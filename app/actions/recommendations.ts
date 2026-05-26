// app/actions/recommendations.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type BookRecommendation = {
  title: string;
  author: string;
  reason: string;
  approximate_pages: number;
  genre: string;
  cover_url?: string | null;
};

const LENGTH_PROMPTS: Record<string, string> = {
  short: "libros cortos (menos de 200 páginas), lecturas rápidas",
  medium: "libros de extensión media (entre 200 y 400 páginas)",
  long: "libros largos (entre 400 y 600 páginas)",
  epic: "libros épicos muy extensos (más de 600 páginas), sagas incluidas",
};

export async function getRecommendations({
  genre,
  length,
}: {
  genre: string;
  length: string;
}): Promise<{ recommendations?: BookRecommendation[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: books } = await supabase
    .from("books")
    .select("title, author, status, rating")
    .eq("user_id", user.id);

  if (!books?.length)
    return {
      error: "Añade algunos libros primero para obtener recomendaciones.",
    };

  const rated = books.filter(
    (b) => b.status === "completed" && b.rating !== null,
  );
  if (rated.length === 0)
    return {
      error:
        "Completa y valora al menos un libro para obtener recomendaciones personalizadas.",
    };

  const topRated = [...rated]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 20)
    .map((b) => `- "${b.title}" de ${b.author} → ${b.rating}/10`)
    .join("\n");

  const lowRated = rated
    .filter((b) => (b.rating ?? 0) < 5)
    .map((b) => `- "${b.title}" de ${b.author}`)
    .join("\n");

  const allOwned = books.map((b) => `"${b.title}" de ${b.author}`).join(", ");

  const genreLine =
    genre !== "all"
      ? `GÉNERO REQUERIDO: ${genre}. Todos los libros deben ser de este género.`
      : "Sin restricción de género, varía según los gustos del usuario.";

  const lengthLine =
    length !== "all"
      ? `EXTENSIÓN REQUERIDA: prefiere ${LENGTH_PROMPTS[length]}.`
      : "Sin restricción de extensión.";

  const prompt = `Eres un experto en literatura y recomendaciones de libros.

LIBROS LEÍDOS Y VALORADOS (de mayor a menor puntuación):
${topRated}

${lowRated ? `LIBROS QUE NO LE GUSTARON (puntuación baja, evitar similares):\n${lowRated}\n` : ""}
LIBROS QUE YA TIENE (no recomendar ninguno de estos): ${allOwned}

${genreLine}
${lengthLine}

Analiza sus patrones: qué autores, estilos y temas valora más. Recomienda exactamente 6 libros que no tenga y que probablemente adoraría.

[
  {
    "title": "Título exacto del libro",
    "author": "Nombre completo del autor",
    "reason": "1-2 frases cortas explicando por qué le encantará",
    "approximate_pages": 320,
    "genre": "Género principal"
  }
]`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return { error: "Falta configurar GEMINI_API_KEY en .env.local" };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  reason: { type: "string" },
                  approximate_pages: { type: "integer" },
                  genre: { type: "string" },
                },
                required: [
                  "title",
                  "author",
                  "reason",
                  "approximate_pages",
                  "genre",
                ],
              },
            },
          },
        }),
      },
    );

    if (!res.ok) {
      console.error("Gemini API error:", await res.text());
      return { error: "Error al conectar con la IA. Inténtalo de nuevo." };
    }

    const data = await res.json();

    // Detectar truncamiento antes de intentar parsear
    const finishReason: string = data.candidates?.[0]?.finishReason ?? "UNKNOWN";
    if (finishReason !== "STOP") {
      console.error("Gemini finishReason:", finishReason, "— respuesta truncada o bloqueada");
      return { error: "La IA no pudo completar la respuesta. Inténtalo de nuevo." };
    }

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Sanitiza el JSON escapando correctamente los saltos de línea y caracteres
    // de control que aparezcan DENTRO de strings JSON (causa raíz del fallo).
    const sanitizeJson = (raw: string): string => {
      // 1. Eliminar fences de código (```json … ```)
      let s = raw
        .replace(/```(?:json|js|javascript)?\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      // 2. Normalizar smart-quotes tipográficas a comillas ASCII
      s = s
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');

      // 3. Escapar caracteres de control DENTRO de strings JSON.
      //    Recorremos carácter a carácter llevando la cuenta de si estamos
      //    dentro de un string para no tocar la estructura del JSON.
      let inString = false;
      let escaped = false;
      let result = "";

      for (let i = 0; i < s.length; i++) {
        const ch = s[i];

        if (escaped) {
          result += ch;
          escaped = false;
          continue;
        }

        if (ch === "\\" && inString) {
          result += ch;
          escaped = true;
          continue;
        }

        if (ch === '"') {
          inString = !inString;
          result += ch;
          continue;
        }

        if (inString) {
          // Caracteres prohibidos dentro de un string JSON → escapar
          if (ch === "\n") { result += "\\n"; continue; }
          if (ch === "\r") { result += "\\r"; continue; }
          if (ch === "\t") { result += "\\t"; continue; }
          const code = ch.charCodeAt(0);
          if (code < 0x20) {
            result += `\\u${code.toString(16).padStart(4, "0")}`;
            continue;
          }
        }

        result += ch;
      }

      // 4. Eliminar trailing commas antes de ] o } que rompen JSON estricto
      result = result.replace(/,\s*([\]}])/g, "$1");

      return result;
    };

    const tryParseRecommendations = (
      raw: string,
    ): BookRecommendation[] | null => {
      if (!raw) return null;

      // Candidato 1: texto completo; candidato 2: primer bloque array extraído
      const candidates: string[] = [raw];
      const arrayMatch = raw.match(/(\[[\s\S]*\])/);
      if (arrayMatch) candidates.push(arrayMatch[1]);

      for (const c of candidates) {
        try {
          const parsed = JSON.parse(sanitizeJson(c)) as unknown;
          if (Array.isArray(parsed) && parsed.length > 0)
            return parsed as BookRecommendation[];
        } catch (_e) {
          // seguimos con el siguiente candidato
        }
      }

      return null;
    };

    const recommendations = tryParseRecommendations(text);
    if (recommendations) return { recommendations };

    console.error(
      "Error crítico parseando el JSON de Gemini. Texto crudo:",
      text,
    );
    return { error: "La IA devolvió un formato inesperado. Intenta de nuevo." };
  } catch (err) {
    console.error("Recommendation parse error:", err);
    return {
      error: "Error al procesar las recomendaciones. Inténtalo de nuevo.",
    };
  }
}