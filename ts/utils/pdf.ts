const pdfUtil = require('pdf-to-text')
import fs from 'fs'
import ejs from 'ejs'
import pdf from 'html-pdf'
import Path from 'path'
import { pdfToPng } from 'pdf-to-png-converter'

import { randomUUID } from 'crypto';
import { fixFrenchDiacritics } from "../utils/string";

export class PDFLib {
    // static async GetPageData(buffer) {
    //     const pageData = await pdfPageCounter(buffer).catch((error) => {
    //         console.error(error)
    //         return {
    //             numpages: 1,
    //             info: {},
    //             metadata: {},
    //             text: "",
    //             version: {},
    //         }
    //     })
    //     return pageData
    // }
    static async PdfToText(pdfFile: Buffer | string): Promise<string> {
        let tempFilePath = ""
        if (pdfFile instanceof Buffer) {
          tempFilePath = `tmp/${randomUUID()}.pdf`
          fs.writeFileSync(tempFilePath, pdfFile)
        } else
          tempFilePath = pdfFile
        return new Promise((resolve, reject) => {
          pdfUtil.pdfToText(tempFilePath, function (err: any, data: string) {
            if (pdfFile instanceof Buffer)
              fs.unlink(tempFilePath, () => { })
            if (err) reject(err);
            resolve(fixFrenchDiacritics(data)); //print all text    
          });
    
        })
      }
    static async PdfToPngFile(buffer: Buffer) {
        const buffers = await pdfToPng(buffer, {
            pagesToProcess: [1]
        })
        return buffers[0].content
    }
    static GenerateHTMLTemplate(templatePath: string, savePath: string, data: any) {
        return new Promise(async (resolve, reject) => {
            try {
                for (const key in data) {
                    data[key] = data[key] != undefined ? data[key] : ""
                    data[key] = data[key] != null ? data[key] : ""
                }
                const html = await ejs.renderFile(templatePath, data) as string
                const result = pdf.create(html, { format: "A4" })
                const dirname = Path.dirname(savePath)
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true });
                }
                result.toFile(savePath, function (err, res) {
                    if (err) { return reject(err) }
                    return resolve(res)
                });
            } catch (error) {
                reject(error)
            }
        })
    }

}