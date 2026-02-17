import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Fare Category</Text>

      <TouchableOpacity
        style={[styles.choiceBtn, { backgroundColor: "#007AFF" }]}
        onPress={() => router.push("/public-admin")}
      >
        <Text style={styles.btnText}>Public Transport Rates</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceBtn, { backgroundColor: "#34C759" }]}
        onPress={() => router.push("/private-admin")}
      >
        <Text style={styles.btnText}>Private Transport Rates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  choiceBtn: { width: "100%", maxWidth: 520, padding: 25, borderRadius: 15 },
  btnText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
