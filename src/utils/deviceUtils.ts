import { Platform, Dimensions } from "react-native";

export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export const getDeviceType = (): "portrait" | "landscape" => {
  const { width, height } = Dimensions.get("window");
  return width < height ? "portrait" : "landscape";
};