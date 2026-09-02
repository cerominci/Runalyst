import { getToken } from "@/utils/endpoints";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then((token) => setAuthed(!!token));
  }, []);

  if (authed === null) return <View style={{ flex: 1, backgroundColor: "#F5F3FF" }} />;
  return <Redirect href={authed ? "/(tabs)" : "/start"} />;
}
