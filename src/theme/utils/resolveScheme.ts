import { ColorSchemeName } from "react-native";
import { ThemeMode } from "../../types";
import { ResolvedScheme } from "../types";

export function resolveScheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): ResolvedScheme {
  if (mode !== ThemeMode.System) return mode;
  return systemScheme === "light" ? ThemeMode.Light : ThemeMode.Dark;
}
