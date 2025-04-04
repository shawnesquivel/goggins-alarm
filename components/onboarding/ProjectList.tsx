import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProjectModal from "../shared/modals/ProjectModal";
import { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  onAddProject: (name: string, goal: string, color: string) => void;
  onUpdateProject: (
    id: string,
    name: string,
    goal: string,
    color: string
  ) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectList({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectListProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      onUpdateProject(selectedProject.id, name, goal, color);
    } else {
      onAddProject(name, goal, color);
    }
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = (id: string) => {
    console.log("handleDeleteProject called with:", id);
    onDeleteProject(id);
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  // Log when modal visibility changes
  useEffect(() => {
    console.log("Modal visibility changed:", isModalVisible);
  }, [isModalVisible]);

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
