// components/debug/SessionDebugPanel.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  DbSession,
  DbPeriod,
  SessionPendingOperation,
  SESSION_STORAGE_KEYS,
} from "@/types/session";
import { SessionService } from "@/services/SessionService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SessionDebugPanelProps {
  visible?: boolean;
}

export default function SessionDebugPanel({
  visible = true,
}: SessionDebugPanelProps) {
  const [currentSession, setCurrentSession] = useState<DbSession | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<DbPeriod | null>(null);
  const [pendingOperations, setPendingOperations] = useState<
    SessionPendingOperation[]
  >([]);
  const [expanded, setExpanded] = useState(false);

  const loadSessionData = async () => {
    try {
      const [session, period, pendingOps] = await Promise.all([
        SessionService.getCurrentSession(),
        SessionService.getCurrentPeriod(),
        SessionService.getPendingOperations(),
      ]);

      setCurrentSession(session);
      setCurrentPeriod(period);
      setPendingOperations(pendingOps);
    } catch (error) {
      console.error("Error loading session data:", error);
    }
  };

  const clearPendingSessions = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.PENDING_OPS);
      await loadSessionData();
    } catch (error) {
      console.error("Error clearing pending sessions:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadSessionData();
      const interval = setInterval(loadSessionData, 3000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!__DEV__ || !visible) return null;

  return (
    <View className="bg-white p-4 rounded-lg shadow">
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row justify-between items-center"
      >
        <Text className="text-sm font-bold">Session Debug Panel</Text>
        <Text className="text-xs">{expanded ? "▼" : "▶"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-4">
          <View className="mb-4">
            <Text className="text-xs font-bold">Current Session:</Text>
            <Text className="text-xs">
              {currentSession
                ? JSON.stringify(currentSession, null, 2)
                : "None"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold">Current Period:</Text>
            <Text className="text-xs">
              {currentPeriod ? JSON.stringify(currentPeriod, null, 2) : "None"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold">
              Pending Operations ({pendingOperations.length}):
            </Text>
            <ScrollView className="max-h-40">
              <Text className="text-xs">
                {JSON.stringify(pendingOperations, null, 2)}
              </Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={clearPendingSessions}
            className="bg-red-500 p-2 rounded"
          >
            <Text className="text-xs text-white text-center">
              Clear Pending Sessions
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
