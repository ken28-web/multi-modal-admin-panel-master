import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    padding: 26,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});
