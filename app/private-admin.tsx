import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AdminPanel() {
  const [fare, setFare] = useState("");
  const [fuel, setFuel] = useState("");
  const [fareFocused, setFareFocused] = useState(false);
  const [fuelFocused, setFuelFocused] = useState(false);

  const handleUpdate = () => {
    console.log("Fare Updated to:", fare);
    console.log("Fuel Updated to:", fuel);
    alert("Prices updated successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Panel</Text>

      {/* This View acts as your "Box" */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fare Price</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={fareFocused ? "#ccc" : "#999"}
            value={fare}
            onChangeText={setFare}
            keyboardType="numeric"
            onFocus={() => setFareFocused(true)}
            onBlur={() => setFareFocused(false)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fuel Price</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={fuelFocused ? "#ccc" : "#999"}
            value={fuel}
            onChangeText={setFuel}
            keyboardType="numeric"
            onFocus={() => setFuelFocused(true)}
            onBlur={() => setFuelFocused(false)}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Update Prices"
            onPress={handleUpdate}
            color="#007AFF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 50,
    width: "30%",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
    width: "40%",
    alignSelf: "center",
  },
});
