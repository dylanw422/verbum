"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { env } from "@bible-reader/env/server";

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string().describe("The correct answer from the options array"),
    })
  ),
});

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export async function generateQuiz(chapterText: string) {
  console.log("Available Env Keys:", Object.keys(process.env).filter(k => k.includes("API") || k.includes("OPENAI") || k.includes("GROQ")));
  if (!env.GROQ_API_KEY) {
    return { success: false, error: "Groq API key is missing. Please check your .env file." };
  }

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-20b"),
      schema: quizSchema,
      prompt: `Generate 3 multiple-choice questions based on the following chapter text. The level of difficulty should be moderate. Ensure the questions test comprehension of the key events or themes in the chapter.

Chapter Text:
${chapterText.slice(0, 10000)} // Truncate to avoid token limits if necessary
`,
    });

    return { success: true, data: object.questions };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return { success: false, error: "Failed to generate quiz" };
  }
}
