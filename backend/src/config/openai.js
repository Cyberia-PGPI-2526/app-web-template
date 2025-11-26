import OpenAI from "openai";
import { OPENAI_API_KEY } from "./env.js";

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}
const options = {
  apiKey: OPENAI_API_KEY,
}
const openaiClient = new OpenAI(options);

export default openaiClient;