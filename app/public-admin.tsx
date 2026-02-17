import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  FareRuleRow,
  generatePublicFareRows,
  getFareRates,
  PublicFareFormula,
  PublicFareRow,
  updatePublicFareTables,
} from "@/services/fareApi";

type PublicFareRowForm = {
  id: string;
  mode: string;
  distance_km: string;
  regular: string;
  discounted: string;
};

type FareRuleRowForm = {
  id: string;
  transport_mode: string;
  service_type: string;
  origin: string;
  destination: string;
  fare: string;
  variant_type: string;
};

type PujQuickForm = {
  base_fare: string;
};

function toFormRows(rows: PublicFareRow[]): PublicFareRowForm[] {
  return rows.map((row, idx) => ({
    id: `${row.mode}-${row.distance_km}-${idx}`,
    mode: String(row.mode || "").toUpperCase(),
    distance_km: String(row.distance_km ?? ""),
    regular: String(row.regular ?? ""),
    discounted: String(row.discounted ?? ""),
  }));
}

function parseRows(rows: PublicFareRowForm[]): PublicFareRow[] {
  return rows.map((row) => ({
    mode: String(row.mode || "")
      .trim()
      .toUpperCase(),
    distance_km: Number(row.distance_km),
    regular: Number(row.regular),
    discounted: Number(row.discounted),
  }));
}

function toFareRuleFormRows(rows: FareRuleRow[]): FareRuleRowForm[] {
  return rows.map((row, idx) => ({
    id: `${row.transport_mode}-${row.service_type}-${idx}`,
    transport_mode: String(row.transport_mode || "").toUpperCase(),
    service_type: String(row.service_type || "").toUpperCase(),
    origin: String(row.origin || ""),
    destination: String(row.destination || ""),
    fare: String(row.fare ?? ""),
    variant_type: String(row.variant_type || "regular").toLowerCase(),
  }));
}

function parseFareRuleRows(rows: FareRuleRowForm[]): FareRuleRow[] {
  return rows.map((row) => ({
    transport_mode: String(row.transport_mode || "")
      .trim()
      .toUpperCase(),
    service_type: String(row.service_type || "")
      .trim()
      .toUpperCase(),
    origin: String(row.origin || "").trim(),
    destination: String(row.destination || "").trim(),
    fare: Number(row.fare),
    variant_type: String(row.variant_type || "regular")
      .trim()
      .toLowerCase(),
  }));
}

export default function PublicAdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<PublicFareRowForm[]>([]);
  const [generatedPreviewRows, setGeneratedPreviewRows] = useState<
    PublicFareRowForm[]
  >([]);
  const [generatedPreviewModes, setGeneratedPreviewModes] = useState<string[]>(
    [],
  );
  const [fareRuleRows, setFareRuleRows] = useState<FareRuleRowForm[]>([]);
  const [showPublicTablePreview, setShowPublicTablePreview] = useState(false);
  const [showFareRulesPreview, setShowFareRulesPreview] = useState(false);
  const [pujQuickForm, setPujQuickForm] = useState<PujQuickForm>({
    base_fare: "13",
  });
  const [error, setError] = useState<string | null>(null);

  const hasRows = rows.length > 0;
  const hasFareRuleRows = fareRuleRows.length > 0;
  const hasGeneratedPreview = generatedPreviewRows.length > 0;

  const hasInvalidRows = useMemo(
    () =>
      rows.some((row) => {
        const mode = String(row.mode || "").trim();
        const distance = Number(row.distance_km);
        const regular = Number(row.regular);
        const discounted = Number(row.discounted);
        return (
          !mode ||
          !Number.isFinite(distance) ||
          distance <= 0 ||
          !Number.isFinite(regular) ||
          regular < 0 ||
          !Number.isFinite(discounted) ||
          discounted < 0
        );
      }),
    [rows],
  );

  const hasInvalidFareRules = useMemo(
    () =>
      fareRuleRows.some((row) => {
        const mode = String(row.transport_mode || "").trim();
        const serviceType = String(row.service_type || "").trim();
        const origin = String(row.origin || "").trim();
        const destination = String(row.destination || "").trim();
        const fare = Number(row.fare);
        const variantType = String(row.variant_type || "").trim();
        return (
          !mode ||
          !serviceType ||
          !origin ||
          !destination ||
          !variantType ||
          !Number.isFinite(fare) ||
          fare < 0
        );
      }),
    [fareRuleRows],
  );

  const hasInvalidPujQuick = useMemo(() => {
    const base = Number(pujQuickForm.base_fare);
    return !Number.isFinite(base) || base < 0;
  }, [pujQuickForm]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getFareRates();
        setRows(toFormRows(data.public || []));
        setFareRuleRows(toFareRuleFormRows(data.fare_rules || []));
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load public fare rates.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const updatePujQuick = (key: keyof PujQuickForm, value: string) => {
    setPujQuickForm((current) => ({ ...current, [key]: value }));
  };

  const onGeneratePujQuickPreview = async () => {
    if (hasInvalidPujQuick) {
      Alert.alert("Invalid PUJ Value", "Please provide a valid PUJ base fare.");
      return;
    }

    try {
      setSaving(true);

      const existingPujDistances = parseRows(rows)
        .filter((row) => String(row.mode || "").toUpperCase() === "PUJ")
        .map((row) => Number(row.distance_km))
        .filter((distance) => Number.isFinite(distance) && distance >= 1);

      const autoMaxDistance =
        existingPujDistances.length > 0
          ? Math.max(...existingPujDistances)
          : 60;

      const formula: PublicFareFormula = {
        mode: "PUJ",
        base_fare: Number(pujQuickForm.base_fare),
        increment_per_km: 1.8,
        additional_rate_per_succeeding_km: 1.8,
        included_distance_km: 4,
        discount_percent: 20,
        max_distance_km: autoMaxDistance,
      };

      const generated = await generatePublicFareRows([formula]);
      setGeneratedPreviewRows(toFormRows(generated));
      setGeneratedPreviewModes(["PUJ"]);
      Alert.alert(
        "PUJ Preview Ready",
        "Generated PUJ preview using first 4km minimum fare, ₱1.80 per succeeding km, and 20% discount.",
      );
    } catch (err: any) {
      Alert.alert(
        "Generate Failed",
        err?.message || "Failed to generate PUJ fare preview.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onApplyGeneratedPreview = () => {
    if (!hasGeneratedPreview) {
      Alert.alert("No Preview", "Generate preview rows first.");
      return;
    }

    const modeSet = new Set(
      generatedPreviewModes.map((mode) => String(mode || "").toUpperCase()),
    );
    const existing = parseRows(rows).filter(
      (row) => !modeSet.has(String(row.mode || "").toUpperCase()),
    );
    const preview = parseRows(generatedPreviewRows);

    const merged = [...existing, ...preview].sort((a, b) => {
      if (a.mode === b.mode) return a.distance_km - b.distance_km;
      return a.mode.localeCompare(b.mode);
    });

    setRows(toFormRows(merged));
    setGeneratedPreviewRows([]);
    setGeneratedPreviewModes([]);
    Alert.alert(
      "Applied",
      "Preview rows are now applied to the editable fare table.",
    );
  };

  const onSave = async () => {
    if (!hasRows || !hasFareRuleRows) {
      Alert.alert("No Rows", "Add at least one fare row before saving.");
      return;
    }

    if (hasInvalidRows || hasInvalidFareRules) {
      Alert.alert(
        "Invalid Data",
        "Please complete all fields with valid numeric values.",
      );
      return;
    }

    try {
      setSaving(true);
      const parsed = parseRows(rows).sort((a, b) => {
        if (a.mode === b.mode) return a.distance_km - b.distance_km;
        return a.mode.localeCompare(b.mode);
      });

      const parsedFareRules = parseFareRuleRows(fareRuleRows).sort((a, b) => {
        const m = a.transport_mode.localeCompare(b.transport_mode);
        if (m !== 0) return m;
        const s = a.service_type.localeCompare(b.service_type);
        if (s !== 0) return s;
        const o = a.origin.localeCompare(b.origin);
        if (o !== 0) return o;
        return a.destination.localeCompare(b.destination);
      });

      const updated = await updatePublicFareTables({
        public_mode_fares: parsed,
        fare_rules: parsedFareRules,
      });

      setRows(toFormRows(updated.public || []));
      setFareRuleRows(toFareRuleFormRows(updated.fare_rules || []));
      Alert.alert(
        "Saved",
        "Public fare tables updated (public_mode_fares and fare_rules).",
      );
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.message || "Unable to update public fare rates.",
      );
    } finally {
      setSaving(false);
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
        <Text style={styles.header}>Public Transport Fare Rates</Text>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.helper}>Loading fare rates...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.sectionTitle}>
            PUJ Quick Adjust (Recommended)
          </Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              For PUJ, admin only needs to change the base fare. The system will
              auto-generate:
            </Text>
            <Text style={styles.instructionText}>
              • Minimum fare for first 4 km
            </Text>
            <Text style={styles.instructionText}>
              • + ₱1.80 per succeeding km
            </Text>
            <Text style={styles.instructionText}>
              • 20% discount fare for eligible groups
            </Text>
            <Text style={styles.instructionText}>
              • Applies automatically to all existing PUJ distance rows
            </Text>
          </View>

          <View style={styles.formulaGrid}>
            <View style={[styles.formulaField, styles.formulaCell]}>
              <Text style={styles.formulaLabel}>
                PUJ Base Fare (First 4 km)
              </Text>
              <TextInput
                style={styles.input}
                value={pujQuickForm.base_fare}
                onChangeText={(v) => updatePujQuick("base_fare", v)}
                placeholder="13"
                keyboardType="numeric"
              />
            </View>

            <Pressable
              style={[
                styles.primaryButton,
                (saving || hasInvalidPujQuick) && styles.primaryButtonDisabled,
              ]}
              onPress={onGeneratePujQuickPreview}
              disabled={saving || hasInvalidPujQuick}
            >
              <Text style={styles.primaryButtonText}>Generate PUJ Preview</Text>
            </Pressable>
          </View>

          {hasGeneratedPreview ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>
                Preview Result ({generatedPreviewRows.length} rows)
              </Text>
              <Text style={styles.previewHint}>
                Modes: {generatedPreviewModes.join(", ")}
              </Text>

              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, styles.modeCol]}>Mode</Text>
                <Text style={[styles.colHeader, styles.smallCol]}>
                  Distance
                </Text>
                <Text style={[styles.colHeader, styles.smallCol]}>Regular</Text>
                <Text style={[styles.colHeader, styles.smallCol]}>
                  Discounted
                </Text>
              </View>

              <ScrollView
                style={styles.previewRowsWrap}
                contentContainerStyle={styles.rowsContent}
              >
                {generatedPreviewRows.map((row) => (
                  <View key={row.id} style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.modeCol]}
                      value={row.mode}
                      editable={false}
                    />
                    <TextInput
                      style={[styles.input, styles.smallCol]}
                      value={row.distance_km}
                      editable={false}
                    />
                    <TextInput
                      style={[styles.input, styles.smallCol]}
                      value={row.regular}
                      editable={false}
                    />
                    <TextInput
                      style={[styles.input, styles.smallCol]}
                      value={row.discounted}
                      editable={false}
                    />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setGeneratedPreviewRows([]);
                    setGeneratedPreviewModes([]);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>
                    Discard Preview
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.primaryButton}
                  onPress={onApplyGeneratedPreview}
                >
                  <Text style={styles.primaryButtonText}>
                    Apply Preview to Table
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowPublicTablePreview((v) => !v)}
            >
              <Text style={styles.secondaryButtonText}>
                {showPublicTablePreview
                  ? "Hide public_mode_fares preview"
                  : "Preview public_mode_fares"}
              </Text>
            </Pressable>
          </View>

          {showPublicTablePreview ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Current public_mode_fares</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, styles.modeCol]}>Mode</Text>
                <Text style={[styles.colHeader, styles.smallCol]}>
                  Distance
                </Text>
                <Text style={[styles.colHeader, styles.smallCol]}>Regular</Text>
                <Text style={[styles.colHeader, styles.smallCol]}>
                  Discounted
                </Text>
              </View>
              <ScrollView
                style={styles.previewRowsWrap}
                contentContainerStyle={styles.rowsContent}
              >
                {rows.map((row) => (
                  <View key={row.id} style={styles.row}>
                    <Text style={[styles.previewCell, styles.modeCol]}>
                      {row.mode}
                    </Text>
                    <Text style={[styles.previewCell, styles.smallCol]}>
                      {row.distance_km}
                    </Text>
                    <Text style={[styles.previewCell, styles.smallCol]}>
                      {row.regular}
                    </Text>
                    <Text style={[styles.previewCell, styles.smallCol]}>
                      {row.discounted}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowFareRulesPreview((v) => !v)}
            >
              <Text style={styles.secondaryButtonText}>
                {showFareRulesPreview
                  ? "Hide fare_rules preview"
                  : "Preview fare_rules"}
              </Text>
            </Pressable>
          </View>

          {showFareRulesPreview ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Current fare_rules</Text>
              <View style={styles.tableHeaderLarge}>
                <Text style={[styles.colHeader, styles.modeCol]}>
                  Transport
                </Text>
                <Text style={[styles.colHeader, styles.modeCol]}>Service</Text>
                <Text style={[styles.colHeader, styles.modeCol]}>Origin</Text>
                <Text style={[styles.colHeader, styles.modeCol]}>
                  Destination
                </Text>
                <Text style={[styles.colHeader, styles.smallCol]}>Fare</Text>
                <Text style={[styles.colHeader, styles.smallCol]}>Variant</Text>
              </View>
              <ScrollView
                style={styles.previewRowsWrap}
                contentContainerStyle={styles.rowsContent}
              >
                {fareRuleRows.map((row) => (
                  <View key={row.id} style={styles.row}>
                    <Text style={[styles.previewCell, styles.modeCol]}>
                      {row.transport_mode}
                    </Text>
                    <Text style={[styles.previewCell, styles.modeCol]}>
                      {row.service_type}
                    </Text>
                    <Text style={[styles.previewCell, styles.modeCol]}>
                      {row.origin}
                    </Text>
                    <Text style={[styles.previewCell, styles.modeCol]}>
                      {row.destination}
                    </Text>
                    <Text style={[styles.previewCell, styles.smallCol]}>
                      {row.fare}
                    </Text>
                    <Text style={[styles.previewCell, styles.smallCol]}>
                      {row.variant_type}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.primaryButton,
                (saving ||
                  hasInvalidRows ||
                  !hasRows ||
                  hasInvalidFareRules ||
                  !hasFareRuleRows) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={onSave}
              disabled={
                saving ||
                hasInvalidRows ||
                !hasRows ||
                hasInvalidFareRules ||
                !hasFareRuleRows
              }
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Save Public Fare Tables"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
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
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  helper: {
    color: "#4b5563",
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  formulaGrid: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  formulaField: {
    gap: 6,
  },
  formulaLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  formulaWide: {
    minWidth: 260,
    flexGrow: 1,
  },
  formulaCell: {
    minWidth: 120,
  },
  instructionCard: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#f8fbff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 3,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 17,
  },
  exampleText: {
    marginTop: 4,
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "600",
  },
  previewCard: {
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#f8fbff",
    borderRadius: 10,
    padding: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  previewHint: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
    marginBottom: 8,
  },
  previewRowsWrap: {
    maxHeight: 220,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10,
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  tableHeaderLarge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },
  modeCol: {
    flex: 1.2,
  },
  smallCol: {
    flex: 1,
  },
  actionCol: {
    width: 90,
  },
  rowsWrap: {
    flex: 1,
  },
  rowsContent: {
    gap: 8,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
  },
  previewCell: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#1f2937",
  },
  deleteButton: {
    width: 90,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
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
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
