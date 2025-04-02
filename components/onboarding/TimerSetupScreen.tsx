import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface TimerSetupScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

const { width } = Dimensions.get("window");

export default function TimerSetupScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: TimerSetupScreenProps) {
  const { settings, updateSettings } = usePomodoro();
  const [focusDuration, setFocusDuration] = useState(30);
  const [breakDuration, setBreakDuration] = useState(5);

  const handleUpdateSettings = () => {
    updateSettings({
      ...settings,
      focusDuration,
      breakDuration,
    });
    onNext();
  };

  const incrementFocus = () => {
    setFocusDuration((prev) => Math.min(prev + 5, 180));
  };

  const decrementFocus = () => {
    setFocusDuration((prev) => Math.max(prev - 5, 5));
  };

  const incrementBreak = () => {
    setBreakDuration((prev) => Math.min(prev + 5, 30));
  };

  const decrementBreak = () => {
    setBreakDuration((prev) => Math.max(prev - 5, 5));
  };

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleUpdateSettings}
      onBack={onBack}
    >
      <View style={styles.container}>
        <View style={styles.timersContainer}>
          {/* Deep Work section */}
          <View style={styles.timerSection}>
            <Text style={styles.sectionTitle}>Deep Work</Text>
            <View style={styles.timerContent}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={incrementFocus}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>

              <View style={styles.timerBox}>
                <Text style={styles.timeValue}>{focusDuration}</Text>
                <Text style={styles.timeUnit}>MINUTES</Text>
              </View>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={decrementFocus}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Deep Rest section */}
          <View style={styles.timerSection}>
            <Text style={styles.sectionTitle}>Deep Rest</Text>
            <View style={styles.timerContent}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={incrementBreak}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>

              <View style={[styles.timerBox, styles.restBox]}>
                <Text style={styles.timeValue}>{breakDuration}</Text>
                <Text style={styles.timeUnit}>MINUTES</Text>
              </View>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={decrementBreak}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  timersContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 60,
  },
  timerSection: {
    alignItems: "center",
    width: width * 0.42, // Set a specific width based on screen width
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
  },
  timerContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  timerBox: {
    width: 120,
    height: 120,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  restBox: {
    backgroundColor: "#e0e0e0",
  },
  timeValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  timeUnit: {
    fontSize: 14,
    color: "#505050",
    marginTop: 4,
  },
});
