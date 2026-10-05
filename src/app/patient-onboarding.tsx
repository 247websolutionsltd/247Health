import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function PatientOnboarding() {
  const theme = useTheme();
  const { user, profile, profileReady, profileLoading, error, reloadProfile } = useAuth();

  if (!user) {
    return (
      <Container edges={["top", "bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.three }}>
          <ThemedText type="large">Sign in to continue</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginVertical: Spacing.three }}>
            Patient details are saved to your account.
          </ThemedText>
          <Button title="Go to sign in" onPress={() => router.replace("/auth/logIn")} />
        </View>
      </Container>
    );
  }

  if (!profileReady || profileLoading) {
    return (
      <Container edges={["top", "bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.three }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.three }}>Loading your patient profile...</ThemedText>
        </View>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container edges={["top", "bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.three }}>
          <ThemedText type="large">Profile unavailable</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginVertical: Spacing.three }}>
            {error ?? "We could not load your patient profile."}
          </ThemedText>
          <Button title="Retry" onPress={() => void reloadProfile()} isLoading={profileLoading} />
        </View>
      </Container>
    );
  }

  return <PatientDetailsForm key={`${user.id}:${profile.updated_at}`} />;
}

function PatientDetailsForm() {
  const theme = useTheme();
  const { user, profile, owner, updateProfile, updateAvatar, loading, error: authError, clearError } = useAuth();
  const [bloodType, setBloodType] = useState(profile?.blood_type ?? "");
  const [allergies, setAllergies] = useState(profile?.allergies ?? "");
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const choosePhoto = async () => {
    setFeedback(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setPhoto({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
    }
  };

  const finish = async (saveDetails: boolean) => {
    clearError();
    setFeedback(null);
    if (!user) {
      setFeedback("Your session is not available. Sign in again to save patient details.");
      return;
    }

    const completedAt = new Date().toISOString();
    if (saveDetails && photo) {
      const photoError = await updateAvatar(photo.uri, photo.mimeType ?? "image/jpeg");
      if (photoError) {
        setFeedback(photoError);
        return;
      }
    }

    const error = await updateProfile(saveDetails
      ? {
          blood_type: bloodType || null,
          allergies: allergies.trim() || null,
          patient_details_completed_at: completedAt,
        }
      : { patient_details_completed_at: completedAt });

    if (error) setFeedback(error);
    else router.replace("/(tabs)/home");
  };

  return (
    <Container edges={["top", "bottom"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.four }}>
          <Back />
          <ThemedText type="large">Patient details</ThemedText>
        </View>

        <ThemedText style={{ color: theme.textSecondary, lineHeight: 22 }}>
          Add optional health details to your patient profile. You can leave any field blank.
        </ThemedText>

        <View style={{ alignItems: "center", marginVertical: Spacing.four }}>
          <TouchableOpacity onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Choose profile photo">
            {photo?.uri || owner.profileImage
              ? <Image source={{ uri: photo?.uri ?? owner.profileImage ?? undefined }} style={{ width: 96, height: 96, borderRadius: 32 }} />
              : <Avatar name={owner.name} color={Colors.primary} size={96} />}
            <View style={{ position: "absolute", right: -4, bottom: -4, backgroundColor: Colors.primary, borderRadius: Radius.pill, padding: 8 }}>
              <ThemedText type="smallBold" style={{ color: "#FFF" }}>Edit</ThemedText>
            </View>
          </TouchableOpacity>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>Profile photo</ThemedText>
        </View>

        <ThemedText type="bold" style={{ marginBottom: Spacing.two }}>Blood type (optional)</ThemedText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
          {BLOOD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setBloodType(bloodType === type ? "" : type)}
              style={{ minWidth: 56, alignItems: "center", paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, borderRadius: Radius.md, backgroundColor: bloodType === type ? Colors.primary : theme.background, borderWidth: 1, borderColor: bloodType === type ? Colors.primary : theme.line }}
            >
              <ThemedText type="smallBold" style={{ color: bloodType === type ? "#FFF" : theme.text }}>{type}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Allergies (optional)"
          placeholder="List allergies, enter 'None known', or leave blank"
          value={allergies}
          onChangeText={setAllergies}
          desc
          maxLength={2000}
        />

        {(feedback || authError) && <ThemedText type="small" style={{ color: Colors.danger, marginBottom: Spacing.two }}>{feedback || authError}</ThemedText>}
        <Button title="Save and continue" onPress={() => finish(true)} disabled={loading} />
        <TouchableOpacity onPress={() => finish(false)} disabled={loading} style={{ alignItems: "center", padding: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>Skip for now</ThemedText>
        </TouchableOpacity>
      </View>
    </Container>
  );
}