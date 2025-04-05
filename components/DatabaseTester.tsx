import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";

type TestResult = {
  name: string;
  status: "success" | "error" | "pending";
  message: string;
  data?: any;
};

const DatabaseTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // User ID from our seed data
  const testUserId = "22222222-2222-2222-2222-222222222222";

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Test 1: Get all users
      addResult({
        name: "Fetching users",
        status: "pending",
        message: "Starting...",
      });
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) {
        addResult({
          name: "Fetching users",
          status: "error",
          message: `Error: ${usersError.message}`,
        });
      } else {
        addResult({
          name: "Fetching users",
          status: "success",
          message: `Successfully fetched ${users.length} users`,
          data: users[0],
        });
      }

      // Test 2: Get all projects with their associated user emails
      addResult({
        name: "Fetching projects",
        status: "pending",
        message: "Starting...",
      });
      const { data: projects, error: projectsError } = await supabase.from(
        "projects"
      ).select(`
          id,
          name,
          goal,
          color,
          users (
            email
          )
        `);

      if (projectsError) {
        addResult({
          name: "Fetching projects",
          status: "error",
          message: `Error: ${projectsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching projects",
          status: "success",
          message: `Successfully fetched ${projects.length} projects`,
          data: projects[0],
        });
      }

      // Test 3: Get completed sessions for a specific user
      addResult({
        name: "Fetching sessions",
        status: "pending",
        message: "Starting...",
      });
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select(
          `
          id,
          task,
          total_deep_work_minutes,
          total_deep_rest_minutes,
          status,
          projects (
            name
          )
        `
        )
        .eq("user_id", testUserId)
        .eq("status", "completed");

      if (sessionsError) {
        addResult({
          name: "Fetching sessions",
          status: "error",
          message: `Error: ${sessionsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching sessions",
          status: "success",
          message: `Successfully fetched ${sessions.length} completed sessions`,
          data: sessions[0],
        });

        // Test 4: Get periods for a specific session
        if (sessions && sessions.length > 0) {
          const sessionId = sessions[0].id;
          addResult({
            name: "Fetching periods",
            status: "pending",
            message: "Starting...",
          });

          const { data: periods, error: periodsError } = await supabase
            .from("periods")
            .select("*")
            .eq("session_id", sessionId);

          if (periodsError) {
            addResult({
              name: "Fetching periods",
              status: "error",
              message: `Error: ${periodsError.message}`,
            });
          } else {
            const workPeriods = periods.filter((p) => p.type === "work").length;
            const restPeriods = periods.filter((p) => p.type === "rest").length;

            addResult({
              name: "Fetching periods",
              status: "success",
              message: `Successfully fetched ${periods.length} periods (${workPeriods} work, ${restPeriods} rest)`,
              data: periods[0],
            });
          }
        }
      }

      // Test 5: Query analytics views
      addResult({
        name: "Fetching analytics",
        status: "pending",
        message: "Starting...",
      });
      const { data: analytics, error: analyticsError } = await supabase
        .from("daily_analytics")
        .select("*")
        .eq("user_id", testUserId);

      if (analyticsError) {
        addResult({
          name: "Fetching analytics",
          status: "error",
          message: `Error: ${analyticsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching analytics",
          status: "success",
          message:
            analytics.length > 0
              ? `Successfully fetched ${analytics.length} analytics records`
              : "No analytics records found - views may need to be refreshed",
          data: analytics[0],
        });
      }
    } catch (error) {
      addResult({
        name: "Global error",
        status: "error",
        message: `Fatal error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Connection Tester</Text>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runAllTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Running Tests..." : "Run Database Tests"}
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultItem,
              result.status === "success" && styles.successItem,
              result.status === "error" && styles.errorItem,
              result.status === "pending" && styles.pendingItem,
            ]}
          >
            <Text style={styles.resultTitle}>{result.name}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>

            {result.data && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Sample Data:</Text>
                <Text style={styles.dataText}>
                  {JSON.stringify(result.data, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loader: {
    marginVertical: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  successItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  errorItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  pendingItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  dataContainer: {
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 4,
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dataText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});

export default DatabaseTester;
