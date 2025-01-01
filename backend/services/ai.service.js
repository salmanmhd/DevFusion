import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateResult(prompt) {
  const result = await model.generateContent(prompt);
  return result;
  console.log(result.response.text());
}
