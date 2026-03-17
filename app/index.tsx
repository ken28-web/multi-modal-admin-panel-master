import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../components/admin-styles/index.styles";

export default function Login() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Transport Fare Admin Panel</Text>
        <Text style={styles.subtitle}>
          Manage and review fare settings with guided steps, previews, and safe
          save actions.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/selection")}
        >
          <Text style={styles.buttonText}>Start Fare Management</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
