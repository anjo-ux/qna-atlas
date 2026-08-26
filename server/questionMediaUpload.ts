/**
 * Admin question image upload — saves to client/public/question-images/.
 */
import * as fs from "fs";
import * as path from "path";
import multer from "multer";
import { randomUUID } from "crypto";

export const QUESTION_IMAGES_PUBLISHED_DIR = path.join(
  process.cwd(),
  "client/public/question-images"
);

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const questionMediaUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(QUESTION_IMAGES_PUBLISHED_DIR, { recursive: true });
      cb(null, QUESTION_IMAGES_PUBLISHED_DIR);
    },
    filename(_req, file, cb) {
      const ext =
        EXT_BY_MIME[file.mimetype] ??
        path.extname(file.originalname).toLowerCase() ||
        ".jpg";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
      return;
    }
    cb(null, true);
  },
});

export function publicQuestionImageUrl(filename: string): string {
  return `/question-images/${filename}`;
}
