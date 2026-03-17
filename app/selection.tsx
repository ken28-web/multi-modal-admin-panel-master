import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../components/admin-styles/selection.styles";

export default function SelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose What You Want to Manage</Text>

      <TouchableOpacity
        style={[styles.choiceBtn, styles.publicBtn]}
        onPress={() => router.push("/public-admin")}
      >
        <Text style={styles.btnText}>
          Public Transport Rates (PUV and Rail)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceBtn, styles.privateBtn]}
        onPress={() => router.push("/private-admin")}
      >
        <Text style={styles.btnText}>Private Transport Fuel Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
