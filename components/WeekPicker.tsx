// components/WeekPicker.tsx
import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface WeekPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectWeek: (date: Date) => void;
}

export const WeekPicker = ({
  visible,
  onClose,
  selectedDate,
  onSelectWeek,
}: WeekPickerProps) => {
  // Format the selected week's start and end dates
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);

  // Create the marked dates object for the calendar
  const markedDates = {
    [format(weekStart, "yyyy-MM-dd")]: {
      startingDay: true,
      color: "#FAE395",
    },
    [format(weekEnd, "yyyy-MM-dd")]: {
      endingDay: true,
      color: "#FAE395",
    },
  };

  // Fill in the dates between start and end
  let currentDate = new Date(weekStart);
  while (format(currentDate, "yyyy-MM-dd") !== format(weekEnd, "yyyy-MM-dd")) {
    currentDate.setDate(currentDate.getDate() + 1);
    markedDates[format(currentDate, "yyyy-MM-dd")] = {
      color: "#FAE395",
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-4 w-[90%] max-h-[80%]">
          <Text
            className="text-lg font-semibold mb-4 text-center uppercase text-[#333]"
            style={{ fontFamily: "Figtree_500Medium" }}
          >
            Select Week
          </Text>

          <Calendar
            current={format(selectedDate, "yyyy-MM-dd")}
            onDayPress={(day) => {
              onSelectWeek(new Date(day.timestamp));
              onClose();
            }}
            markingType="period"
            markedDates={markedDates}
            theme={{
              calendarBackground: "white",
              textSectionTitleColor: "#333",
              selectedDayBackgroundColor: "#000",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#000",
              dayTextColor: "#333",
              textDisabledColor: "#d9e1e8",
              arrowColor: "#A4A095",
              monthTextColor: "#333",
              textMonthFontWeight: "bold",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayFontFamily: "Figtree_400Regular",
              textMonthFontFamily: "Figtree_500Medium",
              textDayHeaderFontFamily: "Figtree_500Medium",
            }}
          />

          <View className="mt-4 pt-4">
            <Pressable
              className="py-3 items-center bg-[#000] rounded-xs"
              onPress={onClose}
            >
              <Text
                className="text-base text-[#fcfcfc] font-medium uppercase"
                style={{ fontFamily: "Figtree_500Medium" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
