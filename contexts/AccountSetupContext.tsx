import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export enum AccountSetupStep {
  DAILY_GOAL = 0,
  PROJECT = 1,
  TIMER_SETTINGS = 2,
  COMPLETED = 3,
}

interface AccountSetupContextType {
  currentStep: AccountSetupStep;
  isSetupRequired: boolean;
  isCheckingSetup: boolean;
  setCurrentStep: (step: AccountSetupStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  checkSetupStatus: () => Promise<boolean>;
  completeSetup: () => Promise<void>;
}

const AccountSetupContext = createContext<AccountSetupContextType>({
  currentStep: AccountSetupStep.DAILY_GOAL,
  isSetupRequired: false,
  isCheckingSetup: true,
  setCurrentStep: () => {},
  nextStep: () => {},
  previousStep: () => {},
  checkSetupStatus: async () => false,
  completeSetup: async () => {},
});

export function AccountSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState<AccountSetupStep>(
    AccountSetupStep.DAILY_GOAL
  );
  const [isSetupRequired, setIsSetupRequired] = useState<boolean>(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState<boolean>(true);

  // Check if user has completed all required setup steps
  const checkSetupStatus = async (): Promise<boolean> => {
    try {
      setIsCheckingSetup(true);

      // Get user's session to check if they're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Not authenticated, no setup needed yet
        setIsSetupRequired(false);
        setIsCheckingSetup(false);
        return false;
      }

      // Check if user has configured timer settings in the users table
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(
          "daily_goal_minutes, default_deep_work_minutes, default_deep_rest_minutes"
        )
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking user settings:", userError);
        throw userError;
      }

      // Check if daily goal is set
      const hasDailyGoal = !!user && user.daily_goal_minutes !== null;

      // Check if user has at least one project
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .limit(1);

      if (projectsError) {
        console.error("Error checking projects:", projectsError);
        throw projectsError;
      }

      const hasProjects = Array.isArray(projects) && projects.length > 0;

      // Check if timer settings are configured
      const hasTimerSettings =
        !!user &&
        user.default_deep_work_minutes !== null &&
        user.default_deep_rest_minutes !== null;

      // If missing any required setup, setup is required
      const setupRequired = !hasDailyGoal || !hasProjects || !hasTimerSettings;

      console.log("Account setup check:", {
        hasDailyGoal,
        hasProjects,
        hasTimerSettings,
        setupRequired,
      });

      setIsSetupRequired(setupRequired);

      //   Always start at the first screen
      setCurrentStep(AccountSetupStep.DAILY_GOAL);

      return setupRequired;
    } catch (error) {
      console.error("Error in checkSetupStatus:", error);
      // Default to not requiring setup in case of errors
      // This prevents blocking the user from accessing the app
      setIsSetupRequired(false);
      return false;
    } finally {
      setIsCheckingSetup(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkSetupStatus();
  }, []);

  // When current step changes to COMPLETED, verify if all setup requirements are met
  useEffect(() => {
    if (currentStep === AccountSetupStep.COMPLETED) {
      // Check if all setup requirements are now met
      checkSetupStatus().then((stillRequired) => {
        if (!stillRequired) {
          console.log("All account setup requirements met - setup complete!");
          setIsSetupRequired(false);
        } else {
          console.log(
            "Some account setup requirements still not met, staying in setup flow."
          );
        }
      });
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < AccountSetupStep.COMPLETED) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      // If we've reached the COMPLETED step, call completeSetup
      if (newStep === AccountSetupStep.COMPLETED) {
        completeSetup();
      }
    }
  };

  const previousStep = () => {
    if (currentStep > AccountSetupStep.DAILY_GOAL) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const completeSetup = async () => {
    try {
      console.log("Marking account setup as complete");
      setIsSetupRequired(false);

      // Force a fresh check of the setup status to ensure everything is really done
      await checkSetupStatus();
    } catch (error) {
      console.error("Error completing setup:", error);
    }
  };

  return (
    <AccountSetupContext.Provider
      value={{
        currentStep,
        isSetupRequired,
        isCheckingSetup,
        setCurrentStep,
        nextStep,
        previousStep,
        checkSetupStatus,
        completeSetup,
      }}
    >
      {children}
    </AccountSetupContext.Provider>
  );
}

export const useAccountSetup = () => {
  const context = useContext(AccountSetupContext);
  if (context === undefined) {
    throw new Error(
      "useAccountSetup must be used within an AccountSetupProvider"
    );
  }
  return context;
};
