import OptionSelector from "app/screens/OptionSelector";
import { FC, useState } from "react";
import { View, StyleSheet } from "react-native";
import OptionModal from "./OptionModal";
import categories from "@utils/categories";
import CategoryOption from "@ui/CategoryOption";

interface Props {
  title: string;
  onSelect(category: string): void;
}

let CategoryOptions: FC<Props> = ({ title, onSelect }) => {
  let [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <View style={styles.container}>
      <OptionSelector
        title={title}
        onPress={() => setShowCategoryModal(true)}
      />

      <OptionModal
        visible={showCategoryModal}
        onRequestClose={setShowCategoryModal}
        options={categories}
        renderItem={(item) => {
          return <CategoryOption {...item} />;
        }}
        onPress={(item) => onSelect(item.name)}
      />
    </View>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default CategoryOptions;
