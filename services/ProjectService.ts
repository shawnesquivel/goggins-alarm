import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";
import { AppState } from "react-native";
import { v4 as uuidv4 } from "uuid";

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: "offline_projects",
  PENDING_OPS: "pending_projects_operations",
  OFFLINE_MODE: "offline_mode",
};

// Define pending operation types
type OperationType = "insert" | "update" | "delete";

export interface PendingOperation {
  type: OperationType;
  data: Project;
  timestamp: number;
}

export const ProjectService = {
  isOfflineMode: false,

  async setOfflineMode(enabled: boolean) {
    this.isOfflineMode = enabled;
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_MODE,
      JSON.stringify(enabled)
    );
    console.log(`Offline mode ${enabled ? "enabled" : "disabled"}`);
  },

  async checkOfflineMode() {
    try {
      const offlineMode = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      this.isOfflineMode = offlineMode === "true";
      return this.isOfflineMode;
    } catch (error) {
      console.error("Error checking offline mode:", error);
      return false;
    }
  },

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
      id: this.generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save locally first
    const localProjects = await this.getLocalProjects();
    await this.saveLocalProjects([...localProjects, newProject]);

    // If in offline mode, skip Supabase operations
    if (this.isOfflineMode) {
      console.log("Offline mode: Skipping Supabase sync for create");
      return newProject;
    }

    // Try to create in Supabase directly first
    try {
      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
        console.log("Creating project with user ID:", user.id);

        // Format data for database
        const dbProject = {
          id: newProject.id,
          name: newProject.name,
          goal: newProject.goal,
          color: newProject.color,
          user_id: user.id,
          created_at: newProject.createdAt.toISOString(),
          updated_at: newProject.updatedAt.toISOString(),
        };

        const { data, error } = await supabase
          .from("projects")
          .insert(dbProject)
          .select();

        if (error) {
          console.error(
            "Direct insert failed, adding to pending operations:",
            error
          );
          // Fall back to pending operations
          await this.addPendingOperation({
            type: "insert",
            data: newProject,
            timestamp: Date.now(),
          });
        } else {
          console.log("Project created successfully in Supabase:", data);
        }
      } else {
        console.warn(
          "No authenticated user found, adding to pending operations"
        );
        // Add to pending operations if no user is found
        await this.addPendingOperation({
          type: "insert",
          data: newProject,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error creating project in Supabase:", error);
      // Add to pending operations
      await this.addPendingOperation({
        type: "insert",
        data: newProject,
        timestamp: Date.now(),
      });
    }

    return newProject;
  },

  // Update an existing project
  async updateProject(projectData: Project): Promise<Project> {
    const updatedProject = {
      ...projectData,
      updatedAt: new Date(),
    };

    // Update in local storage
    const localProjects = await this.getLocalProjects();
    const updatedProjects = localProjects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );
    await this.saveLocalProjects(updatedProjects);

    // If in offline mode, skip Supabase operations
    if (this.isOfflineMode) {
      console.log("Offline mode: Skipping Supabase sync for update");
      return updatedProject;
    }

    // Try to update in Supabase
    try {
      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error("No authenticated user for project update");
      }

      // Convert to DB format with proper user_id
      const dbProject = {
        id: updatedProject.id,
        user_id: user.id,
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
      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error("No authenticated user for project deletion");
      }

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
      // Check offline mode first
      if (this.isOfflineMode) {
        console.log("Offline mode: Skipping sync with Supabase");
        return await this.getLocalProjects();
      }

      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error("No authenticated user found");
      }

      // Process pending operations first
      const pendingOps = await this.getPendingOperations();
      if (pendingOps.length > 0) {
        await this.processPendingOperationsWithRetry(pendingOps);
      }

      // Fetch remote projects for the current user
      const { data: remoteProjects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", authData.user.id);

      if (error) throw error;
      if (!remoteProjects) return [];

      console.log("Remote projects:", remoteProjects);

      // Get current local projects
      const localProjects = await this.getLocalProjects();
      console.log("Local projects before sync:", localProjects);

      // Replace local projects with remote projects
      const mergedProjects = remoteProjects.map((project) => ({
        id: project.id,
        name: project.name,
        goal: project.goal,
        color: project.color,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      }));

      // Save merged result to local storage
      await this.saveLocalProjects(mergedProjects);

      console.log("Synced projects:", mergedProjects);
      return mergedProjects;
    } catch (error) {
      console.warn("Project sync failed:", error);
      // If sync fails, enable offline mode and return local projects
      await this.setOfflineMode(true);
      return await this.getLocalProjects();
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
      } catch (error: any) {
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
    // Also check for duplicate operations with the same ID
    const updatedOps = pendingOps.filter((op) => {
      if (op.type === "insert" || op.type === "update") {
        return op.data.id !== operationId;
      }
      return true;
    });
    await this.savePendingOperations(updatedOps);
  },

  // Helper function to generate a new UUID
  generateUUID(): string {
    return uuidv4();
  },

  /**
   * Clean up invalid pending operations that can't be processed
   */
  async cleanupPendingOperations() {
    try {
      console.log("Cleaning up invalid pending operations...");
      const pendingOps = await this.getPendingOperations();
      console.log(`Found ${pendingOps.length} pending operations`);

      const validOps = pendingOps.filter((op) => {
        // For insert/update operations, ensure required fields exist
        if ((op.type === "insert" || op.type === "update") && op.data) {
          if (!op.data.name) {
            console.log(
              `Removing invalid operation - missing required name field`,
              op
            );
            return false;
          }
        }
        return true;
      });

      console.log(
        `Removed ${pendingOps.length - validOps.length} invalid operations`
      );
      await this.savePendingOperations(validOps);
      return validOps;
    } catch (error) {
      console.error("Error cleaning up pending operations:", error);
      return [];
    }
  },
};

// Helper to check if a string is a valid UUID
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
