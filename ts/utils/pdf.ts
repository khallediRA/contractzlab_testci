import fs from 'fs'
import ejs from 'ejs'
import pdf from 'html-pdf'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import Path from 'path'
import createReport from 'docx-templates'
import { pdfToPng } from 'pdf-to-png-converter'
import sizeOf from 'image-size'
import DocxLib  from './docx'


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
    static async PopulateDOCXTemplate(templatePath: string, data: any): Promise<Buffer> {
        for (const key in data) {
            data[key] = data[key] != undefined ? data[key] : ""
            data[key] = data[key] != null ? data[key] : ""
        }
        const start = new Date(Date.now())
        var template = fs.readFileSync(templatePath, 'binary') as any as Buffer
        const buf = await createReport({
            template, data,
            additionalJsContext: {
                buffer: (buffer: Buffer) => {
                    let { width = 1, height = 1 } = sizeOf(buffer)
                    const ratio = height / width
                    width = Math.min(width / 10, 17)
                    height = Math.floor(width * ratio)
                    const data = buffer.toString("base64")
                    return { width, height, data, extension: '.png' };
                },
            }
        });
        // const buf = doc.getZip().generate({ type: 'nodebuffer' });
        return Buffer.from(buf.buffer) //fs.readFileSync(tmpPath);
    }
    static async PopulateDOCXTemplateToPDF(templatePath: string, savePath: string, data: any): Promise<Buffer> {
        const docxFile = await this.PopulateDOCXTemplate(templatePath, data)
        return await DocxLib.DocxToPdf(docxFile, savePath)
    }
    static PopulateDOCXTemplater(templatePath: string, data: any): Buffer {
        for (const key in data) {
            data[key] = data[key] != undefined ? data[key] : ""
            data[key] = data[key] != null ? data[key] : ""
        }
        const start = new Date(Date.now())
        var content = fs.readFileSync(templatePath, 'binary');
        var zip = new PizZip(content);
        var doc;
        doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.render(data)
        const buf = doc.getZip().generate({ type: 'nodebuffer' }) as Buffer
        return buf
    }
    static async PopulateDOCXTemplaterToPDF(templatePath: string, savePath: string, data: any): Promise<Buffer> {
        const docxFile = this.PopulateDOCXTemplater(templatePath, data)
        return await DocxLib.DocxToPdf(docxFile, savePath)
    }

}