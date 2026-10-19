export function validateEnvironment(env: Record<string, unknown>) {
  const result = { ...env };
  for (const key of ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE']) {
    if (typeof env[key] !== 'string' || !(env[key] as string).trim()) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
  for (const [key, fallback] of [['PORT', 3000], ['DB_PORT', 5432]] as const) {
    const value = Number(env[key] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`${key} must be an integer between 1 and 65535`);
    }
    result[key] = value;
  }
  return result;
}
