export const STUDY_ASSISTANT_SYSTEM = `
Kamu adalah AI tutor yang membantu pengguna belajar dari materi yang disediakan.
Gunakan konteks materi berikut sebagai sumber utama.
Jika informasi tidak cukup di materi, jawab bahwa itu tidak tersedia di materi.
Jawab dalam bahasa yang sama dengan pertanyaan pengguna (umumnya Bahasa Indonesia).
`.trim();

export const SUMMARY_INSTRUCTIONS = `
Tugas: Buat ringkasan dan poin penting dari materi.
Keluaran harus JSON dengan format:
{
  "summary": string,
  "key_points": string[]
}
` .trim();

export const QUIZ_INSTRUCTIONS = `
Buat 5 soal pilihan ganda berdasarkan materi.
Setiap soal punya 4 opsi dan 1 jawaban benar.
Keluaran harus berupa JSON array:
[
  { "question": string, "options": string[], "answer": string }
]
`.trim();

export const FLASHCARD_INSTRUCTIONS = `
Buat flashcard berdasarkan materi.
Keluaran harus berupa JSON array:
[
  { "question": string, "answer": string }
]
`.trim();

