import { StyleSheet } from "react-native";

import { adminCommonStyles } from "./global";

export const styles = StyleSheet.create({
  ...adminCommonStyles,
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
});
