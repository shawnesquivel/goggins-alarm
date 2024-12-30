import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alarm } from "@/types/alarm";
import { AlarmSound } from "@/utils/sound";

interface AlarmContextType {
  alarms: Alarm[];
  lastShoePhotoDate: Date | null;
  setLastShoePhotoDate: (date: Date | null) => void;
  hasShoePhotoToday: () => boolean;
  updateAlarm: (alarm: Alarm) => void;
  alarmSound: AlarmSound;
  isAlarmTriggered: boolean;
  setIsAlarmTriggered: React.Dispatch<React.SetStateAction<boolean>>;
  nextAlarmTime: Date | null;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    // Create default 6 AM alarm
    const defaultTime = new Date();
    defaultTime.setHours(6, 0, 0, 0); // Set to 6:00:00 AM

    const defaultAlarm: Alarm = {
      id: "default",
      time: defaultTime,
      enabled: true,
      label: "Morning Workout",
      repeat: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    };
    return [defaultAlarm];
  });

  const [lastShoePhotoDate, setLastShoePhotoDate] = useState<Date | null>(null);
  const alarmSound = new AlarmSound();
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [nextAlarmTime, setNextAlarmTime] = useState<Date | null>(null);

  // Load saved date when component mounts
  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem("lastShoePhotoDate");
        if (savedDate) {
          setLastShoePhotoDate(new Date(savedDate));
        }
      } catch (error) {
        console.error("Error loading saved date:", error);
      }
    };
    loadSavedDate();
  }, []);

  // Save date whenever it changes
  const handleSetLastShoePhotoDate = async (date: Date | null) => {
    setLastShoePhotoDate(date);
    try {
      if (date) {
        await AsyncStorage.setItem("lastShoePhotoDate", date.toISOString());
      } else {
        await AsyncStorage.removeItem("lastShoePhotoDate");
      }
    } catch (error) {
      console.error("Error saving date:", error);
    }
  };

  const hasShoePhotoToday = () => {
    if (!lastShoePhotoDate) return false;

    const today = new Date();
    const photoDate = new Date(lastShoePhotoDate);

    return (
      photoDate.getDate() === today.getDate() &&
      photoDate.getMonth() === today.getMonth() &&
      photoDate.getFullYear() === today.getFullYear()
    );
  };

  const addAlarm = (newAlarm: Omit<Alarm, "id">) => {
    const alarm: Alarm = {
      ...newAlarm,
      id: newAlarm.id || Date.now().toString(),
    };
    setAlarms((current) => {
      // If it's a default alarm and we already have one, don't add it
      if (alarm.id === "default" && current.some((a) => a.id === "default")) {
        return current;
      }
      return [...current, alarm];
    });
  };

  const toggleAlarm = (id: string) => {
    setAlarms((current) =>
      current.map((alarm) => {
        // Don't allow disabling if it's past alarm time and no photo taken
        if (alarm.id === id) {
          const now = new Date();
          const alarmTime = alarm.time;
          const isPastAlarm =
            now.getHours() > alarmTime.getHours() ||
            (now.getHours() === alarmTime.getHours() &&
              now.getMinutes() >= alarmTime.getMinutes());

          // If trying to disable alarm
          if (alarm.enabled && isPastAlarm && !hasShoePhotoToday()) {
            return alarm; // Keep alarm enabled
          }
          return { ...alarm, enabled: !alarm.enabled };
        }
        return alarm;
      })
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((current) => current.filter((alarm) => alarm.id !== id));
  };

  const updateAlarm = (updatedAlarm: Alarm) => {
    setAlarms((current) =>
      current.map((alarm) =>
        alarm.id === updatedAlarm.id ? updatedAlarm : alarm
      )
    );
  };

  // Move alarm check logic to context
  useEffect(() => {
    const interval = setInterval(() => {
      if (!alarms[0] || !alarms[0].enabled) return;

      const now = new Date();
      const alarmTime = alarms[0].time;

      const isPastAlarm =
        now.getHours() > alarmTime.getHours() ||
        (now.getHours() === alarmTime.getHours() &&
          now.getMinutes() >= alarmTime.getMinutes());

      if (isPastAlarm && !hasShoePhotoToday()) {
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 1);
        nextTime.setSeconds(0);
        setNextAlarmTime(nextTime);

        const isSnoozeTime = now.getSeconds() === 0;
        if (isSnoozeTime) {
          console.log("🚨 TRIGGERING ALARM FROM CONTEXT!");
          alarmSound.playMainSound();
          setIsAlarmTriggered(true);
        }
      } else {
        setNextAlarmTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, hasShoePhotoToday]);

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        lastShoePhotoDate,
        setLastShoePhotoDate: handleSetLastShoePhotoDate,
        hasShoePhotoToday,
        addAlarm,
        toggleAlarm,
        deleteAlarm,
        updateAlarm,
        alarmSound,
        isAlarmTriggered,
        setIsAlarmTriggered,
        nextAlarmTime,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export const useAlarms = () => {
  const context = useContext(AlarmContext);
  if (context === undefined) {
    throw new Error("useAlarms must be used within an AlarmProvider");
  }
  return context;
};
