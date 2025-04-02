import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";

interface FormattedTextProps {
  text: string;
  style?: TextStyle;
}

interface TextSegment {
  text: string;
  italic?: boolean;
  strikethrough?: boolean;
}

/**
 * A component that renders text with basic formatting:
 * - *text* for italic
 * - ~text~ for strikethrough
 */
export default function FormattedText({ text, style }: FormattedTextProps) {
  // Parse the text to identify formatting markers
  const parseText = (): TextSegment[] => {
    if (!text) return [{ text: "" }];

    const parts: TextSegment[] = [];
    let currentText = "";
    let inItalic = false;
    let inStrikethrough = false;

    for (let i = 0; i < text.length; i++) {
      // Check for italic marker *
      if (text[i] === "*") {
        // Add current text segment
        if (currentText) {
          parts.push({
            text: currentText,
            italic: inItalic,
            strikethrough: inStrikethrough,
          });
          currentText = "";
        }
        // Toggle italic state
        inItalic = !inItalic;
        continue;
      }

      // Check for strikethrough marker ~
      if (text[i] === "~") {
        // Add current text segment
        if (currentText) {
          parts.push({
            text: currentText,
            italic: inItalic,
            strikethrough: inStrikethrough,
          });
          currentText = "";
        }
        // Toggle strikethrough state
        inStrikethrough = !inStrikethrough;
        continue;
      }

      // Add character to current segment
      currentText += text[i];
    }

    // Add any remaining text
    if (currentText) {
      parts.push({
        text: currentText,
        italic: inItalic,
        strikethrough: inStrikethrough,
      });
    }

    return parts;
  };

  const renderParts = () => {
    const parts = parseText();

    return parts.map((part, index) => (
      <Text
        key={index}
        style={[
          style,
          part.italic && styles.italic,
          part.strikethrough && styles.strikethrough,
        ]}
      >
        {part.text}
      </Text>
    ));
  };

  return <Text style={style}>{renderParts()}</Text>;
}

const styles = StyleSheet.create({
  italic: {
    fontStyle: "italic",
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
});
