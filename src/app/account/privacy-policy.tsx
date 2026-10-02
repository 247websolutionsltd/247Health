import Back from "@/components/back";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { ScrollView, View } from "react-native";

const privacySections = [
  {
    title: "Information we collect",
    text: "We collect the information needed to provide appointment booking, payment, and account support services, including profile details, contact information, order history, and device information used to protect your account.",
  },
  {
    title: "How we use it",
    text: "This data is used to create and manage appointments, process payments, improve service quality, provide customer support, and keep your account secure.",
  },
  {
    title: "Your choices",
    text: "You can update your profile, set communication preferences, and review saved locations or payment methods at any time from your account settings.",
  },
  {
    title: "Security",
    text: "We take reasonable steps to protect your personal information using secure systems, encryption, and account safeguards. However, no method of digital transmission is completely risk-free.",
  },
];

export default function PrivacyPolicy() {
    const theme = useTheme();
    const styles = useStyles();

  return (
    <Container edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.five }}>
        <View style={[styles.row, {marginBottom:Spacing.three}]}>
            <Back icon="arrow-back"/>
            <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
                Privacy policy
            </ThemedText>
        </View>

        <View
          style={{
            backgroundColor: theme.background,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.line,
            overflow: "hidden",
          }}
        >
          <View style={{ padding: Spacing.three }}>
            <ThemedText type="small" style={{ color: theme.accentText, marginBottom: Spacing.two }}>
              Last updated: September 2026
            </ThemedText>

            <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 22 }}>
              This privacy policy explains how CareNest collects, uses, stores, and protects your personal information. By using our platform, you agree to the practices described below.
            </ThemedText>
          </View>

          {privacySections.map((section) => (
            <View
              key={section.title}
              style={{
                paddingHorizontal: Spacing.three,
                paddingVertical: Spacing.three,
                borderTopWidth: 1,
                borderTopColor: theme.line,
              }}
            >
              <ThemedText type="smallBold" style={{ marginBottom: Spacing.one }}>
                {section.title}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                {section.text}
              </ThemedText>
            </View>
          ))}

          <View style={{ padding: Spacing.three, borderTopWidth: 1, borderTopColor: theme.line }}>
            <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 22 }}>
              If you have questions about this policy or your account data, contact our support team at privacy@carenest.app.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}