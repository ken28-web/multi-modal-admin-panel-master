import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

import {
  PublicAdminView,
  usePublicAdminLogic,
} from "../components/public-admin-components";
import {
  clearAdminSessionToken,
  getAdminSession,
  isAdminAuthenticatedClient,
} from "../services/fareApi";

export default function PublicAdminScreen() {
  const router = useRouter();
  const viewModel = usePublicAdminLogic();

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

  const handleBack = () => {
    if (!viewModel.hasUnsavedChanges) {
      router.push("/selection");
      return;
    }

    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. Leave this page without saving?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => router.push("/selection"),
        },
      ],
    );
  };

  return <PublicAdminView {...viewModel} onBack={handleBack} />;
}
