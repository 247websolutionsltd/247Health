import Button from "@/components/button";
import Container from "@/components/custom-container";
import OTPInput from "@/components/otpInput";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Otp(){
    const styles = useStyles();
    const {logInForm, verifyPasswordReset, loading, error: authError, clearError} = useAuth();
    const [token, setToken] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const handleVerify = async () => {
        clearError();
        setFeedback(null);
        const error = await verifyPasswordReset(logInForm.email, token);
        if (error) setFeedback(error);
        else router.replace('/auth/reset');
    };
    return(
        <Container edges={['top', 'bottom']} style={{justifyContent:'space-between'}}>
            <TouchableOpacity style={{paddingHorizontal:Spacing.two}} onPress={()=>router.back()}>
                <MaterialIcons name="chevron-left" size={35}/>
            </TouchableOpacity>
            <View>
                <View>
                    <View style={{paddingVertical:Spacing.two, paddingHorizontal:Spacing.three}}>
                        <ThemedText type="large">OTP Verification</ThemedText>
                        <ThemedText>Enter the recovery code sent to {logInForm.email || "your email"}</ThemedText>
                    </View>
                    <View style={{paddingVertical:Spacing.two}}>
                        <OTPInput onChangeText={setToken}/>
                    </View>
                </View>

                <View style={{marginTop:Spacing.five}}>
                    {(feedback || authError) && <ThemedText type="small" style={{color:Colors.danger, marginHorizontal:Spacing.three}}>{feedback || authError}</ThemedText>}
                    <Button onPress={handleVerify} title="Verify code" disabled={loading || token.length !== 6} style={{marginHorizontal:Spacing.three}}/>
                    <View style={[styles.row, {justifyContent:'center'}]}>
                        <ThemedText>
                            Remember password? Back to{" "}
                        </ThemedText>
                        <TouchableOpacity style={{marginVertical:Spacing.two}} onPress={()=>router.push('/auth/logIn')}>
                            <ThemedText style={{fontWeight:500, color:Colors.primary}}>
                                Sign in
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View/>
        </Container>
    )
}
