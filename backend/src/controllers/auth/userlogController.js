import { UserAuthModel } from "../../models/auth/userlogModel.js";
import { EmailService } from "../../services/email.service.js";

export class UserAuthController {
    static async login(req, res) {
      try {
          const { email, password } = req.body;
          const resp = await UserAuthModel.login({ email, password });

          await EmailService.sendEmail({ to: email, toName: resp.nombre, subject: "login"});
          res.status(200).json(resp);
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
    }

    static async register( req, res ) {
       try {
            const { nombre, email, password, telefono } = req.body;
            const newUser = await UserAuthModel.register({ nombre, email, password, telefono });

            await EmailService.sendEmail({ to: email, toName: nombre, subject: "registro"});
            res.status(201).json(newUser);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
}