import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { styles } from "../admin-styles/public-admin.styles";
import { PublicAdminViewModel, QUICK_MODE_CONFIG, QUICK_MODES } from "./logic";

type PublicAdminViewProps = PublicAdminViewModel & {
  onBack: () => void;
};

function formatTicketTypeLabel(value: string): string {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "sj") return "Single Journey Ticket";
  if (normalized === "sv") return "Stored Value Card";
  if (!normalized) return "Not set";
  return normalized.replace(/_/g, " ");
}

function formatPublicModeLabel(value: string): string {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  if (normalized === "PUJ") return "Jeepney";
  if (normalized === "PUB_ORDINARY") return "Ordinary Bus";
  if (normalized === "PUB_AIRCON") return "Aircon Bus";
  return normalized || "Not set";
}

export function PublicAdminView({
  onBack,
  loading,
  saving,
  error,
  lastSavedAt,
  currentStep,
  selectedQuickMode,
  selectedQuickConfig,
  selectedQuickForm,
  hasInvalidSelectedQuick,
  quickFormErrors,
  selectedRailMode,
  selectedRailForm,
  hasInvalidSelectedRailQuick,
  railFormErrors,
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
  hasUnsavedChanges,
  setCurrentStep,
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
  onResetToLastSaved,
  onSave,
}: PublicAdminViewProps) {
  const railUsesVariantSplit =
    selectedRailMode === "LRT1" || selectedRailMode === "LRT2";
  const isPnrMode = selectedRailMode === "PNR";
  const [publicSearch, setPublicSearch] = useState("");
  const [railSearch, setRailSearch] = useState("");

  const selectedModeFareRuleRows = useMemo(() => {
    const modeRows = fareRuleRows.filter(
      (row) =>
        String(row.transport_mode || "").toUpperCase() === selectedRailMode,
    );
    const query = publicSearch.trim().toLowerCase();
    if (!query) return modeRows;
    return modeRows.filter((row) =>
      [row.origin, row.destination, row.service_type, row.variant_type]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [fareRuleRows, publicSearch, selectedRailMode]);

  const selectedQuickModeRows = useMemo(() => {
    const modeRows = rows.filter(
      (row) => String(row.mode || "").toUpperCase() === selectedQuickMode,
    );
    const query = railSearch.trim().toLowerCase();
    if (!query) return modeRows;
    return modeRows.filter((row) =>
      `${row.distance_km} ${row.regular} ${row.discounted}`
        .toLowerCase()
        .includes(query),
    );
  }, [railSearch, rows, selectedQuickMode]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.header}>Public Transport Fare Rates</Text>
      </View>

      <View style={styles.stepperRow}>
        {[
          { key: "puv", label: "1. PUV Formula" },
          { key: "rail", label: "2. Rail Formula" },
          { key: "review", label: "3. Review and Save" },
        ].map((step) => {
          const isActive = currentStep === step.key;
          return (
            <Pressable
              key={step.key}
              style={[styles.stepButton, isActive && styles.stepButtonActive]}
              onPress={() => setCurrentStep(step.key as any)}
            >
              <Text
                style={[
                  styles.stepButtonText,
                  isActive && styles.stepButtonTextActive,
                ]}
              >
                {step.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#7f8ea7" />
          <Text style={styles.helper}>Loading fare rates...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={[
              styles.card,
              {
                scrollbarColor: "#4a5261 #171a21",
                scrollbarWidth: "thin",
              } as any,
            ]}
            contentContainerStyle={styles.cardContent}
            showsVerticalScrollIndicator
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {currentStep === "puv" ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>
                  {selectedQuickConfig.title}
                </Text>
                <View style={styles.instructionCard}>
                  {selectedQuickConfig.bulletLines.map((line, idx) => (
                    <Text
                      key={`${selectedQuickMode}-${idx}`}
                      style={styles.instructionText}
                    >
                      • {line}
                    </Text>
                  ))}
                  <Text style={styles.exampleText}>
                    Example: first {selectedQuickConfig.includedDistanceKm} km =
                    base fare, then add extra amount per succeeding km.
                  </Text>
                </View>

                <View style={styles.modePickerRow}>
                  {QUICK_MODES.map((mode) => {
                    const config = QUICK_MODE_CONFIG[mode];
                    const isActive = selectedQuickMode === mode;

                    return (
                      <Pressable
                        key={mode}
                        style={[
                          styles.modePickerButton,
                          isActive && styles.modePickerButtonActive,
                        ]}
                        onPress={() => setSelectedQuickMode(mode)}
                      >
                        <Text
                          style={[
                            styles.modePickerButtonText,
                            isActive && styles.modePickerButtonTextActive,
                          ]}
                        >
                          {config.previewLabel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.formulaGrid}>
                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>
                      Base Fare (first kilometers)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        quickFormErrors.base_fare ? styles.inputError : null,
                      ]}
                      value={selectedQuickForm.base_fare}
                      onChangeText={(value) =>
                        updateQuickForm(selectedQuickMode, "base_fare", value)
                      }
                      placeholder="13"
                      keyboardType="numeric"
                    />
                    {quickFormErrors.base_fare ? (
                      <Text style={styles.fieldErrorText}>
                        {quickFormErrors.base_fare}
                      </Text>
                    ) : null}
                  </View>

                  {selectedQuickConfig.showAddOnInput ? (
                    <View style={[styles.formulaField, styles.formulaCell]}>
                      <Text style={styles.formulaLabel}>
                        Extra Per Km After Included Distance
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          quickFormErrors.add_on_rate
                            ? styles.inputError
                            : null,
                        ]}
                        value={selectedQuickForm.add_on_rate}
                        onChangeText={(value) =>
                          updateQuickForm(
                            selectedQuickMode,
                            "add_on_rate",
                            value,
                          )
                        }
                        placeholder={selectedQuickConfig.addOnPlaceholder}
                        keyboardType="numeric"
                      />
                      {quickFormErrors.add_on_rate ? (
                        <Text style={styles.fieldErrorText}>
                          {quickFormErrors.add_on_rate}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>
                      Senior/PWD Discount Percent
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        quickFormErrors.discount_rate
                          ? styles.inputError
                          : null,
                      ]}
                      value={selectedQuickForm.discount_rate}
                      onChangeText={(value) =>
                        updateQuickForm(
                          selectedQuickMode,
                          "discount_rate",
                          value,
                        )
                      }
                      placeholder="20"
                      keyboardType="numeric"
                    />
                    {quickFormErrors.discount_rate ? (
                      <Text style={styles.fieldErrorText}>
                        {quickFormErrors.discount_rate}
                      </Text>
                    ) : null}
                  </View>

                  <Pressable
                    style={[
                      styles.primaryButton,
                      styles.railGenerateButton,
                      (saving || hasInvalidSelectedQuick) &&
                        styles.primaryButtonDisabled,
                    ]}
                    onPress={() => onGenerateQuickPreview(selectedQuickMode)}
                    disabled={saving || hasInvalidSelectedQuick}
                  >
                    <Text style={styles.primaryButtonText}>
                      {selectedQuickConfig.generateLabel}
                    </Text>
                  </Pressable>
                </View>

                {hasGeneratedPreview ? (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>
                      Preview Result ({generatedPreviewRows.length} rows)
                    </Text>
                    <Text style={styles.previewHint}>
                      Modes:{" "}
                      {generatedPreviewModes
                        .map(formatPublicModeLabel)
                        .join(", ")}
                    </Text>

                    <View style={styles.tableHeader}>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Mode
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Distance
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Regular
                      </Text>
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
                        onPress={onClearGeneratedPreview}
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
              </View>
            ) : null}

            {currentStep === "rail" ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Rail Quick Adjust</Text>
                <View style={styles.instructionCard}>
                  <Text style={styles.instructionText}>
                    Set rail fare using standardized cumulative distances and
                    mode-specific rules.
                  </Text>
                  {isPnrMode ? (
                    <>
                      <Text style={styles.instructionText}>
                        • First 14 km uses base fare, then each succeeding 7 km
                        zone adds your amount.
                      </Text>
                      <Text style={styles.instructionText}>
                        • Max fare cap is fixed at P60 for PNR.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.instructionText}>
                        • Includes boarding fee.
                      </Text>
                      <Text style={styles.instructionText}>
                        • Formula: boarding fee + distance difference x distance
                        rate, then clamp by min/max.
                      </Text>
                      {railUsesVariantSplit ? (
                        <Text style={styles.instructionText}>
                          • Ticket types: Single Journey Ticket and Stored Value
                          Card.
                        </Text>
                      ) : null}
                    </>
                  )}
                </View>

                <View style={styles.modePickerRow}>
                  {(["LRT1", "LRT2", "MRT", "PNR"] as const).map((mode) => {
                    const isActive = selectedRailMode === mode;
                    return (
                      <Pressable
                        key={mode}
                        style={[
                          styles.modePickerButton,
                          isActive && styles.modePickerButtonActive,
                        ]}
                        onPress={() => setSelectedRailMode(mode)}
                      >
                        <Text
                          style={[
                            styles.modePickerButtonText,
                            isActive && styles.modePickerButtonTextActive,
                          ]}
                        >
                          {mode}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.formulaGrid}>
                  {isPnrMode ? (
                    <>
                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>Base Fare</Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.boarding_fee
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.boarding_fee}
                          onChangeText={(value) =>
                            updateRailQuickForm("boarding_fee", value)
                          }
                          placeholder="15"
                          keyboardType="numeric"
                        />
                        {railFormErrors.boarding_fee ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.boarding_fee}
                          </Text>
                        ) : null}
                      </View>

                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>
                          Add-on Per 7 Km Zone
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.distance_rate
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.distance_rate}
                          onChangeText={(value) =>
                            updateRailQuickForm("distance_rate", value)
                          }
                          placeholder="5"
                          keyboardType="numeric"
                        />
                        {railFormErrors.distance_rate ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.distance_rate}
                          </Text>
                        ) : null}
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>Boarding Fee</Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.boarding_fee
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.boarding_fee}
                          onChangeText={(value) =>
                            updateRailQuickForm("boarding_fee", value)
                          }
                          placeholder="16.25"
                          keyboardType="numeric"
                        />
                        {railFormErrors.boarding_fee ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.boarding_fee}
                          </Text>
                        ) : null}
                      </View>

                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>Distance Rate</Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.distance_rate
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.distance_rate}
                          onChangeText={(value) =>
                            updateRailQuickForm("distance_rate", value)
                          }
                          placeholder="1.47"
                          keyboardType="numeric"
                        />
                        {railFormErrors.distance_rate ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.distance_rate}
                          </Text>
                        ) : null}
                      </View>

                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>
                          {railUsesVariantSplit
                            ? "Min Single Journey Fare"
                            : "Min Fare"}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.min_sj_fare
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.min_sj_fare}
                          onChangeText={(value) =>
                            updateRailQuickForm("min_sj_fare", value)
                          }
                          placeholder="20"
                          keyboardType="numeric"
                        />
                        {railFormErrors.min_sj_fare ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.min_sj_fare}
                          </Text>
                        ) : null}
                      </View>

                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>
                          {railUsesVariantSplit
                            ? "Max Single Journey Fare"
                            : "Max Fare"}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            railFormErrors.max_sj_fare
                              ? styles.inputError
                              : null,
                          ]}
                          value={selectedRailForm.max_sj_fare}
                          onChangeText={(value) =>
                            updateRailQuickForm("max_sj_fare", value)
                          }
                          placeholder="55"
                          keyboardType="numeric"
                        />
                        {railFormErrors.max_sj_fare ? (
                          <Text style={styles.fieldErrorText}>
                            {railFormErrors.max_sj_fare}
                          </Text>
                        ) : null}
                      </View>

                      {railUsesVariantSplit ? (
                        <>
                          <View
                            style={[styles.formulaField, styles.formulaCell]}
                          >
                            <Text style={styles.formulaLabel}>
                              Min Stored Value Card Fare
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                railFormErrors.min_sv_fare
                                  ? styles.inputError
                                  : null,
                              ]}
                              value={selectedRailForm.min_sv_fare}
                              onChangeText={(value) =>
                                updateRailQuickForm("min_sv_fare", value)
                              }
                              placeholder="20"
                              keyboardType="numeric"
                            />
                            {railFormErrors.min_sv_fare ? (
                              <Text style={styles.fieldErrorText}>
                                {railFormErrors.min_sv_fare}
                              </Text>
                            ) : null}
                          </View>

                          <View
                            style={[styles.formulaField, styles.formulaCell]}
                          >
                            <Text style={styles.formulaLabel}>
                              Max Stored Value Card Fare
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                railFormErrors.max_sv_fare
                                  ? styles.inputError
                                  : null,
                              ]}
                              value={selectedRailForm.max_sv_fare}
                              onChangeText={(value) =>
                                updateRailQuickForm("max_sv_fare", value)
                              }
                              placeholder="55"
                              keyboardType="numeric"
                            />
                            {railFormErrors.max_sv_fare ? (
                              <Text style={styles.fieldErrorText}>
                                {railFormErrors.max_sv_fare}
                              </Text>
                            ) : null}
                          </View>
                        </>
                      ) : null}
                    </>
                  )}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      styles.railGenerateButton,
                      (saving || hasInvalidSelectedRailQuick) &&
                        styles.primaryButtonDisabled,
                    ]}
                    onPress={onGenerateRailQuickPreview}
                    disabled={saving || hasInvalidSelectedRailQuick}
                  >
                    <Text style={styles.primaryButtonText}>
                      Generate Rail Preview
                    </Text>
                  </Pressable>
                </View>

                {hasGeneratedRailPreview ? (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>
                      Rail Preview ({generatedRailPreviewRows.length} rows)
                    </Text>
                    <Text style={styles.previewHint}>
                      Mode: {selectedRailMode}
                    </Text>

                    <View style={styles.tableHeaderLarge}>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Transport
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Service
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Origin
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Destination
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Fare
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Ticket Type
                      </Text>
                    </View>

                    <ScrollView
                      style={styles.previewRowsWrap}
                      contentContainerStyle={styles.rowsContent}
                    >
                      {generatedRailPreviewRows.map((row) => (
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
                            {formatTicketTypeLabel(row.variant_type)}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.actionsRow}>
                      <Pressable
                        style={styles.secondaryButton}
                        onPress={onClearGeneratedRailPreview}
                      >
                        <Text style={styles.secondaryButtonText}>
                          Discard Rail Preview
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.primaryButton}
                        onPress={onApplyGeneratedRailPreview}
                      >
                        <Text style={styles.primaryButtonText}>
                          Apply Rail Preview
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {currentStep === "review" ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>
                  Review Changes Before Save
                </Text>
                <Text style={styles.helperBlock}>
                  Use the previews below to verify generated rows before saving.
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={onTogglePublicTablePreview}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {showPublicTablePreview
                        ? "Hide public_mode_fares"
                        : "Preview public_mode_fares"}
                    </Text>
                  </Pressable>
                </View>

                {showPublicTablePreview ? (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>
                      Current public_mode_fares (
                      {selectedQuickConfig.previewLabel})
                    </Text>
                    <TextInput
                      style={styles.searchInput}
                      value={railSearch}
                      onChangeText={setRailSearch}
                      placeholder="Search by distance or fare"
                      placeholderTextColor="#808a9c"
                    />
                    <View style={styles.tableHeader}>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Mode
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Distance
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Regular
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Discounted
                      </Text>
                    </View>

                    <ScrollView
                      style={styles.previewRowsWrap}
                      contentContainerStyle={styles.rowsContent}
                    >
                      {selectedQuickModeRows.map((row) => (
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
                    onPress={onToggleFareRulesPreview}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {showFareRulesPreview
                        ? "Hide fare_rules"
                        : "Preview fare_rules"}
                    </Text>
                  </Pressable>
                </View>

                {showFareRulesPreview ? (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>
                      Current fare_rules ({selectedRailMode})
                    </Text>
                    <TextInput
                      style={styles.searchInput}
                      value={publicSearch}
                      onChangeText={setPublicSearch}
                      placeholder="Search by station, service, or ticket type"
                      placeholderTextColor="#808a9c"
                    />
                    <View style={styles.tableHeaderLarge}>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Transport
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Service
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Origin
                      </Text>
                      <Text style={[styles.colHeader, styles.modeCol]}>
                        Destination
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Fare
                      </Text>
                      <Text style={[styles.colHeader, styles.smallCol]}>
                        Ticket Type
                      </Text>
                    </View>

                    <ScrollView
                      style={styles.previewRowsWrap}
                      contentContainerStyle={styles.rowsContent}
                    >
                      {selectedModeFareRuleRows.map((row) => (
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
                            {formatTicketTypeLabel(row.variant_type)}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.stickyBar}>
            <View style={styles.stickyMetaRow}>
              <Text style={styles.stickyMuted}>
                {lastSavedAt ? `Last saved: ${lastSavedAt}` : "Not saved yet"}
              </Text>
              {hasUnsavedChanges ? (
                <Text style={styles.stickyWarning}>Unsaved changes</Text>
              ) : (
                <Text style={styles.stickyMuted}>All changes saved</Text>
              )}
            </View>

            <View style={styles.stickyActions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={onResetToLastSaved}
                disabled={!hasUnsavedChanges || saving}
              >
                <Text style={styles.secondaryButtonText}>
                  Reset to Last Saved
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryButton,
                  isSaveDisabled && styles.primaryButtonDisabled,
                ]}
                onPress={onSave}
                disabled={isSaveDisabled}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? "Saving..." : "Save Public Fare Tables"}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
