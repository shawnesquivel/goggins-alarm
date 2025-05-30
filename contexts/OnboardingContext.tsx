import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Onboarding screen types
export enum OnboardingScreenType {
  WELCOME = "welcome",
  CONCEPT = "concept",
  SETUP = "setup",
  TRIAL = "trial",
  LOGIN = "login",
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
      "What is your dream?\n\nHow about a side hustle that makes $100K?\n\n100K followers on Instagram or TikTok?\n\nQuitting your job and starting your dream career.\n\nLet's do a short exercise.",
  },
  {
    id: "welcome2",
    type: OnboardingScreenType.WELCOME,
    title: "Imagine your *dream* life",
    description:
      "Imagine you achieved *all those things* you're dreaming of.\n\nImagine you focused for the next 6 months.\n\nClose your eyes for 30 seconds and *really feel it*.\n\nP.S. This is important. Do it for your future self.",
  },
  {
    id: "welcome3",
    type: OnboardingScreenType.WELCOME,
    title: '"I don\'t have enough *time*."',
    description:
      "The average person:\n\n- Checks their phone 96 times a day (once every 10 minutes)\n\n- Wastes 2.5 hours daily on social media\n\n- Takes 23 minutes to refocus after each distraction\n\nThat's why we built this app to help you reclaim your focus.",
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
    title: "1\n\nIncrease Deep Work *quantity*",
    description:
      "Each work session is like going to the gym.\n\nYour focus is like a muscle.\n\nThe more you use it, the stronger it gets.",
  },
  {
    id: "concept3",
    type: OnboardingScreenType.CONCEPT,
    title: "2\n\nIncrease Deep Work *quality*",
    description:
      "Each Deep Work session, we'll ask:\n\n1. What you're working on\n\n2. How long you'll focus\n\n3. How it felt when you're done\n\nOur AI helps you understand the quality of your deep work over time.",
  },
  {
    id: "concept4",
    type: OnboardingScreenType.CONCEPT,
    title: "3\n\nImprove over time",
    description:
      "Every day, you'll aim to hit your goal (1-3hrs) and build a streak.\n\nOur AI will track your stats over time, and help unlock your *10X* productivity.",
  },
  // {
  //   id: "trial",
  //   type: OnboardingScreenType.TRIAL,
  //   title: "Start your free trial",
  //   description: "Pro Version\n\nAI insights\n\nCreate unlimited projects",
  //   action: "Start 30-Day Free Trial",
  // },
  {
    id: "login",
    type: OnboardingScreenType.LOGIN,
    title: "Sign in to your account",
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
      "We highly recommend starting at 30-60min per day.\n\nYou can change any time.",
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
  progress: number;
  previousProgress: number;
  updateProgress: (progress: number) => void;
  resetOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  currentScreenIndex: 0,
  totalScreens: 0,
  currentScreen: ONBOARDING_SCREENS[0],
  nextScreen: () => {},
  previousScreen: () => {},
  progress: 0,
  previousProgress: 0,
  updateProgress: () => {},
  resetOnboarding: async () => {},
  completeOnboarding: async () => {},
});

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [currentScreenIndex, setCurrentScreenIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [previousProgress, setPreviousProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if onboarding has been completed before
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (value === "true") {
          setIsOnboarding(false);
        } else {
          setIsOnboarding(true);
        }
      } catch (error) {
        console.error(
          "[OnboardingContext] Error checking onboarding status:",
          error
        );
        setIsOnboarding(true);
      } finally {
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

  const updateProgress = (newProgress: number) => {
    setPreviousProgress(progress);
    setProgress(newProgress);
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
        progress,
        previousProgress,
        updateProgress,
        resetOnboarding,
        completeOnboarding,
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
