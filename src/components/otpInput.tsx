import { Spacing } from "@/constants/theme";
import { useStyles } from "@/styles/styles";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    NativeSyntheticEvent,
    TextInput,
    TextInputKeyPressEventData,
    View
} from "react-native";

const OTP_LENGTH = 6;
const { width } = Dimensions.get("window");
export default function OTPInput({ onChangeText }: { onChangeText?: (value: string) => void }) {
    const styles = useStyles();
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const value = text.replace(/[^0-9]/g, "");

    // User deleted the current digit
    if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";

      setOtp(newOtp);
      onChangeText?.(newOtp.join(""));

      return;
    }

    // Pasting multiple digits
    if (value.length > 1) {
      const newOtp = [...otp];

      value
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((digit, i) => {
          newOtp[index + i] = digit;
        });

      setOtp(newOtp);
      onChangeText?.(newOtp.join(""));

      const nextIndex = Math.min(
        index + value.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    // Normal single digit
    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);
    onChangeText?.(newOtp.join(""));

    // Move to next box
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (event.nativeEvent.key !== "Backspace") {
      return;
    }

    // If current box is already empty,
    // move to previous box and delete its value
    if (otp[index] === "" && index > 0) {
      const newOtp = [...otp];

      newOtp[index - 1] = "";

      setOtp(newOtp);
      onChangeText?.(newOtp.join(""));

      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <View key={index} style={[styles.otpInputView, {
            width:(width-(Spacing.three*2))/OTP_LENGTH, 
        }]}>
            <TextInput
            ref={(ref) => {
                inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) =>
                handleChange(text, index)
            }
            onKeyPress={(event) =>
                handleKeyPress(event, index)
            }
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor="#000"
            style={styles.otpInput}
            />
        </View>
      ))}
    </View>
  );
}