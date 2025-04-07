/**
 * Manual Test Utilities for ProjectService
 *
 * This is a collection of functions that can be manually run
 * to test the ProjectService functionality.
 *
 * To use this file:
 * 1. Import it in a component where you want to test
 * 2. Call the utility functions from a button or useEffect
 */

import { ProjectService } from "./ProjectService";
import { Project } from "@/types/project";

// Test creating a project
export const testCreateProject = async () => {
  console.log("Testing create project...");
  try {
    const newProject = await ProjectService.createProject({
      name: "Test Project " + Date.now(),
      goal: "This is a test project created at " + new Date().toLocaleString(),
      color: "#FF5733",
    });

    console.log("Created project:", newProject);
    return newProject;
  } catch (error) {
    console.error("Error creating project:", error);
  }
};

// Test getting projects
export const testGetProjects = async () => {
  console.log("Testing get local projects...");
  try {
    const projects = await ProjectService.getLocalProjects();
    console.log("Local projects:", projects);
    return projects;
  } catch (error) {
    console.error("Error getting projects:", error);
  }
};

// Test updating a project
export const testUpdateProject = async (project: Project) => {
  console.log("Testing update project...");
  try {
    const updatedProject = await ProjectService.updateProject({
      ...project,
      name: project.name + " (Updated)",
      goal: project.goal + " - Updated at " + new Date().toLocaleString(),
    });

    console.log("Updated project:", updatedProject);
    return updatedProject;
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

// Test deleting a project
export const testDeleteProject = async (projectId: string) => {
  console.log("Testing delete project:", projectId);
  try {
    const result = await ProjectService.deleteProject(projectId);
    console.log("Delete result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

// Test syncing projects
export const testSyncProjects = async () => {
  console.log("Testing sync projects...");
  try {
    const syncedProjects = await ProjectService.syncProjects();
    console.log("Synced projects:", syncedProjects);
    return syncedProjects;
  } catch (error) {
    console.error("Error syncing projects:", error);
  }
};

// Test processing pending operations
export const testProcessPendingOperations = async () => {
  console.log("Testing process pending operations...");
  try {
    await ProjectService.processPendingOperations();
    console.log("Processed pending operations");

    // Get the current pending operations
    const pendingOps = await ProjectService.getPendingOperations();
    console.log("Remaining pending operations:", pendingOps);

    return pendingOps;
  } catch (error) {
    console.error("Error processing pending operations:", error);
  }
};

// Run a complete test flow
export const runCompleteTest = async () => {
  console.log("Running complete ProjectService test...");

  // Create a project
  const project = await testCreateProject();
  if (!project) return;

  // Get all projects
  await testGetProjects();

  // Update the project
  const updatedProject = await testUpdateProject(project);
  if (!updatedProject) return;

  // Sync projects
  await testSyncProjects();

  // Process pending operations
  await testProcessPendingOperations();

  // Delete the project
  await testDeleteProject(updatedProject.id);

  // Get all projects again
  await testGetProjects();

  console.log("Complete test finished!");
};

// Export a simple interface for running tests
export default {
  createProject: testCreateProject,
  getProjects: testGetProjects,
  updateProject: testUpdateProject,
  deleteProject: testDeleteProject,
  syncProjects: testSyncProjects,
  processPendingOperations: testProcessPendingOperations,
  runCompleteTest,
};
