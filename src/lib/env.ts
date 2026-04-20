export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Tetap simpan ini jika masih ada kode yang pakai OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY, 
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  // TAMBAHKAN BARIS INI:
  GEMINI_API_KEY: process.env.GEMINI_API_KEY, 
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash", 
};

export function requireEnv(name: keyof typeof env) {
  const value = env[name];
  // Jika variabel env tidak ada, aplikasi akan melempar error agar kita tahu ada yang kurang di .env
  if (!value) throw new Error(`Missing env var: ${String(name)}`);
  return value;
}