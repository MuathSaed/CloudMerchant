import CustomText from "@ui/CustomText";
import categories from "@utils/categories";
import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";

interface Props {
  onPress(category: string): void;
}

let LIST_ITEM_SIZE = 80;

let CategoryList: FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Categories</CustomText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => onPress(item.name)}
              style={styles.listItem}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <CustomText style={styles.categoryName}>
                {item.name}
              </CustomText>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    marginBottom: 50,
  },
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    marginBottom: 15,
  },
  listItem: {
    width: LIST_ITEM_SIZE,
    marginRight: 20,
  },
  iconContainer: {
    width: LIST_ITEM_SIZE,
    height: LIST_ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 7,
    borderColor: colors.primary,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    paddingTop: 2,
    color: colors.primary,
  },
});

export default CategoryList;
