import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  FareRuleRow,
  generatePublicFareRows,
  getFareRates,
  PublicFareFormula,
  PublicFareRow,
  updatePublicFareTables,
} from "../../services/fareApi";

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
export type RailMode = "LRT1" | "LRT2" | "MRT" | "PNR";

export type QuickForm = {
  base_fare: string;
  add_on_rate: string;
  discount_rate: string;
};

export type RailQuickForm = {
  boarding_fee: string;
  distance_rate: string;
  min_sj_fare: string;
  max_sj_fare: string;
  min_sv_fare: string;
  max_sv_fare: string;
};

export type QuickModeConfig = {
  mode: QuickMode;
  title: string;
  generateLabel: string;
  previewLabel: string;
  includedDistanceKm: number;
  showAddOnInput: boolean;
  addOnPlaceholder: string;
  bulletLines: string[];
};

export const QUICK_MODES: QuickMode[] = ["PUJ", "PUB_ORDINARY", "PUB_AIRCON"];
export const RAIL_MODES: RailMode[] = ["LRT1", "LRT2", "MRT", "PNR"];
const RAIL_MODES_WITH_VARIANTS: RailMode[] = ["LRT1", "LRT2"];
const PNR_BASE_DISTANCE_KM = 14;
const PNR_ZONE_DISTANCE_KM = 7;
const PNR_MAX_FARE = 60;

function railModeUsesVariantSplit(mode: RailMode): boolean {
  return RAIL_MODES_WITH_VARIANTS.includes(mode);
}

export const QUICK_MODE_CONFIG: Record<QuickMode, QuickModeConfig> = {
  PUJ: {
    mode: "PUJ",
    title: "PUJ Quick Adjust",
    generateLabel: "Generate PUJ Preview",
    previewLabel: "PUJ",
    includedDistanceKm: 4,
    showAddOnInput: true,
    addOnPlaceholder: "1.8",
    bulletLines: [
      "Minimum fare for first 4 km",
      "+ Add-on rate per succeeding km",
    ],
  },
  PUB_ORDINARY: {
    mode: "PUB_ORDINARY",
    title: "PUB Ordinary Quick Adjust",
    generateLabel: "Generate PUB_ORDINARY Preview",
    previewLabel: "PUB_ORDINARY",
    includedDistanceKm: 5,
    showAddOnInput: true,
    addOnPlaceholder: "2.25",
    bulletLines: [
      "Minimum fare for first 5 km",
      "+ Add-on rate per succeeding km",
    ],
  },
  PUB_AIRCON: {
    mode: "PUB_AIRCON",
    title: "PUB Air-Conditioned Quick Adjust",
    generateLabel: "Generate PUB_AIRCON Preview",
    previewLabel: "PUB_AIRCON",
    includedDistanceKm: 5,
    showAddOnInput: true,
    addOnPlaceholder: "2.65",
    bulletLines: [
      "Minimum fare for first 5 km",
      "+ Add-on rate per succeeding km",
    ],
  },
};

const RAIL_STANDARDIZED_DISTANCES_KM: Record<
  RailMode,
  Record<string, number>
> = {
  LRT1: {
    "FPJ (FORMERLY ROOSEVELT)": 0.0,
    ROOSEVELT: 0.0,
    BALINTAWAK: 1.87,
    MONUMENTO: 4.12,
    "5TH AVENUE": 5.19,
    "R. PAPA": 6.14,
    "ABAD SANTOS": 6.8,
    BLUMENTRITT: 7.73,
    TAYUMAN: 8.4,
    BAMBANG: 9.02,
    "DOROTEO JOSE": 9.67,
    CARRIEDO: 10.48,
    "CENTRAL TERMINAL": 11.2,
    CENTRAL: 11.2,
    "UNITED NATIONS": 12.41,
    "UN AVE.": 12.41,
    "PEDRO GIL": 13.16,
    QUIRINO: 13.95,
    "VITO CRUZ": 14.77,
    "GIL PUYAT": 15.39,
    LIBERTAD: 16.12,
    EDSA: 17.13,
    BACLARAN: 17.72,
    "REDEMPTORIST-ASEANA": 18.5,
    "MIA ROAD": 19.3,
    "PITX (ASIA WORLD)": 20.4,
    "NINOY AQUINO AVE": 21.8,
    "DR. SANTOS": 23.1,
  },
  LRT2: {
    "ANTIPOLO (MASINAG)": 0.0,
    "MARIKINA-PASIG": 2.23,
    SANTOLAN: 4.03,
    KATIPUNAN: 6.0,
    ANONAS: 6.95,
    "ARANETA CENTER-CUBAO": 7.89,
    "BETTY GO-BELMONTE": 9.06,
    GILMORE: 10.14,
    "J. RUIZ": 11.08,
    "V. MAPA": 12.31,
    PUREZA: 13.67,
    LEGARDA: 15.06,
    RECTO: 16.11,
  },
  MRT: {
    "NORTH AVENUE": 0.0,
    "QUEZON AVENUE": 1.2,
    "GMA-KAMUNING": 2.15,
    "ARANETA CENTER-CUBAO": 4.05,
    "SANTOLAN-ANNAPOLIS": 5.55,
    ORTIGAS: 7.85,
    "SHAW BOULEVARD": 8.65,
    BONI: 9.6,
    GUADALUPE: 10.45,
    BUENDIA: 12.45,
    AYALA: 13.4,
    MAGALLANES: 14.95,
    "TAFT AVENUE": 16.9,
  },
  PNR: {
    TUTUBAN: 0.0,
    BLUMENTRITT: 2.4,
    "LAON LAAN": 3.6,
    ESPANA: 5.0,
    "STA. MESA": 6.7,
    PACO: 8.6,
    "SAN ANDRES": 10.1,
    "VITO CRUZ": 11.5,
    "DELA ROSA": 14.0,
    EDSA: 16.3,
    NICHOLS: 18.9,
    FTI: 21.9,
    BICUTAN: 24.3,
    SUCAT: 27.4,
    ALABANG: 31.8,
    MUNTINLUPA: 34.3,
    "SAN PEDRO": 39.0,
    "PACITA MAIN GATE": 41.4,
    BINAN: 44.5,
    "SANTA ROSA": 48.8,
    CABUYAO: 52.0,
    BANLIC: 54.1,
    CALAMBA: 56.2,
  },
};

const RAIL_ROUNDING_STEP: Record<RailMode, number> = {
  LRT1: 5,
  LRT2: 5,
  MRT: 1,
  PNR: 1,
};

const RAIL_ALIAS_MAP: Record<string, string> = {
  "UN AVE": "UN Ave.",
  "UN AVE.": "UN Ave.",
  "UN AVENUE": "UN Ave.",
  "UNITED NATIONS": "UN Ave.",
  "UNITED NATIONS STATION": "UN Ave.",
  CENTRAL: "Central",
  "CENTRAL TERMINAL": "Central",
  "FPJ (FORMERLY ROOSEVELT)": "Roosevelt",
  FPJ: "Roosevelt",
  ROOSEVELT: "Roosevelt",
  "R PAPA": "R. Papa",
  "R. PAPA": "R. Papa",
  "5TH AVENUE": "5th Avenue",
  "ARANETA CENTER CUBAO": "Araneta Center-Cubao",
  "ARANETA CENTER-CUBAO": "Araneta Center-Cubao",
  "BETTY GO BELMONTE": "Betty Go-Belmonte",
  "GMA KAMUNING": "GMA Kamuning",
  "SANTOLAN ANNAPOLIS": "Santolan-Annapolis",
  "NINOY AQUINO AVE.": "Ninoy Aquino Ave",
  "STA MESA": "Sta. Mesa",
  "STA ROSA": "Santa Rosa",
  "SANTA ROSA": "Santa Rosa",
  "BI\u00d1AN": "Binan",
  "PACO STATION": "Paco",
  "TUTUBAN STATION": "Tutuban",
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

function normalizeStationName(value: string): string {
  const cleaned = String(value || "").trim();
  const withoutDiacritics = cleaned
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const upper = withoutDiacritics.toUpperCase();
  return RAIL_ALIAS_MAP[upper] || withoutDiacritics;
}

function railFareFromFormula(
  mode: RailMode,
  variantType: string,
  distanceDifferenceKm: number,
  boardingFee: number,
  distanceRate: number,
  minFare: number,
  maxFare: number,
): number {
  const rawFare = boardingFee + distanceDifferenceKm * distanceRate;
  const roundingStep = RAIL_ROUNDING_STEP[mode] || 1;
  const usesVariantSplit = railModeUsesVariantSplit(mode);
  const normalizedVariant = String(variantType || "")
    .trim()
    .toLowerCase();
  const isStoredValue = usesVariantSplit && normalizedVariant === "sv";
  const computedFare = isStoredValue
    ? rawFare
    : Math.ceil(rawFare / roundingStep) * roundingStep;
  const bounded = Math.min(maxFare, Math.max(minFare, computedFare));
  return Number(bounded.toFixed(2));
}

function pnrFareFromFormula(
  distanceDifferenceKm: number,
  baseFare: number,
  addOnPerZone: number,
): number {
  if (distanceDifferenceKm <= PNR_BASE_DISTANCE_KM) {
    return Number(Math.min(PNR_MAX_FARE, baseFare).toFixed(2));
  }

  const excessKm = distanceDifferenceKm - PNR_BASE_DISTANCE_KM;
  const zoneCount = Math.ceil(excessKm / PNR_ZONE_DISTANCE_KM);
  const computedFare = baseFare + zoneCount * addOnPerZone;
  return Number(Math.min(PNR_MAX_FARE, computedFare).toFixed(2));
}

export type PublicAdminViewModel = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedQuickMode: QuickMode;
  selectedQuickConfig: QuickModeConfig;
  selectedQuickForm: QuickForm;
  hasInvalidSelectedQuick: boolean;
  selectedRailMode: RailMode;
  selectedRailForm: RailQuickForm;
  hasInvalidSelectedRailQuick: boolean;
  hasGeneratedPreview: boolean;
  generatedPreviewRows: PublicFareRowForm[];
  generatedPreviewModes: string[];
  hasGeneratedRailPreview: boolean;
  generatedRailPreviewRows: FareRuleRowForm[];
  rows: PublicFareRowForm[];
  fareRuleRows: FareRuleRowForm[];
  showPublicTablePreview: boolean;
  showFareRulesPreview: boolean;
  isSaveDisabled: boolean;
  setSelectedQuickMode: (mode: QuickMode) => void;
  setSelectedRailMode: (mode: RailMode) => void;
  updateQuickForm: (
    mode: QuickMode,
    key: keyof QuickForm,
    value: string,
  ) => void;
  updateRailQuickForm: (key: keyof RailQuickForm, value: string) => void;
  onGenerateQuickPreview: (mode: QuickMode) => Promise<void>;
  onGenerateRailQuickPreview: () => void;
  onClearGeneratedPreview: () => void;
  onClearGeneratedRailPreview: () => void;
  onApplyGeneratedPreview: () => void;
  onApplyGeneratedRailPreview: () => void;
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
  const [selectedRailMode, setSelectedRailMode] = useState<RailMode>("LRT1");
  const [quickForms, setQuickForms] = useState<Record<QuickMode, QuickForm>>({
    PUJ: { base_fare: "13", add_on_rate: "1.8", discount_rate: "20" },
    PUB_ORDINARY: {
      base_fare: "13",
      add_on_rate: "2.25",
      discount_rate: "20",
    },
    PUB_AIRCON: {
      base_fare: "15",
      add_on_rate: "2.65",
      discount_rate: "20",
    },
  });
  const [railQuickForms, setRailQuickForms] = useState<
    Record<RailMode, RailQuickForm>
  >({
    LRT1: {
      boarding_fee: "16.25",
      distance_rate: "1.47",
      min_sj_fare: "20",
      max_sj_fare: "55",
      min_sv_fare: "20",
      max_sv_fare: "55",
    },
    LRT2: {
      boarding_fee: "13.29",
      distance_rate: "1.21",
      min_sj_fare: "15",
      max_sj_fare: "35",
      min_sv_fare: "15",
      max_sv_fare: "35",
    },
    MRT: {
      boarding_fee: "13.00",
      distance_rate: "1.00",
      min_sj_fare: "13",
      max_sj_fare: "28",
      min_sv_fare: "13",
      max_sv_fare: "28",
    },
    PNR: {
      boarding_fee: "15",
      distance_rate: "5",
      min_sj_fare: "15",
      max_sj_fare: "60",
      min_sv_fare: "15",
      max_sv_fare: "60",
    },
  });
  const [generatedRailPreviewRows, setGeneratedRailPreviewRows] = useState<
    FareRuleRowForm[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const hasRows = rows.length > 0;
  const hasFareRuleRows = fareRuleRows.length > 0;
  const hasGeneratedPreview = generatedPreviewRows.length > 0;
  const hasGeneratedRailPreview = generatedRailPreviewRows.length > 0;

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
  const selectedRailForm = railQuickForms[selectedRailMode];

  const hasInvalidSelectedQuick = useMemo(() => {
    const base = Number(selectedQuickForm.base_fare);
    const addOn = Number(selectedQuickForm.add_on_rate);
    const discountRate = Number(selectedQuickForm.discount_rate);

    if (!Number.isFinite(base) || base < 0) return true;
    if (!Number.isFinite(discountRate) || discountRate < 0) return true;
    if (!selectedQuickConfig.showAddOnInput) return false;
    return !Number.isFinite(addOn) || addOn < 0;
  }, [selectedQuickConfig.showAddOnInput, selectedQuickForm]);

  const hasInvalidSelectedRailQuick = useMemo(() => {
    if (selectedRailMode === "PNR") {
      const baseFare = Number(selectedRailForm.boarding_fee);
      const addOnPerZone = Number(selectedRailForm.distance_rate);
      return (
        !Number.isFinite(baseFare) ||
        baseFare < 0 ||
        !Number.isFinite(addOnPerZone) ||
        addOnPerZone < 0
      );
    }

    const usesVariantSplit = railModeUsesVariantSplit(selectedRailMode);
    const boardingFee = Number(selectedRailForm.boarding_fee);
    const distanceRate = Number(selectedRailForm.distance_rate);
    const minSjFare = Number(selectedRailForm.min_sj_fare);
    const maxSjFare = Number(selectedRailForm.max_sj_fare);
    const minSvFare = Number(selectedRailForm.min_sv_fare);
    const maxSvFare = Number(selectedRailForm.max_sv_fare);

    return (
      !Number.isFinite(boardingFee) ||
      boardingFee < 0 ||
      !Number.isFinite(distanceRate) ||
      distanceRate < 0 ||
      !Number.isFinite(minSjFare) ||
      minSjFare < 0 ||
      !Number.isFinite(maxSjFare) ||
      maxSjFare < 0 ||
      minSjFare > maxSjFare ||
      (usesVariantSplit &&
        (!Number.isFinite(minSvFare) ||
          minSvFare < 0 ||
          !Number.isFinite(maxSvFare) ||
          maxSvFare < 0 ||
          minSvFare > maxSvFare))
    );
  }, [selectedRailForm, selectedRailMode]);

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

  const updateRailQuickForm = (key: keyof RailQuickForm, value: string) => {
    setRailQuickForms((current) => ({
      ...current,
      [selectedRailMode]: {
        ...current[selectedRailMode],
        [key]: value,
      },
    }));
  };

  const onGenerateQuickPreview = async (mode: QuickMode) => {
    const config = QUICK_MODE_CONFIG[mode];
    const form = quickForms[mode];
    const base = Number(form.base_fare);
    const addOn = Number(form.add_on_rate);
    const discountRate = Number(form.discount_rate);

    if (
      !Number.isFinite(base) ||
      base < 0 ||
      !Number.isFinite(addOn) ||
      addOn < 0 ||
      !Number.isFinite(discountRate) ||
      discountRate < 0
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
        discount_percent: discountRate,
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

  const onGenerateRailQuickPreview = () => {
    const usesVariantSplit = railModeUsesVariantSplit(selectedRailMode);
    if (hasInvalidSelectedRailQuick) {
      Alert.alert(
        "Invalid Rail Values",
        selectedRailMode === "PNR"
          ? "Please provide valid PNR base fare and add-on per 7km zone values."
          : usesVariantSplit
            ? "Please provide valid distance rate and SJ/SV min/max fare values."
            : "Please provide valid distance rate and min/max fare values.",
      );
      return;
    }

    const cumulativeDistanceMap =
      RAIL_STANDARDIZED_DISTANCES_KM[selectedRailMode];

    const distanceRate = Number(selectedRailForm.distance_rate);
    const boardingFee = Number(selectedRailForm.boarding_fee);
    const minSjFare = Number(selectedRailForm.min_sj_fare);
    const maxSjFare = Number(selectedRailForm.max_sj_fare);
    const minSvFare = Number(selectedRailForm.min_sv_fare);
    const maxSvFare = Number(selectedRailForm.max_sv_fare);

    const selectedModeRows = fareRuleRows.filter(
      (row) =>
        String(row.transport_mode || "").toUpperCase() === selectedRailMode,
    );

    const previewRows = selectedModeRows.map((row) => {
      const originName = normalizeStationName(row.origin).toUpperCase();
      const destinationName = normalizeStationName(
        row.destination,
      ).toUpperCase();
      const originDistance = cumulativeDistanceMap[originName];
      const destinationDistance = cumulativeDistanceMap[destinationName];

      if (originDistance === undefined || destinationDistance === undefined) {
        return row;
      }

      if (originDistance === destinationDistance) {
        return {
          ...row,
          fare: "0",
        };
      }

      const distanceDifferenceKm = Math.abs(
        destinationDistance - originDistance,
      );
      const normalizedVariant = String(row.variant_type || "")
        .trim()
        .toLowerCase();
      const minFare =
        usesVariantSplit && normalizedVariant === "sv" ? minSvFare : minSjFare;
      const maxFare =
        usesVariantSplit && normalizedVariant === "sv" ? maxSvFare : maxSjFare;
      const fare =
        selectedRailMode === "PNR"
          ? pnrFareFromFormula(distanceDifferenceKm, boardingFee, distanceRate)
          : railFareFromFormula(
              selectedRailMode,
              usesVariantSplit ? row.variant_type : "sj",
              distanceDifferenceKm,
              boardingFee,
              distanceRate,
              minFare,
              maxFare,
            );

      return {
        ...row,
        fare: String(fare),
      };
    });

    setGeneratedRailPreviewRows(previewRows);
    Alert.alert(
      "Rail Preview Ready",
      selectedRailMode === "PNR"
        ? `${selectedRailMode} preview generated using hardcoded zone rule: first 14km uses base fare, then add-on every 7km zone, capped at ₱60.`
        : usesVariantSplit
          ? `${selectedRailMode} preview generated: SJ uses rounded fare with SJ caps, SV uses exact computed fare with SV caps, both with standardized distance + boarding fee.`
          : `${selectedRailMode} preview generated: single fare logic applied (no SJ/SV split), using standardized distance + boarding fee + min/max caps.`,
    );
  };

  const onClearGeneratedRailPreview = () => {
    setGeneratedRailPreviewRows([]);
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

  const onApplyGeneratedRailPreview = () => {
    if (!hasGeneratedRailPreview) {
      Alert.alert("No Rail Preview", "Generate rail preview rows first.");
      return;
    }

    const previewKey = (row: FareRuleRowForm) =>
      [
        String(row.transport_mode || "").toUpperCase(),
        String(row.service_type || "").toUpperCase(),
        String(row.origin || "").trim(),
        String(row.destination || "").trim(),
        String(row.variant_type || "").toLowerCase(),
      ].join("|");

    const previewMap = new Map<string, FareRuleRowForm>();
    generatedRailPreviewRows.forEach((row) => {
      previewMap.set(previewKey(row), row);
    });

    const merged = fareRuleRows.map(
      (row) => previewMap.get(previewKey(row)) || row,
    );
    setFareRuleRows(merged);
    onClearGeneratedRailPreview();
    Alert.alert("Applied", "Rail preview rows are now applied to fare_rules.");
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
    selectedRailMode,
    selectedRailForm,
    hasInvalidSelectedRailQuick,
    hasGeneratedPreview,
    generatedPreviewRows,
    generatedPreviewModes,
    hasGeneratedRailPreview,
    generatedRailPreviewRows,
    rows,
    fareRuleRows,
    showPublicTablePreview,
    showFareRulesPreview,
    isSaveDisabled,
    setSelectedQuickMode,
    setSelectedRailMode,
    updateQuickForm,
    updateRailQuickForm,
    onGenerateQuickPreview,
    onGenerateRailQuickPreview,
    onClearGeneratedPreview,
    onClearGeneratedRailPreview,
    onApplyGeneratedPreview,
    onApplyGeneratedRailPreview,
    onTogglePublicTablePreview,
    onToggleFareRulesPreview,
    onSave,
  };
}
