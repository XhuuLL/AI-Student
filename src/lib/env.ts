export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};

export function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`Missing env var: ${String(name)}`);
  return value;
}

