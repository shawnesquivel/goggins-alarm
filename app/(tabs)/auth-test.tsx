import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { AuthService } from "@/services/AuthService";
import AuthProjectTests from "@/services/AuthProjectTestUtils";
import { createUserProfile } from "@/lib/supabase";

export default function AuthTestScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  // Check current user on mount
  useEffect(() => {
    checkCurrentUser();

    // Set up auth state listener
    const subscription = AuthService.onAuthStateChange((newUser, event) => {
      setUser(newUser);
      setStatus(`Auth state changed: ${event}`);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkCurrentUser = async () => {
    setLoading(true);
    setStatus("Checking current user...");
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setStatus(
        currentUser
          ? `Logged in as: ${currentUser.email}`
          : "No user authenticated"
      );
    } catch (error) {
      setStatus(`Error checking user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Separate handler for React Native buttons (uses GestureResponderEvent)
  const handleSignInPress = async (_event?: GestureResponderEvent) => {
    if (!email || !password) {
      setStatus("Please enter email and password");
      return;
    }

    setLoading(true);
    setStatus("Signing in...");
    try {
      const data = await AuthService.signIn(email, password);
      setUser(data.session?.user);
      setStatus(`Signed in as: ${data.session?.user?.email}`);
    } catch (error) {
      setStatus(`Error signing in: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Separate handler for web form (uses FormEvent)
  const handleSignInSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSignInPress();
  };

  // Separate handler for React Native buttons (uses GestureResponderEvent)
  const handleSignUpPress = async (_event?: GestureResponderEvent) => {
    if (!email || !password) {
      setStatus("Please enter email and password");
      return;
    }

    setLoading(true);
    setStatus("Signing up...");
    try {
      const data = await AuthService.signUp(email, password);
      setStatus(
        `Signed up successfully. ${
          data.user?.identities?.length === 0
            ? "Email confirmation required."
            : ""
        }`
      );
    } catch (error) {
      setStatus(`Error signing up: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Separate handler for web form (uses FormEvent)
  const handleSignUpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSignUpPress();
  };

  const handleSignOut = async () => {
    setLoading(true);
    setStatus("Signing out...");
    try {
      await AuthService.signOut();
      setUser(null);
      setStatus("Signed out successfully");
    } catch (error) {
      setStatus(`Error signing out: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setStatus("Creating project with auth...");
    try {
      const project = await AuthProjectTests.createProject();
      if (project) {
        setStatus(`Created project: ${project.name}`);
      }
    } catch (error) {
      setStatus(`Error creating project: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProjects = async () => {
    setLoading(true);
    setStatus("Getting user projects...");
    try {
      const projects = await AuthProjectTests.getUserProjects();
      setStatus(`Found ${projects?.length || 0} projects`);
    } catch (error) {
      setStatus(`Error getting projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProjects = async () => {
    setLoading(true);
    setStatus("Syncing projects...");
    try {
      const projects = await AuthProjectTests.syncProjects();
      setStatus(`Synced ${projects?.length || 0} projects`);
    } catch (error) {
      setStatus(`Error syncing projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserProfile = async () => {
    setLoading(true);
    setStatus("Creating user profile...");
    try {
      const profile = await createUserProfile();
      if (profile) {
        setStatus(`User profile created/found for: ${profile.id}`);
      } else {
        setStatus("No user authenticated to create profile");
      }
    } catch (error) {
      setStatus(`Error creating user profile: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAuthTest = async () => {
    if (!email || !password) {
      setStatus("Please enter email and password for test");
      return;
    }

    setLoading(true);
    setStatus("Running auth test flow...");
    try {
      await AuthProjectTests.runAuthTestFlow(email, password);
      setStatus("Auth test flow completed");
    } catch (error) {
      setStatus(`Error in auth test flow: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to render auth form as web form or native inputs based on platform
  const renderAuthForm = () => {
    if (Platform.OS === "web") {
      // Web version - use proper form element
      return (
        <form onSubmit={handleSignInSubmit} style={{ marginBottom: 16 }}>
          <Text style={styles.subtitle}>Authentication</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            spellCheck={false}
          />
          <View style={styles.authButtons}>
            <Pressable
              style={styles.button}
              onPress={handleSignInPress}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={handleSignUpPress}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>
          </View>
        </form>
      );
    } else {
      // Native version - no form needed
      return (
        <View style={styles.authForm}>
          <Text style={styles.subtitle}>Authentication</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.authButtons}>
            <Button
              title="Sign In"
              onPress={handleSignInPress}
              disabled={loading}
            />
            <Button
              title="Sign Up"
              onPress={handleSignUpPress}
              disabled={loading}
            />
          </View>
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView>
        <Text style={styles.title}>Auth Integration Test</Text>

        <Text style={styles.status}>{status}</Text>

        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.subtitle}>Logged In User</Text>
            <Text>Email: {user.email}</Text>
            <Text>ID: {user.id}</Text>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              disabled={loading}
            />
          </View>
        ) : (
          renderAuthForm()
        )}

        <Text style={styles.subtitle}>Test Operations</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Check Current User"
            onPress={checkCurrentUser}
            disabled={loading}
          />
          <Button
            title="Create User Profile"
            onPress={handleCreateUserProfile}
            disabled={loading}
          />
          <Button
            title="Create Project"
            onPress={handleCreateProject}
            disabled={loading}
          />
          <Button
            title="Get Projects"
            onPress={handleGetProjects}
            disabled={loading}
          />
          <Button
            title="Sync Projects"
            onPress={handleSyncProjects}
            disabled={loading}
          />
          <Button
            title="Run Auth Test Flow"
            onPress={handleRunAuthTest}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  status: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginBottom: 16,
  },
  authForm: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: "#e6f7ff",
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
    gap: 8,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
