import fs from "fs";

const isFileCreatedToday = (filePath: string): boolean => {
  const fileStat = fs.statSync(filePath);
  const today = new Date();

  const isToday: boolean = fileStat.birthtime.getDate() === today.getDate() && fileStat.birthtime.getMonth() === today.getMonth() && fileStat.birthtime.getFullYear() === today.getFullYear();

  return isToday;
};

const removeYesterdayBackup = (backupPath: string): void => {
  try {
    const files = fs.readdirSync(backupPath);

    files.forEach((file) => {
      const filePath = backupPath.concat("/", file);
      let createdToday = isFileCreatedToday(filePath);
      if (createdToday) {
        return;
      } else {
        fs.rmSync(filePath);
      }
    });
  } catch (error) {
    console.log(`[REMOVE YESTERDAY BACKUP ERR]`, error);
  }
};

export default removeYesterdayBackup;
