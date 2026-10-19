import Back from "@/components/back";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { support } from "@/lib/support";
import { useState } from "react";
import { Linking, TouchableOpacity, View } from "react-native";

const faqs = [
    { question: "How do I reschedule an appointment?", answer: "Open the Visits tab, find your upcoming appointment and tap Reschedule. Pick a new time and your old slot is released once the new one is confirmed." },
    { question: "How do I cancel?", answer: "Open the Visits tab and tap Cancel on your upcoming appointment. The time goes back to the schedule for other patients." },
    { question: "How do video consultations work?", answer: "Choose Video call when you book. The clinic will contact you with joining details before your visit." },
    { question: "How do I pay?", answer: "Consultation fees are paid at the clinic. You aren't charged in the app." },
];
export default function Support() { 
    const theme = useTheme(); 
    const styles = useStyles();
    const [open, setOpen] = useState<number | null>(null); 
    const contacts = [
        support.phone ? { label: "Call support", detail: support.phone, icon: "phone", url: "tel:" + support.phone.replace(/ +/g, "") } : null,
        support.email ? { label: "Email support", detail: support.email, icon: "email", url: "mailto:" + support.email } : null,
    ].filter((c): c is { label: string; detail: string; icon: string; url: string } => c !== null);
    return(
         <Container edges={["top"]}>
            <View style={{ padding: Spacing.three }}>
                <View style={[styles.row, {marginBottom:Spacing.three}]}>
                    <Back icon="arrow-back"/>
                    <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
                        Customer care
                    </ThemedText>
                </View>
                <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
                    We’re here to help you get the care you need.
                </ThemedText>
                <View style={{ marginTop: Spacing.three }}>
                    {contacts.length === 0 && (
                        <ThemedText type="small" style={{ color: theme.textSecondary }}>Contact details will appear here once the clinic adds them.</ThemedText>
                    )}
                    {
                        contacts.map((item) => (
                            <TouchableOpacity key={item.label} onPress={() => void Linking.openURL(item.url).catch(() => undefined)} style={{ flexDirection: "row", alignItems: "center", padding: Spacing.three, borderRadius: 18, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.background, marginBottom: Spacing.two }}>
                                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
                                    <MaterialIcons name={item.icon as any} size={20} color={theme.accentText} />
                                </View>
                                <View style={{ marginLeft: Spacing.two }}>
                                    <ThemedText type="smallBold">{item.label}</ThemedText>
                                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.detail}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </View>
                <ThemedText type="bold" style={{ marginTop: Spacing.two, marginBottom: Spacing.two }}>Frequently asked</ThemedText>
                {
                    faqs.map((faq, index) => (
                        <TouchableOpacity key={faq.question} onPress={() => setOpen(open === index ? null : index)} style={{ borderBottomWidth: 1, borderBottomColor: theme.line, paddingVertical: Spacing.two }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <ThemedText type="smallBold" style={{ flex: 1 }}>{faq.question}</ThemedText>
                                <MaterialIcons name={open === index ? "expand-less" : "expand-more"} size={20} color={theme.textSecondary} />
                            </View>
                            {
                                open === index && 
                                <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 21, marginTop: Spacing.two }}>
                                    {faq.answer}
                                </ThemedText>
                            }
                        </TouchableOpacity>
                    ))
                }
                {support.hours ? (
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
                        Hours: {support.hours}
                    </ThemedText>
                ) : null}
            </View>
        </Container>
        )
}