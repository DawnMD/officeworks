type Source = Record<string, string | undefined>;

function required(source: Source, name: string): string {
  const value = source[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

/** Reads and checks the backend's configuration. Throws on the first problem it finds. */
export function parseEnv(source: Source) {
  return {
    port: Number(source.PORT ?? 8787),
    corsOrigins: (source.CORS_ORIGINS ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    fakeStoreUrl: required(source, "FAKE_STORE_URL"),
    enquiriesCsvPath: source.ENQUIRIES_CSV_PATH || "data/enquiries.csv",
  };
}

export type Env = ReturnType<typeof parseEnv>;
