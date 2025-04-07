import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@/components/Themed";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useProjects } from "@/contexts/ProjectContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSessionStart?: () => void;
}

export default function StartSessionModal({
  visible,
  onClose,
  onSessionStart,
}: StartSessionModalProps) {
  // Get projects from ProjectContext, startFocusSession from AlarmContext
  const { startFocusSession } = usePomodoro();
  const { projects, loading } = useProjects();

  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25); // TODO: Change default duration to public.users.default_deep_work_minutes
  const [isListening, setIsListening] = useState(false);

  // Initialize with first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleStartSession = () => {
    if (!taskDescription || !selectedProjectId) return;

    startFocusSession(taskDescription, selectedProjectId, []);
    if (onSessionStart) {
      onSessionStart();
    }
    onClose();
  };

  // Mock voice recognition with a preset task
  const startVoiceRecognition = () => {
    setIsListening(true);
    // Simulate voice processing after 2 seconds
    setTimeout(() => {
      setTaskDescription("Working on the landing page for Project X");
      setIsListening(false);
    }, 2000);
  };

  // Get project name by ID
  const getProjectName = (id: string): string => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : "Select Project";
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="bg-white w-11/12 max-w-md rounded-2xl overflow-hidden">
          {/* Header */}
          <View className="p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-center">
              Start Focus Session
            </Text>
          </View>

          {/* Form */}
          <View className="p-6">
            {isListening ? (
              <View className="items-center py-8">
                <Text className="text-xl font-medium mb-4">LISTENING...</Text>
                <TouchableOpacity
                  onPress={() => setIsListening(false)}
                  className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-600 font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Task Description */}
                <View className="mb-6">
                  <Text className="text-sm font-medium mb-2 text-gray-700">
                    What are you working on?
                  </Text>
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-base"
                      placeholder="Enter task description"
                      value={taskDescription}
                      onChangeText={setTaskDescription}
                    />
                    <TouchableOpacity
                      onPress={startVoiceRecognition}
                      className="ml-2 w-10 h-10 rounded-full bg-black items-center justify-center"
                    >
                      <FontAwesome name="microphone" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Project Selection */}
                <View className="mb-6">
                  <Text className="text-sm font-medium mb-2 text-gray-700">
                    Project
                  </Text>
                  {loading ? (
                    <Text className="text-sm text-gray-600 italic">
                      Loading projects...
                    </Text>
                  ) : projects.length === 0 ? (
                    <Text className="text-sm text-gray-600 italic">
                      No projects available. Please create a project first.
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {projects.map((project) => (
                        <TouchableOpacity
                          key={project.id}
                          onPress={() => setSelectedProjectId(project.id)}
                          className={`px-4 py-2 rounded-full border-2 ${
                            selectedProjectId === project.id
                              ? "border-black"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: project.color }}
                        >
                          <Text
                            className={`${
                              selectedProjectId === project.id
                                ? "text-black font-medium"
                                : "text-white"
                            }`}
                          >
                            {project.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Duration Selection */}
                <View className="mb-6">
                  <Text className="text-sm font-medium mb-2 text-gray-700">
                    Duration (minutes)
                  </Text>
                  <View className="flex-row gap-2">
                    {[15, 25, 45].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        onPress={() => setSessionDuration(duration)}
                        className={`flex-1 py-2 rounded-lg border-2 ${
                          sessionDuration === duration
                            ? "border-black bg-black"
                            : "border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-center ${
                            sessionDuration === duration
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {duration}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 p-4 border-r border-gray-200"
            >
              <Text className="text-center text-gray-600 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartSession}
              className={`flex-1 p-4 ${
                !taskDescription.trim() ||
                !selectedProjectId ||
                loading ||
                projects.length === 0
                  ? "bg-gray-400"
                  : "bg-black"
              }`}
              disabled={
                !taskDescription.trim() ||
                !selectedProjectId ||
                loading ||
                projects.length === 0
              }
            >
              <Text className="text-center text-white font-medium">
                Start Session
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
