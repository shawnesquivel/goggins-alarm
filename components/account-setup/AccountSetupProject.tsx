import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAccountSetup } from "@/contexts/AccountSetupContext";
import { supabase } from "@/lib/supabase";
import EditProjectModal from "@/components/shared/modals/EditProjectModal";
import { Project } from "@/types/project";

/**
 * AccountSetupProject component for setting up the user's first project
 * during the account setup process
 */
export default function AccountSetupProject() {
  const { nextStep } = useAccountSetup();
  const [modalVisible, setModalVisible] = useState(false); // Start false, then set to true in useEffect
  const [isSaving, setIsSaving] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project> | null>(null);

  // Show the modal with a slight delay to ensure component is fully mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[AccountSetupProject] Setting modal visible");
      setModalVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Function to verify the project was saved correctly
  const verifyProjectSaved = async (projectId: string) => {
    try {
      // Fetch the project from the database
      const { data: project, error } = await supabase
        .from("projects")
        .select("id, name, goal, color")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error(
          "[AccountSetupProject] Error fetching project data:",
          error
        );
        return;
      }

      // Log the saved project
      console.log(
        "[AccountSetupProject] VERIFICATION - Project in database:",
        project
      );

      // Check if the saved values match the expected values
      if (
        project &&
        project.name === newProject?.name &&
        project.goal === newProject?.goal &&
        project.color === newProject?.color
      ) {
        console.log(
          "[AccountSetupProject] VERIFICATION SUCCESSFUL: Project saved correctly"
        );
      } else {
        console.warn(
          "[AccountSetupProject] VERIFICATION FAILED: Project data mismatch",
          {
            expectedValues: {
              name: newProject?.name,
              goal: newProject?.goal,
              color: newProject?.color,
            },
            actualValues: {
              name: project?.name,
              goal: project?.goal,
              color: project?.color,
            },
          }
        );
      }

      // Also fetch the count of user's projects
      const { data: projectCount, error: countError } = await supabase
        .from("projects")
        .select("id", { count: "exact" });

      if (countError) {
        console.error(
          "[AccountSetupProject] Error counting projects:",
          countError
        );
      } else {
        console.log(
          "[AccountSetupProject] User now has",
          projectCount?.length,
          "projects"
        );
      }
    } catch (error) {
      console.error("[AccountSetupProject] Error during verification:", error);
    }
  };

  const handleSaveProject = async (
    name: string,
    goal: string,
    color: string
  ) => {
    console.log("[AccountSetupProject] Saving new project:", {
      name,
      goal,
      color,
    });
    setIsSaving(true);

    try {
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("[AccountSetupProject] No active session found");
        return;
      }

      const userId = sessionData.session.user.id;

      // First save the expected values for verification
      const projectData = {
        name,
        goal,
        color,
      };
      setNewProject(projectData);

      // Create a new project in the database
      // The await ensures this completes before verification
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: name,
          goal: goal,
          color: color,
        })
        .select("id, name, goal, color, user_id")
        .single();

      if (error) {
        console.error("[AccountSetupProject] Error creating project:", error);
      } else {
        console.log(
          "[AccountSetupProject] Successfully created project:",
          project
        );

        // Since the operation is already awaited above,
        // verification will run after the insert is complete
        await verifyProjectSaved(project.id);

        // Move to the next step
        setModalVisible(false);
        nextStep();
      }
    } catch (error) {
      console.error(
        "[AccountSetupProject] Error during project creation:",
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    // We don't want to allow closing without creating a project
    // So we'll just reopen the modal
    console.log("[AccountSetupProject] Attempting to close modal - reopening");

    // Brief delay before reopening to avoid potential race conditions
    setTimeout(() => {
      setModalVisible(true);
    }, 100);
  };

  // Dummy delete function - won't be used in creation mode
  const handleDeleteProject = () => {
    console.log("[AccountSetupProject] Delete not available in creation mode");
  };

  return (
    <View style={styles.container}>
      {/* Only show instructions when modal isn't visible */}
      {!modalVisible && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Let's set up your first project
          </Text>
        </View>
      )}

      {/* The modal is directly attached to the root View for better stacking context */}
      <EditProjectModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        mode="add" // Use "add" mode to create a new project
      />

      {isSaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Creating your project...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionContainer: {
    padding: 20,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
});
