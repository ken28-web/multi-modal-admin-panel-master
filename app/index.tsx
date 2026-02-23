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
          Manage public and private fare rates from this web dashboard.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/selection")}
        >
          <Text style={styles.buttonText}>Open Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
