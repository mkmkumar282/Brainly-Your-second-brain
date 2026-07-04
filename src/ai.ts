
import { GoogleGenerativeAI } from "@google/generative-ai";
import { contentModel } from "./schema.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// 1. extractKeywords(query)
// ─────────────────────────────────────────────


export function extractKeywords(query: string): string[] {
  const STOPWORDS = new Set([
    "the", "is", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "as", "into", "it", "its",
    "what", "how", "when", "where", "why", "who", "which", "did",
    "i", "my", "me", "we", "our", "you", "your", "he", "his", "she",
    "her", "they", "their", "this", "that", "these", "those",
    "was", "were", "are", "been", "be", "do", "does", "did", "have",
    "has", "had", "will", "would", "could", "should", "may", "might",
    "about", "can", "get", "any", "all", "more", "also", "just",
  ]);

  return [
    ...new Set(                         
      query
        .toLowerCase()                  
        .replace(/[^a-z0-9 ]/g, " ")   
        .split(/\s+/)                 
        .filter(
          (word) =>
            word.length > 2 &&          
            !STOPWORDS.has(word)        
        )
    ),
  ];
}

export async function searchRelevantNotes(
  keywords: string[],
  userId: string | mongoose.Types.ObjectId
): Promise<any[]> {
  const MIN_TEXT_RESULTS = 3; 

  const userObjectId =
    typeof userId === "string"
      ? new mongoose.Types.ObjectId(userId)
      : userId;


  const textSearchQuery = keywords.join(" "); 

  const textResults = await contentModel
    .find(
      {
        userId: userObjectId,
        $text: { $search: textSearchQuery }, 
      },
      {
        score: { $meta: "textScore" }, 
      }
    )
    .sort({ score: { $meta: "textScore" } }) 
    .lean(); 

  if (textResults.length >= MIN_TEXT_RESULTS) {
    return textResults;
  }


  const regexOrConditions = keywords.flatMap((kw) => [
    { title: { $regex: kw, $options: "i" } },       
    { description: { $regex: kw, $options: "i" } }, 
  ]);

  const regexResults = await contentModel
    .find({
      userId: userObjectId,
      $or: regexOrConditions, 
    })
    .lean();


  const seenIds = new Set(textResults.map((doc) => String(doc._id)));

  const merged = [...textResults];
  for (const doc of regexResults) {
    if (!seenIds.has(String(doc._id))) {
      seenIds.add(String(doc._id));
      merged.push(doc);
    }
  }

  return merged;
}

// ─────────────────────────────────────────────
// 3. buildContext(notes, tokenBudget)
// ─────────────────────────────────────────────


export function buildContext(
  notes: any[],
  tokenBudget: number = 3000
): { contextText: string; sourceTitles: string[] } {
  let contextText = "";
  const sourceTitles: string[] = [];
  let tokensUsed = 0;

  for (const note of notes) {
    const content = note.description || note.title || "";

    const noteFormatted =
      `[Note: "${note.title}" | Type: ${note.type} | Source: ${note.link || "N/A"}]\n` +
      `${content}\n` +
      `---\n`;

    const noteTokens = Math.ceil(noteFormatted.length / 4);

    if (tokensUsed + noteTokens > tokenBudget) {
      break;
    }

    contextText += noteFormatted;
    sourceTitles.push(note.title);
    tokensUsed += noteTokens;
  }

  return { contextText, sourceTitles };
}

// ─────────────────────────────────────────────
// 4. askAI(contextText, userQuestion)
// ─────────────────────────────────────────────

export async function askAI(
  contextText: string,
  userQuestion: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
First, check the SAVED NOTES below. If they contain relevant information, 
prioritize and cite them directly by title.

If the notes are missing, irrelevant, or don't fully answer the question, 
answer using your own general knowledge instead — don't refuse to answer. 
Just make it clear which parts came from the user's notes versus your own 
knowledge, using a short note like "(from your saved notes)" or "(general knowledge)".
CONTEXT:
${contextText}

QUESTION:
${userQuestion}`;

  const result = await model.generateContent(prompt);

  const responseText = result.response.text();

  return responseText;
}
