const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // 🔴 CLAVE para 587

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS.replace(/\s/g, ""),
  },

  tls: {
    rejectUnauthorized: false, // ✔️ igual que el sistema que funciona
  },
});

exports.sendRecoveryMail = async (to, link) => {
  await transporter.sendMail({
    from: `"Sistema V Ingeniería" <${process.env.MAIL_USER}>`,
    to,
    subject: "Recuperación de contraseña – Sistema V Ingeniería",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Recuperación de contraseña</title>
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

<!-- CONTENIDO -->
<tr>
<td style="padding:35px; color:#334155; font-size:14px; line-height:1.7;">

<h2 style="color:#1e40af; margin-top:0;">
Recuperación de contraseña
</h2>

<p>
Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en
<strong>Sistema V Ingeniería</strong>.
</p>

<p>
Para continuar con el proceso de recuperación, haz clic en el siguiente botón:
</p>

<!-- BOTÓN -->
<table cellpadding="0" cellspacing="0" style="margin:30px 0;">
<tr>
<td align="center">

<a href="${link}"
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

Restablecer contraseña

</a>

</td>
</tr>
</table>

<p>
Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
</p>

<p style="word-break:break-all;">
<a href="${link}" style="color:#2563eb;">
${link}
</a>
</p>

<p style="margin-top:25px;">
⏱️ <strong>Este enlace expirará en 1 hora</strong> por razones de seguridad.
</p>

<p>
Si no solicitaste este cambio de contraseña, puedes ignorar este mensaje.
Tu contraseña permanecerá segura y sin modificaciones.
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