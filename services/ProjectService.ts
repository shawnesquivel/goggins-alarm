import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";
import { AppState } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "@/services/AuthService";

/**
 * Storage keys used for persisting data in AsyncStorage
 */
const STORAGE_KEYS = {
  PROJECTS: "offline_projects",
  PENDING_OPS: "pending_projects_operations",
  OFFLINE_MODE: "offline_mode",
};

/**
 * Types of operations that can be queued for syncing
 */
type OperationType = "insert" | "update" | "delete";

/**
 * Represents a pending operation to be synced with the remote database
 */
export interface PendingOperation {
  type: OperationType;
  data: Project;
  timestamp: number;
}

/**
 * Gets the storage key for projects specific to the current user
 * @returns Storage key in format "user_{id}_projects" or "anonymous_projects"
 */
async function getUserProjectsKey() {
  const userId = await AuthService.getCurrentUserId();
  const key = userId ? `user_${userId}_projects` : "anonymous_projects";
  console.log(`[ProjectService] Using projects storage key: ${key}`);
  return key;
}

/**
 * Gets the storage key for pending operations specific to the current user
 * @returns Storage key in format "user_{id}_pending_ops" or "anonymous_pending_ops"
 */
async function getUserPendingOpsKey() {
  const userId = await AuthService.getCurrentUserId();
  const key = userId ? `user_${userId}_pending_ops` : "anonymous_pending_ops";
  console.log(`[ProjectService] Using pending ops storage key: ${key}`);
  return key;
}

/**
 * Service for managing projects with offline-first capabilities.
 *
 * This service implements an offline-first architecture where:
 * - All operations are performed on local storage first
 * - Changes are queued as pending operations when offline
 * - Sync occurs automatically when the app regains connectivity
 * - Each user has their own isolated storage space
 * - Fallback to offline mode on sync failures
 */
export const ProjectService = {
  isOfflineMode: false,
  appStateSubscription: null as { remove: () => void } | null,

  /**
   * Enables or disables offline mode
   * @param enabled - Whether to enable offline mode
   */
  async setOfflineMode(enabled: boolean) {
    this.isOfflineMode = enabled;
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_MODE,
      JSON.stringify(enabled)
    );
    console.log(
      `[ProjectService] Offline mode ${enabled ? "enabled" : "disabled"}`
    );
  },

  /**
   * Checks if offline mode is currently enabled
   * @returns Current offline mode state
   */
  async checkOfflineMode() {
    try {
      const offlineMode = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      this.isOfflineMode = offlineMode === "true";
      return this.isOfflineMode;
    } catch (error) {
      console.error("[ProjectService] Error checking offline mode:", error);
      return false;
    }
  },

  /**
   * Local Storage Methods
   */

  /**
   * Retrieves all projects from local storage for the current user
   * @returns Array of projects with normalized dates
   */
  async getLocalProjects(): Promise<Project[]> {
    try {
      console.log("[ProjectService] Getting local projects");
      const storageKey = await getUserProjectsKey();
      const storedProjects = await AsyncStorage.getItem(storageKey);
      console.log(
        `[ProjectService] Retrieved from ${storageKey}: ${
          storedProjects ? "data found" : "no data"
        }`
      );

      const projects = storedProjects ? JSON.parse(storedProjects) : [];

      // Normalize all project dates
      console.log(`[ProjectService] Loaded ${projects.length} local projects`);
      return projects.map(this.normalizeProjectDates);
    } catch (error) {
      console.error(
        "[ProjectService] Error loading projects from local storage:",
        error
      );
      return [];
    }
  },

  /**
   * Saves projects to local storage for the current user
   * @param projects - Array of projects to save
   */
  async saveLocalProjects(projects: Project[]): Promise<void> {
    try {
      console.log(
        `[ProjectService] Saving ${projects.length} projects to local storage`
      );
      const storageKey = await getUserProjectsKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(projects));
      console.log(
        `[ProjectService] Projects saved successfully to ${storageKey}`
      );
    } catch (error) {
      console.error(
        "[ProjectService] Error saving projects to local storage:",
        error
      );
    }
  },

  /**
   * Supabase Database Methods
   */

  /**
   * Fetches projects from Supabase for the authenticated user
   * @returns Array of projects or null if fetch fails
   */
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

  /**
   * Creates a new project with offline-first approach:
   * 1. Saves to local storage immediately
   * 2. If online, attempts to sync with Supabase
   * 3. If offline/sync fails, queues for later sync
   *
   * @param projectData - Project data without id/timestamps
   * @returns Newly created project
   */
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

  /**
   * Updates an existing project with offline-first approach:
   * 1. Updates in local storage immediately
   * 2. If online, attempts to sync with Supabase
   * 3. If offline/sync fails, queues for later sync
   *
   * @param projectData - Complete project data to update
   * @returns Updated project
   */
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

  /**
   * Deletes a project with offline-first approach:
   * 1. Deletes from local storage immediately
   * 2. If online, attempts to sync with Supabase
   * 3. If offline/sync fails, queues for later sync
   *
   * @param projectId - ID of project to delete
   * @returns Success status of local deletion
   */
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

  /**
   * Retrieves all pending operations for the current user
   * @returns Array of pending operations
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const storageKey = await getUserPendingOpsKey();
      console.log(
        `[ProjectService] Getting pending operations from ${storageKey}`
      );
      const storedOps = await AsyncStorage.getItem(storageKey);
      const operations = storedOps ? JSON.parse(storedOps) : [];
      console.log(
        `[ProjectService] Found ${operations.length} pending operations`
      );
      return operations;
    } catch (error) {
      console.error(
        "[ProjectService] Error loading pending operations:",
        error
      );
      return [];
    }
  },

  /**
   * Saves pending operations for the current user
   * @param operations - Array of pending operations to save
   */
  async savePendingOperations(operations: PendingOperation[]): Promise<void> {
    try {
      const storageKey = await getUserPendingOpsKey();
      console.log(
        `[ProjectService] Saving ${operations.length} pending operations to ${storageKey}`
      );
      await AsyncStorage.setItem(storageKey, JSON.stringify(operations));
      console.log(`[ProjectService] Pending operations saved successfully`);
    } catch (error) {
      console.error("[ProjectService] Error saving pending operations:", error);
    }
  },

  /**
   * Adds a new operation to the pending queue
   * @param operation - Operation to add to queue
   */
  async addPendingOperation(operation: PendingOperation): Promise<void> {
    console.log(
      `[ProjectService] Adding ${operation.type} operation to pending queue`
    );
    const pendingOps = await this.getPendingOperations();
    await this.savePendingOperations([...pendingOps, operation]);
  },

  /**
   * Clears all stored data for a specific user or anonymous data
   * @param userId - Optional user ID, if not provided uses current user
   */
  async clearUserData(userId?: string | null): Promise<void> {
    try {
      // If userId not provided, get the current user
      if (userId === undefined) {
        userId = await AuthService.getCurrentUserId();
      }

      if (userId) {
        console.log(`[ProjectService] Clearing data for user: ${userId}`);
        // Clear user-specific storage
        await AsyncStorage.removeItem(`user_${userId}_projects`);
        await AsyncStorage.removeItem(`user_${userId}_pending_ops`);
        console.log(
          `[ProjectService] User data cleared successfully for ${userId}`
        );
      } else {
        console.log(
          `[ProjectService] No user ID available, clearing anonymous data`
        );
        await AsyncStorage.removeItem("anonymous_projects");
        await AsyncStorage.removeItem("anonymous_pending_ops");
      }
    } catch (error) {
      console.error("[ProjectService] Error clearing user data:", error);
    }
  },

  /**
   * Sync Methods
   */

  /**
   * Synchronizes local projects with remote database:
   * 1. Processes any pending operations first
   * 2. Fetches latest remote projects
   * 3. Updates local storage with remote data
   *
   * Falls back to offline mode if sync fails
   *
   * @returns Array of synchronized projects
   */
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

      return mergedProjects;
    } catch (error) {
      console.warn("Project sync failed:", error);
      // If sync fails, enable offline mode and return local projects
      await this.setOfflineMode(true);
      return await this.getLocalProjects();
    }
  },

  /**
   * Processes pending operations with retry logic
   * Attempts to sync each operation with the remote database
   * Removes successful operations from the queue
   *
   * @param operations - Array of pending operations to process
   */
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

  /**
   * Initializes app state change listeners to handle sync operations.
   * When the app becomes active (e.g. returning from background),
   * this triggers a sync of pending operations with the remote database.
   *
   * Offline-first: Any queued operations will be processed when the app regains focus + connectivity.
   */
  initListeners(): () => void {
    console.log("[ProjectService] Initializing AppState listeners");

    // Clean up any existing listener first to prevent duplicates
    if (this.appStateSubscription) {
      console.log("[ProjectService] Cleaning up existing AppState listener");
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Create new listener
    console.log("[ProjectService] Creating new AppState listener");
    this.appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("[ProjectService] App became active, syncing projects");
        this.syncProjects();
      }
    });

    // Return cleanup function for the context to use
    return () => {
      if (this.appStateSubscription) {
        console.log(
          "[ProjectService] Cleaning up AppState listener from cleanup function"
        );
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
    };
  },

  /**
   * Ensures project dates are proper Date objects
   * @param project - Project to normalize
   * @returns Project with normalized dates
   */
  normalizeProjectDates(project: Project): Project {
    if (project.createdAt && !(project.createdAt instanceof Date)) {
      project.createdAt = new Date(project.createdAt);
    }

    if (project.updatedAt && !(project.updatedAt instanceof Date)) {
      project.updatedAt = new Date(project.updatedAt);
    }

    return project;
  },

  /**
   * Removes a pending operation from the queue
   * @param operationId - ID of operation to remove
   */
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

  /**
   * Generates a new UUID for project IDs
   * @returns UUID string
   */
  generateUUID(): string {
    return uuidv4();
  },

  /**
   * Removes invalid pending operations that can't be processed
   * @returns Array of valid pending operations
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

  // Add this method to explicitly clean up listeners when needed
  cleanupListeners() {
    if (this.appStateSubscription) {
      console.log("[ProjectService] Explicitly cleaning up AppState listener");
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  },
};

/**
 * Validates if a string is a valid UUID
 * @param id - String to validate
 * @returns Whether string is valid UUID
 */
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
