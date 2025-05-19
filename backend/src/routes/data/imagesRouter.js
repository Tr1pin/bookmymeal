import { Router } from "express";
import {  ImageController } from "../../controllers/data/imagesController.js";
import { uploadImage } from "../../middlewares/multer.middleware.js";

const router = Router();

router.post('/upload', uploadImage.single('file'),  ImageController.uploadImage);
router.get('/:name', ImageController.getImageUrl);
router.delete('/:name', ImageController.deleteImage);

export default router;