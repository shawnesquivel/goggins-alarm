import React, { ReactNode } from "react";
import { View, Text } from "react-native";

interface StyledTextProps {
  children: ReactNode;
  italic?: boolean;
  strikethrough?: boolean;
  className?: string;
}

/**
 * A component that applies styling using Tailwind classes
 */
export const StyledText: React.FC<StyledTextProps> = ({
  children,
  italic = false,
  strikethrough = false,
  className = "",
}) => {
  return (
    <Text
      className={`
        ${italic ? "italic" : ""}
        ${strikethrough ? "line-through" : ""}
        ${className}
      `}
    >
      {children}
    </Text>
  );
};

export default StyledText;
