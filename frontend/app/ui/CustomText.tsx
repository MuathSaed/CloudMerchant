import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface CustomTextProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

let CustomText: React.FC<CustomTextProps> = ({ children, style, onPress, numberOfLines, ellipsizeMode }) => {
  return (
    <Text ellipsizeMode={ellipsizeMode} numberOfLines={numberOfLines} onPress={onPress} style={[styles.defaultFont, style]}>{children}</Text>
  );
};

let styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'Product Sans Regular'
  },
});

export default CustomText;