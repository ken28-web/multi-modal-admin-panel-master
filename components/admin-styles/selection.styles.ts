import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: "#111318",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    color: "#d7dbe3",
    letterSpacing: 0.5,
  },
  choiceBtn: {
    width: "100%",
    maxWidth: 520,
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
  },
  publicBtn: {
    backgroundColor: "#2d3a4d",
    borderColor: "#4c5f7d",
  },
  privateBtn: {
    backgroundColor: "#313642",
    borderColor: "#5d6573",
  },
  btnText: {
    color: "#e8ecf3",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
  },
});
