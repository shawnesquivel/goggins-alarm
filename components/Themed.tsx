/**
 * Light mode only version - simplified to avoid conflicts with NativeWind
 */

import { Text as DefaultText, View as DefaultView } from "react-native";
import Colors from "@/constants/Colors";

type ThemeProps = {
  lightColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function Text(props: TextProps) {
  const { style, lightColor, ...otherProps } = props;
  const color = lightColor || Colors.light.text;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, ...otherProps } = props;
  const backgroundColor = lightColor || Colors.light.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
