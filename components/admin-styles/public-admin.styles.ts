import { StyleSheet } from "react-native";

import { adminCommonStyles } from "./global";

export const styles = StyleSheet.create({
  ...adminCommonStyles,
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  helper: {
    color: "#a2a7b2",
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: "#171a21",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2b303a",
    padding: 16,
  },
  cardContent: {
    paddingBottom: 14,
  },
  sectionCard: {
    backgroundColor: "#1b1f27",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#303642",
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#d4d9e2",
  },
  modePickerRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 6,
  },
  modePickerButton: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a4250",
    backgroundColor: "#242a34",
    alignItems: "center",
    justifyContent: "center",
  },
  modePickerButtonActive: {
    borderColor: "#6f8fb7",
    backgroundColor: "#2f3848",
  },
  modePickerButtonText: {
    color: "#c4cad6",
    fontWeight: "600",
    fontSize: 12,
  },
  modePickerButtonTextActive: {
    color: "#d9e4f7",
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
    color: "#adb3bf",
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
    borderColor: "#353e4c",
    backgroundColor: "#202733",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 3,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#d2d8e3",
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 12,
    color: "#aab1bd",
    lineHeight: 17,
  },
  exampleText: {
    marginTop: 4,
    fontSize: 12,
    color: "#9fb3d4",
    fontWeight: "600",
  },
  previewCard: {
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#36404e",
    backgroundColor: "#202732",
    borderRadius: 10,
    padding: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#d3d9e4",
  },
  previewHint: {
    fontSize: 12,
    color: "#9ea6b4",
    marginTop: 2,
    marginBottom: 8,
  },
  previewRowsWrap: {
    maxHeight: 220,
  },
  errorText: {
    color: "#e58a9f",
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
    color: "#aab1be",
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
    borderColor: "#3b4452",
    borderRadius: 8,
    backgroundColor: "#131820",
    color: "#d5dbe6",
    paddingHorizontal: 10,
  },
  previewCell: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "#3b4452",
    borderRadius: 8,
    backgroundColor: "#131820",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#d4dae5",
  },
  deleteButton: {
    width: 90,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#7b3a4a",
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
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#4f6b91",
    alignItems: "center",
    justifyContent: "center",
  },
  railGenerateButton: {
    flexBasis: "100%",
    minHeight: 44,
    marginTop: 2,
  },
  primaryButtonDisabled: {
    backgroundColor: "#3f4f67",
  },
  primaryButtonText: {
    color: "#f1f4f8",
    fontWeight: "700",
  },
});
