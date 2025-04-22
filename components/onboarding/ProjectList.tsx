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
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
export default function ProjectList() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const {
    projects: contextProjects,
    addProject: addProjectToContext,
    updateProject: updateProjectInContext,
    deleteProject: deleteProjectFromContext,
    resetAllProjects,
  } = useProjects();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);
      if (!session) {
        return;
      }
      const syncedProjects = await ProjectService.syncProjects();
      setProjects(syncedProjects);

      // Initialize context ONLY if it's empty
      if (contextProjects.length === 0 && syncedProjects.length > 0) {
        syncedProjects.forEach((project) => {
          addProjectToContext({
            name: project.name,
            goal: project.goal,
            color: project.color,
          });
        });
      }
    } catch (error) {
      console.error("📱 ProjectList - Error loading projects:", error);
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
      // Create project in service first
      const newProject = await ProjectService.createProject({
        name,
        goal,
        color,
      });
      setProjects((prev) => [...prev, newProject]);
      addProjectToContext({
        name: newProject.name,
        goal: newProject.goal,
        color: newProject.color,
      });
    } catch (error) {
      console.error("📱 ProjectList - Error adding project:", error);
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
      if (!projectToUpdate) {
        return;
      }

      const updatedProject = await ProjectService.updateProject({
        ...projectToUpdate,
        name,
        goal,
        color,
      });

      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      updateProjectInContext({
        ...projectToUpdate,
        name,
        goal,
        color,
      });
    } catch (error) {
      console.error("📱 ProjectList - Error updating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await ProjectService.deleteProject(id);

      setProjects((prev) => prev.filter((p) => p.id !== id));
      deleteProjectFromContext(id);
    } catch (error) {
      console.error("📱 ProjectList - Error deleting project:", error);
    }
  };

  // Add reset all projects debug function
  const handleResetAllProjects = async () => {
    try {
      // Use the new context method instead of handling each project individually
      await resetAllProjects();

      // Force reload projects to sync state
      setTimeout(() => {
        loadProjects();
      }, 500);
    } catch (error) {
      console.error("📱 ProjectList - Error resetting projects:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    try {
      setSelectedProject(project);
      setIsModalVisible(true);
    } catch (error) {
      console.error("📱 ProjectList - Error in handleEditProject:", error);
    }
  };

  const handleSave = (name: string, goal: string, color: string) => {
    if (selectedProject) {
      handleUpdateProject(selectedProject.id, name, goal, color);
    } else {
      handleAddProject(name, goal, color);
    }
    setIsModalVisible(false);
    setSelectedProject(null);
  };

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
      {__DEV__ && (
        <View
          style={{ padding: 5, backgroundColor: "#f0f0e0", marginBottom: 5 }}
        >
          <Text style={{ fontSize: 10 }}>
            Local projects: {projects.length}, Context projects:{" "}
            {contextProjects.length}
          </Text>
          <TouchableOpacity
            onPress={handleResetAllProjects}
            style={{
              backgroundColor: "#ff6b6b",
              padding: 5,
              borderRadius: 4,
              marginTop: 2,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
              RESET ALL PROJECTS (DEV ONLY)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm text-gray-600 uppercase">
          ACCOUNT SETTINGS
        </Text>
        <Text className="text-4xl font-bold italic">Projects List</Text>
      </View>

      <Text className="text-blue-600 mb-6">
        Click to edit a project, or add up to 10 projects at a time.
      </Text>

      <ScrollView className="flex-1 mb-4">
        {projects.length === 0 ? (
          <Text className="text-gray-500 text-center">
            No projects yet. Add one to get started.
          </Text>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() => {
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
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          setSelectedProject(null);
          setIsModalVisible(true);
        }}
        className="items-center py-3 mb-6"
      >
        <Text className="text-black text-center">+ Add Project</Text>
      </TouchableOpacity>

      <View className="mb-6 space-y-3">
        <TouchableOpacity className="bg-black py-4 items-center rounded-md">
          <Text className="text-white uppercase font-medium">Save List</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 items-center">
          <Text className="text-black uppercase text-sm">
            Return without saving
          </Text>
        </TouchableOpacity>
      </View>

      <ProjectModal
        visible={isModalVisible}
        onClose={() => {
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
