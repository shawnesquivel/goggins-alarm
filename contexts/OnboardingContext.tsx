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
    title: '"What do you *really* want?"',
    description:
      "What is your dream?\n\nHow about A side hustle that makes $100K?\n\n100K followers on Instagram or TikTok?\n\nQuitting your job and starting your dream career.\n\nLet's do a short exercise.",
  },
  {
    id: "welcome2",
    type: OnboardingScreenType.WELCOME,
    title: "Imagine your *dream* life",
    description:
      "Imagine you had *all those things* you're dreaming of.\n\nImagine how you'd feel if you focused for the next 6 months.\n\nClose your eyes for 30 seconds and *really feel it*.\n\nP.S. This is important. Do it for your future self.",
  },
  {
    id: "welcome3",
    type: OnboardingScreenType.WELCOME,
    title: '"I ~don\'t~ have enough time."',
    description:
      "The average person:\n- Checks their phone 96 times a day (once every 10 minutes)\n- Wastes 2.5 hours daily on social media\n- Takes 23 minutes to refocus after each distraction\n\nThat's why we built this app to help you reclaim your focus.",
  },
  {
    id: "concept1",
    type: OnboardingScreenType.CONCEPT,
    title: "Deep Work: Your *Unfair* Advantage",
    description:
      "Deep work means to concentrate for 30-90min with *zero* distractions.\n\nDeep Work = Quantity of Work × Quality of Work\n\nWhat others accomplish in 10 distracted hours, you'll finish in just 3.\n\nThis system took us from being in careers we hated, to working in our dream jobs remotely around the world.\n\nHere's how...",
  },
  {
    id: "concept2",
    type: OnboardingScreenType.CONCEPT,
    title: "1. Increase Deep Work quantity",
    description:
      "Each work session is like going to the gym.\n\nYour focus is like a muscle.\n\nThe more you use it, the stronger it gets.",
  },
  {
    id: "concept3",
    type: OnboardingScreenType.CONCEPT,
    title: "2. Increase Deep Work quality",
    description:
      "Each Deep Work session, we'll ask:\n\n1. What you're working on\n2. How long you'll focus\n3. How it felt when you're done\n\nOur AI helps you understand the quality of your deep work over time.",
  },
  {
    id: "concept4",
    type: OnboardingScreenType.CONCEPT,
    title: "3. Improve over time",
    description:
      "Every day, you'll aim to hit your goal (1-3hrs) and build a streak.\n\nOur AI will track your stats over time, and help unlock your *10X* productivity.",
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
    id: "setup3",
    type: OnboardingScreenType.SETUP,
    title: "Set your daily intention goal.",
    description:
      "Most people fail because they push *too hard, too fast*.\n\n~Don't~ be that person!\n\nSet a daily focus goal that you can commit to for the next 7 days, no matter what.\n\nWe highly recommend starting at 30-60min per day.\n\nYou can change this goal any time.",
  },
  {
    id: "start",
    type: OnboardingScreenType.START,
    title: "Begin with *intention*.",
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if onboarding has been completed before
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (value === "true") {
          console.log("[OnboardingContext] Onboarding previously completed.");
          setIsOnboarding(false);
        } else {
          console.log("[OnboardingContext] Onboarding not completed.");
          setIsOnboarding(true);
        }
      } catch (error) {
        console.error(
          "[OnboardingContext] Error checking onboarding status:",
          error
        );
        setIsOnboarding(true);
      } finally {
        console.log(
          "[OnboardingContext] Finished check, setting isLoading false."
        );
        setIsLoading(false);
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
    console.log("[OnboardingContext] Resetting onboarding...");
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      console.log("[OnboardingContext] AsyncStorage key removed.");
      setIsOnboarding(true);
      setCurrentScreenIndex(0);
      console.log(
        "[OnboardingContext] State set: isOnboarding=true, currentScreenIndex=0"
      );
    } catch (error) {
      console.error("[OnboardingContext] Error resetting onboarding:", error);
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
        isLoading,
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
