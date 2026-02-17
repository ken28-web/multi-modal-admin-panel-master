import { useRouter } from "expo-router";

import {
  PublicAdminView,
  usePublicAdminLogic,
} from "../components/public-admin-components";

export default function PublicAdminScreen() {
  const router = useRouter();
  const viewModel = usePublicAdminLogic();

  return (
    <PublicAdminView {...viewModel} onBack={() => router.push("/selection")} />
  );
}
