import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Fare Category</Text>

      <TouchableOpacity
        style={[styles.choiceBtn, styles.publicBtn]}
        onPress={() => router.push("/public-admin")}
      >
        <Text style={styles.btnText}>Public Transport Rates</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceBtn, styles.privateBtn]}
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
    backgroundColor: "#111318",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    color: "#d7dbe3",
    letterSpacing: 0.5,
  },
  choiceBtn: {
    width: "100%",
    maxWidth: 520,
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
  },
  publicBtn: {
    backgroundColor: "#2d3a4d",
    borderColor: "#4c5f7d",
  },
  privateBtn: {
    backgroundColor: "#313642",
    borderColor: "#5d6573",
  },
  btnText: {
    color: "#e8ecf3",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
  },
});
