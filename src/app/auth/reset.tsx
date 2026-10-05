import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Forgot(){
    const styles = useStyles();
    const {updatePassword, loading, error: authError, clearError} = useAuth();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const handleReset = async () => {
        clearError();
        setFeedback(null);
        if (password !== confirm) {
            setFeedback("Passwords do not match.");
            return;
        }
        const error = await updatePassword(password);
        if (error) setFeedback(error);
        else router.replace('/');
    };
    return(
        <Container edges={['top', 'bottom']} style={{justifyContent:'space-between'}}>
            <TouchableOpacity style={{paddingHorizontal:Spacing.two}} onPress={()=>router.back()}>
                <MaterialIcons name="chevron-left" size={35}/>
            </TouchableOpacity>
            <View>
                <View style={{padding:Spacing.three}}>
                    <View style={{paddingVertical:Spacing.two}}>
                        <ThemedText type="large">New Password</ThemedText>
                        <ThemedText>Enter new password</ThemedText>
                    </View>
                    <View style={{paddingVertical:Spacing.two}}>
                        <Input label="New Password" placeholder="Enter a new password" password value={password} autoComplete="new-password" textContentType="newPassword" onChangeText={setPassword}/>
                        <Input label="Confirm Password" placeholder="Repeat the new password" password value={confirm} autoComplete="new-password" textContentType="newPassword" onChangeText={setConfirm}/>
                    </View>
                </View>

                <View style={{marginTop:Spacing.five}}>
                    {(feedback || authError) && <ThemedText type="small" style={{color:Colors.danger, marginHorizontal:Spacing.three}}>{feedback || authError}</ThemedText>}
                    <Button onPress={handleReset} title="Reset Password" disabled={loading || !password || !confirm} style={{marginHorizontal:Spacing.three}}/>
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
