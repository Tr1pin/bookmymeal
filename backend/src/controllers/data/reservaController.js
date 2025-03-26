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

    static async createReservation ( req, res ) {
        try {
            const { usuario_id, fecha, hora, estado, personas } = req.body;
            const newReserva = await ReservaModel.createReservation( { usuario_id, fecha, hora, estado, personas } );

            res.status(200).json(newReserva);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message }); 
        }
    }

    static async updateReservation ( res, req ) {
        try {
            const { reserva_id, estado, date, hour, personas } = req.body;
            const updateres = await ReservaModel.updateReservation( { reserva_id, estado, date, hour, personas } );
            
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