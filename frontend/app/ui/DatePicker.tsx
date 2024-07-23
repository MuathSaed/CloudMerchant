import { FC, useState } from "react";
import { View, StyleSheet, Text, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "@utils/colors";
import { formatDate } from "@utils/date";

interface Props {
  title: string;
  value: Date;
  onChange(value: Date): void;
}

let isIOS = Platform.OS === "ios";

let DatePicker: FC<Props> = ({ title, value, onChange }) => {
  let [showPicker, setShowPicker] = useState(false);

  let visible = isIOS ? true : showPicker;

  let onPress = () => {
    if (isIOS) return;
    setShowPicker(true);
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {!isIOS && (
        <Text style={styles.value}>
          {formatDate(value.toISOString(), "dd LLL yyyy")}
        </Text>
      )}
      {visible ? (
        <DateTimePicker
          testID="dateTimePicker"
          value={value}
          onChange={(_, date) => {
            if (date) onChange(date);

            if (!isIOS) setShowPicker(false);
          }}
        />
      ) : null}
    </Pressable>
  );
};

let styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    padding: isIOS ? 0 : 8,
    borderWidth: isIOS ? 0 : 1,
    borderColor: colors.deActive,
    borderRadius: 5,
  },
  title: { color: colors.primary },
  value: { color: colors.primary, paddingLeft: 10 },
});

export default DatePicker;
