import Back from "@/components/back";
import Button from "@/components/button";
import OnboardingItem from "@/components/onboard";
import Paginator from "@/components/paginator";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { onboardingData } from "@/data/onboardData";
import useHook from "@/hooks/general-hook";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === "number") {
      setCurrentIndex(nextIndex);
    }
  }).current;
  const { isLoading, setIsLoading } = useHook();
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finishOnboarding();
    }
  };
  const scrollBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    } else {
      console.log("first")
    }
  };
  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      router.replace("/auth/logIn");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const styles = useStyles();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.paper }} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={[styles.skip, { backgroundColor: theme.accentSurface }]}
        onPress={finishOnboarding}
        disabled={isLoading}
      >
        <ThemedText type="smallBold" style={{ color: theme.accentText }}>Skip</ThemedText>
      </TouchableOpacity>

      <FlatList
        data={onboardingData}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={flatListRef}
      />
      <Paginator data={onboardingData} currentIndex={currentIndex} />
      <View style={onboardStyles.bottom}>
        {
          currentIndex > 0 &&
          <Back onPress={scrollBack} />
        }
        
        <Button
         onPress={scrollToNext} 
         isLoading={isLoading} 
         title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
         style={{flex:1}}
         icon={currentIndex === onboardingData.length - 1 ? null : "arrow-forward"}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const onboardStyles = StyleSheet.create({
  bottom:{
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  }
});
