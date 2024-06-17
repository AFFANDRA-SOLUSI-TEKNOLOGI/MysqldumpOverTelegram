import fs from "fs";
import archiver from "archiver";

type Files = {
  path: string;
  name: string;
};

const compressFile = (outputPath: string, files: Files[], callback: (error: Error | null, outputPath?: string) => void): string => {
  try {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", function () {
      if (callback) callback(null, outputPath);
    });

    archive.on("error", function (err) {
      if (callback) callback(err);
      throw err;
    });

    archive.pipe(output);

    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    archive.finalize();
  } catch (error) {
    console.error(`COMPRESS FILE ERR`, error);
  } finally {
    return outputPath;
  }
};

export default compressFile;
