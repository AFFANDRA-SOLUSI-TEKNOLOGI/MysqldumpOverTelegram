import fs from "fs";

const getFileSizeInMegabytes = (filePath: string): number => {
  const fileSizeInMegabytes = fs.statSync(filePath).size / (1024 * 1024);

  return fileSizeInMegabytes;
};

export default getFileSizeInMegabytes;
