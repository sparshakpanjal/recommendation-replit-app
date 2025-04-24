import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { Parser as Json2CsvParser } from 'json2csv';

const dataDir = path.resolve('./data');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Utility to read CSV as JSON
export const readCSV = (filename) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(dataDir, filename);

    if (!fs.existsSync(filePath)) {
      return resolve([]); // Return empty if file doesn't exist
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Utility to write JSON to CSV
export const writeCSV = (filename, jsonData) => {
  const filePath = path.join(dataDir, filename);
  const json2csv = new Json2CsvParser();
  const csv = json2csv.parse(jsonData);

  fs.writeFileSync(filePath, csv, 'utf8');
};

// Optional utility to append a single record to CSV
export const appendCSV = (filename, newEntry) => {
  const filePath = path.join(dataDir, filename);
  const headersExist = fs.existsSync(filePath);

  const keys = Object.keys(newEntry);
  const line = (headersExist ? '' : `${keys.join(',')}\n`) + keys.map(k => newEntry[k]).join(',') + '\n';

  fs.appendFileSync(filePath, line);
};

// Dummy dbConnect for compatibility
export const dbConnect = async () => {
  console.log('🔗 CSV-based pseudo-DB ready.');
  return true;
};
