import Back from "@/components/back";
import Button from "@/components/button";
import OnboardingItem from "@/components/onboard";
import Paginator from "@/components/paginator";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { onboardingData } from "@/data/onboardData";
import useHook from "@/hooks/general-hook";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, type ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<(typeof onboardingData)[number]> | null>(null);
  const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === "number") {
      setCurrentIndex(nextIndex);
    }
  }, []);
  const { isLoading, setIsLoading } = useHook();
  const [finishError, setFinishError] = useState<string | null>(null);

  const scrollToNext = () => {
    if (isLoading) return;
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
    if (isLoading) return;
    setIsLoading(true);
    setFinishError(null);
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      router.replace("/auth/logIn");
    } catch (error: unknown) {
      console.error("[onboarding] Unable to finish onboarding", error);
      setFinishError("We couldn't finish setting up the app. Please try again.");
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
        viewabilityConfig={VIEWABILITY_CONFIG}
        ref={flatListRef}
      />
      <Paginator data={onboardingData} currentIndex={currentIndex} />
      {finishError && (
        <ThemedText type="small" style={{ color: Colors.danger, paddingHorizontal: Spacing.three }}>
          {finishError}
        </ThemedText>
      )}
      <View style={onboardStyles.bottom}>
        {
          currentIndex > 0 &&
          <Back onPress={scrollBack} />
        }
        
        <Button
         onPress={scrollToNext} 
         isLoading={isLoading} 
         title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
         disabled={isLoading}
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
