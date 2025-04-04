import React, { ReactNode, forwardRef } from "react";
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
export const StyledText = forwardRef<Text, StyledTextProps>(
  (
    { children, italic = false, strikethrough = false, className = "", style },
    ref
  ) => {
    return (
      <Text
        ref={ref}
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
  }
);

export default StyledText;
