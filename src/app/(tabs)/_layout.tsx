
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_META: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: "Home", icon: "home-outline", iconActive: "home" },
  appointments: { label: "Visits", icon: "calendar-outline", iconActive: "calendar" },
  notification: { label: "Alerts", icon: "notifications-outline", iconActive: "notifications" },
  profile: { label: "Profile", icon: "person-outline", iconActive: "person" },
};
interface TabBarRoute {
  key: string;
  name: string;
}

interface TabBarProps {
  state: { index: number; routes: TabBarRoute[] };
  navigation: { navigate: (name: string) => void };
}

const Send = ()=>{
  return(
    <TouchableOpacity style={styles.send} onPress={() => router.navigate('/(tabs)/book' as const)}>
      <MaterialIcons name="add" size={32} color={"#FFF"}/>
    </TouchableOpacity>
  )
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes;
  const left = routes.slice(0,2);
  const right = routes.slice(2);

  function renderTab(route: TabBarRoute) {
    const meta = TAB_META[route.name];
    if (!meta) return null;
    const isFocused = state.routes[state.index]?.key === route.key;

    return (
      <Pressable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityLabel={meta.label}
        accessibilityState={{ selected: isFocused }}
      >
        <Ionicons name={isFocused ? meta.iconActive : meta.icon} size={24} color={isFocused ? Colors.primary : theme.textSecondary} />
        <Text style={[styles.tabLabel, { color: isFocused ? Colors.primary : theme.textSecondary }]}>{meta.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[{backgroundColor: theme.background, borderTopColor: theme.line,}, styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {left.map(renderTab)}
      <Send/>
      {right.map(renderTab)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="appointments" options={{ title: "Appointments" }} />
      <Tabs.Screen name="book" options={{ href: null, title: "Book appointment" }} />
      <Tabs.Screen name="notification" options={{ title: "Notification" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderTopWidth: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#1E40AF",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    ...(Platform.OS === "android" ? { elevation: 8 } : {}),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  tabLabel: {
    // fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  send:{
    width:60,
    height:60,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:22,
    backgroundColor:Colors.primary,
    bottom:18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  }
});
