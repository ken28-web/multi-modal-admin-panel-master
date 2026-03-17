import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

import {
    clearAdminSessionToken,
    getAdminSession,
    getPrivateFuelPriceOptions,
    getPrivateVehicleFuelSettings,
    isAdminAuthenticatedClient,
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

type PrivateStep = "fuel-prices" | "vehicle-efficiency" | "review";

function toEditable(
  rows: PrivateVehicleFuelSetting[],
): EditablePrivateVehicleFuelSetting[] {
  return rows.map((row) => ({
    ...row,
    fuel_efficiency_input: String(row.fuel_efficiency),
  }));
}

function isPositiveNumber(value: string): boolean {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

export default function PrivateAdminScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 900;
  const compactHeaderRowStyle = isCompact
    ? ({ flexWrap: "wrap", alignItems: "flex-start" } as const)
    : null;
  const compactHeaderTextStyle = isCompact
    ? ({ fontSize: 20, lineHeight: 26 } as const)
    : null;
  const compactStepperButtonStyle = isCompact
    ? ({ width: "100%", minHeight: 40 } as const)
    : null;
  const compactActionsStyle = isCompact
    ? ({ flexDirection: "column" } as const)
    : null;
  const compactButtonStyle = isCompact ? ({ width: "100%" } as const) : null;
  const compactStickyMetaStyle = isCompact
    ? ({ flexDirection: "column", alignItems: "flex-start", gap: 6 } as const)
    : null;

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
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [step, setStep] = useState<PrivateStep>("fuel-prices");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [fuelSearch, setFuelSearch] = useState("");

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
    void loadRows();
  }, []);

  const fuelOptionErrors = useMemo(
    () =>
      fuelOptions.reduce<Record<string, string>>((acc, row) => {
        if (!isPositiveNumber(row.price_input)) {
          acc[row.fuel_type] = "Price must be greater than 0.";
        }
        return acc;
      }, {}),
    [fuelOptions],
  );

  const vehicleErrors = useMemo(
    () =>
      rows.reduce<Record<string, string>>((acc, row) => {
        if (!isPositiveNumber(row.fuel_efficiency_input)) {
          acc[row.vehicle_type] = "Fuel efficiency must be greater than 0.";
        }
        return acc;
      }, {}),
    [rows],
  );

  const hasInvalidInput = useMemo(
    () => Object.keys(vehicleErrors).length > 0,
    [vehicleErrors],
  );

  const hasInvalidFuelOptions = useMemo(
    () => Object.keys(fuelOptionErrors).length > 0,
    [fuelOptionErrors],
  );

  const hasChanges = useMemo(
    () =>
      JSON.stringify(rows) !== JSON.stringify(initialRows) ||
      JSON.stringify(fuelOptions) !== JSON.stringify(initialFuelOptions),
    [rows, initialRows, fuelOptions, initialFuelOptions],
  );

  const filteredFuelOptions = useMemo(() => {
    const query = fuelSearch.trim().toLowerCase();
    if (!query) return fuelOptions;
    return fuelOptions.filter((row) =>
      `${row.fuel_type} ${row.price_input}`.toLowerCase().includes(query),
    );
  }, [fuelOptions, fuelSearch]);

  const filteredVehicleRows = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      `${row.vehicle_type} ${row.fuel_efficiency_input}`
        .toLowerCase()
        .includes(query),
    );
  }, [rows, vehicleSearch]);

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

  const handleBack = () => {
    if (!hasChanges) {
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
      setLastSavedAt(new Date().toLocaleString());
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
      <View style={[styles.headerRow, compactHeaderRowStyle]}>
        <Pressable style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Text style={[styles.header, compactHeaderTextStyle]}>
          Private Transport
        </Text>
      </View>

      <View style={styles.stepperRow}>
        {[
          { key: "fuel-prices", label: "1. Fuel Prices" },
          { key: "vehicle-efficiency", label: "2. Vehicle Efficiency" },
          { key: "review", label: "3. Review and Save" },
        ].map((item) => {
          const active = step === item.key;
          return (
            <Pressable
              key={item.key}
              style={[
                styles.stepButton,
                compactStepperButtonStyle,
                active && styles.stepButtonActive,
              ]}
              onPress={() => setStep(item.key as PrivateStep)}
            >
              <Text
                style={[
                  styles.stepButtonText,
                  active && styles.stepButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.infoTitle}>Private Vehicle Fuel Settings</Text>
          <Text style={styles.infoText}>
            Edit fixed fuel efficiency values per vehicle type and one global
            fuel type pricing.
          </Text>

          {step === "fuel-prices" ? (
            <>
              <Text style={styles.fieldLabel}>Fuel Type Prices (P/L)</Text>
              <TextInput
                style={styles.searchInput}
                value={fuelSearch}
                onChangeText={setFuelSearch}
                placeholder="Search fuel type"
                placeholderTextColor="#7c8697"
              />

              {filteredFuelOptions.map((option) => {
                const index = fuelOptions.findIndex(
                  (row) => row.fuel_type === option.fuel_type,
                );
                return (
                  <View key={option.fuel_type} style={styles.row}>
                    <Text style={styles.rowTitle}>{option.fuel_type}</Text>
                    <TextInput
                      value={option.price_input}
                      onChangeText={(value) =>
                        updateFuelOptionPrice(index, value)
                      }
                      keyboardType="decimal-pad"
                      style={[
                        styles.input,
                        fuelOptionErrors[option.fuel_type]
                          ? styles.inputError
                          : null,
                      ]}
                      placeholder="0"
                      placeholderTextColor="#687286"
                    />
                    {fuelOptionErrors[option.fuel_type] ? (
                      <Text style={styles.fieldErrorText}>
                        {fuelOptionErrors[option.fuel_type]}
                      </Text>
                    ) : null}
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => setDefaultFuelOption(option.fuel_type)}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {option.is_default
                          ? "Default Fuel Type"
                          : "Set as Default"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </>
          ) : null}

          {step === "vehicle-efficiency" ? (
            <>
              <Text style={styles.fieldLabel}>
                Vehicle Fuel Efficiency (km/L)
              </Text>
              <TextInput
                style={styles.searchInput}
                value={vehicleSearch}
                onChangeText={setVehicleSearch}
                placeholder="Search vehicle type"
                placeholderTextColor="#7c8697"
              />
              {!isLoading
                ? filteredVehicleRows.map((row) => {
                    const index = rows.findIndex(
                      (item) => item.vehicle_type === row.vehicle_type,
                    );
                    return (
                      <View key={row.vehicle_type} style={styles.row}>
                        <Text style={styles.rowTitle}>{row.vehicle_type}</Text>
                        <TextInput
                          value={row.fuel_efficiency_input}
                          onChangeText={(value) =>
                            updateField(index, "fuel_efficiency_input", value)
                          }
                          keyboardType="decimal-pad"
                          style={[
                            styles.input,
                            vehicleErrors[row.vehicle_type]
                              ? styles.inputError
                              : null,
                          ]}
                          placeholder="0"
                          placeholderTextColor="#687286"
                        />
                        {vehicleErrors[row.vehicle_type] ? (
                          <Text style={styles.fieldErrorText}>
                            {vehicleErrors[row.vehicle_type]}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })
                : null}
            </>
          ) : null}

          {step === "review" ? (
            <View>
              <Text style={styles.infoText}>
                Review your changes, then save to apply fixed private transport
                defaults in fare estimation.
              </Text>
              <Text style={styles.mutedText}>
                Fuel options: {fuelOptions.length} | Vehicle settings:{" "}
                {rows.length}
              </Text>
            </View>
          ) : null}

          {isLoading ? (
            <Text style={styles.loadingText}>Loading settings...</Text>
          ) : null}
          {!isLoading && rows.length === 0 ? (
            <Text style={styles.infoText}>No vehicle settings found.</Text>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.infoText}>{message}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <View style={[styles.stickyMetaRow, compactStickyMetaStyle]}>
          <Text style={styles.stickyMuted}>
            {lastSavedAt ? `Last saved: ${lastSavedAt}` : "Not saved yet"}
          </Text>
          {hasChanges ? (
            <Text style={styles.stickyWarning}>Unsaved changes</Text>
          ) : (
            <Text style={styles.stickyMuted}>All changes saved</Text>
          )}
        </View>
        <View style={[styles.actions, compactActionsStyle]}>
          <Pressable
            style={[styles.secondaryButton, compactButtonStyle]}
            onPress={handleReset}
            disabled={!hasChanges || isLoading || isSaving}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryButton,
              compactButtonStyle,
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
      </View>
    </View>
  );
}
