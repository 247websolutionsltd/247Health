import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

interface InputProps extends TextInputProps{
    label: string;
    placeholder?: string;
    password?: boolean | null;
    number?: boolean;
    desc?: boolean;
}
export default function Input({label, placeholder="", password, onChangeText, number=false, value, desc, ...inputProps}:InputProps){
    const styles = useStyles();
    const theme = useTheme();
    const [ showPassword, setPassword ] = useState(false);
    return(
        <View style={{paddingVertical:Spacing.two}}>
            <ThemedText style={{marginBottom:Spacing.one}}>{label}</ThemedText>
            <View style={[styles.textInputView, {minHeight:desc?100:'auto', maxHeight:300 }]}>
                <TextInput
                 {...inputProps}
                 placeholder={placeholder} 
                 style={{flex:1, color:theme.text, verticalAlign:'top',}} 
                 secureTextEntry={ (password===true && !showPassword)}
                 onChangeText={onChangeText}
                 keyboardType={number?"numeric":inputProps.keyboardType ?? "default"}
                 value={value}
                 multiline={desc || inputProps.multiline}
                 placeholderTextColor={theme.textSecondary}
                />
                {
                    password &&
                    <TouchableOpacity onPress={()=>setPassword(!showPassword)}>
                        <MaterialIcons name={showPassword?"visibility-off":"visibility"} size={18} color={theme.textSecondary}/>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
} 