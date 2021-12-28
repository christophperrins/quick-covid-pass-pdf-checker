import { access, mkdir, readdir, readFile, rename, writeFile } from 'fs/promises';
import { getTextFromFile, isImage, isPdf } from './fileUtils';

const SUCCESS_FOLDER = process.cwd() + "/valid";
const UNSUCCESSFUL_FOLDER = process.cwd() + "/invalid";
const CSV_FILE_NAME = "summary.csv";
const CSV_FILE_LOCATION = process.cwd() + "/" + CSV_FILE_NAME;

const verifyTextContainsExpectedCopy = (string: string) => {
  if(!string.includes("Dose")) return false;
  if(!string.includes("Date of vaccination")) return false;
  if(!string.includes("Vaccine product")) return false;
  if(!string.includes("Manufacturer")) return false;
  if(!string.includes("Vaccine")) return false;
  if(!string.includes("Batch number")) return false;
  if(!string.includes("Disease targeted")) return false;
  if(!string.includes("Country of vaccination")) return false;
  if(!string.includes("Issuer")) return false;
  if(!string.includes("Administrating centre")) return false;
  return true;
}

const createDirectory = async (path: string) : Promise<void> => {
  try {
    return await mkdir(path);
  } catch {
    return Promise.resolve();
  }
}

const getCsvData = async () : Promise<string> => {
  try {
    await access(CSV_FILE_LOCATION);
    return readFile(CSV_FILE_LOCATION, "utf-8");
  } catch {
    return Promise.resolve("File name, Validity\n");
  }
}

const app = async () => {
  const files: string[] = await readdir(process.cwd());
  await createDirectory(SUCCESS_FOLDER);
  await createDirectory(UNSUCCESSFUL_FOLDER);
  let writeCsvData = await getCsvData();
  const fileTasks = files.map(async (file) => {
    const fileLocation = process.cwd()+"/"+file;
    if (!isImage(file) && !isPdf(file) ) {
      return;
    }

    const text = await getTextFromFile(fileLocation);
    
    if (verifyTextContainsExpectedCopy(text)) {
      await rename(fileLocation, SUCCESS_FOLDER + "/" + file);
      writeCsvData += `${file}, valid\n`;
      return Promise.resolve();
    } else {
      await rename(fileLocation, UNSUCCESSFUL_FOLDER + "/" + file);
      writeCsvData += `${file}, invalid\n`;
      return Promise.resolve();
    }
  })
  
  await Promise.all(fileTasks);
  await writeFile(CSV_FILE_LOCATION, writeCsvData);
}

app();