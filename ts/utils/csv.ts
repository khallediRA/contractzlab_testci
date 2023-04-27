import XLSX from "xlsx"
import fs from "fs"
import { parse } from "csv-parse"
import { Parser } from "json2csv"
export class CSVLib {
  static XlsxToCsv(inPath: string, outPath: string) {
    // Load the XLSX file
    const workbook = XLSX.readFile(inPath);

    // Get the name of the first sheet
    const sheetName = workbook.SheetNames[0];

    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Write the CSV to a file
    fs.writeFileSync(outPath, csv);
  }
  static XlsxToRecords(inPath: string): any[][] {
    let recordsPerSheet: any[][] = []
    // Load the XLSX file
    const workbook = XLSX.readFile(inPath);

    for (const sheetName of workbook.SheetNames) {
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(sheetData);
      recordsPerSheet.push(sheetData)

    }
    return recordsPerSheet

  }
  static CsvToRecords(inPath: string, encoding?: BufferEncoding): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const csvData = fs.readFileSync(inPath, encoding);
        // Parse the CSV data
        parse(csvData, {
          delimiter: ',', // Set the delimiter to comma
          columns: true, // Treat the first row as headers
        }, (err, records) => {
          if (err) {
            reject(err)
            return;
          }
          resolve(records)
        });
      } catch (error) {
        reject(error)
      }

    })
  }
  static RecordsToCSV(records: any[], outPath: string, encoding?: BufferEncoding) {
    // Convert the records to CSV data
    const parser = new Parser();
    const csvData = parser.parse(records);

    // Write the CSV data to a file
    fs.writeFileSync(outPath, csvData, { encoding });

  }
}