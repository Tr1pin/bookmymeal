import { Router } from "express";
import {  ImageController } from "../../controllers/data/imagesController.js";

const router = Router();

router.get('/:name', ImageController.getImageUrl);
router.delete('/:name', ImageController.deleteImage);

export default router;