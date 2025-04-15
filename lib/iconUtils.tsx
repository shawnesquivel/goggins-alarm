import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { IconInfo } from "./sessions";

// Helper function to render FontAwesome icons from IconInfo
export const renderIcon = (iconInfo: IconInfo) => {
  return (
    <FontAwesome
      name={iconInfo.name as any}
      size={iconInfo.size}
      color={iconInfo.color}
    />
  );
};
