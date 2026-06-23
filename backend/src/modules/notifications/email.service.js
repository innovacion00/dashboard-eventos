import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.GMAIL_USER || !env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN) {
    logger.warn('Credenciales de Gmail no configuradas — los correos no se enviarán');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: env.GMAIL_USER,
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
    },
  });

  return transporter;
}

function buildHtml({ title, message, actionUrl }) {
  const buttonHtml = actionUrl
    ? `<a href="${actionUrl}" style="display:inline-block;margin-top:18px;padding:12px 28px;background:#A17C2D;color:#fff;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;">Ver detalle</a>`
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f2ed;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="height:6px;background:linear-gradient(90deg,#A17C2D 0%,#C8A350 50%,#A17C2D 100%);"></div>
    <div style="padding:36px 40px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:20px;font-weight:700;color:#A17C2D;">GEH Events</span>
        <span style="font-size:14px;color:#8A8378;margin-left:8px;">Hotel Windsor House</span>
      </div>
      <h2 style="margin:0 0 12px;font-size:18px;color:#2A2723;">${title}</h2>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#46423B;">${message}</p>
      <div style="text-align:center;">${buttonHtml}</div>
    </div>
    <div style="padding:16px 40px;border-top:1px solid #ECE5D5;text-align:center;">
      <span style="font-size:11px;color:#A39B8C;">GEH Events Command Center — Hotel Windsor House</span>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail({ to, subject, title, message, actionUrl, attachments }) {
  const t = getTransporter();
  if (!t) return;

  const fullActionUrl = actionUrl && !actionUrl.startsWith('http')
    ? `${env.CORS_ORIGIN}${actionUrl}`
    : actionUrl;

  try {
    await t.sendMail({
      from: `"GEH Events — Hotel Windsor House" <${env.GMAIL_USER}>`,
      to,
      subject,
      html: buildHtml({ title, message, actionUrl: fullActionUrl }),
      attachments,
    });
    logger.info({ to, subject }, 'Correo enviado');
  } catch (err) {
    logger.error({ err, to, subject }, 'Error al enviar correo');
  }
}
