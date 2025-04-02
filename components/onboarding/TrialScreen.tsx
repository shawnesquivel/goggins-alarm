import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface TrialScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function TrialScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: TrialScreenProps) {
  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Deep Work</Text>
            <Text style={styles.optionFeature}>• Track focus time</Text>
            <Text style={styles.optionFeature}>• Increase productivity</Text>
            <Text style={styles.optionFeature}>• Set goals and intentions</Text>
            <Text style={styles.optionFeature}>• Track progress</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.trialButton} onPress={onNext}>
          <Text style={styles.trialButtonText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.subscriptionText}>
          After trial ends, you'll be charged $39.99/year ($3.33/month)
        </Text>

        <Text style={styles.termsText}>
          You can cancel anytime in your App Store settings before the trial
          ends
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  optionFeature: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  trialButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  trialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subscriptionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
