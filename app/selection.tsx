import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Sector</Text>

      <TouchableOpacity
        style={[styles.choiceBtn, { backgroundColor: "#007AFF" }]}
        onPress={() => router.push("/public-admin")}
      >
        <Text style={styles.btnText}>Public Transport</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceBtn, { backgroundColor: "#34C759" }]}
        onPress={() => router.push("/private-admin")}
      >
        <Text style={styles.btnText}>Private Sector</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    marginTop: 200,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  choiceBtn: { width: "30%", padding: 25, borderRadius: 15 },
  btnText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
