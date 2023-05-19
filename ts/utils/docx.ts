import fs from 'fs'
import libre from 'libreoffice-convert'
import Path from 'path'


export default class DocxLib {
    static DocxToPdf(file: string | Buffer, savePath?: string): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const stack = new Error().stack
            try {
                const extend = '.pdf'
                let buffer: Buffer = typeof file == "string" ? fs.readFileSync(file) : file
                libre.convert(buffer, extend, undefined, async (err, pdfBuffer) => {
                    if (err) { return reject(err) }
                    try {
                        if (savePath) {
                            const dirname = Path.dirname(savePath)
                            if (!fs.existsSync(dirname)) {
                                fs.mkdirSync(dirname, { recursive: true });
                            }
                            fs.writeFileSync(savePath, pdfBuffer);
                        }
                        return resolve(pdfBuffer)
                    } catch (error) { return reject(error) }
                });
            } catch (error) { reject(error) }
        })
    }

}

module.exports = DocxLib;