import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Project } from "@/types/project";
import ProjectModal from "@/components/shared/modals/ProjectModal";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";

export default function ProjectsScreen() {
  const { projects, addProject, updateProject, deleteProject, loading } =
    useProjects();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [projectToDelete, setProjectToDelete] = useState<string>("");

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

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f0]">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-5">
          <Text className="text-sm text-gray-600 uppercase">
            ACCOUNT SETTINGS
          </Text>
          <Text className="text-4xl font-bold italic">Projects List</Text>
          <Text className="text-blue-600 mt-2">
            Click to edit a project, or add up to 10 projects at a time.
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading projects...</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Projects List */}
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => handleEditProject(project)}
                className="flex-row items-center mb-4"
                activeOpacity={0.7}
              >
                <View
                  className="w-6 h-6 rounded-full mr-3 border border-gray-400"
                  style={{ backgroundColor: project.color || "#ccc" }}
                />
                <Text className="text-base">{project.name}</Text>
              </TouchableOpacity>
            ))}

            {projects.length === 0 && (
              <View className="items-center justify-center py-6">
                <Text className="text-gray-400 text-center">
                  No projects yet. Add your first project!
                </Text>
              </View>
            )}

            {/* Add Project Text Button */}
            <TouchableOpacity
              className="items-center py-3 mb-6"
              onPress={handleAddProject}
            >
              <Text className="text-black text-center">+ Add Project</Text>
            </TouchableOpacity>

            {/* Save List Button */}
            <TouchableOpacity className="bg-black py-4 items-center rounded-md mb-3">
              <Text className="text-white uppercase font-medium">
                SAVE LIST
              </Text>
            </TouchableOpacity>

            {/* Return Without Saving */}
            <TouchableOpacity className="py-3 items-center mb-6">
              <Text className="text-black uppercase text-sm">
                RETURN WITHOUT SAVING
              </Text>
            </TouchableOpacity>

            {/* Keeping your original red button */}
            {/* {__DEV__ && (
              <TouchableOpacity
                className="bg-red-500 py-3 rounded-lg items-center"
                onPress={() => ProjectService.cleanupPendingOperations()}
              >
                <Text className="text-white font-medium">
                  Clear All Pending Operations
                </Text>
              </TouchableOpacity>
            )} */}
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
    </SafeAreaView>
  );
}
