import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Project } from "@/types/project";
import ProjectModal from "@/components/shared/modals/ProjectModal";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";
import { v4 as uuidv4 } from "uuid";
import { ProjectService } from "@/services/ProjectService";

export default function ProjectsScreen() {
  const { projects, addProject, updateProject, deleteProject, loading } =
    useProjects();
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

  const handleSaveProject = (name: string, goal: string, color: string) => {
    if (!name.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }

    if (selectedProject) {
      updateProject({
        ...selectedProject,
        name,
        goal,
        color,
        updatedAt: new Date(),
      });
    } else {
      addProject({
        name,
        goal,
        color,
      });
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
      className="bg-white p-4 rounded-lg mb-4 shadow-sm"
      style={{ borderLeftWidth: 5, borderLeftColor: item.color || "#4A90E2" }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity onPress={() => handleEditProject(item)}>
          <Text className="text-lg font-bold">{item.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProject(item.id)}>
          <FontAwesome name="trash" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      {item.goal && (
        <Text className="text-sm text-gray-600 mb-2">Goal: {item.goal}</Text>
      )}
      <Text className="text-xs text-gray-400">
        Created:{" "}
        {typeof item.createdAt === "object" && item.createdAt instanceof Date
          ? item.createdAt.toLocaleDateString()
          : new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading projects...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {projects.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-base text-gray-400 text-center">
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

          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg flex-row items-center justify-center mt-4"
            onPress={handleAddProject}
          >
            <FontAwesome name="plus" size={12} color="#fff" />
            <Text className="text-white font-bold ml-2">Add Project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 p-3 rounded-lg items-center mt-4"
            onPress={() => ProjectService.cleanupPendingOperations()}
          >
            <FontAwesome name="trash" size={12} color="#fff" />
            <Text className="text-white font-bold">
              Clear All Pending Operations
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

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
