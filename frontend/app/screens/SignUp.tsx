import { NavigationProp, useNavigation } from "@react-navigation/native";
import AppButton from "@ui/AppButton";
import CustomKeyAvoidingView from "@ui/CustomKeyAvoidingView";
import FormDivider from "@ui/FormDivider";
import FormInput from "@ui/FormInput";
import FormNavigator from "@ui/FormNavigator";
import WelcomeHeader from "@ui/WelcomeHeader";
import { AuthStackParamList } from "app/navigator/AuthNavigator";
import { FC, useState } from "react";
import { View, StyleSheet, Pressable, Text, Modal, Dimensions } from "react-native";
import { RadioButton } from "react-native-paper";
import { newBuyerSchema, newSellerSchema, newDriverSchema, yupValidate } from "@utils/validate";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { showMessage } from "react-native-flash-message";
import axios from "axios";
import useAuth from "app/hooks/useAuth";
import colors from "@utils/colors";
import CustomText from "@ui/CustomText";
import MapView, { Marker, Region } from "react-native-maps";
import { selectImages } from "@utils/helper";
import mime from "mime";


let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

interface Props {}

let SignUp: FC<Props> = (props) => {
  let [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    address: "",
    city: "",
    longitude: "",
    latitude: "",
    description: "",
  });
  let [busy, setBusy] = useState(false);
  let { navigate } = useNavigation<NavigationProp<AuthStackParamList>>();
  let { signIn } = useAuth();
  let [newImage, setImage] = useState<{ name: string; type: string; uri: string } | null>(null);
  let [mapVisible, setMapVisible] = useState(false);
  let [selectedLocation, setSelectedLocation] = useState<Region>({
    latitude: 32.2203,
    longitude: 35.2446,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  let handleChange = (name: string) => (text: string) => {
    setUserInfo({ ...userInfo, [name]: text });
  };

  let handleRoleChange = (value: string) => {
    setUserInfo({ ...userInfo, role: value });
  };

  let pickImage = async () => {
    let getImage = await selectImages();
    setImage({ 
      name: "image_0", 
      type: mime.getType(getImage[0]) ?? "", 
      uri: getImage[0] 
    });
  };

  let handleSubmit = async () => {
    let newUserSchema;
    if (userInfo.role === "Buyer") {
        newUserSchema = newBuyerSchema;
    } else if (userInfo.role === "Seller") {
        newUserSchema = newSellerSchema;
    } else {
        newUserSchema = newDriverSchema;
    }

    let { error } = await yupValidate(newUserSchema, userInfo);

    if (error) return showMessage({ message: error, type: "danger" });

    setBusy(true);

    let formData = new FormData();
    type userInfoKeys = keyof typeof userInfo;
    for (let key in userInfo) {
      let value = userInfo[key as userInfoKeys];
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }

    formData.append("image", newImage as any);

    let res = await fetchDataAsync<{ message: string }>(
      client.post("/auth/sign-up", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );

    if (res?.message) {
      showMessage({ message: res.message, type: "success" });
      navigate("SignIn");
    }
    setBusy(false);
  };

  let handleMapPress = (event: any) => {
    let { coordinate } = event.nativeEvent;
    setSelectedLocation({
      ...selectedLocation,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    console.log(coordinate.latitude, coordinate.longitude);
    setUserInfo({ ...userInfo, longitude: coordinate.longitude, latitude: coordinate.latitude });
    setMapVisible(false);
  };

  let { email, name, password, role, address, city, longitude, latitude, description } = userInfo;

  return (
    <CustomKeyAvoidingView>
      <View style={styles.innerContainer}>
        <WelcomeHeader message="Sign up to start buying and selling goods in your area." />

        <View style={styles.formContainer}>
          <FormInput
            placeholder="Name"
            value={name}
            onChangeText={handleChange("name")}
          />
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
          <View style={styles.radioButtonContainer}>
            <Text style={styles.radioButtonLabel}>Role</Text>
            <RadioButton.Group onValueChange={handleRoleChange} value={role}>
              <View style={styles.radioButtonRow}>
                <View style={styles.radioButtonItem}>
                  <RadioButton value="Buyer" />
                  <Text style={styles.radioButtonText}>Buyer</Text>
                </View>
                <View style={styles.radioButtonItem}>
                  <RadioButton value="Seller" />
                  <Text style={styles.radioButtonText}>Seller</Text>
                </View>
                <View style={styles.radioButtonItem}>
                  <RadioButton value="Driver" />
                  <Text style={styles.radioButtonText}>Driver</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          {role === "Buyer" && (
            <>
              <FormInput
                placeholder="Address"
                value={address}
                onChangeText={handleChange("address")}
              />
              <FormInput
                placeholder="City"
                value={city}
                onChangeText={handleChange("city")}
              />
              <AppButton style={{ marginBottom: 15 }} title="Pick Location from Map" onPress={() => setMapVisible(true)} />
            </>
          )}

          {role === "Seller" && (
            <>
              <FormInput
                placeholder="Description"
                value={description}
                onChangeText={handleChange("description")}
                multiline
              />
              <AppButton style={{ marginBottom: 15 }} title="Upload Product Sample" onPress={pickImage} />
            </>
          )}

          {role === "Driver" && (
            <>
              <AppButton style={{ marginBottom: 15 }} title="Upload Driving License" onPress={pickImage} />
            </>
          )}

          <AppButton active={!busy} title="Sign Up" onPress={handleSubmit} />

          <FormDivider />

          <Pressable onPress={() => navigate("SignIn")}>
            <CustomText style={styles.title}>Already have an account? Sign In</CustomText>
          </Pressable>
        </View>

        <Modal visible={mapVisible} animationType="slide">
          <MapView
            style={styles.map}
            initialRegion={selectedLocation}
            onPress={handleMapPress}
          >
            <Marker coordinate={selectedLocation} />
          </MapView>
          <AppButton title="Close Map" onPress={() => setMapVisible(false)} />
        </Modal>

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
    color: colors.primary,
    fontFamily: 'Product Sans Regular',
  },
  radioButtonContainer: {
    marginBottom: 15,
  },
  radioButtonLabel: {
    marginBottom: 5,
    color: colors.primary,
    fontFamily: 'Product Sans Regular',
  },
  radioButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButtonItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButtonText: {
    fontFamily: 'Product Sans Regular',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default SignUp;

