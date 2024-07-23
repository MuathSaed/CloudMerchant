import { RequestHandler } from "express";
import formidable, { File } from "formidable";

declare global {
  namespace Express {
    interface Request {
      files: { [key: string]: File | File[] };
    }
  }
}

let processFileUpload: RequestHandler = async (req, res, next) => {
  let form = formidable();

  if (!req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }

  let [fields, files] = await form.parse(req);
  console.log(fields);
  if (!req.body) req.body = {};

  for (let key in fields) {
    req.body[key] = fields[key]![0];
  }

  if (!req.files) req.files = {};

  for (let key in files) {
    let actualFiles = files[key];
    if (!actualFiles) break;

    if (actualFiles.length > 1) {
      req.files[key] = actualFiles;
    } else {
      req.files[key] = actualFiles[0];
    }
  }
  next();
};

export default processFileUpload;