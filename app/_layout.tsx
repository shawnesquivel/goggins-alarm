import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/components/useColorScheme";
import { PomodoroProvider } from "@/contexts/AlarmContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountSetupProvider } from "@/contexts/AccountSetupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAccountSetup } from "@/contexts/AccountSetupContext";
import { View, Text, ActivityIndicator } from "react-native";
import {
  Figtree_400Regular,
  Figtree_500Medium,
} from "@expo-google-fonts/figtree";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
} from "@expo-google-fonts/libre-baskerville";
import { LibreCaslonText_400Regular } from "@expo-google-fonts/libre-caslon-text";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { checkConnection } from "@/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import SupabaseLogin from "@/components/auth/SupabaseLogin";
import AccountSetupFlow from "@/components/account-setup/AccountSetupFlow";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#0000ff" />
    <Text className="mt-4 text-gray-600">Loading...</Text>
  </View>
);

const OfflineIndicator = () => (
  <View className="bg-gray-100/90 py-1 flex flex-row items-center justify-center">
    <MaterialIcons
      name="cloud-off"
      size={12}
      color="#4B5563"
      className="mr-1"
    />
    <Text className="text-gray-600 text-xs">
      Offline - Changes will sync when online
    </Text>
  </View>
);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
    LibreCaslonText_400Regular,
  });

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const connected = await checkConnection();
        setIsConnected(connected);
        if (!connected) {
          console.log("Supabase connection failed - entering offline mode");
        }
      } catch (error) {
        console.log("Error checking connection:", error);
        setIsConnected(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AccountSetupProvider>
        <OnboardingProvider>
          <ProjectProvider>
            <PomodoroProvider>
              {!isConnected && <OfflineIndicator />}
              <RootLayoutNav />
            </PomodoroProvider>
          </ProjectProvider>
        </OnboardingProvider>
      </AccountSetupProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isOnboarding } = useOnboarding();
  const { isSetupRequired, isCheckingSetup } = useAccountSetup();
  const colorScheme = useColorScheme();

  // Show loading screen while checking auth state
  if (isAuthLoading || isCheckingSetup) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated and not in onboarding
  if (!session && !isOnboarding) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <SupabaseLogin />
      </View>
    );
  }

  // Show account setup if authenticated but setup is required
  if (session && isSetupRequired) {
    return <AccountSetupFlow />;
  }

  // Show main app layout if authenticated or in onboarding
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "FAQ",
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="login"
          options={{ presentation: "fullScreenModal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
