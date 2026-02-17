import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  getPrivateVehicleFuelSettings,
  type PrivateVehicleFuelSetting,
  updatePrivateVehicleFuelSettings,
} from "../services/fareApi";

import { styles } from "../components/admin-styles/private-admin.styles";

type EditablePrivateVehicleFuelSetting = PrivateVehicleFuelSetting & {
  fuel_efficiency_input: string;
  fuel_price_input: string;
};

function toEditable(
  rows: PrivateVehicleFuelSetting[],
): EditablePrivateVehicleFuelSetting[] {
  return rows.map((row) => ({
    ...row,
    fuel_efficiency_input: String(row.fuel_efficiency),
    fuel_price_input: String(row.fuel_price),
  }));
}

export default function PrivateAdminScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<EditablePrivateVehicleFuelSetting[]>([]);
  const [initialRows, setInitialRows] = useState<
    EditablePrivateVehicleFuelSetting[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRows = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const data = await getPrivateVehicleFuelSettings();
      const editable = toEditable(data);
      setRows(editable);
      setInitialRows(editable);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load private settings",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const hasInvalidInput = useMemo(
    () =>
      rows.some((row) => {
        const efficiency = Number(row.fuel_efficiency_input);
        const price = Number(row.fuel_price_input);
        return (
          !Number.isFinite(efficiency) ||
          efficiency <= 0 ||
          !Number.isFinite(price) ||
          price <= 0
        );
      }),
    [rows],
  );

  const hasChanges = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(initialRows),
    [rows, initialRows],
  );

  const updateField = (
    index: number,
    field: "fuel_efficiency_input" | "fuel_price_input",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleReset = () => {
    setRows(initialRows);
    setError(null);
    setMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    if (hasInvalidInput) {
      setError("Fuel efficiency and fuel price must both be greater than 0.");
      return;
    }

    const payload: PrivateVehicleFuelSetting[] = rows.map((row) => ({
      vehicle_type: row.vehicle_type,
      fuel_efficiency: Number(row.fuel_efficiency_input),
      fuel_price: Number(row.fuel_price_input),
    }));

    setIsSaving(true);
    try {
      const updated = await updatePrivateVehicleFuelSettings(payload);
      const editable = toEditable(updated);
      setRows(editable);
      setInitialRows(editable);
      setMessage("Private vehicle fuel settings saved.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save private settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.infoTitle}>Private Vehicle Fuel Settings</Text>
          <Text style={styles.infoText}>
            Edit fixed fuel efficiency and fuel price values per vehicle type.
          </Text>

          {isLoading ? (
            <Text style={styles.loadingText}>Loading settings...</Text>
          ) : null}

          {!isLoading && rows.length === 0 ? (
            <Text style={styles.infoText}>No vehicle settings found.</Text>
          ) : null}

          {!isLoading
            ? rows.map((row, index) => (
                <View key={row.vehicle_type} style={styles.row}>
                  <Text style={styles.rowTitle}>{row.vehicle_type}</Text>

                  <Text style={styles.fieldLabel}>Fuel Efficiency (km/L)</Text>
                  <TextInput
                    value={row.fuel_efficiency_input}
                    onChangeText={(value) =>
                      updateField(index, "fuel_efficiency_input", value)
                    }
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#687286"
                  />

                  <Text style={styles.fieldLabel}>Fuel Price (₱/L)</Text>
                  <TextInput
                    value={row.fuel_price_input}
                    onChangeText={(value) =>
                      updateField(index, "fuel_price_input", value)
                    }
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#687286"
                  />
                </View>
              ))
            : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.infoText}>{message}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleReset}
              disabled={!hasChanges || isLoading || isSaving}
            >
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                (!hasChanges || hasInvalidInput || isSaving || isLoading) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || hasInvalidInput || isSaving || isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.mutedText}>
            These values are used as fixed defaults for private vehicle cost
            estimation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
