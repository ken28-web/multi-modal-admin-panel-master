const appConfig = require("./app.json");

function normalizeBaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

const baseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_BASE_PATH);

if (baseUrl) {
  appConfig.expo.experiments = {
    ...(appConfig.expo.experiments || {}),
    baseUrl,
  };
}

module.exports = appConfig;
