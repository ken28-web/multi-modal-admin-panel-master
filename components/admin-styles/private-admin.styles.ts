import { StyleSheet } from "react-native";

import { adminCommonStyles } from "./global";

export const styles = StyleSheet.create({
  ...adminCommonStyles,
  scrollContent: {
    paddingBottom: 28,
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
    color: "#aab1bd",
    fontSize: 13,
    marginBottom: 6,
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#3f5c84",
    alignItems: "center",
    justifyContent: "center",
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
});
