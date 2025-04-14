import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "./style";
import Toast from "react-native-toast-message";
import Animated, { FadeIn } from "react-native-reanimated";

export default function LoginPage() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { changeLanguage, language } = useContext(LanguageContext);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const sendOtp = () => {
    if (mobileNumber.length === 10) {
      setIsSendingOtp(true);
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

      setTimeout(() => {
        setIsSendingOtp(false);
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: `Your OTP is: ${newOtp}`,
        });

        const autoOtp = newOtp.split("");
        setOtp(autoOtp);

        inputRefs.current[3]?.focus();
      }, 1500);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid Mobile",
        text2: t("enterValidMobile"),
      });
    }
  };

  const handleContinue = () => {
    setIsContinuing(true);
    setTimeout(() => {
      setIsContinuing(false);
      navigation.navigate("Main");
    }, 1500);
  };

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.container}>
        <Text style={styles.title}>{t("title")}</Text>

        {/* Language Selector */}
        <View style={styles.languageContainer}>
          <RNPickerSelect
            onValueChange={(value) => changeLanguage(value)}
            items={[
              { label: "తెలుగు", value: "telugu" },
              { label: "English", value: "english" },
              { label: "हिंदी", value: "hindi" },
            ]}
            style={pickerSelectStyles}
            placeholder={{ label: t("selectLanguage"), value: null }}
            value={language}
          />
        </View>

        <Text style={styles.loginText}>{t("login")}</Text>
        <TextInput
          style={styles.mobileInput}
          placeholder={t("enterMobile")}
          keyboardType="phone-pad"
          maxLength={10}
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />

        <TouchableOpacity style={styles.sendOtpButton} onPress={sendOtp} disabled={isSendingOtp}>
          {isSendingOtp ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendOtpText}>{t("sendOtp")}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => {
                let otpArray = [...otp];
                otpArray[index] = value;
                setOtp(otpArray);
                if (value && index < 3) inputRefs.current[index + 1].focus();
                else if (!value && index > 0) inputRefs.current[index - 1].focus();
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isContinuing}
        >
          {isContinuing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueText}>{t("continue")}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Toast position="bottom" bottomOffset={60} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  languageContainer: {
    width: 240,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFFBB",
    marginBottom: 20,
  },
  loginText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  mobileInput: {
    width: "90%",
    fontSize: 18,
    borderBottomWidth: 2,
    paddingBottom: 6,
    marginBottom: 15,
    borderColor: "black",
    color: "#000",
  },
  sendOtpButton: {
    backgroundColor: "#46a2da",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 18,
  },
  sendOtpText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 6,
    borderColor: "none",
    backgroundColor: "#FFF",
  },
  continueButton: {
    backgroundColor: "#46a2da",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 15,
  },
  continueText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
  },
  inputAndroid: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
  },
};
