import XLSX from "xlsx"
import fs from "fs"
import { parse } from "csv-parse"
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
  static CsvToRecords(inPath: string, encodeing: BufferEncoding) {
    return new Promise((resolve, reject) => {
      try {
        const csvData = fs.readFileSync(inPath, encodeing);
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
}