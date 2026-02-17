export const adminTheme = {
  background: "#111318",
  textPrimary: "#d7dbe3",
  textSecondary: "#aab1bd",
  border: "#3d4655",
  panel: "#252c38",
};

export const adminCommonStyles = {
  container: {
    flex: 1,
    backgroundColor: adminTheme.background,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 18,
    gap: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: adminTheme.textPrimary,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: adminTheme.border,
    backgroundColor: adminTheme.panel,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryButtonText: {
    color: "#cfd5df",
    fontWeight: "600" as const,
  },
};
