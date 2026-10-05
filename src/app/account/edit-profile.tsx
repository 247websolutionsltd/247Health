import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function EditProfile() {
  const { owner } = useAuth();
  return <EditProfileForm key={`${owner.name}:${owner.phone}`} owner={owner} />;
}

function EditProfileForm({ owner }: { owner: { name: string; phone: string; email: string; profileImage: string | null; bloodType: string | null; allergies: string | null } }) {
  const styles = useStyles();
  const theme = useTheme();
  const { updateProfile, updateAvatar, loading, error: authError, clearError } = useAuth();
  const [name, setName] = useState(owner.name);
  const [phone, setPhone] = useState(owner.phone);
  const [bloodType, setBloodType] = useState(owner.bloodType ?? "");
  const [allergies, setAllergies] = useState(owner.allergies ?? "");
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
  };

  const handleSave = async () => {
    clearError();
    setFeedback(null);
    const error = await updateProfile({
      full_name: name.trim() || null,
      phone: phone.trim() || null,
      blood_type: bloodType || null,
      allergies: allergies.trim() || null,
    });
    if (error) setFeedback(error);
    else if (photo) {
      const photoError = await updateAvatar(photo.uri, photo.mimeType ?? "image/jpeg");
      if (photoError) setFeedback(photoError);
      else router.back();
    } else router.back();
  };

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={[styles.row, {marginBottom:Spacing.three}]}>
            <Back icon="arrow-back"/>
            <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
            Edit profile
            </ThemedText>
        </View>
        <View style={{ alignItems: "center", marginBottom: Spacing.three }}>
          <TouchableOpacity onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Change profile photo">
            {photo?.uri || owner.profileImage
              ? <Image source={{ uri: photo?.uri ?? owner.profileImage ?? undefined }} style={{ width: 88, height: 88, borderRadius: 30 }} />
              : <Avatar name={name || "Patient"} color={Colors.primary} size={88} />}
            <View style={{ position: "absolute", right: -4, bottom: -4, backgroundColor: Colors.primary, borderRadius: Radius.pill, padding: 7 }}>
              <ThemedText type="smallBold" style={{ color: "#FFF" }}>Edit</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: theme.background,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.line,
            padding: Spacing.three,
          }}
        >
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <ThemedText type="smallBold" style={{ marginTop: Spacing.two }}>Email</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one }}>{owner.email}</ThemedText>
          <Input label="Phone number" value={phone} onChangeText={setPhone} placeholder="(000) 000-0000" number />
          <ThemedText type="smallBold" style={{ marginTop: Spacing.two, marginBottom: Spacing.two }}>Blood type</ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
            {BLOOD_TYPES.map((type) => (
              <TouchableOpacity key={type} onPress={() => setBloodType(bloodType === type ? "" : type)} style={{ minWidth: 50, alignItems: "center", padding: Spacing.two, borderRadius: Radius.md, backgroundColor: bloodType === type ? Colors.primary : theme.background, borderWidth: 1, borderColor: bloodType === type ? Colors.primary : theme.line }}>
                <ThemedText type="smallBold" style={{ color: bloodType === type ? "#FFF" : theme.text }}>{type}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="List allergies or enter 'None known'" desc maxLength={2000} />
        </View>

        <View style={{ marginTop: Spacing.three, backgroundColor: theme.accentSurface, borderRadius: 18, padding: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>Summary</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 20 }}>
            Keep your details accurate so doctors and clinic staff can verify your identity and reach you about your appointments.
          </ThemedText>
        </View>

        {(feedback || authError) && <ThemedText type="small" style={{ color: "#D65C5C", marginTop: Spacing.two }}>{feedback || authError}</ThemedText>}
        <Button
          title="Save changes"
          onPress={handleSave}
          disabled={loading}
          style={{ marginTop: Spacing.three }}
        />
      </View>
    </Container>
  );
}
