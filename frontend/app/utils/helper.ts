import {launchImageLibrary} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';

export let formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export let selectImages = async () => {
  let result: string[] = [];
  try {
    let response = await new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.3,
          selectionLimit: 0,
        },
        (response) => {
          if (response.didCancel) {
            reject({message: 'User cancelled image picker'});
          } else if (response.errorCode) {
            reject({message: response.errorMessage || 'Unknown error'});
          } else {
            resolve(response);
          }
        }
      );
    });

    let typedResponse = response as { assets: { uri: string }[] };
    if (typedResponse.assets) {
      result = typedResponse.assets.map(({uri}) => uri);
    }
  } catch (error) {
    showMessage({message: (error as any).message, type: 'danger'});
  }

  return result;
};
