import { ReservaModel } from "../../models/data/reservaModel.js";

export class ReservaController {
    //Getters de Reservas
    static async getAll( req, res ) {
        try {
            const reservas = await ReservaModel.getAll();
            res.status(200).json(reservas);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    static async getById( req, res ) {
        try {
            const id = req.params.id;
            const reservas = await ReservaModel.getById({ id });

            res.status(200).json(reservas);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    static async getReservationByUser ( req, res ) {
        try {
            const id = req.params.id;
            const reservas = await ReservaModel.getReservationByUser({ id });

            res.status(200).json(reservas);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    } 

    static async getReservationByTable( req, res ) {
        try {
            const id = req.params.id;
            const reservas = await ReservaModel.getReservationByTable({ id });

            res.status(200).json(reservas);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    static async getReservationByDate ( req, res ) {
        try {
            const date = req.params.date;
            const reservas = await ReservaModel.getReservationByDate({ date });

            res.status(200).json(reservas);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    static async createReservationWithUserId ( req, res ) {
        try {
            const { usuario_id, fecha, hora, personas } = req.body;
            const newReserva = await ReservaModel.createReservationWithUserId( { usuario_id, fecha, hora, personas } );

            await EmailService.sendEmail({
                to: req.body.usuario.email, 
                toName: req.body.usuario.nombre, 
                subject: "reserva"
           });
            res.status(200).json(newReserva);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message }); 
        }
    }

    static async createReservation ( req, res ) {
        try {
            const { nombre, telefono, fecha, hora, personas } = req.body;
            const newReserva = await ReservaModel.createReservation( { nombre, telefono, fecha, hora, personas } );
            
            res.status(200).json(newReserva);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message }); 
        }
    }

    static async updateReservation ( req, res ) {
        try {
            const { id, estado, fecha, hora, personas } = req.body;
            const updateres = await ReservaModel.updateReservation( { id, estado, date: fecha, hour: hora, personas } );
            
            res.status(200).json(updateres);
        }catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }

    }

    static async checkReservation ( req, res ) {
        try {
            const { fecha, hora, personas } = req.body;
            const chechRes = await ReservaModel.checkReservation({ fecha, hora, personas });

            res.status(200).json(chechRes);
        }catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    static async deleteReservation ( req, res ) {
        try {
            const id = req.params.id;
            const delRes = await ReservaModel.deleteReservation({ id });

            res.status(200).json(delRes);
        }catch (err){
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }
}