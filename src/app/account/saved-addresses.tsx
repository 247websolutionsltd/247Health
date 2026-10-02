import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const addresses = [
  {
    label: "Home",
    value: "23 Admiralty Road, Lekki Phase 1, Lagos",
    icon: "home",
  },
  {
    label: "Preferred clinic",
    value: "CityCare Clinic, Victoria Island, Lagos",
    icon: "business",
  },
];

export default function SavedAddresses() {
    const theme = useTheme();
    const styles = useStyles();

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={[styles.row, {marginBottom:Spacing.three}]}>
            <Back icon="arrow-back"/>
            <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
                Saved locations
            </ThemedText>
        </View>

        <View style={{ backgroundColor: theme.background, borderRadius: 18, borderWidth: 1, borderColor: theme.line, overflow: "hidden" }}>
          {addresses.map((item, index) => (
            <View
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                padding: Spacing.three,
                borderBottomWidth: index === addresses.length - 1 ? 0 : 1,
                borderBottomColor: theme.line,
              }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name={item.icon as any} size={20} color={theme.accentText} />
              </View>

              <View style={{ flex: 1, marginLeft: Spacing.two }}>
                <ThemedText type="smallBold">{item.label}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20, marginTop: Spacing.one }}>
                  {item.value}
                </ThemedText>
              </View>

              <TouchableOpacity>
                <MaterialIcons name="edit" size={18} color={theme.accentText} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Button
          title="Add new location"
          onPress={() => router.back()}
          type="secondary"
          style={{ marginTop: Spacing.three }}
        />
      </View>
    </Container>
  );
}
