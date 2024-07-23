import FormInput from "@ui/FormInput";
import { FC, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import mime from "mime";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from "@utils/colors";
import OptionModal from "@components/OptionModal";
import AppButton from "@ui/AppButton";
import CustomKeyAvoidingView from "@ui/CustomKeyAvoidingView";
import { showMessage } from "react-native-flash-message";
import HorizontalImageList from "@components/HorizontalImageList";
import { newProductSchema, yupValidate } from "@utils/validate";
import useClient from "app/hooks/useClient";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import LoadingSpinner from "@ui/LoadingSpinner";
import { selectImages } from "@utils/helper";
import CategoryOptions from "@components/CategoryOptions";
import CustomText from "@ui/CustomText";
import TopLogo from "app/svg/TopLogo";
import ChatNotification from "@ui/ChatNotification";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "app/navigator/AppNavigator";
import { useSelector } from "react-redux";
import { getUnreadChatsCount } from "app/store/chats";

interface Props {}

let defaultInfo = {
  name: "",
  description: "",
  category: "",
  price: "",
  quantity: "",
};

let imageOptions = [{ value: "Remove Image", id: "remove" }];

let NewProduct: FC<Props> = (props) => {
  let [productInfo, setProductInfo] = useState({ ...defaultInfo });
  let [busy, setBusy] = useState(false);
  let { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  let totalUnreadMessages = useSelector(getUnreadChatsCount);
  let [showCategoryModal, setShowCategoryModal] = useState(false);
  let [showImageOptions, setShowImageOptions] = useState(false);
  let [images, setImages] = useState<string[]>([]);
  let [selectedImage, setSelectedImage] = useState("");
  let { authClient } = useClient();

  let { category, description, name, price, quantity } = productInfo;

  let handleChange = (name: string) => (text: string) => {
    setProductInfo({ ...productInfo, [name]: text });
  };

  let handleSubmit = async () => {
    let { error } = await yupValidate(newProductSchema, productInfo);
    if (error) return showMessage({ message: error, type: "danger" });

    setBusy(true);
    let formData = new FormData();

    type productInfoKeys = keyof typeof productInfo;

    for (let key in productInfo) {
      let value = productInfo[key as productInfoKeys];
      formData.append(key, value);
    }

    let newImages = images.map((img, index) => ({
      name: "image_" + index,
      type: mime.getType(img),
      uri: img,
    }));

    for (let img of newImages) {
      console.log(img);
      formData.append("images", img as any);
    }

    let res = await fetchDataAsync<{ message: string }>(
      authClient.post("/product/list", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
    setBusy(false);

    if (res) {
      showMessage({ message: res.message, type: "success" });
      setProductInfo({ ...defaultInfo });
      setImages([]);
    }

    console.log(res);
  };

  let handleOnImageSelection = async () => {
    let newImages = await selectImages();
    setImages([...images, ...newImages]);
  };

  return (
    
    <CustomKeyAvoidingView>
    <View style={styles.header}> 
        <TopLogo />
        <ChatNotification
          onPress={() => navigate('Chats')}
          indicate={totalUnreadMessages > 0}
        />
    </View>
      
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Pressable
            onPress={handleOnImageSelection}
            style={styles.fileSelector}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="images" size={24} color="black" />
            </View>
            <CustomText style={styles.btnTitle}>Add Images</CustomText>
          </Pressable>

          <HorizontalImageList
            images={images}
            onLongPress={(img) => {
              setSelectedImage(img);
              setShowImageOptions(true);
            }}
          />
          
        </View>

        <FormInput
          value={name}
          placeholder="Product name"
          onChangeText={handleChange("name")}
        />
        <FormInput
          value={price}
          placeholder="Price"
          onChangeText={handleChange("price")}
          keyboardType="numeric"
        />
        <FormInput
          value={quantity}
          placeholder="Quantity"
          onChangeText={handleChange("quantity")}
          keyboardType="numeric"
        />

        <CategoryOptions
          onSelect={handleChange("category")}
          title={category || "Category"}
        />

        <FormInput
          value={description}
          placeholder="Description"
          multiline
          numberOfLines={1}
          onChangeText={handleChange("description")}
        />

        <AppButton title="Add Product" onPress={handleSubmit} />

        <OptionModal
          visible={showImageOptions}
          onRequestClose={setShowImageOptions}
          options={imageOptions}
          renderItem={(item) => {
            return <Text style={styles.imageOption}>{item.value}</Text>;
          }}
          onPress={(option) => {
            if (option.id === "remove") {
              let newImages = images.filter((img) => img !== selectedImage);
              setImages([...newImages]);
            }
          }}
        />
      </View>
      <LoadingSpinner visible={busy} />
    </CustomKeyAvoidingView>
  );
};

let styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
  },
  imageContainer: { flexDirection: "row" },
  btnTitle: {
    color: colors.primary,
    marginTop: 5,
  },
  fileSelector: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 7,
  },
  selectedImage: {
    width: 70,
    height: 70,
    borderRadius: 7,
    marginLeft: 5,
  },
  imageOption: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.primary,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default NewProduct;
