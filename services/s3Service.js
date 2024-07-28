import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "../config.js";

const { accessKeyId, secretAccessKey, region, characters } = config;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const bucket = "game-development";

function randomString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}

const fileFilter = (allowedTypes) => (_req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype))
    return cb(
      new AppError(`File type must be ${allowedTypes.join(", ")}`, 422),
      false
    );
  return cb(null, true);
};

const storageS3 = (folder) =>
  multerS3({
    s3: s3Client,
    bucket,
    contentDisposition: "inline",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_req, file, cb) => {
      const name = `${folder}/${new Date().toISOString()}${randomString(10)}${
        file.originalname
      }`;
      cb(null, name);
    },
  });

const s3Service = {
  uploadS3({
    maxSize = 200,
    folder = "profile-images",
    allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
  }) {
    const limits = { fileSize: 1024 * 1024 * maxSize };
    return multer({
      storage: storageS3(folder),
      fileFilter: fileFilter(allowedTypes),
      limits,
    });
  },

  async deleteFile(key) {
    if (!key) return;
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const data = await s3Client.send(command);
      console.log("deleteFile", key, null, data);
    } catch (err) {
      console.error("Error deleting object:", err);
    }
  },
};

export default s3Service;
