import axios from "axios";
import { config } from '../config'
import { Configuration, OpenAIApi } from "openai";

const { openAIApiKey } = config
const configuration = new Configuration({
  apiKey: openAIApiKey,
});
export const openai = new OpenAIApi(configuration);
export class OpenAIService {
  static async Completion(prompt: string): Promise<string> {
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.2,
        max_tokens: 64,
      });
      console.log(completion.data);
      return completion.data.choices[0].text!

    } catch (error: any) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
      return ""
    }
  }

}
