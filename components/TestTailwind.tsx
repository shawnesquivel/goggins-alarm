import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function TestTailwind() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <View className="bg-primary rounded-lg p-6 shadow-lg w-full">
        <Text className="text-white font-pmedium text-xl text-center mb-4">
          Testing TailwindCSS
        </Text>

        <Text className="text-gray-100 mb-6 text-center">
          If you can see styled elements, TailwindCSS is working correctly!
        </Text>

        <TouchableOpacity className="bg-secondary py-3 px-6 rounded-full w-full">
          <Text className="text-black font-pbold text-center">
            Primary Button
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mt-6">
          <TouchableOpacity className="bg-black-100 py-2 px-4 rounded-lg flex-1 mr-2">
            <Text className="text-white text-center">Option 1</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-black-200 py-2 px-4 rounded-lg flex-1 ml-2">
            <Text className="text-white text-center">Option 2</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
