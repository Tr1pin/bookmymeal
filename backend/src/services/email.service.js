import 'dotenv/config';
import nodemailer from 'nodemailer';


export class EmailService {
  static async sendEmail ({ to, toName, subject, message, data = {} }){

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
        const { numeroPedido, productos, total, tipoEntrega, direccionEntrega } = data;
        
        // Generar HTML para el resumen de productos
        const resumenPedido = productos ? productos.map(producto => `
          <div style="border-bottom: 1px solid #eee; padding: 12px 0;">
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${producto.cantidad} x ${producto.nombre} = €${parseFloat(producto.subtotal).toFixed(2)}
            </div>
            <div style="color: #666; font-size: 0.9em;">
              Precio unitario: €${parseFloat(producto.precio).toFixed(2)}
            </div>
          </div>
        `).join('') : '';

        // Información de entrega
        const infoEntrega = tipoEntrega === 'domicilio' ? 
          `<p><b>Entrega a domicilio:</b><br>${direccionEntrega || 'Dirección no especificada'}</p>` :
          `<p><b>Recogida en tienda</b></p>`;

        transporter.sendMail({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
          to: `${toName} <${to}>`,
          subject: "Tu pedido ha sido confirmado",
          html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1e3a8a; padding: 12px 20px; display: inline-block; margin: 0 0 20px 0;">¡Pedido confirmado!</h2>
            <p>Hola <b>${toName}</b>,</p>
            <p>Tu pedido <b>#${numeroPedido}</b> ha sido recibido y está en preparación.</p>
            
            ${infoEntrega}
            
            <p><b>Resumen de tu pedido:</b></p>
            <div style="margin: 16px 0; border: 1px solid #ddd; border-radius: 4px; padding: 16px;">
              ${resumenPedido}
            </div>
            
            <div style="text-align: right; font-size: 1.2em; font-weight: bold; margin: 20px 0; padding: 12px; background-color: #f5f5f5; border-radius: 4px;">
              <div style="margin-bottom: 8px;"><b>Total (IVA incluido): €${parseFloat(total).toFixed(2)}</b></div>
            </div>
            
            <p>Te avisaremos cuando tu pedido esté listo.</p>
            <p>¡Gracias por confiar en BookMyMeal!</p>
            <hr>
            <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
          </div>
          `
        });
        break;
      
      case "reserva":
        const { fecha, hora, personas, numeroMesa } = data;
        
        // Formatear la fecha para mostrarla mejor
        const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        transporter.sendMail({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`,
          to: `${toName} <${to}>`,
          subject: "Tu reserva ha sido confirmada",
          html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1e3a8a; padding: 12px 20px; display: inline-block; margin: 0 0 20px 0;">¡Reserva confirmada!</h2>
            <p>Hola <b>${toName}</b>,</p>
            <p>¡Gracias por reservar con <b>BookMyMeal</b>!</p>
            
            <p><b>Detalles de tu reserva:</b></p>
            <div style="margin: 16px 0; border: 1px solid #ddd; border-radius: 4px; padding: 16px; background-color: #f9f9f9;">
              <div style="margin-bottom: 12px;">
                <span style="font-weight: bold; color: #1e3a8a;">Fecha:</span> ${fechaFormateada}
              </div>
              <div style="margin-bottom: 12px;">
                <span style="font-weight: bold; color: #1e3a8a;">Hora:</span> ${hora}
              </div>
              <div style="margin-bottom: 12px;">
                <span style="font-weight: bold; color: #1e3a8a;">Nº Personas:</span> ${personas}
              </div>
              ${numeroMesa ? `<div style="margin-bottom: 12px;">
                <span style="font-weight: bold; color: #1e3a8a;">Mesa:</span> ${numeroMesa}
              </div>` : ''}
            </div>
            
            <p>¡Te esperamos!</p>
            <p style="margin-top: 20px;">Saludos,<br>El equipo de BookMyMeal</p>
            <hr>
            <small>© ${new Date().getFullYear()} BookMyMeal. Todos los derechos reservados.</small>
          </div>
          `
        });
        break;
      
      default:
        break;
    }
   
  }

}