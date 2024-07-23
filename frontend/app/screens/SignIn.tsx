import { NavigationProp, useNavigation } from "@react-navigation/native";
import AppButton from "@ui/AppButton";
import CustomKeyAvoidingView from "@ui/CustomKeyAvoidingView";
import FormDivider from "@ui/FormDivider";
import FormInput from "@ui/FormInput";
import WelcomeHeader from "@ui/WelcomeHeader";
import { signInSchema, yupValidate } from "@utils/validate";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { AuthStackParamList } from "app/navigator/AuthNavigator";
import { FC, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { showMessage } from "react-native-flash-message";
import axios from "axios";
import useAuth from "app/hooks/useAuth";
import colors from "@utils/colors";
import CustomText from "@ui/CustomText";

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

interface Props {}

let SignIn: FC<Props> = (props) => {
  let { navigate } = useNavigation<NavigationProp<AuthStackParamList>>();
  let [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });
  

  let { signIn } = useAuth();

  let handleSubmit = async () => {
    let { values, error } = await yupValidate(signInSchema, userInfo);

    if (error) return showMessage({ message: error, type: "danger" });
    if (values) {
      signIn(values);
    }
  };

  let handleChange = (name: string) => (text: string) => {
    setUserInfo({ ...userInfo, [name]: text });
  };

  let { email, password } = userInfo;

  return (
    <CustomKeyAvoidingView>
      <View style={styles.innerContainer}>
        <WelcomeHeader message="Sign in to start buying and selling goods in your area." />

        <View style={styles.formContainer}>
          <FormInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleChange("email")}
          />
          <FormInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={handleChange("password")}
          />

          <AppButton title="Sign In" onPress={handleSubmit} />

          <Pressable onPress={() => navigate("ForgetPassword")}>
            <CustomText style={styles.forgetTitle}>Forget Password?</CustomText>
          </Pressable>

          <FormDivider />

          <Pressable onPress={() => navigate("SignUp")}>
            <CustomText style={styles.title}>Don't have an account? Sign Up</CustomText>
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
  forgetTitle: {
    textAlign: "center",
    marginTop: 10,
    color: colors.primary,
  },
  title: {
    color: colors.primary,
  },
});

export default SignIn;
