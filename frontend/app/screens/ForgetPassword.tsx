import { NavigationProp, useNavigation } from "@react-navigation/native";
import AppButton from "@ui/AppButton";
import CustomKeyAvoidingView from "@ui/CustomKeyAvoidingView";
import CustomText from "@ui/CustomText";
import FormDivider from "@ui/FormDivider";
import FormInput from "@ui/FormInput";
import FormNavigator from "@ui/FormNavigator";
import WelcomeHeader from "@ui/WelcomeHeader";
import colors from "@utils/colors";
import { emailRegex } from "@utils/validate";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { AuthStackParamList } from "app/navigator/AuthNavigator";
import axios from "axios";
import { FC, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { showMessage } from "react-native-flash-message";

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

interface Props {}

let ForgetPassword: FC<Props> = (props) => {
  let [email, setEmail] = useState("");
  let [busy, setBusy] = useState(false);
  let { navigate } = useNavigation<NavigationProp<AuthStackParamList>>();

  let handleSubmit = async () => {
    if (!emailRegex.test(email)) {
      return showMessage({ message: "Invalid email id!", type: "danger" });
    }

    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      client.post("/auth/forget-pass", { email })
    );
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  };

  return (
    <CustomKeyAvoidingView>
      <View style={styles.innerContainer}>
        <WelcomeHeader message="Enter your email to receive a password reset link." />

        <View style={styles.formContainer}>
          <FormInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />

          <AppButton
            active={!busy}
            title={busy ? "Please Wait..." : "Request Link"}
            onPress={handleSubmit}
          />

          <FormDivider />

          <Pressable onPress={() => navigate("SignIn")}>
            <CustomText style={styles.title}>Back to Sign In</CustomText>
          </Pressable>
          
        </View>
      </View>
    </CustomKeyAvoidingView>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 15,
    flex: 1,
  },
  formContainer: {
    marginTop: 30,
  },
  title: {
    textAlign: "center",
    marginTop: 10,
    color: colors.primary,
  }
});

export default ForgetPassword;
