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

export default function Onboarding() {
  const {
    currentScreen,
    currentScreenIndex,
    totalScreens,
    nextScreen,
    previousScreen,
    completeOnboarding,
  } = useOnboarding();

  // Render appropriate screen based on type
  const renderScreen = () => {
    switch (currentScreen.type) {
      case OnboardingScreenType.SETUP:
        if (currentScreen.id === "setup1") {
          return (
            <ProjectSetupScreen
              screen={currentScreen}
              currentStep={currentScreenIndex}
              totalSteps={totalScreens}
              onNext={nextScreen}
              onBack={previousScreen}
            />
          );
        } else if (currentScreen.id === "setup2") {
          return (
            <TimerSetupScreen
              screen={currentScreen}
              currentStep={currentScreenIndex}
              totalSteps={totalScreens}
              onNext={nextScreen}
              onBack={previousScreen}
            />
          );
        }
        break;

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

      case OnboardingScreenType.START:
        return (
          <StartSessionScreen
            screen={currentScreen}
            currentStep={currentScreenIndex}
            totalSteps={totalScreens}
            onNext={completeOnboarding}
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
