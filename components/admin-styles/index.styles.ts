import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#111318",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    padding: 26,
    backgroundColor: "#1b1f27",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#303642",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#edf4ff",
  },
  subtitle: {
    fontSize: 15,
    color: "#b8c2d3",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b4452",
    backgroundColor: "#131820",
    color: "#d5dbe6",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorText: {
    color: "#f0a5b6",
    marginBottom: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#4f6b91",
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
  },
});
