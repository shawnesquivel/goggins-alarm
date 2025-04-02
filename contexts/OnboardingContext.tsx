import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Onboarding screen types
export enum OnboardingScreenType {
  WELCOME = "welcome",
  CONCEPT = "concept",
  SETUP = "setup",
  TRIAL = "trial",
  START = "start",
}

export interface OnboardingScreen {
  id: string;
  type: OnboardingScreenType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: any;
  action?: string;
}

// Define all onboarding screens
const ONBOARDING_SCREENS: OnboardingScreen[] = [
  {
    id: "welcome1",
    type: OnboardingScreenType.WELCOME,
    title: '"I don\'t have enough time."',
    description:
      "But how many hours have you spent on social media this week instead of working on your dreams?",
  },
  {
    id: "welcome2",
    type: OnboardingScreenType.WELCOME,
    title: '"I don\'t have enough resources."',
    description:
      "Yet every day, people with the same circumstances as you make it.",
  },
  {
    id: "welcome3",
    type: OnboardingScreenType.WELCOME,
    title: '"I just need to lock in"',
    description: "Deep Work = Work Time * Quality of Work",
    subtitle:
      "1 hr of deep work > 3 hrs of scatterbrain\n\nBut why don't you do it?\n\nIt's simpler than you think...",
  },
  {
    id: "concept1",
    type: OnboardingScreenType.CONCEPT,
    title: "You just need discipline.",
    description:
      "If you can lock in, you can become the 1% of the population.\n\nOr go back to doomscrolling 3hrs/day and join the 99%.",
  },
  {
    id: "concept2",
    type: OnboardingScreenType.CONCEPT,
    title: "1. Increase Deep Work quantity",
    description:
      "Each work session is a chance to increase our focus capacity.\n\nFocus goes up and down.\n\nLong Term Consistency > Short Term Intensity",
  },
  {
    id: "concept3",
    type: OnboardingScreenType.CONCEPT,
    title: "2. Increase Deep Work quality",
    description:
      "For each Deep Work session, we ask:\n\n1. What you're working on\n2. How long you'll focus\n3. How it felt when you're done\n\nOur AI helps you understand the quality of your deep work over time.",
  },
  {
    id: "setup1",
    type: OnboardingScreenType.SETUP,
    title: "Your focus areas",
    description: "These will help you categorize your tasks.",
  },
  {
    id: "trial",
    type: OnboardingScreenType.TRIAL,
    title: "Start your free trial",
    description: "Free trial for 7 days, then $39.99/year ($3.33 per month)",
    action: "Start 7-Day Trial",
  },
  {
    id: "setup2",
    type: OnboardingScreenType.SETUP,
    title: "Set a default pomodoro timer",
    description: "You can always change this later.",
  },
  {
    id: "start",
    type: OnboardingScreenType.START,
    title: "Begin with intention.",
    description: "Start your Deep Work Session",
    action: "Start Session",
  },
];

// Storage key
const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

interface OnboardingContextType {
  isOnboarding: boolean;
  currentScreenIndex: number;
  totalScreens: number;
  currentScreen: OnboardingScreen;
  nextScreen: () => void;
  previousScreen: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [currentScreenIndex, setCurrentScreenIndex] = useState<number>(0);

  // Check if onboarding has been completed before
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (value === "true") {
          setIsOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Navigation functions
  const nextScreen = () => {
    if (currentScreenIndex < ONBOARDING_SCREENS.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    }
  };

  const previousScreen = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      setIsOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setIsOnboarding(true);
      setCurrentScreenIndex(0);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentScreenIndex,
        totalScreens: ONBOARDING_SCREENS.length,
        currentScreen: ONBOARDING_SCREENS[currentScreenIndex],
        nextScreen,
        previousScreen,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
