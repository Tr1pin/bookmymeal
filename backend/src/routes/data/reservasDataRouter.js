import { Router } from "express";
import { ReservaController } from "../../controllers/data/reservaController.js";

const router = Router();

//Getters de Reservas
router.get('', ReservaController.getAll);
router.get('/id/:id', ReservaController.getById);

router.get('/usuario/:id', ReservaController.getReservationByUser);
router.get('/mesa/:id', ReservaController.getReservationByTable);
router.get('/fecha/:date', ReservaController.getReservationByDate);

//Post de Reservas
router.post('', ReservaController.createReservation);
router.post('/with-user', ReservaController.createReservationWithUserId);
router.put('', ReservaController.updateReservation);
/* router.post('/checkReservation', ReservaController.checkReservation); */

//Delete de Reservas
router.delete('/:id', ReservaController.deleteReservation);

export default router;
