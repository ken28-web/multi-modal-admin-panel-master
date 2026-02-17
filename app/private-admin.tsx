import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 18,
    alignSelf: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1f2937",
    fontWeight: "600",
  },
});
