import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProjectModal from "../shared/modals/ProjectModal";
import { Project } from "@/types/project";
import { ProjectService } from "@/services/ProjectService";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);

      // Try to sync with remote
      const syncedProjects = await ProjectService.syncProjects();
      setProjects(syncedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (
    name: string,
    goal: string,
    color: string
  ) => {
    try {
      const newProject = await ProjectService.createProject({
        name,
        goal,
        color,
      });

      // Refresh the project list
      setProjects((prev) => [...prev, newProject]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleUpdateProject = async (
    id: string,
    name: string,
    goal: string,
    color: string
  ) => {
    try {
      const projectToUpdate = projects.find((p) => p.id === id);
      if (!projectToUpdate) return;

      const updatedProject = await ProjectService.updateProject({
        ...projectToUpdate,
        name,
        goal,
        color,
      });

      // Update the project in the local state
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await ProjectService.deleteProject(id);

      // Remove the project from the local state
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    console.log("handleEditProject called with:", project);
    try {
      setSelectedProject(project);
      setIsModalVisible(true);
      console.log("State updated:", {
        selectedProject: project,
        isModalVisible: true,
      });
    } catch (error) {
      console.error("Error in handleEditProject:", error);
    }
  };

  const handleSave = (name: string, goal: string, color: string) => {
    console.log("handleSave called with:", { name, goal, color });
    if (selectedProject) {
      handleUpdateProject(selectedProject.id, name, goal, color);
    } else {
      handleAddProject(name, goal, color);
    }
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  // Log when modal visibility changes
  useEffect(() => {
    console.log("Modal visibility changed:", isModalVisible);
  }, [isModalVisible]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-black">Loading projects...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f0] px-4 py-2">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-sm text-gray-600 uppercase">
          ACCOUNT SETTINGS
        </Text>
        <Text className="text-4xl font-bold italic">Projects List</Text>
      </View>

      {/* Instructions */}
      <Text className="text-blue-600 mb-6">
        Click to edit a project, or add up to 10 projects at a time.
      </Text>

      {/* Projects List */}
      <ScrollView className="flex-1 mb-4">
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            onPress={() => {
              console.log("Project TouchableOpacity pressed:", project);
              handleEditProject(project);
            }}
            className="flex-row items-center mb-4"
            activeOpacity={0.7}
          >
            <View
              className="w-5 h-5 rounded-full mr-3 border border-gray-400"
              style={{ backgroundColor: project.color || "#ccc" }}
            />
            <Text className="text-base">{project.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Project Button */}
      <TouchableOpacity
        onPress={() => {
          setSelectedProject(null);
          setIsModalVisible(true);
        }}
        className="items-center py-3 mb-6"
      >
        <Text className="text-black text-center">+ Add Project</Text>
      </TouchableOpacity>

      {/* Save and Cancel Buttons */}
      <View className="mb-6 space-y-3">
        <TouchableOpacity
          className="bg-black py-4 items-center rounded-md"
          onPress={() => console.log("Save List")}
        >
          <Text className="text-white uppercase font-medium">Save List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 items-center"
          onPress={() => console.log("Return without saving")}
        >
          <Text className="text-black uppercase text-sm">
            Return without saving
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for adding/editing projects */}
      <ProjectModal
        visible={isModalVisible}
        onClose={() => {
          console.log("Modal onClose called");
          setIsModalVisible(false);
          setSelectedProject(null);
        }}
        project={selectedProject || undefined}
        onSave={handleSave}
        onDelete={
          selectedProject
            ? () => handleDeleteProject(selectedProject.id)
            : undefined
        }
        mode={selectedProject ? "edit" : "add"}
      />
    </SafeAreaView>
  );
}
