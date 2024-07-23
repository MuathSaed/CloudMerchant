import * as Font from 'expo-font'; 

export let loadFonts = async () => {
  try {
    await Font.loadAsync({
        'Product Sans Bold': require('assets/fonts/Product-Sans-Bold.ttf'),
        'Product Sans Bold Italic': require('assets/fonts/Product-Sans-Bold-Italic.ttf'),
        'Product Sans Italic': require('assets/fonts/Product-Sans-Italic.ttf'),
        'Product Sans Regular': require('assets/fonts/Product-Sans-Regular.ttf'),
    });
  } catch (error) {
    console.error('Error loading fonts:', error);
  }
};

export default loadFonts;