import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Product } from "app/store/listings";
import colors from "app/utils/colors";
import { formatPrice } from "app/utils/helper";
import useAuth from "app/hooks/useAuth";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import AppButton from "@ui/AppButton";
import axios from "axios";

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

interface Props {}

let ProductDetailScreen: React.FC<Props> = () => {
  let route = useRoute();
  let { params } = route;
  let product = (params as { product: Product }).product;
  let { authState } = useAuth();
  let [quantity, setQuantity] = useState(1);

  let handleAddToCart = async () => {
    await fetchDataAsync(
      client.post(
        "/cart/add",
        {
          productId: product.id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.profile?.accessToken}`,
          },
        }
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.sellerContainer}>
          <Text style={styles.sellerText}>Seller:</Text>
          <Text style={styles.sellerName}>{product.seller.name}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityInput}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.quantityButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <AppButton title="Add to Cart" onPress={handleAddToCart} />
      </View>
    </ScrollView>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sellerText: {
    fontSize: 16,
    marginRight: 5,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
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
});

export default ProductDetailScreen;