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
import Constants from "expo-constants";

type TestResult = {
  name: string;
  status: "success" | "error" | "pending";
  message: string;
  data?: any;
};

const DatabaseTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // User ID from our seed data
  const testUserId = "22222222-2222-2222-2222-222222222222";

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Get connection info
  const fetchConnectionInfo = async () => {
    try {
      // Get the Supabase URL from Constants
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;

      // Try to get config from Supabase
      const { data: config, error: configError } = await supabase.rpc(
        "get_config_info"
      );

      setConnectionInfo({
        supabaseUrl,
        configInfo: config || "Not available",
        configError: configError?.message,
      });

      addResult({
        name: "Connection Info",
        status: "success",
        message: `Connected to: ${supabaseUrl}`,
        data: {
          url: supabaseUrl,
          configInfo: config || "Not available",
          error: configError?.message,
        },
      });
    } catch (error) {
      addResult({
        name: "Connection Info",
        status: "error",
        message: `Error getting connection info: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Get connection info first
      await fetchConnectionInfo();

      // Test 0: Check schema completeness
      addResult({
        name: "Checking schema completeness",
        status: "pending",
        message: "Starting...",
      });

      try {
        const { data: schemaInfo, error: schemaError } = await supabase.rpc(
          "check_schema_completeness"
        );

        if (schemaError) {
          addResult({
            name: "Checking schema completeness",
            status: "error",
            message: `Error: ${schemaError.message}`,
          });
        } else {
          addResult({
            name: "Checking schema completeness",
            status: "success",
            message: `Schema check complete`,
            data: schemaInfo,
          });
        }
      } catch (error) {
        addResult({
          name: "Checking schema completeness",
          status: "error",
          message: `Error checking schema: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }

      // Test 0b: Check tables in the database
      addResult({
        name: "Listing available tables",
        status: "pending",
        message: "Starting...",
      });

      try {
        const { data: tables, error: tablesError } = await supabase
          .from("pg_tables")
          .select("schemaname, tablename")
          .eq("schemaname", "public");

        if (tablesError) {
          addResult({
            name: "Listing available tables",
            status: "error",
            message: `Error: ${tablesError.message}`,
          });
        } else {
          addResult({
            name: "Listing available tables",
            status: "success",
            message: `Found ${tables?.length || 0} tables in public schema`,
            data: tables,
          });
        }
      } catch (error) {
        addResult({
          name: "Listing available tables",
          status: "error",
          message: `Error listing tables: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }

      // Test 1: Get all users (no filters)
      addResult({
        name: "Fetching users (unfiltered)",
        status: "pending",
        message: "Starting...",
      });
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) {
        addResult({
          name: "Fetching users (unfiltered)",
          status: "error",
          message: `Error: ${usersError.message}`,
        });
      } else {
        addResult({
          name: "Fetching users (unfiltered)",
          status: "success",
          message: `Successfully fetched ${users.length} users`,
          data: users[0],
        });
      }

      // Test 1b: Get users with auth schema
      addResult({
        name: "Fetching auth.users",
        status: "pending",
        message: "Starting...",
      });
      try {
        const { data: authUsers, error: authUsersError } = await supabase
          .from("auth.users")
          .select("*");

        if (authUsersError) {
          addResult({
            name: "Fetching auth.users",
            status: "error",
            message: `Error: ${authUsersError.message}`,
          });
        } else {
          addResult({
            name: "Fetching auth.users",
            status: "success",
            message: `Successfully fetched ${authUsers.length} auth.users`,
            data: authUsers[0],
          });
        }
      } catch (error) {
        addResult({
          name: "Fetching auth.users",
          status: "error",
          message: `Error fetching auth.users: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }

      // Test 2: Get all projects (no filters)
      addResult({
        name: "Fetching projects (unfiltered)",
        status: "pending",
        message: "Starting...",
      });
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*");

      if (projectsError) {
        addResult({
          name: "Fetching projects (unfiltered)",
          status: "error",
          message: `Error: ${projectsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching projects (unfiltered)",
          status: "success",
          message: `Successfully fetched ${projects.length} projects`,
          data: projects[0],
        });
      }

      // Test 2b: Get projects with user_id filter
      addResult({
        name: "Fetching projects by user_id",
        status: "pending",
        message: "Starting...",
      });
      const { data: userProjects, error: userProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", testUserId);

      if (userProjectsError) {
        addResult({
          name: "Fetching projects by user_id",
          status: "error",
          message: `Error: ${userProjectsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching projects by user_id",
          status: "success",
          message: `Successfully fetched ${userProjects.length} projects for user ${testUserId}`,
          data: userProjects[0],
        });
      }

      // Test 3: Get all sessions (no filters)
      addResult({
        name: "Fetching sessions (unfiltered)",
        status: "pending",
        message: "Starting...",
      });
      const { data: allSessions, error: allSessionsError } = await supabase
        .from("sessions")
        .select("*");

      if (allSessionsError) {
        addResult({
          name: "Fetching sessions (unfiltered)",
          status: "error",
          message: `Error: ${allSessionsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching sessions (unfiltered)",
          status: "success",
          message: `Successfully fetched ${allSessions.length} sessions total`,
          data: allSessions[0],
        });
      }

      // Test 3b: Get completed sessions for specific user
      addResult({
        name: "Fetching completed sessions for user",
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
          name: "Fetching completed sessions for user",
          status: "error",
          message: `Error: ${sessionsError.message}`,
        });
      } else {
        addResult({
          name: "Fetching completed sessions for user",
          status: "success",
          message: `Successfully fetched ${sessions.length} completed sessions for user ${testUserId}`,
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

      // Test 6: Check RLS policies
      addResult({
        name: "Checking RLS policies",
        status: "pending",
        message: "Starting...",
      });

      try {
        const { data: policies, error: policiesError } = await supabase.rpc(
          "get_rls_policies"
        );

        if (policiesError) {
          addResult({
            name: "Checking RLS policies",
            status: "error",
            message: `Error: ${policiesError.message}`,
          });
        } else {
          addResult({
            name: "Checking RLS policies",
            status: "success",
            message: `Successfully fetched RLS policy information`,
            data: policies,
          });
        }
      } catch (error) {
        addResult({
          name: "Checking RLS policies",
          status: "error",
          message: `Error checking RLS policies: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }

      // Test 7: Get current authenticated user
      addResult({
        name: "Current authenticated user",
        status: "pending",
        message: "Starting...",
      });

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) {
          addResult({
            name: "Current authenticated user",
            status: "error",
            message: `Error: ${authError.message}`,
          });
        } else {
          addResult({
            name: "Current authenticated user",
            status: "success",
            message: authData?.user
              ? `Authenticated as ${authData.user.email}`
              : "No authenticated user",
            data: authData?.user || "Not authenticated",
          });
        }
      } catch (error) {
        addResult({
          name: "Current authenticated user",
          status: "error",
          message: `Error getting auth user: ${
            error instanceof Error ? error.message : String(error)
          }`,
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
