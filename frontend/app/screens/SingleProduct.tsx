import AppHeader from "@components/AppHeader";
import ProductDetail from "@components/ProductDetail";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@ui/BackButton";
import useAuth from "app/hooks/useAuth";
import { ProfileNavigatorParamList } from "app/navigator/SellerProfileNavigator";
import { FC, useEffect, useState } from "react";
import { View, StyleSheet, Text, Alert, Pressable, TouchableOpacity, ScrollView } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import colors from "@utils/colors";
import OptionButton from "@ui/OptionButton";
import OptionModal from "@components/OptionModal";
import useClient from "app/hooks/useClient";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import axios from "axios";
import { showMessage } from "react-native-flash-message";
import LoadingSpinner from "@ui/LoadingSpinner";
import { useDispatch } from "react-redux";
import { Product, deleteItem } from "app/store/listings";
import ChatIcon from "@components/ChatIcon";
import CustomText from "@ui/CustomText";
import AppButton from "@ui/AppButton";
import ImageSlider from "@components/ImageSlider";
import { formatPrice } from "@utils/helper";
import AvatarView from "@ui/AvatarView";


let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "SingleProduct">;

let menuOptions = [
  {
    name: "Edit",
    icon: <Feather name="edit" size={20} color={colors.primary} />,
  },
  {
    name: "Delete",
    icon: <Feather name="trash-2" size={20} color={colors.primary} />,
  },
];

let SingleProduct: FC<Props> = ({ route, navigation }) => {
  let [showMenu, setShowMenu] = useState(false);
  let [busy, setBusy] = useState(false);
  let [buttonBusy, setButtonBusy] = useState(false);
  let [fetchingChatId, setFetchingChatId] = useState(false);
  let [productInfo, setProductInfo] = useState<Product>();
  let { authState } = useAuth();
  let { authClient } = useClient();
  let dispatch = useDispatch();
  let { product, id } = route.params;
  let [quantity, setQuantity] = useState(1);

  let isAdmin = authState.profile?.id === productInfo?.seller.id;

  let confirmDelete = async () => {
    let id = product?.id;
    if (!id) return;

    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      authClient.delete("/product/" + id)
    );
    setBusy(false);
    if (res?.message) {
      dispatch(deleteItem(id));
      showMessage({ message: res.message, type: "success" });
      navigation.navigate("Products");
    }
  };

  let onDeletePress = () => {
    Alert.alert(
      "Are you sure?",
      "This action will remove this product permanently",
      [
        { text: "Delete", style: "destructive", onPress: confirmDelete },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  let fetchProductInfo = async (id: string) => {
    let res = await fetchDataAsync<{ product: Product }>(
      authClient.get("/product/detail/" + id)
    );
    if (res) {
      setProductInfo(res.product);
    }
  };

  let onChatBtnPress = async () => {
    if (!productInfo) return;

    setFetchingChatId(true);
    let res = await fetchDataAsync<{ conversationId: string }>(
      authClient.get("/conversation/with/" + productInfo.seller.id)
    );
    setFetchingChatId(false);
    if (res) {
      navigation.navigate("ChatWindow", {
        conversationId: res.conversationId,
        peerProfile: productInfo.seller,
      });
    }
  };

  useEffect(() => {
    if (id) fetchProductInfo(id);

    if (product) setProductInfo(product);
  }, [id, product]);

  let handleAddToCart = async () => {
    setButtonBusy(true);
    let addToCart = await fetchDataAsync(
      client.post(
        "/cart/add",
        {
          productId: id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.profile?.accessToken}`,
          },
        }
      )
    );

    if (addToCart) {
      showMessage({ message: "Product added to cart", type: "success" });
    } else {
      showMessage({ message: "Failed to add product to cart", type: "danger" });
    }
    setButtonBusy(false);
  };

  return (
    <>
      <AppHeader
        backButton={<BackButton />}
        right={
          <OptionButton onPress={() => setShowMenu(true)} visible={isAdmin} />
        }
      />
      <View style={styles.container}>
        {productInfo ? 
          <View style={styles.detailContainer}>
          <ScrollView>
            <ImageSlider images={productInfo.image} />
    
            <CustomText style={styles.category}>{productInfo.category}</CustomText>
            <CustomText style={styles.price}>{formatPrice(productInfo.price)}</CustomText>
            
            <CustomText
                style={[
                  styles.stock,
                  { color: productInfo.quantity > 0 ? "green" : "red" },
                ]}
              >
                {productInfo.quantity > 0 ? "In Stock" : "Out of Stock"}
              </CustomText>

            <CustomText style={styles.name}>{productInfo.name}</CustomText>
            <CustomText style={styles.description}>{productInfo.description}</CustomText>
    
            <View style={styles.profileContainer}>
              <AvatarView uri={productInfo.seller.avatar} size={60} />
              <CustomText style={styles.profileName}>{productInfo.seller.name}</CustomText>
            </View>

            {!isAdmin && (
            <><View style={styles.quantityContainer}>
                  <CustomText style={styles.quantityLabel}>Quantity:</CustomText>
                  <View style={styles.quantityInput}>
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <CustomText style={styles.quantityButton}>-</CustomText>
                    </TouchableOpacity>
                    <CustomText style={styles.quantityValue}>{quantity}</CustomText>
                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                      <CustomText style={styles.quantityButton}>+</CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
                <AppButton active={!buttonBusy && productInfo.quantity > 0} title="Add to Cart" onPress={handleAddToCart} />
                </>
        )}
          </ScrollView>
        </View>
        
        : <></>}
        
        

        {!isAdmin && (
          <ChatIcon onPress={onChatBtnPress} busy={fetchingChatId} />
        )}
      </View>
      <OptionModal
        options={menuOptions}
        renderItem={({ icon, name }) => (
          <View style={styles.option}>
            {icon}
            <CustomText style={styles.optionTitle}>{name}</CustomText>
          </View>
        )}
        visible={showMenu}
        onRequestClose={setShowMenu}
        onPress={(option) => {
          if (option.name === "Delete") {
            onDeletePress();
          }
          if (option.name === "Edit") {
            navigation.navigate("EditProduct", { product: product! });
          }
        }}
      />
      <LoadingSpinner visible={busy} />
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailContainer: {
    padding: 15,
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionTitle: {
    paddingLeft: 5,
    color: colors.primary,
  },
  quantityContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  quantityInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  quantityButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 18,
  },
  quantityValue: {
    paddingHorizontal: 10,
    fontSize: 16,
  },
  title: {
    color: colors.primary,
  },
  category: {
    marginTop: 15,
    color: colors.primary,
    fontWeight: "700",
  },
  price: {
    marginTop: 5,
    color: colors.active,
    fontWeight: "700",
    fontSize: 20,
  },
  stock: {
    marginTop: 5,
    fontWeight: "700",
  },
  name: {
    marginTop: 15,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 20,
  },
  description: {
    marginTop: 15,
    color: colors.primary,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  profileName: {
    paddingLeft: 15,
    color: colors.primary,
    fontWeight: "600",
    fontSize: 20,
  },
});

export default SingleProduct;
