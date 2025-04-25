import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import {
  useAccountSetup,
  AccountSetupStep,
} from "@/contexts/AccountSetupContext";
import AccountSetupDailyGoal from "./AccountSetupDailyGoal";
import AccountSetupProject from "./AccountSetupProject";
import AccountSetupTimer from "./AccountSetupTimer";

/**
 * AccountSetupFlow manages the account setup process after authentication
 * It shows different screens based on what the user needs to configure:
 * 1. Daily goal configuration
 * 2. Project creation
 * 3. Timer settings
 */
export default function AccountSetupFlow() {
  const {
    currentStep,
    isCheckingSetup,
    nextStep,
    previousStep,
    completeSetup,
  } = useAccountSetup();

  // Show loading while checking setup status
  if (isCheckingSetup) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Checking account setup...</Text>
      </View>
    );
  }

  // Render the appropriate step based on current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case AccountSetupStep.DAILY_GOAL:
        return <AccountSetupDailyGoal />;

      case AccountSetupStep.PROJECT:
        return <AccountSetupProject />;

      case AccountSetupStep.TIMER_SETTINGS:
        return <AccountSetupTimer />;

      case AccountSetupStep.COMPLETED:
        // This should not normally be rendered as the flow should redirect
        // to the main app when setup is completed
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-center">
              Setup Complete!
            </Text>
            <Text className="text-center text-gray-600 mt-2">
              Redirecting to app...
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Progress indicator */}
      <View className="flex-row justify-between items-center px-4 pt-12 pb-4">
        <Text className="text-sm font-medium text-gray-500">
          Step {currentStep + 1} of 3
        </Text>
      </View>

      {/* Main content area */}
      <View className="flex-1">{renderCurrentStep()}</View>

      {/* Debug buttons (visible during development) */}
      <View className="p-4 border-t border-gray-200 flex-row justify-between">
        <TouchableOpacity
          onPress={previousStep}
          className="py-2 px-4 bg-gray-200 rounded-md"
          disabled={currentStep === AccountSetupStep.DAILY_GOAL}
        >
          <Text className="text-gray-700">Previous</Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500 self-center">
          Debug controls
        </Text>

        <TouchableOpacity
          onPress={nextStep}
          className="py-2 px-4 bg-gray-200 rounded-md"
        >
          <Text className="text-gray-700">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
