import axios from "axios";
import AppError from "../../core/AppError";
import { QuizDaily } from "./quizDaily.model";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const todayKey = () =>
  new Date().toISOString().split("T")[0];

interface AIGeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  reference: string;
}

const generateDailyQuizFromAI = async (): Promise<AIGeneratedQuestion[]> => {
  if (!OPENAI_API_KEY) {
    throw new AppError("OpenAI API key missing", 500);
  }

  const prompt = `
Generate 5 Bible quiz questions.
Difficulty: Medium.
Each question must include:
- question
- 4 options
- correctAnswer (must match one option exactly)
- reference (Book Chapter:Verse)

Return ONLY strict JSON array.
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Bible quiz generator." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const raw = response.data.choices[0].message.content;

  let parsed: AIGeneratedQuestion[];

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AppError("Invalid AI response format", 500);
  }

  if (!Array.isArray(parsed) || parsed.length !== 5) {
    throw new AppError("AI returned invalid number of questions", 500);
  }

  return parsed;
};

export const QuizDailyService = {
 async getToday() {
  const today = todayKey();

  let daily = await QuizDaily.findOne({ date: today }).lean();

  if (!daily) {
    const questions = await generateDailyQuizFromAI();

    const created = await QuizDaily.create({
      date: today,
      questions,
      locked: true
    });

    daily = created.toObject();
  }

  return {
    date: daily.date,
    total: daily.questions.length,
    timer: 30,
    questions: daily.questions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      reference: q.reference
      // DO NOT send correctAnswer here
    }))
  };
},

  async history(limit = 30) {
    return QuizDaily.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }
};