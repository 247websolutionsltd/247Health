import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/PageContext";
import { Dimensions, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// export type ThemeType = typeof Colors.light;
export function useStyles() {
  const { themeMode, setThemeMode } = useAppTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themeMode === "dark" ? Colors.dark : Colors.light
  const {width, height} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  // Pass the active theme colors into the factory function below
  return createStyles(theme, width, height, insets);
}


const createStyles = (theme:any, width:any, height:any, insets:any)=>StyleSheet.create({
    button: {
        height:56,
        borderRadius: Radius.pill,
        alignItems: "center",
        justifyContent:'center',
        backgroundColor:Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
    },
    button2:{
        borderWidth:1,
        borderColor:theme.line,
        alignItems:'center',
        justifyContent:'center',
        height:56,
        borderRadius:Radius.pill,
        backgroundColor:theme.background
    },
    row:{
      flexDirection:'row',
      alignItems:'center',
    },
    rowStretch:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between'
    },
    backButton:{
      borderWidth:1,
      borderColor:theme.line,
      alignItems:'center',
      justifyContent:'center',
      width:50,
      marginRight:10,
      height:50,
      borderRadius:100,
      backgroundColor:theme.background
    },
    skip: {
      position: "absolute",
      top: Spacing.three + insets.top,
      right: 16,
      zIndex: 10,
      padding:Spacing.two,
      borderRadius:Radius.pill
    },
    addView:{
      flex:1,
      alignItems:'flex-end',
      justifyContent:'flex-end',
      position:'absolute',
      height,
      width,
      paddingVertical: Spacing.three + 40,
      paddingHorizontal: Spacing.three
    },
    add:{
      padding:12,
      borderRadius:200,
      backgroundColor:Colors.primary
    },
    textInputView:{
      paddingVertical:Spacing.one,
      paddingHorizontal:Spacing.three,
      borderRadius: Radius.sm,
      flexDirection:'row',
      backgroundColor:theme.backgroundElement,
      alignItems:'center',
      minHeight:52
    },
    authImage:{
      height:height/3,
      width:'100%'
    },
    authImageView:{
      flex:1,
      backgroundColor:'#35353535',
      alignItems:'center',
      justifyContent:'flex-end',
      padding:Spacing.five
    },
    line:{
      backgroundColor:theme.line,
      height:1,
      flex:1
    },
    socialRow: {
      flexDirection: "row",
      gap: Spacing.three,
      marginVertical:Spacing.two,
      marginHorizontal:Spacing.three
    },
    socialBtn: {
      flex: 1,
      height: 50,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      flexDirection:'row'
    },
    createLabelView:{
      flexDirection:'row',
      margin:Spacing.three,
      marginBottom:0
    },
    createLabel:{
      height:4,
      borderRadius:Radius.md,
    },
    registerInfo:{
      padding:Spacing.two,
      backgroundColor:theme.contrast,
      borderRadius:Radius.sm
    },
    option:{
      flexDirection:'row',
      alignItems:'center',
      backgroundColor:theme.background,
      padding:Spacing.three,
      borderWidth:1,
      borderRadius:Radius.md,
      marginVertical:Spacing.two,
    },
    optionCircle:{
      borderWidth:1,
      borderColor:theme.line,
      borderRadius:Radius.pill,
      width:20,
      height:20,
      alignItems:'center',
      justifyContent:'center'
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding:Spacing.three-Spacing.one,
    },
    otpInput: {
      width: "100%",
      height: 50,
      borderWidth: 1,
      borderColor: "#777",
      fontSize: 14,
      color: "#555",
      padding: 0,
    },
    otpInputView:{
      padding:Spacing.one
    },
    searchView:{
      flexDirection:'row',
      alignItems:'center',
      backgroundColor:theme.background,
      borderRadius:Radius.pill,
      padding:Spacing.two,
      paddingHorizontal:Spacing.three,
      flexShrink:1,
      shadowColor:'#1E40AF', shadowOpacity:0.08, shadowRadius:14, shadowOffset:{width:0,height:5}, elevation:3,
      marginBottom:Spacing.three
    },
    rowWrap:{
      flexDirection:'row',
      flexWrap:'wrap'
    },
    homeCard:{
      width:'100%',
      borderRadius:Radius.md,
      padding:Spacing.two,
      height:200,
      justifyContent:'center',
      paddingVertical:Spacing.four,
      backgroundColor:theme.accentSurface
    },
    homeCardView:{
      width:'50%',
      padding:Spacing.two
    },
    homeProfile:{
      width:50,
      height:50,
      borderRadius:100
    },
    homeAddView:{
      width:15,
      height:15,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:Colors.primaryDark,
      borderRadius:30,
      bottom:10,
      right:5
    },
    profileView:{
      padding:Spacing.three,
      borderRadius:Radius.md,
      backgroundColor:Colors.primaryDark,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
    },
    profile:{
      borderWidth:1,
      borderColor:theme.line,
      borderRadius:Radius.md,
      backgroundColor:theme.background,
      margin:Spacing.three
    },
    profileInd:{
      flexDirection:'row',
      alignItems:'center',
      padding:Spacing.three,
      borderBottomWidth:1,
      borderColor:theme.line,
    },
    radio:{
      width:40,
      height:20,
      borderRadius:20,
      justifyContent:'center',
      padding:3
    },
    radioCircle:{
      width:16,
      height:16,
      borderRadius:100,
      backgroundColor:theme.paper
    },
    posterImage:{
      width:55,
      height:55,
      borderRadius:Radius.pill,
      marginRight:Spacing.two
    },
    editButton:{
      padding:Spacing.two,
      borderWidth:1,
      borderColor:Colors.primary,
      borderRadius:Radius.sm,
    },
    notification:{
      padding:Spacing.three,
      flexDirection:'row',
      alignItems:'center',
    },
    topUp:{
      backgroundColor:theme.tint,
      borderRadius:Radius.md,
      padding:Spacing.three,
      alignItems:'center'
    },
    topUpView:{
      backgroundColor:Colors.primaryDark,
      width:40,
      height:40,
      alignItems:'center',
      justifyContent:'center',
      borderRadius:100
    },
    topUpContainer:{
      alignItems:'center', 
      padding:Spacing.three, 
      paddingTop:Spacing.two
    },
    transaction:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      padding:Spacing.two,
      borderRadius:Radius.sm,
      marginVertical:Spacing.two
    },
    wallet:{
        backgroundColor: Colors.primaryDark,
        borderRadius: 24,
        padding: Spacing.three,
    },
    walletIcon:{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(96, 165, 250, 0.24)",
        alignItems: "center",
        justifyContent: "center",
    },
    walletSummary:{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: Spacing.two,
        marginHorizontal: Spacing.half,
    },
    filters:{
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        borderRadius: 999,
    },
    transactions:{
        backgroundColor: theme.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.line,
        paddingHorizontal: Spacing.two,
    },
    notificationCard:{
        marginHorizontal: Spacing.three,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.line,
        overflow: "hidden",
    }
});