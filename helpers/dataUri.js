import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.name).toString();
   return parser.format(extName, file.data);
};

export default getDataUri;
