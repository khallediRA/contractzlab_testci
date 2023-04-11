const pdfUtil = require('pdf-to-text')
import { randomUUID } from 'crypto';


class PDFToTextLib {
  static async PdfToText(pdfFile: Buffer | string): Promise<string> {
    let tempFilePath = ""
    if (pdfFile instanceof Buffer) {
      tempFilePath = `tmp/${randomUUID()}.pdf`
    } else
      tempFilePath = pdfFile
    return new Promise((resolve, reject) => {
      pdfUtil.pdfToText(tempFilePath, function (err: any, data: string) {
        if (err) reject(err);
        resolve(data); //print all text    
      });

    })
  }
}