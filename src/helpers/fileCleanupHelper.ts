import fs from "fs";

/**
 * Deletes multer temp files from local disk.
 * Always call this in finally block — runs on both success and failure.
 */
export const cleanupTempFiles = (files: Express.Multer.File[]): void => {
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};
