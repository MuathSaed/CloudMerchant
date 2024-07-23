import AppHeader from "@components/AppHeader";
import HorizontalImageList from "@components/HorizontalImageList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@ui/BackButton";
import colors from "@utils/colors";
import { ProfileNavigatorParamList } from "app/navigator/SellerProfileNavigator";
import { FC, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FormInput from "@ui/FormInput";
import OptionModal from "@components/OptionModal";
import useClient from "app/hooks/useClient";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { selectImages } from "@utils/helper";
import CategoryOptions from "@components/CategoryOptions";
import AppButton from "@ui/AppButton";
import { newProductSchema, yupValidate } from "@utils/validate";
import { showMessage } from "react-native-flash-message";
import mime from "mime";
import LoadingSpinner from "@ui/LoadingSpinner";
import deepEqual from "deep-equal";
import CustomText from "@ui/CustomText";

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "EditProduct">;

type ProductInfo = {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
};

let imageOptions = [
  { value: "Use as Thumbnail", id: "thumb" },
  { value: "Remove Image", id: "remove" },
];

let EditProduct: FC<Props> = ({ route }) => {
  let productInfoToUpdate = {
    ...route.params.product,
    price: route.params.product.price.toString(),
    quantity: route.params.product.quantity.toString(),
  };

  let [selectedImage, setSelectedImage] = useState("");
  let [showImageOptions, setShowImageOptions] = useState(false);
  let [busy, setBusy] = useState(false);
  let [product, setProduct] = useState({ ...productInfoToUpdate });
  let { authClient } = useClient();

  let isFormChanged = deepEqual(productInfoToUpdate, product);

  let onLongPress = (image: string) => {
    setSelectedImage(image);
    setShowImageOptions(true);
  };

  let removeSelectedImage = async () => {
    let notLocalImage = selectedImage.startsWith(
      "https://res.cloudinary.com"
    );

    let images = product.image;
    let newImages = images?.filter((img) => img !== selectedImage);
    setProduct({ ...product, image: newImages });

    if (notLocalImage) {
      let splittedItems = selectedImage.split("/");
      let imageId = splittedItems[splittedItems.length - 1].split(".")[0];
      await fetchDataAsync(
        authClient.delete(`/product/image/${product.id}/${imageId}`)
      );
    }
  };

  let handleOnImageSelect = async () => {
    let newImages = await selectImages();
    let oldImages = product.image || [];
    let images = oldImages.concat(newImages);
    setProduct({ ...product, image: [...images] });
  };

  let makeSelectedImageAsThumbnail = () => {
    if (selectedImage.startsWith("https://res.cloudinary.com")) {
      setProduct({ ...product, thumbnail: selectedImage });
    }
  };

  let handleOnSubmit = async () => {
    let dataToUpdate: ProductInfo = {
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    };
    let { error } = await yupValidate(newProductSchema, dataToUpdate);
    if (error) return showMessage({ message: error, type: "danger" });

    let formData = new FormData();

    if (product.thumbnail) {
      formData.append("thumbnail", product.thumbnail);
    }

    type productInfoKeys = keyof typeof dataToUpdate;

    for (let key in dataToUpdate) {
      let value = dataToUpdate[key as productInfoKeys];

      console.log(key, value);

      formData.append(key, value);
    }

    product.image?.forEach((img, index) => {
      if (!img.startsWith("https://res.cloudinary.com")) {
        formData.append("images", {
          uri: img,
          name: "image_" + index,
          type: mime.getType(img) || "image/jpg",
        } as any);
      }
    });

    console.log(formData.getAll("images"));

    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      authClient.patch("/product/" + product.id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  };

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <ScrollView>
          <CustomText style={styles.title}>Images</CustomText>
          <HorizontalImageList
            images={product.image || []}
            onLongPress={onLongPress}
          />
          <Pressable onPress={handleOnImageSelect} style={styles.imageSelector}>
            <FontAwesome5 name="images" size={30} color={colors.primary} />
          </Pressable>

          <FormInput
            placeholder="Product name"
            value={product.name}
            onChangeText={(name) => setProduct({ ...product, name })}
          />
          <FormInput
            placeholder="Price"
            keyboardType="numeric"
            value={product.price.toString()}
            onChangeText={(price) => setProduct({ ...product, price })}
          />
          <FormInput
            placeholder="Quantity"
            keyboardType="numeric"
            value={product.quantity.toString()}
            onChangeText={(quantity) => setProduct({ ...product, quantity })}
          />

          <CategoryOptions
            onSelect={(category) => setProduct({ ...product, category })}
            title={product.category || "Category"}
          />

          <FormInput
            placeholder="Description"
            value={product.description}
            onChangeText={(description) =>
              setProduct({ ...product, description })
            }
          />
          {!isFormChanged && (
            <AppButton title="Update Product" onPress={handleOnSubmit} />
          )}
        </ScrollView>
      </View>

      <OptionModal
        options={imageOptions}
        visible={showImageOptions}
        onRequestClose={setShowImageOptions}
        renderItem={(option) => {
          return <Text style={styles.option}>{option.value}</Text>;
        }}
        onPress={({ id }) => {
          if (id === "thumb") makeSelectedImageAsThumbnail();
          if (id === "remove") removeSelectedImage();
        }}
      />
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
    fontWeight: "600",
    fontSize: 16,
    color: colors.primary,
    marginBottom: 10,
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
});

export default EditProduct;
