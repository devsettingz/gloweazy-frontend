import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function TestSecureStore() {
  const [token, setToken] = useState<string | null>(null);

  const saveSampleToken = async () => {
    await AsyncStorage.setItem("gloweazy_token", "sample123");
    const stored = await AsyncStorage.getItem("gloweazy_token");
    setToken(stored);
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem("gloweazy_token");
    setToken(null);
  };

  useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem("gloweazy_token");
      setToken(stored);
    };
    loadToken();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Stored Token: {token || "None"}</Text>
      <Button title="Save Token" onPress={saveSampleToken} />
      <Button title="Clear Token" onPress={clearToken} />
    </View>
  );
}
