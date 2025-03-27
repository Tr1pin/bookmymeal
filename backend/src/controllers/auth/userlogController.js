import { UserAuthModel } from "../../models/auth/userlogModel.js";

export class UserAuthController {
    static async login(req, res) {
      try {
          const { email, password } = req.body;
          const resp = await UserAuthModel.login({ email, password });

          res.status(200).json(resp);
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
    }

    static async register( req, res ) {
       try {
            const { nombre, email, password } = req.body;
            const newUser = await UserAuthModel.register({ nombre, email, password });

            res.status(201).json(newUser);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
}