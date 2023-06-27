import axios, { AxiosResponse } from "axios";
import { config } from '../config'
import { Configuration, OpenAIApi } from "openai";
import { randomUUID } from "crypto";

const { openAIApiKey } = config
const configuration = new Configuration({
  apiKey: openAIApiKey,
});
export const openai = new OpenAIApi(configuration);
const chatCompletionExampleResponse = {
  "id": "chatcmpl-7LrvNc9NTLi9C7tmhrbEgt1SiuL9z",
  "object": "chat.completion",
  "created": 1685446529,
  "model": "gpt-4-0314",
  "usage": {
    "prompt_tokens": 1584,
    "completion_tokens": 675,
    "total_tokens": 2259
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Objet: Modification du contrat de vente d'adjuvants\n\nDOCUMENTS CONTRACTUELS: Le présent avenant au contrat de vente du 01/01/2021 et le contrat de vente initial signé entre les parties le 01 janvier 2021.\n\nPRISE D’EFFET – DUREE/Date d'effet: Cet avenant entre en vigueur à partir du 1 janvier 2022.\n\nPRISE D’EFFET – DUREE/Durée: La durée du contrat est indéterminée, mais les prix mentionnés dans l'avenant demeurent fermes et non révisables jusqu'au 31/12/2022.\n\nPRISE D’EFFET – DUREE/Reconduction: Non mentionné dans l'avenant.\n\nSUPPORT – DISPONIBILITE - MAINTENANCE/Support: Non mentionné dans l'avenant.\n\nSUPPORT – DISPONIBILITE - MAINTENANCE/Disponiblité: Non mentionné dans l'avenant.\n\nSUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance préventive: Non mentionné dans l'avenant.\n\nSUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance Corrective: Non mentionné dans l'avenant.\n\nSUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance évolutive - Mises à jour & Evolutions (Updates & Upgrades): Non mentionné dans l'avenant.\n\nLOCALISATION DES DONNEES ET PROPRIETE DES DONNEES/LOCALISATION DES DONNEES S: Non mentionné dans l'avenant.\n\nLOCALISATION DES DONNEES ET PROPRIETE DES DONNEES/Propriéte des données: Non mentionné dans l'avenant.\n\nCOORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Obligation de loyauté: Non mentionné dans l'avenant.\n\nCOORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Obligation de Collaboration: Non mentionné dans l'avenant.\n\nCOORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Suivi du contrat: Non mentionné dans l'avenant.\n\nCOORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Réunion de suivi: Non mentionné dans l'avenant.\n\nObligation du prestataire/Conseil: Non mentionné dans l'avenant.\n\nObligations générales: Les parties conviennent de changer l'article 5, article 6 et d'ajouter un nouvel article concernant les quantités prévisionnelles au titre de l'année 2022 du contrat de vente.\n\nStipulations générales liées à la propriété intellectuelle: Non mentionné dans l'avenant.\n\nObligation de Collaboration: Non mentionné dans l'avenant.\n\nPropriété intellectuelle/Stipulations générales liées à la propriété intellectuelle: Non mentionné dans l'avenant.\n\nPropriété intellectuelle/Droit d’utilisation du Service Hébergé: Non mentionné dans l'avenant."
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
export type chatCompletion = typeof chatCompletionExampleResponse
export type message={ role: "user" | "system", content: string }
export class OpenAIService {
  static async MultiChatCompletion(multiMessages: message[][], model: string, user?: string): Promise<chatCompletion[]> {
    try {

      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      if (!user)
        user = randomUUID()
      let completions: chatCompletion[] = []
      for (const messages of multiMessages) {
        const response = await axios.post(apiUrl, {
          user,
          model,
          messages,
          temperature: 0
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIApiKey}`
          }
        })
        const completion = response.data as chatCompletion
        completions.push(completion)
      }
      return completions

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
  static async ChatCompletion(messages: message[], model: string, user?: string): Promise<chatCompletion> {
    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const response = await axios.post(apiUrl, {
        user,
        model,
        messages,
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
