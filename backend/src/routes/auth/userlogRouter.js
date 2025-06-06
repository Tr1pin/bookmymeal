import { Router } from "express";
import { UserAuthController } from "../../controllers/auth/userlogController.js";

const router = Router();

router.post("/login", UserAuthController.login);
router.post("/register", UserAuthController.register);
router.post("/login2FA", UserAuthController.login2FA);

export default router;
