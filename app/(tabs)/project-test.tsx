import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>Project Service Test</Text>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.buttonContainer}>
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
        <View style={styles.selectedProject}>
          <Text style={styles.selectedProjectTitle}>
            Selected: {selectedProject.name}
          </Text>
          <View style={styles.selectedProjectButtons}>
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

      <ScrollView style={styles.projectList}>
        <Text style={styles.subtitle}>Projects ({projects.length})</Text>
        {projects.map((project) => (
          <View
            key={project.id}
            style={[
              styles.projectItem,
              { borderLeftColor: project.color || "#ccc" },
            ]}
          >
            <View>
              <Text style={styles.projectName}>{project.name}</Text>
              {project.goal ? (
                <Text style={styles.projectGoal}>{project.goal}</Text>
              ) : null}
              <Text style={styles.projectDate}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  status: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  projectList: {
    flex: 1,
  },
  projectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  projectGoal: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  projectDate: {
    fontSize: 12,
    color: "#999",
  },
  selectedProject: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedProjectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  selectedProjectButtons: {
    flexDirection: "row",
    gap: 8,
  },
});
