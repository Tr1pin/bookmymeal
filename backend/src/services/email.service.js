import 'dotenv/config';
import nodemailer from 'nodemailer';


export class EmailService {
  static async sendEmail ({ to, toName, subject, message }){

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    switch (subject) {
      case "registro":
        transporter.sendMail({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
          to: `${toName} <${to}>`,
          subject: "Bienvenido/a a BookMyMeal",
          html: `
             <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
                <!-- <img src="https://bookmymeal.com/images/logo.png" alt="BookMyMeal Logo"> -->
                <p>Hola <b>${toName}</b>,</p>
                <p>¡Gracias por registrarte en <b>BookMyMeal</b>! Ya puedes empezar a descubrir y reservar en los mejores restaurantes.</p>
                <p>¿Listo/a para tu primera experiencia gastronómica?</p>
                <a href="http://localhost:4200" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:4px;">Explora Restaurantes</a>
                <p>¡Buen provecho!<br>El equipo de BookMyMeal</p>
                <hr>
                <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
              </div>
          `
        });
        break;

      case "login":
          const codigo = Math.floor(100000 + Math.random() * 900000);
          transporter.sendMail({
            from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
            to: `${toName} <${to}>`,
            subject: "Código de inicio de sesión",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
              <p>Hola <b>${toName}</b>,</p>
              <p>Tu código de acceso para iniciar sesión en BookMyMeal es:</p>
              <div style="font-size: 2em; font-weight: bold; margin: 24px 0; color: #fff; background-color: #1e3a8a; padding: 8px 16px; border-radius: 4px; display: inline-block;">${codigo}</div>
              <p>Introduce este código en la aplicación para continuar.</p>
              <p>Si no has solicitado este código, ignora este mensaje.</p>
              <hr>
              <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
            </div>
            `
          });
        break;

      case "pedido":
        const numeroPedido = Math.floor(100000 + Math.random() * 900000);
        const resumenPedido = "";
        const total = 0;
        transporter.sendMail({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
          to: `${toName} <${to}>`,
          subject: "Tu pedido ha sido confirmado",
          html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
            <h2 style="color: #fff; background-color: #1e3a8a; padding: 8px 16px; border-radius: 4px; display: inline-block;">¡Pedido confirmado!</h2>
            <p>Hola <b>${toName}</b>,</p>
            <p>Tu pedido <b>#${numeroPedido}</b> ha sido recibido y está en preparación.</p>
            <p><b>Resumen de tu pedido:</b></p>
            <div style="margin: 16px 0;">${resumenPedido}</div>
            <p><b>Total:</b> ${total} €</p>
            <p>¡Gracias por confiar en BookMyMeal!</p>
            <hr>
            <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
          </div>
          `
        });
        break;
      
      case "reserva":
        const fecha = "";
        const hora = "";
        const personas = 0;
        transporter.sendMail({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
          to: `${toName} <${to}>`,
          subject: "Tu reserva ha sido confirmada",
          html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
            <h2 style="color: #fff; background-color: #1e3a8a; padding: 8px 16px; border-radius: 4px; display: inline-block;">¡Reserva confirmada!</h2>
            <p>Hola <b>${toName}</b>,</p>
            <p>¡Gracias por reservar con <b>BookMyMeal</b>!</p>
            <p><b>Detalles de tu reserva:</b></p>
            <ul>
              <li><b>Fecha:</b> ${fecha}</li>
              <li><b>Hora:</b> ${hora}</li>
              <li><b>Nº Personas:</b> ${personas}</li>
            </ul>
            <p>¡Te esperamos!</p>
            <hr>
            <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
          </div>
          `
        });
      default:
        break;
    }
   
  }

}