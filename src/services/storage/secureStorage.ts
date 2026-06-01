import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const webStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  }
};

export const secureStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return webStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      webStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      webStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }
};
