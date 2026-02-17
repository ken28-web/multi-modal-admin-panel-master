import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  getPrivateFuelPriceOptions,
  getPrivateVehicleFuelSettings,
  type PrivateFuelPriceOption,
  type PrivateVehicleFuelSetting,
  updatePrivateFuelPriceOptions,
  updatePrivateVehicleFuelSettings,
} from "../services/fareApi";

import { styles } from "../components/admin-styles/private-admin.styles";

type EditablePrivateVehicleFuelSetting = PrivateVehicleFuelSetting & {
  fuel_efficiency_input: string;
};

type EditablePrivateFuelPriceOption = PrivateFuelPriceOption & {
  price_input: string;
};

function toEditable(
  rows: PrivateVehicleFuelSetting[],
): EditablePrivateVehicleFuelSetting[] {
  return rows.map((row) => ({
    ...row,
    fuel_efficiency_input: String(row.fuel_efficiency),
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
  const [fuelOptions, setFuelOptions] = useState<
    EditablePrivateFuelPriceOption[]
  >([]);
  const [initialFuelOptions, setInitialFuelOptions] = useState<
    EditablePrivateFuelPriceOption[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRows = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const [vehicleData, fuelPriceData] = await Promise.all([
        getPrivateVehicleFuelSettings(),
        getPrivateFuelPriceOptions(),
      ]);

      const editable = toEditable(vehicleData);
      setRows(editable);
      setInitialRows(editable);

      const options = fuelPriceData.map((row) => ({
        ...row,
        price_input: String(row.price),
      }));
      setFuelOptions(options);
      setInitialFuelOptions(options);
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
        return !Number.isFinite(efficiency) || efficiency <= 0;
      }),
    [rows],
  );

  const hasInvalidFuelOptions = useMemo(
    () =>
      fuelOptions.some((row) => {
        const price = Number(row.price_input);
        return !Number.isFinite(price) || price <= 0;
      }),
    [fuelOptions],
  );

  const hasChanges = useMemo(
    () =>
      JSON.stringify(rows) !== JSON.stringify(initialRows) ||
      JSON.stringify(fuelOptions) !== JSON.stringify(initialFuelOptions),
    [rows, initialRows, fuelOptions, initialFuelOptions],
  );

  const updateField = (
    index: number,
    field: "fuel_efficiency_input",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const updateFuelOptionPrice = (index: number, value: string) => {
    setFuelOptions((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, price_input: value } : row,
      ),
    );
  };

  const setDefaultFuelOption = (fuelType: string) => {
    setFuelOptions((prev) =>
      prev.map((row) => ({
        ...row,
        is_default: row.fuel_type === fuelType,
      })),
    );
  };

  const handleReset = () => {
    setRows(initialRows);
    setFuelOptions(initialFuelOptions);
    setError(null);
    setMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    if (hasInvalidInput || hasInvalidFuelOptions) {
      setError("Fuel efficiency and fuel type prices must be greater than 0.");
      return;
    }

    const normalizedFuelOptions: PrivateFuelPriceOption[] = fuelOptions.map(
      (row) => ({
        fuel_type: row.fuel_type,
        price: Number(row.price_input),
        is_default: row.is_default,
      }),
    );
    if (
      normalizedFuelOptions.length > 0 &&
      !normalizedFuelOptions.some((row) => row.is_default)
    ) {
      normalizedFuelOptions[0].is_default = true;
    }
    const selectedDefaultFuel =
      normalizedFuelOptions.find((row) => row.is_default) ||
      normalizedFuelOptions[0];
    const defaultFuelPrice = selectedDefaultFuel
      ? Number(selectedDefaultFuel.price)
      : 60;

    const payload: PrivateVehicleFuelSetting[] = rows.map((row) => ({
      vehicle_type: row.vehicle_type,
      fuel_efficiency: Number(row.fuel_efficiency_input),
      fuel_price: defaultFuelPrice,
    }));

    setIsSaving(true);
    try {
      const updatedFuelOptions = await updatePrivateFuelPriceOptions(
        normalizedFuelOptions,
      );
      const updated = await updatePrivateVehicleFuelSettings(payload);
      const editable = toEditable(updated);
      setRows(editable);
      setInitialRows(editable);
      const editableFuelOptions = updatedFuelOptions.map((row) => ({
        ...row,
        price_input: String(row.price),
      }));
      setFuelOptions(editableFuelOptions);
      setInitialFuelOptions(editableFuelOptions);
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
            Edit fixed fuel efficiency values per vehicle type and one global
            fuel type pricing (Diesel, Gasoline RON 91, Gasoline RON 95).
          </Text>

          <Text style={styles.fieldLabel}>Fuel Type Prices (₱/L)</Text>
          {fuelOptions.map((option, index) => (
            <View key={option.fuel_type} style={styles.row}>
              <Text style={styles.rowTitle}>{option.fuel_type}</Text>
              <TextInput
                value={option.price_input}
                onChangeText={(value) => updateFuelOptionPrice(index, value)}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#687286"
              />
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setDefaultFuelOption(option.fuel_type)}
              >
                <Text style={styles.secondaryButtonText}>
                  {option.is_default ? "Default Fuel Type" : "Set as Default"}
                </Text>
              </Pressable>
            </View>
          ))}

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
                (!hasChanges ||
                  hasInvalidInput ||
                  hasInvalidFuelOptions ||
                  isSaving ||
                  isLoading) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={
                !hasChanges ||
                hasInvalidInput ||
                hasInvalidFuelOptions ||
                isSaving ||
                isLoading
              }
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
