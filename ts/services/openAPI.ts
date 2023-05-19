import axios, { AxiosResponse } from "axios";
import { config } from '../config'
import { Configuration, OpenAIApi } from "openai";

const { openAIApiKey } = config
const configuration = new Configuration({
  apiKey: openAIApiKey,
});
export const openai = new OpenAIApi(configuration);
export class OpenAIService {
  static async ChatCompletion(prompt: string, model: string): Promise<any> {
    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const response = await axios.post(apiUrl, {
        model,
        messages: [{ role: 'system', content: prompt }],
        temperature: 0
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        }
      })
      console.log(response.data.choices[0].message.content);
      return response.data

    } catch (error: any) {
      if (error.response?.data) {
        console.error(error.response.status, error.response.data);
        throw error.response.data
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        throw error.message
      }
    }
  }

}
