import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Project } from "@/types/alarm";
import ProjectModal from "@/components/shared/modals/ProjectModal";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const { projects, addProject, updateProject, deleteProject } = usePomodoro();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [projectToDelete, setProjectToDelete] = useState<string>("");

  const colorOptions = [
    "#4A90E2", // Blue
    "#7ED321", // Green
    "#F5A623", // Orange
    "#D0021B", // Red
    "#9013FE", // Purple
    "#50E3C2", // Teal
    "#BD10E0", // Pink
    "#000000", // Black
  ];

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (selectedProject) {
      // For editing, we need to preserve the id and timestamps
      updateProject({
        ...selectedProject,
        ...projectData,
        updatedAt: new Date(),
      });
    } else {
      // For adding, we need to generate an id and timestamps
      addProject({
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Project);
    }
    setShowProjectModal(false);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete("");
    }
    setShowDeleteModal(false);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View
      style={[styles.projectCard, { borderLeftColor: item.color || "#4A90E2" }]}
    >
      <View style={styles.projectHeader}>
        <TouchableOpacity onPress={() => handleEditProject(item)}>
          <Text style={styles.projectName}>{item.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProject(item.id)}>
          <FontAwesome name="trash" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      {item.goal && <Text style={styles.projectGoal}>Goal: {item.goal}</Text>}
      <Text style={styles.projectDate}>
        Created:{" "}
        {typeof item.createdAt === "object" && item.createdAt instanceof Date
          ? item.createdAt.toLocaleDateString()
          : new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No projects yet. Add your first project!
            </Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
          <FontAwesome name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Project</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Project Modal */}
      <ProjectModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        project={selectedProject}
        onSave={handleSaveProject}
        mode={selectedProject ? "edit" : "add"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
  },
  projectCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  projectGoal: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  projectDate: {
    fontSize: 12,
    color: "#999",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
