import axios from "axios";
import { Router } from "express";
import fs from "fs"

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import { MiddlewareRequest } from "../utils/middleware";
import { ModelRouter } from "./Model";
import { FindOptions } from "sequelize";
import { ContractTemplate } from "../models/ContractTemplate";
import { IContractAI, IContractAIResponse } from "../interfaces";
import { ContractAI } from "../models/ContractAI";
import { KOp } from "../sequelize";
import { openai } from "../services/openAPI";
import { ContractAIResponse } from "../models/ContractAIResponse";
import { PDFToTextLib } from "../services/pdfToText";
import fileUpload from "express-fileupload";
import { UrlToUploadPath } from "../utils/string";

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


export class ContractAIRouter {
  static async generateAIPrompt(row: IContractAI, file: Buffer | string): Promise<string> {
    if (!(row.answers && row.answers.length == row.form?.questions?.length))
      throw "missing data"
    const fileContent = await PDFToTextLib.PdfToText(file)

    return fileContent
  }

  static Route(): Router {
    let router: Router = Router();
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

        const row = await ContractTemplate.findOne(findOptions) as IContractAI
        if (!row)
          throw { message: `Instance Not Found` }
        let pdfFile: Buffer | string | undefined = (req.files?.["file"] as fileUpload.UploadedFile)?.data
        if (!pdfFile) {
          pdfFile = UrlToUploadPath((row as IContractAI).file?.url!)
        }
        if (!pdfFile)
          return
        const prompt = await this.generateAIPrompt(row, pdfFile)
        return res.send({ prompt })

        const openAiResponse = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: prompt,
          temperature: 0.2,
          max_tokens: 2000,
        })
        const data = openAiResponse.data
        let contractAIResponse: IContractAIResponse = {
          contractAIId: row.id,
          externalId: data.id,
          content: data.choices[0].text,
          info: {
            model: data.model,
            finish_reason: data.choices[0].finish_reason,
            ...data.usage,
          }
        }
        const createdResponse = await ContractAIResponse.Create(contractAIResponse, { user } as any)
        res.send({ row: createdResponse })
      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
    })
    return router;
  }
}
