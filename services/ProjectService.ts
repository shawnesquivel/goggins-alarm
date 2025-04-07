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
      return storedProjects ? JSON.parse(storedProjects) : [];
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
    // Generate a new client-side ID
    const newProject: Project = {
      ...projectData,
      id: uuidv4(), // Use uuid v4 to generate a UUID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to local storage first
    const localProjects = await this.getLocalProjects();
    await this.saveLocalProjects([...localProjects, newProject]);

    // Try to save to Supabase
    try {
      // Convert to DB format
      const dbProject = {
        id: newProject.id,
        user_id: "11111111-1111-1111-1111-111111111111", // Temporary hardcoded ID for testing
        name: newProject.name,
        goal: newProject.goal,
        color: newProject.color,
        created_at: newProject.createdAt.toISOString(),
        updated_at: newProject.updatedAt.toISOString(),
      };

      const { error } = await supabase.from("projects").insert(dbProject);

      if (error) {
        console.error("Error saving project to Supabase:", error);
        // Add to pending operations queue
        await this.addPendingOperation({
          type: "insert",
          data: newProject,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to sync project with Supabase:", error);
      // Add to pending operations queue
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
      // Get from DB
      const dbProjects = await this.getProjectsFromDB();

      if (!dbProjects) {
        console.log("Failed to fetch remote projects, using local data");
        return await this.getLocalProjects();
      }

      // Get local projects for merging
      const localProjects = await this.getLocalProjects();

      // Simple conflict resolution strategy: use the most recently updated version
      // For each local project, check if it exists in DB projects
      const mergedProjects = [...dbProjects];

      // Add or update with local projects that might not be synced yet
      for (const localProject of localProjects) {
        const dbProjectIndex = mergedProjects.findIndex(
          (p) => p.id === localProject.id
        );

        if (dbProjectIndex === -1) {
          // Project only exists locally, add it
          mergedProjects.push(localProject);
        } else {
          // Project exists in both places, use the most recent version
          const dbProject = mergedProjects[dbProjectIndex];
          const localUpdatedTime = localProject.updatedAt.getTime();
          const dbUpdatedTime = dbProject.updatedAt.getTime();

          if (localUpdatedTime > dbUpdatedTime) {
            // Local is more recent, replace DB version
            mergedProjects[dbProjectIndex] = localProject;
          }
        }
      }

      // Save merged projects back to local storage
      await this.saveLocalProjects(mergedProjects);

      // Process any pending operations
      await this.processPendingOperations();

      return mergedProjects;
    } catch (error) {
      console.error("Error syncing projects:", error);
      // Fall back to local data on error
      return await this.getLocalProjects();
    }
  },

  // Process pending operations
  async processPendingOperations(): Promise<void> {
    const pendingOps = await this.getPendingOperations();
    if (pendingOps.length === 0) return;

    console.log(`Processing ${pendingOps.length} pending operations`);

    // Process each operation in order
    const remainingOps = [...pendingOps];

    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      let success = false;

      try {
        switch (op.type) {
          case "insert": {
            // Convert to DB format
            const dbProject = {
              id: op.data.id,
              user_id: "11111111-1111-1111-1111-111111111111", // Temporary hardcoded ID for testing
              name: op.data.name,
              goal: op.data.goal,
              color: op.data.color,
              created_at: op.data.createdAt.toISOString(),
              updated_at: op.data.updatedAt.toISOString(),
            };

            const { error } = await supabase.from("projects").insert(dbProject);
            success = !error;
            break;
          }

          case "update": {
            // Convert to DB format
            const dbProject = {
              id: op.data.id,
              user_id: "11111111-1111-1111-1111-111111111111", // Temporary hardcoded ID for testing
              name: op.data.name,
              goal: op.data.goal,
              color: op.data.color,
              updated_at: op.data.updatedAt.toISOString(),
            };

            const { error } = await supabase
              .from("projects")
              .update(dbProject)
              .eq("id", op.data.id);

            success = !error;
            break;
          }

          case "delete": {
            const { error } = await supabase
              .from("projects")
              .delete()
              .eq("id", op.data.id);

            success = !error;
            break;
          }
        }

        if (success) {
          // Remove from pending operations if successful
          remainingOps.splice(i, 1);
          i--;
        }
      } catch (error) {
        console.error(`Error processing operation ${op.type}:`, error);
        // Operation failed, keep it in queue
      }
    }

    // Save remaining operations
    await this.savePendingOperations(remainingOps);
  },

  // Initialize app-level listeners
  initListeners(): void {
    // Listen for app state changes to trigger sync
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("App became active, processing pending operations");
        this.processPendingOperations();
      }
    });
  },
};
