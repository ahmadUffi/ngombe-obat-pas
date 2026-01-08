import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/gif",
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Tipe file tidak didukung. Hanya gambar diperbolehkan."));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
