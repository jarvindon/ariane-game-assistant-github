import { NextResponse } from "next/server";

const fallbackAnalysis = {
  gameName: "Elden Ring",
  context: "Combat détecté · Boss en phase 2",
  quickTips: [
    "Restez à moyenne distance et punissez après l’attaque sautée.",
    "Gardez votre roulade pour le combo à trois frappes.",
    "Une invocation peut détourner l’aggro quelques secondes."
  ]
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { image?: string } | null;
  const image = body?.image;
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  const mimeType = image?.match(/^data:(image\/(?:jpeg|png|webp));base64,/)?.[1];
  if (!image || !mimeType || !allowedMimeTypes.includes(mimeType) || image.length > 7_000_000) {
    return NextResponse.json({ error: "Une image valide est requise." }, { status: 400 });
  }

  const requestKey = request.headers.get("x-openai-key");
  const apiKey = requestKey || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(fallbackAnalysis);

  const [, encodedImage] = image.split(",", 2);
  const prompt = `Tu es Ariane, un assistant IA tactique spécialisé dans les jeux vidéo.
Analyse cette capture et réponds uniquement avec un JSON valide au format:
{"gameName":"string","context":"string","quickTips":["string","string","string"]}
Identifie le jeu et la situation visible. Sois concis, concret et utile en temps réel.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${encodedImage}`, detail: "low" } }
        ]
      }]
    })
  });
  if (!response.ok) return NextResponse.json({ error: "Le service d’analyse est indisponible." }, { status: 502 });

  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = result.choices?.[0]?.message?.content?.replace(/^```json\s*|\s*```$/g, "");
  try {
    return NextResponse.json(text ? JSON.parse(text) : fallbackAnalysis);
  } catch {
    return NextResponse.json({ error: "Réponse IA invalide." }, { status: 502 });
  }
}
