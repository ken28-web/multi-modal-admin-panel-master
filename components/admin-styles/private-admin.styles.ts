import { StyleSheet } from "react-native";

import { adminCommonStyles } from "./global";

export const styles = StyleSheet.create({
  ...adminCommonStyles,
  scrollContent: {
    paddingBottom: 14,
  },
  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#171a21",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#303642",
    padding: 18,
    alignSelf: "center",
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  stepButton: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a4250",
    backgroundColor: "#222833",
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonActive: {
    borderColor: "#7da2d2",
    backgroundColor: "#2b3a4f",
  },
  stepButtonText: {
    color: "#c6cfde",
    fontSize: 12,
    fontWeight: "600",
  },
  stepButtonTextActive: {
    color: "#edf4ff",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d4d9e2",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#aab1bd",
    lineHeight: 20,
    marginBottom: 8,
  },
  loadingText: {
    color: "#aab1bd",
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#ffb4b4",
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a303b",
    paddingBottom: 12,
  },
  rowTitle: {
    color: "#d4d9e2",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  fieldLabel: {
    color: "#c6cfde",
    fontSize: 14,
    marginBottom: 6,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#364050",
    backgroundColor: "#10131a",
    color: "#d7dbe3",
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#364050",
    backgroundColor: "#10131a",
    color: "#d7dbe3",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "#d96f89",
  },
  fieldErrorText: {
    color: "#f0a5b6",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#3f5c84",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButton: {
    flexGrow: 2,
  },
  secondaryActionButton: {
    flexGrow: 1,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#f0f4fb",
    fontWeight: "700",
  },
  mutedText: {
    color: "#aab1bd",
    fontSize: 13,
    marginTop: 10,
  },
  stickyBar: {
    borderWidth: 1,
    borderColor: "#303642",
    borderRadius: 12,
    backgroundColor: "#1b1f27",
    padding: 12,
    gap: 8,
  },
  stickyMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stickyMuted: {
    color: "#aeb7c6",
    fontSize: 12,
  },
  stickyWarning: {
    color: "#f3c27b",
    fontSize: 12,
    fontWeight: "700",
  },
});
