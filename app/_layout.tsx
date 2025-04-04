import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/components/useColorScheme";
import { PomodoroProvider } from "@/contexts/AlarmContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  Figtree_400Regular,
  Figtree_500Medium,
} from "@expo-google-fonts/figtree";
import { LibreBaskerville_400Regular } from "@expo-google-fonts/libre-baskerville";

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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    LibreBaskerville_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Wrap with providers and directly render the RootLayoutNav
  // No navigation decision-making in this component
  return (
    <AuthProvider>
      <OnboardingProvider>
        <PomodoroProvider>
          <RootLayoutNav />
        </PomodoroProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

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
