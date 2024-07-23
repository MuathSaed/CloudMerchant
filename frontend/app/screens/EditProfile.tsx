import AppHeader from "@components/AppHeader";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@ui/BackButton";
import colors from "@utils/colors";
import { ProfileNavigatorParamList } from "app/navigator/BuyerProfileNavigator";
import { FC, useState } from "react";
import { View, StyleSheet, ScrollView, Modal, Dimensions } from "react-native";
import FormInput from "@ui/FormInput";
import useClient from "app/hooks/useClient";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import AppButton from "@ui/AppButton";
import { updateBuyerSchema, updateSchema, yupValidate } from "@utils/validate";
import { showMessage } from "react-native-flash-message";
import LoadingSpinner from "@ui/LoadingSpinner";
import deepEqual from "deep-equal";
import CustomText from "@ui/CustomText";
import MapView, { Marker, Region } from "react-native-maps";

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "EditProfile">;

type ProfileInfo = {
  name: string;
  email: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};


let EditProfile: FC<Props> = ({ route }) => {
  let profileInfoToUpdate = {
    ...route.params.profile,
  };

  let [mapVisible, setMapVisible] = useState(false);
  let [selectedLocation, setSelectedLocation] = useState<Region>({
    latitude: 32.2203,
    longitude: 35.2446,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  let [busy, setBusy] = useState(false);
  let [profile, setProfile] = useState({ ...profileInfoToUpdate });
  let [password, setPassword] = useState("");
  let { authClient } = useClient();

  let isFormChanged = deepEqual(profileInfoToUpdate, profile);

  let handleMapPress = (event: any) => {
    let { coordinate } = event.nativeEvent;
    setSelectedLocation({
      ...selectedLocation,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    console.log(coordinate.latitude, coordinate.longitude);
    setProfile({ ...profile, location: {
      longitude: coordinate.longitude, latitude: coordinate.latitude}
     });
    setMapVisible(false);
  };

  let handleOnSubmit = async () => {
    let dataToUpdate: ProfileInfo = {
      name: profile.name,
      email: profile.email,
      address: profile.address,
      city: profile.city,
      latitude: profile.location?.latitude,
      longitude: profile.location?.longitude,
    };

    console.log(dataToUpdate);

    if (profile.role === "Buyer") {
      let { error } = await yupValidate(updateBuyerSchema, dataToUpdate);
      if (error) return showMessage({ message: error, type: "danger" });
    } else {
      let { error } = await yupValidate(updateSchema, dataToUpdate);
      if (error) return showMessage({ message: error, type: "danger" });
    }

    setBusy(true);

    let res = await fetchDataAsync<{ message: string; profile: ProfileInfo }>(
      authClient.patch("/auth/update-profile", dataToUpdate)
    );
    
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  };

  let handlePasswordChange = async () => {
    if (!password) return showMessage({ message: "Please enter a password", type: "danger" });

    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      authClient.post("/auth/update-password", { id: profile.id, password })
    );
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  }

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <ScrollView>
        <CustomText style={styles.title}>Edit Profile</CustomText>
          <FormInput
            placeholder="Name"
            value={profile.name}
            onChangeText={(name) => setProfile({ ...profile, name })}
          />
          <FormInput
            placeholder="Email"
            value={profile.email}
            onChangeText={(email) => setProfile({ ...profile, email })}
          />

          {profile.role === "Buyer" && (
            <>
              <FormInput
                placeholder="Address"
                value={profile.address}
                onChangeText={(address) => setProfile({ ...profile, address })}
              />

                <FormInput
                placeholder="City"
                value={profile.city}
                onChangeText={(city) => setProfile({ ...profile, city })}
              />

              <AppButton style={{ marginBottom: 15 }} title="Pick Location from Map" onPress={() => setMapVisible(true)} />
            </>
          )}

          <Modal visible={mapVisible} animationType="slide">
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 32.2203,
                longitude: 35.2446,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              
              }}
              onPress={handleMapPress}
            >
              <Marker coordinate={selectedLocation} />
            </MapView>
            <AppButton title="Close Map" onPress={() => setMapVisible(false)} />
          </Modal>

          <AppButton style={{ marginBottom: 40 }} title="Update Profile" onPress={handleOnSubmit} />


          <CustomText style={styles.title}>Change Password</CustomText>
          <FormInput
            placeholder="Password"
            secureTextEntry
            onChangeText={(password) => setPassword(password)}
          />
          <AppButton title="Change Password" onPress={handlePasswordChange} />
        </ScrollView>
      </View>

      <LoadingSpinner visible={busy} />
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "Product Sans Bold",
  },
  imageSelector: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 7,
    borderColor: colors.primary,
    marginVertical: 10,
  },
  option: {
    paddingVertical: 10,
    color: colors.primary,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default EditProfile;
