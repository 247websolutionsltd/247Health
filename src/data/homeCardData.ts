import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type Icon = ComponentProps<typeof MaterialIcons>['name'];
export const quickActions: { icon: Icon; title: string; route: string }[] = [
  { icon: "event-available", title: "Book visit", route: "/(tabs)/book" },
  { icon: "videocam", title: "Video call", route: "/doctors?mode=video" },
  { icon: "medication", title: "Pharmacy", route: "/support" },
  { icon: "science", title: "Lab tests", route: "/support" },
];
