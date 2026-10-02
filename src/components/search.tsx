import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TextInput, TouchableOpacityProps, View } from "react-native";

interface SearchProps extends TouchableOpacityProps{
    filter?: boolean;
}
export default function Search({filter, style}:SearchProps){
    const styles = useStyles();
    const theme = useTheme();
    const [query, setQuery] = useState("");
    return(
        <View style={[styles.searchView, style]}>
            <MaterialIcons name="search" size={20} color={theme.textSecondary}/>
            <TextInput placeholder="Search doctors or specialties" value={query} onChangeText={setQuery} onSubmitEditing={() => router.push({ pathname: "/doctors", params: { query } } as never)} returnKeyType="search" style={{flex:1, fontSize:15, color: theme.text}} placeholderTextColor={theme.textSecondary}/>
        </View>
    )
}