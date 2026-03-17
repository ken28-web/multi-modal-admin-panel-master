import { useRouter } from "expo-router";
import { Alert } from "react-native";

import {
  PublicAdminView,
  usePublicAdminLogic,
} from "../components/public-admin-components";

export default function PublicAdminScreen() {
  const router = useRouter();
  const viewModel = usePublicAdminLogic();

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
