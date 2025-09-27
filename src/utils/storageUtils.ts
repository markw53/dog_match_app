import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error storing data:", err);
  }
};

export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? (JSON.parse(json) as T) : null;
  } catch (err) {
    console.error("Error retrieving data:", err);
    return null;
  }
};