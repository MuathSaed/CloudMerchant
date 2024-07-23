import { AxiosResponse, AxiosError } from "axios";
import { showMessage } from "react-native-flash-message";

export let fetchDataAsync = async <T>(
  promise: Promise<AxiosResponse<T>>
): Promise<T | null> => {
  try {
    let response = await promise;
    return response.data;
  } catch (error) {
    let message = (error as any).message;
    if (error instanceof AxiosError) {
      let response = error.response;
      if (response) {
        message = response.data.message;
      }
    }

    showMessage({ message, type: "danger" });
  }

  return null;
};
