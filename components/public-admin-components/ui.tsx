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

export function PublicAdminView({
  onBack,
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
}: PublicAdminViewProps) {
  const railUsesVariantSplit =
    selectedRailMode === "LRT1" || selectedRailMode === "LRT2";
  const isPnrMode = selectedRailMode === "PNR";
  const selectedModeFareRuleRows = fareRuleRows.filter(
    (row) =>
      String(row.transport_mode || "").toUpperCase() === selectedRailMode,
  );
  const selectedQuickModeRows = rows.filter(
    (row) => String(row.mode || "").toUpperCase() === selectedQuickMode,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.header}>Public Transport Fare Rates</Text>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#7f8ea7" />
          <Text style={styles.helper}>Loading fare rates...</Text>
        </View>
      ) : (
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

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>PUV Quick Adjust</Text>
            <View style={styles.instructionCard}>
              {selectedQuickConfig.bulletLines.map((line, idx) => (
                <Text
                  key={`${selectedQuickMode}-${idx}`}
                  style={styles.instructionText}
                >
                  • {line}
                </Text>
              ))}
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
                <Text style={styles.formulaLabel}>Base Fare</Text>
                <TextInput
                  style={styles.input}
                  value={selectedQuickForm.base_fare}
                  onChangeText={(value) =>
                    updateQuickForm(selectedQuickMode, "base_fare", value)
                  }
                  placeholder="13"
                  keyboardType="numeric"
                />
              </View>

              {selectedQuickConfig.showAddOnInput ? (
                <View style={[styles.formulaField, styles.formulaCell]}>
                  <Text style={styles.formulaLabel}>Add-on Rate (per km)</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedQuickForm.add_on_rate}
                    onChangeText={(value) =>
                      updateQuickForm(selectedQuickMode, "add_on_rate", value)
                    }
                    placeholder={selectedQuickConfig.addOnPlaceholder}
                    keyboardType="numeric"
                  />
                </View>
              ) : null}

              <View style={[styles.formulaField, styles.formulaCell]}>
                <Text style={styles.formulaLabel}>Discount Rate (%)</Text>
                <TextInput
                  style={styles.input}
                  value={selectedQuickForm.discount_rate}
                  onChangeText={(value) =>
                    updateQuickForm(selectedQuickMode, "discount_rate", value)
                  }
                  placeholder="20"
                  keyboardType="numeric"
                />
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
                  Modes: {generatedPreviewModes.join(", ")}
                </Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.colHeader, styles.modeCol]}>Mode</Text>
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

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={onTogglePublicTablePreview}
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
                <Text style={styles.previewTitle}>
                  Current public_mode_fares ({selectedQuickMode})
                </Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.colHeader, styles.modeCol]}>Mode</Text>
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
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rail Quick Adjust</Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                Set rail fare by standardized cumulative distances and
                mode-specific rules.
              </Text>
              {isPnrMode ? (
                <>
                  <Text style={styles.instructionText}>
                    • Hardcoded rule: first 14km uses base fare, then every
                    succeeding 7km zone adds your configured add-on amount
                  </Text>
                  <Text style={styles.instructionText}>
                    • Base fare and add-on per 7km are editable below (max cap
                    ₱60)
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.instructionText}>
                    • Includes boarding fee
                  </Text>
                  <Text style={styles.instructionText}>
                    • Formula: clamp(boarding fee + |destination km - origin km|
                    × distance rate, min fare, max fare)
                  </Text>
                </>
              )}
              {!isPnrMode && railUsesVariantSplit ? (
                <Text style={styles.instructionText}>
                  • Variant logic: SJ rounds up (₱5 step), SV uses exact
                  computed fare, with separate SJ/SV caps
                </Text>
              ) : !isPnrMode ? (
                <Text style={styles.instructionText}>
                  • Variant logic: no SJ/SV split for this mode; single fare cap
                  range is applied
                </Text>
              ) : null}
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
                      style={styles.input}
                      value={selectedRailForm.boarding_fee}
                      onChangeText={(value) =>
                        updateRailQuickForm("boarding_fee", value)
                      }
                      placeholder="15"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>Add-on per 7km</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedRailForm.distance_rate}
                      onChangeText={(value) =>
                        updateRailQuickForm("distance_rate", value)
                      }
                      placeholder="5"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>Boarding Fee</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedRailForm.boarding_fee}
                      onChangeText={(value) =>
                        updateRailQuickForm("boarding_fee", value)
                      }
                      placeholder="16.25"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>Distance Rate</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedRailForm.distance_rate}
                      onChangeText={(value) =>
                        updateRailQuickForm("distance_rate", value)
                      }
                      placeholder="1.47"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>
                      {railUsesVariantSplit ? "Min SJ Fare" : "Min Fare"}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={selectedRailForm.min_sj_fare}
                      onChangeText={(value) =>
                        updateRailQuickForm("min_sj_fare", value)
                      }
                      placeholder="20"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formulaField, styles.formulaCell]}>
                    <Text style={styles.formulaLabel}>
                      {railUsesVariantSplit ? "Max SJ Fare" : "Max Fare"}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={selectedRailForm.max_sj_fare}
                      onChangeText={(value) =>
                        updateRailQuickForm("max_sj_fare", value)
                      }
                      placeholder="55"
                      keyboardType="numeric"
                    />
                  </View>

                  {railUsesVariantSplit ? (
                    <>
                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>Min SV Fare</Text>
                        <TextInput
                          style={styles.input}
                          value={selectedRailForm.min_sv_fare}
                          onChangeText={(value) =>
                            updateRailQuickForm("min_sv_fare", value)
                          }
                          placeholder="20"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={[styles.formulaField, styles.formulaCell]}>
                        <Text style={styles.formulaLabel}>Max SV Fare</Text>
                        <TextInput
                          style={styles.input}
                          value={selectedRailForm.max_sv_fare}
                          onChangeText={(value) =>
                            updateRailQuickForm("max_sv_fare", value)
                          }
                          placeholder="55"
                          keyboardType="numeric"
                        />
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
                <Text style={styles.previewHint}>Mode: {selectedRailMode}</Text>

                <View style={styles.tableHeaderLarge}>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Transport
                  </Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Service
                  </Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>Origin</Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Destination
                  </Text>
                  <Text style={[styles.colHeader, styles.smallCol]}>Fare</Text>
                  <Text style={[styles.colHeader, styles.smallCol]}>
                    Variant
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
                        {row.variant_type}
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

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={onToggleFareRulesPreview}
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
                <Text style={styles.previewTitle}>
                  Current fare_rules ({selectedRailMode})
                </Text>
                <View style={styles.tableHeaderLarge}>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Transport
                  </Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Service
                  </Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>Origin</Text>
                  <Text style={[styles.colHeader, styles.modeCol]}>
                    Destination
                  </Text>
                  <Text style={[styles.colHeader, styles.smallCol]}>Fare</Text>
                  <Text style={[styles.colHeader, styles.smallCol]}>
                    Variant
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
                        {row.variant_type}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
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
        </ScrollView>
      )}
    </View>
  );
}
