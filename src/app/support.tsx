import Back from "@/components/back";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const faqs = [{ question: "How do I reschedule an appointment?", answer: "Open the Visits tab, find your upcoming appointment and tap Reschedule." }, { question: "How do video consultations work?", answer: "Choose Video call when booking. You'll get a secure link 10 minutes before your slot." }, { question: "Can I cancel and get a refund?", answer: "Cancel at least 12 hours before your visit for a full refund to your original payment method." }];
export default function Support() { 
    const theme = useTheme(); 
    const styles = useStyles();
    const [open, setOpen] = useState<number | null>(null); 
    const contacts = [
        { label: "Call support", detail: "+234 800 247 0000", icon: "phone" }, 
        { label: "Chat with us", detail: "Usually replies in 5 minutes", icon: "chat" }, 
        { label: "Email support", detail: "help@carenest.app", icon: "email" }
    ]; 
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
                    {
                        contacts.map((item) => (
                            <TouchableOpacity key={item.label} onPress={() => undefined} style={{ flexDirection: "row", alignItems: "center", padding: Spacing.three, borderRadius: 18, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.background, marginBottom: Spacing.two }}>
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
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
                    Hours: Monday - Sunday, 24 hours
                </ThemedText>
            </View>
        </Container>
        )
}