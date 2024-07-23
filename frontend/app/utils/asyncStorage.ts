import AsyncStorage from "@react-native-async-storage/async-storage";

let save = async (key: string, value: string) => {
  await AsyncStorage.setItem(key, value);
};

let get = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

let remove = async (key: string) => {
  await AsyncStorage.removeItem(key);
};

let clear = async () => {
  await AsyncStorage.clear();
};

let asyncStorage = { save, get, remove, clear };

export enum Keys {
  AUTH_TOKEN = "AUTH_TOKEN",
  REFRESH_TOKEN = "REFRESH_TOKEN",
}

export default asyncStorage;
