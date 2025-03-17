import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constant";

export type Language = keyof typeof LANGUAGE_VERSIONS;

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language: Language, sourceCode: string): Promise<any> => {
  try {
    const response = await API.post("/execute", {
      language,
      version: LANGUAGE_VERSIONS[language],
      files: [{ content: sourceCode }],
    });

    console.log("API Response:", response.data); // ✅ Debugging
    return response.data; // ✅ Return response data
  } catch (error) {
    console.error("API Error:", error);
    return null; // ✅ Prevent undefined errors
  }
};
