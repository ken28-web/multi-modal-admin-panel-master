import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
    FareRuleRow,
    generatePublicFareRows,
    getFareRates,
    PublicFareFormula,
    PublicFareRow,
    updatePublicFareTables,
} from "@/services/fareApi";

export type PublicFareRowForm = {
  id: string;
  mode: string;
  distance_km: string;
  regular: string;
  discounted: string;
};

export type FareRuleRowForm = {
  id: string;
  transport_mode: string;
  service_type: string;
  origin: string;
  destination: string;
  fare: string;
  variant_type: string;
};

export type QuickMode = "PUJ" | "PUB_ORDINARY" | "PUB_AIRCON";

export type QuickForm = {
  base_fare: string;
  add_on_rate: string;
};

export type QuickModeConfig = {
  mode: QuickMode;
  title: string;
  generateLabel: string;
  previewLabel: string;
  includedDistanceKm: number;
  showAddOnInput: boolean;
  bulletLines: string[];
};

export const QUICK_MODES: QuickMode[] = ["PUJ", "PUB_ORDINARY", "PUB_AIRCON"];

export const QUICK_MODE_CONFIG: Record<QuickMode, QuickModeConfig> = {
  PUJ: {
    mode: "PUJ",
    title: "PUJ Quick Adjust",
    generateLabel: "Generate PUJ Preview",
    previewLabel: "PUJ",
    includedDistanceKm: 4,
    showAddOnInput: false,
    bulletLines: [
      "Minimum fare for first 4 km",
      "+ ₱1.80 per succeeding km",
      "20% discount fare for eligible groups",
      "Applies automatically to all existing PUJ distance rows",
    ],
  },
  PUB_ORDINARY: {
    mode: "PUB_ORDINARY",
    title: "PUB Ordinary Quick Adjust",
    generateLabel: "Generate City Ordinary Preview",
    previewLabel: "City Ordinary",
    includedDistanceKm: 5,
    showAddOnInput: true,
    bulletLines: [
      "Minimum fare for first 5 km",
      "+ Add-on rate per succeeding km",
    ],
  },
  PUB_AIRCON: {
    mode: "PUB_AIRCON",
    title: "PUB Air-Conditioned Quick Adjust",
    generateLabel: "Generate City Aircon Preview",
    previewLabel: "City Air-Conditioned",
    includedDistanceKm: 5,
    showAddOnInput: true,
    bulletLines: [
      "Minimum fare for first 5 km",
      "+ Add-on rate per succeeding km",
    ],
  },
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

export type PublicAdminViewModel = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedQuickMode: QuickMode;
  selectedQuickConfig: QuickModeConfig;
  selectedQuickForm: QuickForm;
  hasInvalidSelectedQuick: boolean;
  hasGeneratedPreview: boolean;
  generatedPreviewRows: PublicFareRowForm[];
  generatedPreviewModes: string[];
  rows: PublicFareRowForm[];
  fareRuleRows: FareRuleRowForm[];
  showPublicTablePreview: boolean;
  showFareRulesPreview: boolean;
  isSaveDisabled: boolean;
  setSelectedQuickMode: (mode: QuickMode) => void;
  updateQuickForm: (
    mode: QuickMode,
    key: keyof QuickForm,
    value: string,
  ) => void;
  onGenerateQuickPreview: (mode: QuickMode) => Promise<void>;
  onClearGeneratedPreview: () => void;
  onApplyGeneratedPreview: () => void;
  onTogglePublicTablePreview: () => void;
  onToggleFareRulesPreview: () => void;
  onSave: () => Promise<void>;
};

export function usePublicAdminLogic(): PublicAdminViewModel {
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
  const [selectedQuickMode, setSelectedQuickMode] = useState<QuickMode>("PUJ");
  const [quickForms, setQuickForms] = useState<Record<QuickMode, QuickForm>>({
    PUJ: { base_fare: "13", add_on_rate: "1.8" },
    PUB_ORDINARY: { base_fare: "13", add_on_rate: "2.25" },
    PUB_AIRCON: { base_fare: "15", add_on_rate: "2.65" },
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

  const selectedQuickConfig = QUICK_MODE_CONFIG[selectedQuickMode];
  const selectedQuickForm = quickForms[selectedQuickMode];

  const hasInvalidSelectedQuick = useMemo(() => {
    const base = Number(selectedQuickForm.base_fare);
    const addOn = Number(selectedQuickForm.add_on_rate);

    if (!Number.isFinite(base) || base < 0) return true;
    if (!selectedQuickConfig.showAddOnInput) return false;
    return !Number.isFinite(addOn) || addOn < 0;
  }, [selectedQuickConfig.showAddOnInput, selectedQuickForm]);

  const isSaveDisabled =
    saving ||
    hasInvalidRows ||
    !hasRows ||
    hasInvalidFareRules ||
    !hasFareRuleRows;

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

  const updateQuickForm = (
    mode: QuickMode,
    key: keyof QuickForm,
    value: string,
  ) => {
    setQuickForms((current) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [key]: value,
      },
    }));
  };

  const onGenerateQuickPreview = async (mode: QuickMode) => {
    const config = QUICK_MODE_CONFIG[mode];
    const form = quickForms[mode];
    const base = Number(form.base_fare);
    const addOn = config.showAddOnInput ? Number(form.add_on_rate) : 1.8;

    if (
      !Number.isFinite(base) ||
      base < 0 ||
      !Number.isFinite(addOn) ||
      addOn < 0
    ) {
      Alert.alert(
        "Invalid Values",
        `Please provide valid ${config.previewLabel} values.`,
      );
      return;
    }

    try {
      setSaving(true);

      const existingDistances = parseRows(rows)
        .filter((row) => String(row.mode || "").toUpperCase() === config.mode)
        .map((row) => Number(row.distance_km))
        .filter((distance) => Number.isFinite(distance) && distance >= 1);

      const autoMaxDistance =
        existingDistances.length > 0 ? Math.max(...existingDistances) : 60;

      const formula: PublicFareFormula = {
        mode: config.mode,
        base_fare: base,
        increment_per_km: addOn,
        additional_rate_per_succeeding_km: addOn,
        included_distance_km: config.includedDistanceKm,
        discount_percent: 20,
        max_distance_km: autoMaxDistance,
      };

      const generated = await generatePublicFareRows([formula]);
      setGeneratedPreviewRows(toFormRows(generated));
      setGeneratedPreviewModes([config.mode]);
      Alert.alert(
        `${config.previewLabel} Preview Ready`,
        `Generated ${config.previewLabel} preview using first ${config.includedDistanceKm}km minimum fare and add-on per succeeding km.`,
      );
    } catch (err: any) {
      Alert.alert(
        "Generate Failed",
        err?.message ||
          `Failed to generate ${config.previewLabel} fare preview.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const onClearGeneratedPreview = () => {
    setGeneratedPreviewRows([]);
    setGeneratedPreviewModes([]);
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
    onClearGeneratedPreview();
    Alert.alert(
      "Applied",
      "Preview rows are now applied to the editable fare table.",
    );
  };

  const onTogglePublicTablePreview = () => {
    setShowPublicTablePreview((value) => !value);
  };

  const onToggleFareRulesPreview = () => {
    setShowFareRulesPreview((value) => !value);
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

  return {
    loading,
    saving,
    error,
    selectedQuickMode,
    selectedQuickConfig,
    selectedQuickForm,
    hasInvalidSelectedQuick,
    hasGeneratedPreview,
    generatedPreviewRows,
    generatedPreviewModes,
    rows,
    fareRuleRows,
    showPublicTablePreview,
    showFareRulesPreview,
    isSaveDisabled,
    setSelectedQuickMode,
    updateQuickForm,
    onGenerateQuickPreview,
    onClearGeneratedPreview,
    onApplyGeneratedPreview,
    onTogglePublicTablePreview,
    onToggleFareRulesPreview,
    onSave,
  };
}
