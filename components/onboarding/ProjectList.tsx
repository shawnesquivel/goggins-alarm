import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
    <View className="flex-1 w-full">
      <ScrollView className="flex-1">
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            onPress={() => {
              console.log("Project TouchableOpacity pressed:", project);
              handleEditProject(project);
            }}
            className="flex-row items-center p-4 rounded-lg mb-3"
            activeOpacity={0.7}
          >
            <View
              className="w-5 h-5 rounded-full mr-3 border border-black"
              style={{ backgroundColor: project.color || "#ccc" }}
            />
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Figtree_500Medium" }}
                className="text-base"
              >
                {project.name}
              </Text>
              {project.goal && (
                <Text
                  style={{ fontFamily: "Figtree_400Regular" }}
                  className="text-sm text-[#666]"
                >
                  {project.goal}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          setSelectedProject(null);
          setIsModalVisible(true);
        }}
        className="flex-row items-center justify-center py-4 rounded-lg mt-4"
      >
        <Ionicons name="add" size={24} color="black" />
        <Text
          style={{ fontFamily: "Figtree_500Medium" }}
          className="text-black ml-2 text-lg"
        >
          Add Another Project
        </Text>
      </TouchableOpacity>

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
    </View>
  );
}
