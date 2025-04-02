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

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const { projects, addProject, deleteProject } = usePomodoro();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectGoal, setNewProjectGoal] = useState("");
  const [selectedColor, setSelectedColor] = useState("#4A90E2");

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

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject({
        name: newProjectName.trim(),
        goal: newProjectGoal.trim() || undefined,
        color: selectedColor,
      });
      setNewProjectName("");
      setNewProjectGoal("");
      setShowNewForm(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View
      style={[styles.projectCard, { borderLeftColor: item.color || "#4A90E2" }]}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Pressable onPress={() => deleteProject(item.id)}>
          <FontAwesome name="trash" size={20} color="#999" />
        </Pressable>
      </View>
      {item.goal && <Text style={styles.projectGoal}>Goal: {item.goal}</Text>}
      <Text style={styles.projectDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
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

        {showNewForm ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create New Project</Text>
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Achieve [X Goal] by Dec 31, 2026"
              value={newProjectGoal}
              onChangeText={setNewProjectGoal}
              placeholderTextColor="#999"
              multiline
            />

            <Text style={styles.label}>Project Color</Text>
            <View style={styles.colorContainer}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowNewForm(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.createButton]}
                onPress={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.addButton}
            onPress={() => setShowNewForm(true)}
          >
            <FontAwesome name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Project</Text>
          </Pressable>
        )}
      </ScrollView>
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
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  createButton: {
    backgroundColor: "#4A90E2",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  createButtonText: {
    color: "#fff",
  },
});
