import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { styles } from "../components/admin-styles/private-admin.styles";

export default function PrivateAdminScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/selection")}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.header}>Private Transport</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>No private fare data yet</Text>
        <Text style={styles.infoText}>
          Private transport fare configuration is currently disabled because the
          private fare dataset is not available yet.
        </Text>
        <Text style={styles.infoText}>
          Public fare management is active and now updates both database tables:
          public_mode_fares and fare_rules.
        </Text>
      </View>
    </View>
  );
}
