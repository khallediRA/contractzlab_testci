import { Router } from "express";
import fs from "fs"

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import { MiddlewareRequest } from "../utils/middleware";
import { ModelRouter } from "./Model";
import { FindOptions } from "sequelize";
import { IContractAI, IContractAIResponse } from "../interfaces";
import { ContractAI } from "../models/ContractAI";
import { KOp } from "../sequelize";
import { OpenAIService, openai } from "../services/openAPI";
import { ContractAIResponse } from "../models/ContractAIResponse";
import { PDFToTextLib } from "../services/pdfToText";
import fileUpload from "express-fileupload";
import { UrlToUploadPath, optimizeStr } from "../utils/string";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const q = [
  "Quel est l'objet du contrat, les services demandés",
  "Quels documents composent ce contrat ?",
  "Quand est-ce que ce contrat entre en vigueur ?",
  "Quelle est la durée du contrat ?",
  "La reconduction est-elle tacite ? Quels sont les délais ?",
  "Quels sont les conditions d'accés et d'intervention du support ?",
  "La disponibilité du service et ses exception",
  "Faut-il prévoir une maintenance préventive ?",
  "Les conditions de la maintenance corrective, champ de couverture et exceptions,",
  "La mainteneance évolutive est-elle payante ?",
  "Ou sont les données hébergées ?",
  "Qui est propriétaire des données fournies par le client ?",
  "Les conséquences de désignation d'un correspondant",
  "Quelle est la périodicité et l'objet des réunions ? ",
  "Quelues sont les obligations du prestataire en matiére de conseil",
  "Quelles sont les obligations du client ddans l'utilisation des services heberges",
  "Qui est proprietaire du logicel"
]
const a = [
  "Le contrat a pour objet la fourniture de services informatiques liés à la maintenance, l'hébergement et la mise à disposition d'un logiciel pour le compte du client.",
  "Le contrat comprend les termes et conditions générales, ainsi que toute annexe, addenda ou autre document y afférent.",
  "Le contrat entre en vigueur à la date de signature par les parties.",
  "Le contrat est conclu pour une durée de [x] mois/années à compter de la date d'entrée en vigueur.",
  "Le contrat est reconduit tacitement pour des périodes successives de [x] mois/années, sauf résiliation par l'une des parties moyennant un préavis de [x] jours avant la fin de la période en cours.",
  "Le prestataire assure un support technique aux heures ouvrables et hors heures ouvrables en cas d'urgence, conformément aux conditions définies dans les annexes.",
  "Le prestataire s'engage à mettre à disposition du client les services conformément aux niveaux de service convenus, sous réserve des événements de force majeure ou d'interruptions planifiées.",
  "Le prestataire assure une maintenance préventive régulière pour garantir la qualité et la continuité des services fournis.",
  "La maintenance corrective couvre les interventions pour résoudre les dysfonctionnements ou les pannes du logiciel. Les exceptions sont définies dans les conditions particulières.",
  "La maintenance évolutive peut être payante si elle est hors du champ de couverture initial défini dans le contrat.",
  "Les données sont hébergées sur des serveurs situés dans des centres de données sécurisés.",
  "Le client reste propriétaire de toutes les données qu'il fournit au prestataire.",
  "La désignation d'un correspondant permet une communication efficace et rapide entre les parties en cas de besoin.",
  "Les réunions ont lieu périodiquement selon une fréquence définie dans les conditions particulières et portent sur l'état d'avancement des prestations, les éventuels problèmes rencontrés et les mesures à prendre.",
  "Le prestataire doit fournir des conseils et des recommandations pour l'utilisation optimale des services fournis.",
  "Le client doit utiliser les services conformément aux termes du contrat et aux bonnes pratiques du secteur.",
  "Le prestataire reste propriétaire du"
]

const maxTokens = 8191

export class ContractAIRouter {
  static async generateAIPrompt(row: IContractAI, fileContent: string): Promise<string> {
    const form = row.form?.form!
    let prompt = `
Generate a Legal Document based on the draft pdf file and a desired output.
Match the output format provided in clauses and subclaues
Expand each clause and subclause into a comprehensive legal document format
Language: Deduct from file.
[pdf file]
${optimizeStr(fileContent)}
[/pdf file]
[output]
${form.map(([clause, text]) => `${clause}:${text}\n`)}
[/output]
    `
    return prompt
  }
  static async processAIResponse(row: IContractAI, response: string): Promise<any> {
    const summarySheet = response.split("\n")
      .filter((str) => str)
      .map((line) => line.split(":").map(str => str.trim()))
    row.summarySheet = summarySheet as any
    return summarySheet
  }
  static Route(): Router {
    let router: Router = Router();
    router.get("/models", async (req, res) => {

    })

    router.post("/generateAIResponse", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractAI)
      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        await verifyUser(_req, res)
        await verifyCrud("update")(_req, res)
        const user = _req.middleData.user
        _req.query["schema"] = "full"
        await parseFindOptions(_req, res)
        const findOptions: FindOptions = _req.middleData.findOptions
        const id: string = req.query["id"] as string
        findOptions.where = findOptions.where ? { [KOp("and")]: [findOptions.where, { id }] } : { id }

        const row = await ContractAI.findOne(findOptions) as IContractAI & ContractAI
        if (!row)
          throw { message: `Instance Not Found` }
        let pdfFile: Buffer | string | undefined = (req.files?.["file"] as fileUpload.UploadedFile)?.data
        if (!pdfFile) {
          pdfFile = UrlToUploadPath((row as IContractAI).file?.url!)
        }
        if (!pdfFile)
          return
        const fileContent = await PDFToTextLib.PdfToText(pdfFile)

        const prompt = await this.generateAIPrompt(row, fileContent)
        const tokens = prompt.length
        // return res.send({tokens, prompt })

        if (tokens > maxTokens)
          throw {
            message: `This model's maximum context length is ${maxTokens} tokens, however you requested ${tokens} tokens`
          }
        const openAiData = await OpenAIService.ChatCompletion(prompt, "gpt-4")
        const now = Date.now()
        fs.writeFileSync(`tmp/${now}-file.txt`, fileContent)
        fs.writeFileSync(`tmp/${now}-prompt.txt`, prompt)
        fs.writeFileSync(`tmp/${now}-ai.txt`, openAiData.choices[0].message.content)
        this.processAIResponse(row, openAiData.choices[0].message.content)
        await row.save()
        return res.send({ tokens, now, prompt, row: row.toView() })
      } catch (error) {
        console.error(error);
        if ((error as any)?.response?.data)
          return res.status((error as any)?.response?.status || 400).send((error as any)?.response?.data)
        return res.status((error as any)?.status || 400).send(error)
      }
    })
    return router;
  }
}
