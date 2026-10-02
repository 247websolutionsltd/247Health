import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

export default function Refer() { 
    const styles = useStyles();
    const theme = useTheme(); 
    return(
    <Container edges={["top"]}>
        <View style={{ padding: Spacing.three }}>
            <View style={[styles.row, {marginBottom:Spacing.three}]}>
                <Back icon="arrow-back"/>
                <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
                    Refer and earn
                </ThemedText>
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
                Invite a friend and you both get a free consultation credit.
            </ThemedText>
            <View style={{ marginTop: Spacing.three, backgroundColor: Colors.primaryDark, borderRadius: 22, padding: Spacing.three }}>
                <ThemedText type="small" style={{ color: "#DCEBFF" }}>Your referral code</ThemedText>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.two }}>
                    <ThemedText type="title" style={{ color: "#FFF", letterSpacing: 2 }}>DAVID24</ThemedText>
                    <TouchableOpacity>
                        <MaterialIcons name="content-copy" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three }}>
                <View style={{ flex: 1, padding: Spacing.three, borderRadius: 18, backgroundColor: theme.accentSurface }}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Referrals</ThemedText>
                    <ThemedText type="large" style={{ color: theme.accentText, marginTop: Spacing.one }}>3</ThemedText>
                </View>
                <View style={{ flex: 1, padding: Spacing.three, borderRadius: 18, backgroundColor: theme.accentSurface }}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Earned</ThemedText>
                    <ThemedText type="large" style={{ color: theme.accentText, marginTop: Spacing.one }}>$30</ThemedText>
                </View>
            </View>
            <Button title="Share invite" onPress={() => undefined} iconLeft="share" style={{ marginTop: Spacing.three }} />
        </View>
    </Container>
    )
}