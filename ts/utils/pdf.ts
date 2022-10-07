import fs from 'fs'
import ejs from 'ejs'
import pdf from 'html-pdf'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import libre from 'libreoffice-convert'
import Path from 'path'
import createReport from 'docx-templates'
import { pdfToPng } from 'pdf-to-png-converter'
import sizeOf from 'image-size'


class PDFLib {
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
    static GenerateDOCXTemplate(templatePath: string, savePath: string, data: any) {
        return new Promise(async (resolve, reject) => {
            const stack = new Error().stack
            try {
                for (const key in data) {
                    data[key] = data[key] != undefined ? data[key] : ""
                    data[key] = data[key] != null ? data[key] : ""
                }
                const start = new Date(Date.now())
                var template = fs.readFileSync(templatePath, 'binary') as any as Buffer
                const buf = await createReport({
                    template, data,
                    additionalJsContext: {
                        buffer: (buffer:Buffer) => {
                            let { width=1, height=1 } = sizeOf(buffer)
                            const ratio = height / width
                            width = Math.min(width / 10, 17)
                            height = Math.floor(width * ratio)
                            const data = buffer.toString("base64")
                            return { width, height, data, extension: '.png' };
                        },
                    }
                });
                // const buf = doc.getZip().generate({ type: 'nodebuffer' });
                console.warn(`docx converted at ${(Date.now() - start.getTime()) / 1000.0}s`);
                const extend = '.pdf'
                const file = Buffer.from(buf.buffer) //fs.readFileSync(tmpPath);
                libre.convert(file, extend, undefined, async (err, buffer) => {
                    console.warn(`pdf converted at ${(Date.now() - start.getTime()) / 1000.0}s`);
                    // fs.unlinkSync(tmpPath)
                    if (err) {
                        return reject(err)
                    }
                    try {
                        const dirname = Path.dirname(savePath)
                        if (!fs.existsSync(dirname)) {
                            fs.mkdirSync(dirname, { recursive: true });
                        }
                        fs.writeFileSync(savePath, buffer);
                        console.warn(`finished at ${(Date.now() - start.getTime()) / 1000.0}s`);
                        return resolve({ buffer })
                    } catch (error) {
                        return reject(error)
                    }
                });
            } catch (error) {
                reject(error)
            }
        })
    }
    static GenerateTemplate(templatePath: string, savePath: string, data: any) {
        return new Promise(async (resolve, reject) => {
            const stack = new Error().stack
            try {
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
                const buf = doc.getZip().generate({ type: 'nodebuffer' });
                console.warn(`docx converted at ${(Date.now() - start.getTime()) / 1000.0}s`);

                // const tmpPath = `tmp/file_${randomInt(1024)}.docx`;
                // fs.writeFileSync(tmpPath, buf);
                //word to pdf
                // const file = fs.readFileSync(tmpPath);
                const extend = '.pdf'
                const file = buf//fs.readFileSync(tmpPath);
                libre.convert(file, extend, undefined, async (err, buffer) => {
                    console.warn(`pdf converted at ${(Date.now() - start.getTime()) / 1000.0}s`);
                    // fs.unlinkSync(tmpPath)
                    if (err) {
                        console.error(`Error converting file`);
                        console.error(err);
                        return reject(err)
                    }
                    try {
                        const dirname = Path.dirname(savePath)
                        if (!fs.existsSync(dirname)) {
                            fs.mkdirSync(dirname, { recursive: true });
                        }
                        fs.writeFileSync(savePath, buffer);
                        console.warn(`finished at ${(Date.now() - start.getTime()) / 1000.0}s`);
                        return resolve({ buffer })
                    } catch (error) {
                        return reject(error)
                    }
                });
            } catch (error) {
                console.error({ templatePath, savePath });
                console.error(stack);
                reject(error)
            }
        })
    }
    static Start() {
        PDFLib.GenerateTemplate("docs/DNC_MODELE.docx",
            "uploads/DNC_MODELE_filled.pdf",
            { firstname: "Fares", lastname: "MANAI", address: "Manzah 7" },
        )
    }

}

module.exports = PDFLib;