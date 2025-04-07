/**
 * Test Utilities for ProjectService with Authentication
 *
 * This is a collection of functions to test the ProjectService
 * with authentication integration.
 */

import { AuthService } from "./AuthService";
import { ProjectService } from "./ProjectService";
import { Project } from "@/types/project";
import { createUserProfile } from "@/lib/supabase";

// Test getting current user
export const testGetCurrentUser = async () => {
  console.log("Testing get current user...");
  try {
    const user = await AuthService.getCurrentUser();
    console.log(
      "Current user:",
      user
        ? {
            id: user.id,
            email: user.email,
            // Only show a few properties to avoid cluttering logs
          }
        : "No user authenticated"
    );
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
  }
};

// Test signing in
export const testSignIn = async (email: string, password: string) => {
  console.log("Testing sign in...");
  try {
    const data = await AuthService.signIn(email, password);
    console.log("Signed in user:", data.session?.user?.email);
    return data.session?.user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Test signing up
export const testSignUp = async (email: string, password: string) => {
  console.log("Testing sign up...");
  try {
    const data = await AuthService.signUp(email, password);
    console.log("Sign up result:", data);
    return data.user;
  } catch (error) {
    console.error("Error signing up:", error);
  }
};

// Test signing out
export const testSignOut = async () => {
  console.log("Testing sign out...");
  try {
    await AuthService.signOut();
    console.log("Signed out successfully");
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

// Test creating user profile
export const testCreateUserProfile = async () => {
  console.log("Testing create user profile...");
  try {
    const profile = await createUserProfile();
    console.log(
      "User profile result:",
      profile
        ? {
            id: profile.id,
            email: profile.email,
          }
        : "No profile created (likely no user authenticated)"
    );
    return profile;
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

// Test creating a project with authenticated user
export const testCreateProjectWithAuth = async () => {
  console.log("Testing create project with authentication...");
  try {
    // Check if user is authenticated
    const userId = await AuthService.getCurrentUserId();
    console.log("Current user ID:", userId || "Not authenticated");

    if (!userId) {
      console.log("No authenticated user, cannot create project");
      return null;
    }

    // Ensure user profile exists before creating project
    await testCreateUserProfile();

    // Create project
    const newProject = await ProjectService.createProject({
      name: `Test Project ${Date.now()}`,
      goal: `This is a test project created with auth at ${new Date().toLocaleString()}`,
      color: "#3498db",
    });

    console.log("Created project:", newProject);
    return newProject;
  } catch (error) {
    console.error("Error creating project with auth:", error);
  }
};

// Test getting user-specific projects
export const testGetUserProjects = async () => {
  console.log("Testing get user projects...");
  try {
    const localProjects = await ProjectService.getLocalProjects();
    console.log("Local projects:", localProjects);

    // Get current user ID for reference
    const userId = await AuthService.getCurrentUserId();
    console.log("Current user ID:", userId || "Not authenticated");

    return localProjects;
  } catch (error) {
    console.error("Error getting user projects:", error);
  }
};

// Test syncing with authenticated user
export const testSyncProjectsWithAuth = async () => {
  console.log("Testing sync projects with authentication...");
  try {
    // Ensure user profile exists before syncing projects
    await testCreateUserProfile();

    const syncedProjects = await ProjectService.syncProjects();
    console.log("Synced projects:", syncedProjects);
    return syncedProjects;
  } catch (error) {
    console.error("Error syncing projects with auth:", error);
  }
};

// Run a complete auth test flow
export const runAuthTestFlow = async (email: string, password: string) => {
  console.log("Running complete auth test flow...");

  // Check current user
  await testGetCurrentUser();

  // Sign in
  const user = await testSignIn(email, password);
  if (!user) {
    console.log("Authentication failed, stopping test flow");
    return;
  }

  // Create user profile
  await testCreateUserProfile();

  // Create a project
  const project = await testCreateProjectWithAuth();
  if (!project) return;

  // Get user projects
  await testGetUserProjects();

  // Sync projects
  await testSyncProjectsWithAuth();

  // Sign out
  await testSignOut();

  // Check current user again
  await testGetCurrentUser();

  console.log("Auth test flow completed!");
};

// Export a simple interface for running tests
export default {
  getCurrentUser: testGetCurrentUser,
  signIn: testSignIn,
  signUp: testSignUp,
  signOut: testSignOut,
  createUserProfile: testCreateUserProfile,
  createProject: testCreateProjectWithAuth,
  getUserProjects: testGetUserProjects,
  syncProjects: testSyncProjectsWithAuth,
  runAuthTestFlow,
};
