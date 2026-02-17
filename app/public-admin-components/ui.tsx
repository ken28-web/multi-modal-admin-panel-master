import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { PublicAdminViewModel, QUICK_MODE_CONFIG, QUICK_MODES } from "./logic";
import { styles } from "./styles";

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
}: PublicAdminViewProps) {
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
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.helper}>Loading fare rates...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

          <Text style={styles.sectionTitle}>{selectedQuickConfig.title}</Text>
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
                  placeholder="2.25"
                  keyboardType="numeric"
                />
              </View>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
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
      )}
    </View>
  );
}
