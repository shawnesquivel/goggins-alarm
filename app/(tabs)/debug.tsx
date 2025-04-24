import React, { useEffect, useState } from "react";

import { View, Text, Button, ScrollView } from "react-native";
import { ProjectService } from "@/services/ProjectService";
import { Project } from "@/types/project";
import ProjectTests from "@/services/ProjectServiceUtils";

export default function ProjectTestScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setStatus("Loading projects...");
    try {
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);
      setStatus(`Loaded ${localProjects.length} projects`);
    } catch (error) {
      setStatus(`Error loading projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setStatus("Creating project...");
    try {
      const newProject = await ProjectTests.createProject();
      if (newProject) {
        setStatus(`Created project: ${newProject.name}`);
        await loadProjects();
      }
    } catch (error) {
      setStatus(`Error creating project: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSelectedProject = async () => {
    if (!selectedProject) {
      setStatus("No project selected");
      return;
    }

    setLoading(true);
    setStatus(`Updating project: ${selectedProject.name}...`);
    try {
      const updatedProject = await ProjectTests.updateProject(selectedProject);
      if (updatedProject) {
        setStatus(`Updated project: ${updatedProject.name}`);
        setSelectedProject(null);
        await loadProjects();
      }
    } catch (error) {
      setStatus(`Error updating project: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelectedProject = async () => {
    if (!selectedProject) {
      setStatus("No project selected");
      return;
    }

    setLoading(true);
    setStatus(`Deleting project: ${selectedProject.name}...`);
    try {
      const result = await ProjectTests.deleteProject(selectedProject.id);
      if (result) {
        setStatus(`Deleted project: ${selectedProject.name}`);
        setSelectedProject(null);
        await loadProjects();
      }
    } catch (error) {
      setStatus(`Error deleting project: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProjects = async () => {
    setLoading(true);
    setStatus("Syncing projects...");
    try {
      const syncedProjects = await ProjectTests.syncProjects();
      if (syncedProjects) {
        setProjects(syncedProjects);
        setStatus(`Synced ${syncedProjects.length} projects`);
      }
    } catch (error) {
      setStatus(`Error syncing projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPendingOperations = async () => {
    setLoading(true);
    setStatus("Processing pending operations...");
    try {
      const pendingOps = await ProjectTests.processPendingOperations();
      setStatus(
        `Processed pending operations. ${pendingOps?.length || 0} remaining.`
      );
    } catch (error) {
      setStatus(`Error processing pending operations: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCompleteTest = async () => {
    setLoading(true);
    setStatus("Running complete test...");
    try {
      await ProjectTests.runCompleteTest();
      setStatus("Complete test finished!");
      await loadProjects();
    } catch (error) {
      setStatus(`Error in complete test: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold my-4">Project Service Test</Text>

      <Text className="p-2 bg-gray-200 rounded mb-4">{status}</Text>

      <View className="flex-row flex-wrap mb-4 gap-2">
        <Button
          title="Create Project"
          onPress={handleCreateProject}
          disabled={loading}
        />
        <Button
          title="Load Projects"
          onPress={loadProjects}
          disabled={loading}
        />
        <Button
          title="Sync Projects"
          onPress={handleSyncProjects}
          disabled={loading}
        />
        <Button
          title="Process Pending Ops"
          onPress={handleProcessPendingOperations}
          disabled={loading}
        />
        <Button
          title="Run Complete Test"
          onPress={handleRunCompleteTest}
          disabled={loading}
        />
      </View>

      {selectedProject ? (
        <View className="bg-gray-200 p-4 rounded mb-4">
          <Text className="text-base font-bold mb-2">
            Selected: {selectedProject.name}
          </Text>
          <View className="flex-row gap-2">
            <Button
              title="Update"
              onPress={handleUpdateSelectedProject}
              disabled={loading}
            />
            <Button
              title="Delete"
              onPress={handleDeleteSelectedProject}
              disabled={loading}
              color="red"
            />
            <Button
              title="Cancel"
              onPress={() => setSelectedProject(null)}
              disabled={loading}
            />
          </View>
        </View>
      ) : null}

      <ScrollView className="flex-1">
        <Text className="text-lg font-bold my-2">
          Projects ({projects.length})
        </Text>
        {projects.map((project) => (
          <View
            key={project.id}
            className="flex-row justify-between items-center p-4 bg-white rounded mb-2"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: project.color || "#ccc",
            }}
          >
            <View>
              <Text className="text-base font-bold">{project.name}</Text>
              {project.goal ? (
                <Text className="text-sm text-gray-600 my-1">
                  {project.goal}
                </Text>
              ) : null}
              <Text className="text-xs text-gray-400">
                Updated: {project.updatedAt.toLocaleString()}
              </Text>
            </View>
            <Button
              title="Select"
              onPress={() => setSelectedProject(project)}
              disabled={loading || selectedProject?.id === project.id}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
