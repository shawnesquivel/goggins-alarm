import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";
import { AppState } from "react-native";
import { v4 as uuidv4 } from "uuid";

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: "offline_projects",
  PENDING_OPS: "pending_projects_operations",
};

// Define pending operation types
type OperationType = "insert" | "update" | "delete";

export interface PendingOperation {
  type: OperationType;
  data: Project;
  timestamp: number;
}

export const ProjectService = {
  /**
   * Local Storage Methods
   */

  // Get projects from local storage
  async getLocalProjects(): Promise<Project[]> {
    try {
      const storedProjects = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      const projects = storedProjects ? JSON.parse(storedProjects) : [];

      // Normalize all project dates
      return projects.map(this.normalizeProjectDates);
    } catch (error) {
      console.error("Error loading projects from local storage:", error);
      return [];
    }
  },

  // Save projects to local storage
  async saveLocalProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROJECTS,
        JSON.stringify(projects)
      );
    } catch (error) {
      console.error("Error saving projects to local storage:", error);
    }
  },

  /**
   * Supabase Database Methods
   */

  // Fetch projects from Supabase
  async getProjectsFromDB(): Promise<Project[] | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching projects:", error);
        return null;
      }

      // Convert DB format to client format
      return data.map((project) => ({
        id: project.id,
        name: project.name,
        goal: project.goal,
        color: project.color,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        // Note: user_id is stored in the database but not in the local Project type
        // May need to update the Project type to include this field in the future
      }));
    } catch (error) {
      console.error("Error fetching projects from Supabase:", error);
      return null;
    }
  },

  /**
   * CRUD Operations
   */

  // Create a new project
  async createProject(
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const newProject = {
      ...projectData,
      id: this.generateUUID(), // Use UUID instead of timestamp
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save locally first
    await this.saveLocalProjects([
      ...(await this.getLocalProjects()),
      newProject,
    ]);

    // Add to pending operations
    await this.addPendingOperation({
      type: "insert",
      data: newProject,
      timestamp: Date.now(),
    });

    return newProject;
  },

  // Update an existing project
  async updateProject(projectData: Project): Promise<Project> {
    const updatedProject: Project = {
      ...projectData,
      updatedAt: new Date(),
    };

    // Update in local storage first
    const localProjects = await this.getLocalProjects();
    const updatedProjects = localProjects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );

    await this.saveLocalProjects(updatedProjects);

    // Try to update in Supabase
    try {
      // Convert to DB format
      const dbProject = {
        id: updatedProject.id,
        user_id: "11111111-1111-1111-1111-111111111111", // Temporary hardcoded ID for testing
        name: updatedProject.name,
        goal: updatedProject.goal,
        color: updatedProject.color,
        updated_at: updatedProject.updatedAt.toISOString(),
      };

      const { error } = await supabase
        .from("projects")
        .update(dbProject)
        .eq("id", updatedProject.id);

      if (error) {
        console.error("Error updating project in Supabase:", error);
        // Add to pending operations queue
        await this.addPendingOperation({
          type: "update",
          data: updatedProject,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to sync project update with Supabase:", error);
      // Add to pending operations queue
      await this.addPendingOperation({
        type: "update",
        data: updatedProject,
        timestamp: Date.now(),
      });
    }

    return updatedProject;
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<boolean> {
    // Get the project before deletion for the pending operations queue if needed
    const localProjects = await this.getLocalProjects();
    const projectToDelete = localProjects.find(
      (project) => project.id === projectId
    );

    if (!projectToDelete) {
      console.error("Project not found for deletion:", projectId);
      return false;
    }

    // Delete from local storage first
    const updatedProjects = localProjects.filter(
      (project) => project.id !== projectId
    );
    await this.saveLocalProjects(updatedProjects);

    // Try to delete from Supabase
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project from Supabase:", error);
        // Add to pending operations queue
        await this.addPendingOperation({
          type: "delete",
          data: projectToDelete,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to sync project deletion with Supabase:", error);
      // Add to pending operations queue
      await this.addPendingOperation({
        type: "delete",
        data: projectToDelete,
        timestamp: Date.now(),
      });
    }

    return true;
  },

  /**
   * Pending Operations Queue
   */

  // Get pending operations
  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const storedOps = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OPS);
      return storedOps ? JSON.parse(storedOps) : [];
    } catch (error) {
      console.error("Error loading pending operations:", error);
      return [];
    }
  },

  // Save pending operations
  async savePendingOperations(operations: PendingOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_OPS,
        JSON.stringify(operations)
      );
    } catch (error) {
      console.error("Error saving pending operations:", error);
    }
  },

  // Add operation to pending queue
  async addPendingOperation(operation: PendingOperation): Promise<void> {
    const pendingOps = await this.getPendingOperations();
    await this.savePendingOperations([...pendingOps, operation]);
  },

  /**
   * Sync Methods
   */

  // Sync local projects with remote database
  async syncProjects(): Promise<Project[]> {
    try {
      console.log("Starting project sync...");

      // Get local projects
      const localProjects = await this.getLocalProjects();
      console.log(`Found ${localProjects.length} local projects`);

      // Get pending operations
      const pendingOps = await this.getPendingOperations();
      console.log(`Found ${pendingOps.length} pending operations`);

      // Process pending operations with better error handling
      if (pendingOps.length > 0) {
        await this.processPendingOperationsWithRetry(pendingOps);
      }

      // Fetch remote projects to verify sync
      const { data: remoteProjects, error } = await supabase
        .from("projects")
        .select("*");

      if (error) {
        console.error("Error fetching remote projects:", error);
        throw new Error(`Failed to fetch remote projects: ${error.message}`);
      }

      console.log(`Fetched ${remoteProjects?.length || 0} remote projects`);

      // Compare local and remote counts for verification
      if (remoteProjects && remoteProjects.length !== localProjects.length) {
        console.warn(
          `Sync count mismatch - Local: ${localProjects.length}, Remote: ${remoteProjects.length}`
        );
      }

      // Return remote projects to update local state
      return remoteProjects || [];
    } catch (error) {
      console.error("Project sync failed:", error);
      throw error;
    }
  },

  // Enhanced processing function with retry logic
  async processPendingOperationsWithRetry(
    operations: PendingOperation[]
  ): Promise<void> {
    const results = [];
    const failures = [];

    for (const op of operations) {
      try {
        // Normalize dates
        if (op.data) {
          op.data = this.normalizeProjectDates(op.data);
        }

        console.log(
          `Processing ${op.type} operation for project:`,
          op.type === "delete" ? op.data?.id : op.data?.name || "unknown"
        );

        let result;

        if (op.type === "insert") {
          // Get authenticated user
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("No authenticated user for project insert");
          }

          // Format data for database
          const dbProject = {
            id: isValidUUID(op.data.id) ? op.data.id : this.generateUUID(),
            name: op.data.name,
            goal: op.data.goal,
            color: op.data.color,
            user_id: user.id,
            created_at:
              op.data.createdAt instanceof Date
                ? op.data.createdAt.toISOString()
                : new Date().toISOString(),
            updated_at:
              op.data.updatedAt instanceof Date
                ? op.data.updatedAt.toISOString()
                : new Date().toISOString(),
          };

          console.log("Insert data being sent to Supabase:", dbProject);

          const { data, error } = await supabase
            .from("projects")
            .insert(dbProject)
            .select();

          if (error) {
            throw error;
          }

          result = data[0];
        } else if (op.type === "update") {
          // Similar approach for update operations
          const dbProject = {
            name: op.data.name,
            goal: op.data.goal,
            color: op.data.color,
            updated_at: new Date().toISOString(),
          };

          // For update we need to ensure the ID is valid
          if (!isValidUUID(op.data.id)) {
            throw new Error(
              `Invalid UUID format for project update: ${op.data.id}`
            );
          }

          const { data, error } = await supabase
            .from("projects")
            .update(dbProject)
            .eq("id", op.data.id)
            .select();

          if (error) {
            throw error;
          }

          result = data[0];
        } else if (op.type === "delete") {
          // For delete, make sure ID is a valid UUID
          if (!isValidUUID(op.data.id)) {
            throw new Error(
              `Invalid UUID format for project delete: ${op.data.id}`
            );
          }

          const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", op.data.id);

          if (error) {
            throw error;
          }

          result = { id: op.data.id, deleted: true };
        }

        results.push({ success: true, op, result });

        // Remove from pending ops if successful
        await this.removePendingOperation(op.data.id);
      } catch (error) {
        console.error(`Error processing ${op.type} operation:`, error);
        failures.push({
          op,
          error: error.message || "Unknown error",
          code: error.code,
        });
      }
    }

    console.log(
      `Processed ${results.length} operations successfully, ${failures.length} failures`
    );

    if (failures.length > 0) {
      console.error("Operation failures:", failures);
    }
  },

  // Initialize app-level listeners
  initListeners(): void {
    // Listen for app state changes to trigger sync
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("App became active, processing pending operations");
        this.syncProjects();
      }
    });
  },

  // Helper function to normalize project data
  normalizeProjectDates(project: Project): Project {
    if (project.createdAt && !(project.createdAt instanceof Date)) {
      project.createdAt = new Date(project.createdAt);
    }

    if (project.updatedAt && !(project.updatedAt instanceof Date)) {
      project.updatedAt = new Date(project.updatedAt);
    }

    return project;
  },

  // Helper function to remove a pending operation
  async removePendingOperation(operationId: string): Promise<void> {
    const pendingOps = await this.getPendingOperations();
    const updatedOps = pendingOps.filter((op) => op.data.id !== operationId);
    await this.savePendingOperations(updatedOps);
  },

  // Helper function to generate a new UUID
  generateUUID(): string {
    return uuidv4();
  },
};

// Helper to check if a string is a valid UUID
function isValidUUID(id) {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
