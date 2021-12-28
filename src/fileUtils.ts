import { readFile } from "fs/promises";
import PdfParse from "pdf-parse";
import { fromFileWithPath } from "textract";

export const runOcrOnImage = (path: string) : Promise<string> => {
  return new Promise((resolve, reject) => {
    fromFileWithPath(path, (err, text) => {
      if (err) {
        return reject(err);
      }
      return resolve(text);
    })
  })
}

export const parsePdf = async (path: string) : Promise<string> => {
  const dataBuffer = await readFile(path);
  return PdfParse(dataBuffer)
    .then(data => {
      return data.text
    });
}

const getExtension = (filePath: string) => {
  const fileSplit = filePath.split(".");
  const extension = fileSplit[fileSplit.length-1];
  return extension;
}

export const isImage = (filePath: string) => {
  const extension = getExtension(filePath);
  return extension === "gif" || extension === "jpg" || extension === "jpeg" || extension === "png";
}

export const isPdf = (filePath: string) => {
  const extension = getExtension(filePath);
  return extension === "pdf";
}

export const getTextFromFile = (filePath: string) : Promise<string> => {
  if (isImage(filePath)) {
    return runOcrOnImage(filePath);
  } else if (isPdf(filePath)) {
    return parsePdf(filePath);
  }
  return Promise.reject();
}