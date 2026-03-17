import { ScrollViewStyleReset } from "expo-router/html";

type RootProps = {
  children: React.ReactNode;
};

function normalizeBasePath(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const prefixed = raw.startsWith("/") ? raw : `/${raw}`;
  return prefixed.replace(/\/+$/, "");
}

export default function Root({ children }: RootProps) {
  const basePath = normalizeBasePath(process.env.EXPO_PUBLIC_BASE_PATH || "");
  const faviconHref = `${basePath}/favicon.ico`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href={faviconHref} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
