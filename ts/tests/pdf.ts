import { PDFToTextLib } from "../services/pdfToText";


async function test() {
  const text = await PDFToTextLib.PdfToText("docs/lorem.pdf")
  console.log(text);
}
test()