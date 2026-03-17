import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../components/admin-styles/selection.styles";
import {
    clearAdminSessionToken,
    getAdminSession,
    isAdminAuthenticatedClient,
} from "../services/fareApi";

export default function SelectionScreen() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      if (!isAdminAuthenticatedClient()) {
        router.replace("/");
        return;
      }

      try {
        const session = await getAdminSession();
        if (!session.authenticated) {
          clearAdminSessionToken();
          router.replace("/");
        }
      } catch {
        clearAdminSessionToken();
        router.replace("/");
      }
    };

    void run();
  }, [router]);

  const onSignOut = () => {
    clearAdminSessionToken();
    router.replace("/");
  };

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

      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
