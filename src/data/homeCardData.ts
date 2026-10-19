import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type Icon = ComponentProps<typeof MaterialIcons>["name"];

// Shortcuts on the home screen. Every entry leads to a working screen.
export const quickActions: { icon: Icon; title: string; route: string }[] = [
  { icon: "event-available", title: "Book visit", route: "/(tabs)/book" },
  { icon: "search", title: "Find doctor", route: "/doctors" },
  { icon: "event-note", title: "My visits", route: "/(tabs)/appointments" },
  { icon: "support-agent", title: "Support", route: "/support" },
];
