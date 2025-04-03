import React, { ReactNode } from "react";
import { View, Text, TextStyle } from "react-native";

interface StyledTextProps {
  children: ReactNode;
  italic?: boolean;
  strikethrough?: boolean;
  className?: string;
  style?: TextStyle;
}

/**
 * A component that applies styling using Tailwind classes
 */
export const StyledText: React.FC<StyledTextProps> = ({
  children,
  italic = false,
  strikethrough = false,
  className = "",
  style,
}) => {
  return (
    <Text
      style={style}
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
