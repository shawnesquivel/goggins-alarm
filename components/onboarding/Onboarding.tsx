import React from "react";
import { View } from "react-native";
import {
  useOnboarding,
  OnboardingScreenType,
} from "@/contexts/OnboardingContext";
import OnboardingScreen from "./OnboardingScreen";
import ProjectSetupScreen from "./ProjectSetupScreen";
import TimerSetupScreen from "./TimerSetupScreen";
import StartSessionScreen from "./StartSessionScreen";
import TrialScreen from "./TrialScreen";
import LoginScreen from "./LoginScreen";
import DailyGoalScreen from "./DailyGoalScreen";
import { useRouter } from "expo-router";

export default function Onboarding() {
  const {
    currentScreen,
    currentScreenIndex,
    totalScreens,
    nextScreen,
    previousScreen,
    completeOnboarding,
  } = useOnboarding();
  const router = useRouter();

  // Render appropriate screen based on type
  const renderScreen = () => {
    switch (currentScreen.type) {
      case OnboardingScreenType.SETUP:
        if (currentScreen.id === "setup2") {
          return (
            <TimerSetupScreen
              screen={currentScreen}
              currentStep={currentScreenIndex}
              totalSteps={totalScreens}
              onNext={nextScreen}
              onBack={previousScreen}
            />
          );
        } else if (currentScreen.id === "setup3") {
          return (
            <DailyGoalScreen
              screen={currentScreen}
              currentStep={currentScreenIndex}
              totalSteps={totalScreens}
              onNext={() => {
                // Don't do any navigation here - it's handled in the DailyGoalScreen component
                console.log(
                  "[Onboarding] Daily goal setup complete - navigation handled in component"
                );
              }}
              onBack={previousScreen}
            />
          );
        }
        // Remove the break to allow falling through to default case for any other setup screens
        return (
          <OnboardingScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={nextScreen}
            onBack={previousScreen}
          />
        );

      case OnboardingScreenType.TRIAL:
        return (
          <TrialScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={nextScreen}
            onBack={previousScreen}
          />
        );

      case OnboardingScreenType.LOGIN:
        return (
          <LoginScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={nextScreen}
            onBack={previousScreen}
          />
        );

      case OnboardingScreenType.START:
        return (
          <StartSessionScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={() => {
              // Don't do any navigation here - it's handled in the StartSessionScreen component
              console.log(
                "[Onboarding] Start session complete - navigation handled in component"
              );
            }}
            onBack={previousScreen}
          />
        );

      default:
        // Generic screens (welcome, concept)
        return (
          <OnboardingScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={nextScreen}
            onBack={currentScreenIndex > 0 ? previousScreen : undefined}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}
