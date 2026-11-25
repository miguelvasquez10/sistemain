const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS.replace(/\s/g, ""),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendSecurityReminderMail = async (to, nombre) => {
  const systemUrl = process.env.FRONTEND_URL;

  await transporter.sendMail({
    from: `"Sistema Cuentas de Cobro" <${process.env.MAIL_USER}>`,
    to,
    subject:
      "Recordatorio informativo – Seguridad Social | Sistema Cuentas de Cobro",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Recordatorio Seguridad Social</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F6F5; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F5; padding:30px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background-color:#0A6A50; padding:22px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:20px;">
Institución Universitaria Colegio Mayor de Antioquia
</h1>
<p style="color:#E6F2EE; margin:6px 0 0; font-size:13px;">
Sistema de Cuentas de Cobro
</p>
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:35px; color:#333333; font-size:14px; line-height:1.7;">

<h2 style="color:#0A6A50; margin-top:0;">
Recordatorio de Seguridad Social
</h2>

<p>
Hola <strong>${nombre}</strong>,
</p>

<p>
Te enviamos este mensaje porque te encuentras registrado(a) en el 
<strong>Sistema de Cuentas de Cobro</strong> y actualmente tienes un contrato vigente asociado a tu cuenta.
</p>

<p>
Este es un recordatorio informativo para que verifiques el cumplimiento oportuno del pago de tu <strong>seguridad social</strong>, conforme a tus obligaciones contractuales.
</p>

<p>
El sistema realiza este envío automáticamente el día <strong>2 de cada mes</strong> a los usuarios con contratos activos registrados en la plataforma.
</p>

<hr style="margin:25px 0; border:none; border-top:1px solid #E5E5E5;" />

<p style="font-weight:bold; color:#0A6A50;">
¿Ya realizaste el pago?
</p>

<p>
Si ya efectuaste el pago de tu seguridad social, te invitamos a ingresar al sistema para generar tus documentos.
</p>

<p>
Recuerda adjuntar:
</p>

<ul style="margin-top:10px;">
<li>📎 Planilla de seguridad social</li>
<li>📎 Comprobante de pago</li>
</ul>

<!-- BOTÓN -->
<table cellpadding="0" cellspacing="0" style="margin:30px 0;">
<tr>
<td align="center">
<a href="${systemUrl}"
   style="
     background-color:#0A6A50;
     color:#ffffff;
     padding:14px 28px;
     text-decoration:none;
     border-radius:6px;
     font-weight:bold;
     display:inline-block;
     font-size:14px;
   ">
  Ingresar al Sistema Cuentas de Cobro
</a>
</td>
</tr>
</table>

<p style="margin-top:20px; font-size:13px; color:#555;">
Si este mensaje no aplica para tu situación actual, puedes ignorarlo con tranquilidad.
</p>

<p style="margin-top:30px; font-size:12px; color:#777;">
Este mensaje es únicamente informativo y no constituye notificación oficial.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background-color:#084F3C; padding:18px; text-align:center; color:#E6F2EE; font-size:12px;">
<p style="margin:0;">
Este correo fue generado automáticamente por el Sistema de Cuentas de Cobro.<br/>
Por favor, no respondas a este mensaje.
</p>
<p style="margin:6px 0 0;">
© ${new Date().getFullYear()} Institución Universitaria Colegio Mayor de Antioquia
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
    `,
  });
};

exports.sendWelcomeMail = async (to, nombre) => {
  const systemUrl = process.env.FRONTEND_URL;

  await transporter.sendMail({
    from: `"Sistema V Ingeniería" <${process.env.MAIL_USER}>`,
    to,
    subject: "Bienvenido(a) a Sistema V Ingeniería",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Bienvenido - Sistema V Ingeniería</title>
</head>

<body style="margin:0; padding:0; background-color:#F1F5F9; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:linear-gradient(135deg,#1e3a8a,#2563eb); padding:26px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:22px;">
Sistema V Ingeniería
</h1>

<p style="color:#dbeafe; margin:6px 0 0; font-size:13px;">
Plataforma de gestión para proyectos de ingeniería civil
</p>
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:35px; color:#334155; font-size:14px; line-height:1.7;">

<h2 style="color:#1e40af; margin-top:0;">
¡Bienvenido(a) al Sistema V Ingeniería!
</h2>

<p>
Hola <strong>${nombre}</strong>,
</p>

<p>
Tu cuenta ha sido creada exitosamente en <strong>Sistema V Ingeniería</strong>, una plataforma diseñada para facilitar la gestión, organización y seguimiento de procesos relacionados con proyectos de ingeniería civil.
</p>

<p>
A través del sistema podrás acceder a los diferentes módulos disponibles, gestionar información de proyectos, realizar modelaciones y administrar procesos de interventoría de forma eficiente.
</p>

<p>
Te invitamos a ingresar al sistema y comenzar a explorar las funcionalidades disponibles.
</p>

<!-- BOTÓN -->
<table cellpadding="0" cellspacing="0" style="margin:30px 0;">
<tr>
<td align="center">

<a href="${systemUrl}"
style="
background:linear-gradient(135deg,#2563eb,#1d4ed8);
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:8px;
font-weight:bold;
display:inline-block;
font-size:14px;
box-shadow:0 4px 10px rgba(37,99,235,0.3);
">

Ingresar al Sistema

</a>

</td>
</tr>
</table>

<p style="margin-top:20px; font-size:13px; color:#475569;">
Si tienes alguna duda o inconveniente con el acceso al sistema, comunícate con el administrador de la plataforma.
</p>

<p style="margin-top:30px; font-size:12px; color:#64748b;">
Este mensaje fue generado automáticamente por el sistema.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#1e3a8a; padding:18px; text-align:center; color:#cbd5f5; font-size:12px;">

<p style="margin:0;">
Este correo fue generado automáticamente por Sistema V Ingeniería.<br/>
Por favor, no respondas a este mensaje.
</p>

<p style="margin:6px 0 0;">
© ${new Date().getFullYear()} Sistema V Ingeniería
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  });
};