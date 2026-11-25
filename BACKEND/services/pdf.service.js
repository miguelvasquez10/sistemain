const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const A4_OPTIONS = {
  size: 'A4',
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
  bufferPages: true,
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Sin respuesta';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Sin respuesta';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function drawHeader(doc, title, subtitle = '') {
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor('#0f172a')
    .text(title, { align: 'center' });

  if (subtitle) {
    doc
      .moveDown(0.4)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#475569')
      .text(subtitle, { align: 'center' });
  }

  doc.moveDown(1.2);

  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.moveDown(1.2);
}

function drawSectionTitle(doc, title) {
  const y = doc.y + 4;

  if (y > doc.page.height - doc.page.margins.bottom - 40) {
    doc.addPage();
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor('#1d4ed8')
    .text(title);

  doc.moveDown(0.5);
}

function drawMetaRow(doc, label, value) {
  const labelWidth = 140;
  const startX = doc.page.margins.left;
  const availableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const neededHeight = doc.heightOfString(formatValue(value), {
    width: availableWidth - labelWidth,
  });

  if (doc.y + neededHeight + 12 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  const y = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .fillColor('#0f172a')
    .text(`${label}:`, startX, y, {
      width: labelWidth,
      continued: false,
    });

  doc
    .font('Helvetica')
    .fontSize(10.5)
    .fillColor('#334155')
    .text(formatValue(value), startX + labelWidth, y, {
      width: availableWidth - labelWidth,
    });

  doc.moveDown(0.4);
}

function drawFieldBlock(doc, label, value) {
  const pageBottom = doc.page.height - doc.page.margins.bottom;
  const boxWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const labelHeight = doc.heightOfString(label, { width: boxWidth - 24 });
  const valueHeight = doc.heightOfString(formatValue(value), {
    width: boxWidth - 24,
  });

  const boxHeight = Math.max(52, labelHeight + valueHeight + 28);

  if (doc.y + boxHeight > pageBottom) {
    doc.addPage();
  }

  const x = doc.page.margins.left;
  const y = doc.y;

  doc
    .roundedRect(x, y, boxWidth, boxHeight, 8)
    .fillAndStroke('#f8fafc', '#cbd5e1');

  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(label, x + 12, y + 10, {
      width: boxWidth - 24,
    });

  doc
    .fillColor('#334155')
    .font('Helvetica')
    .fontSize(10.5)
    .text(formatValue(value), x + 12, y + 28, {
      width: boxWidth - 24,
    });

  doc.y = y + boxHeight + 10;
}

function resolvePhotoPath(photoUrl) {
  if (!photoUrl) return null;

  const cleanUrl = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
  return path.join(process.cwd(), cleanUrl);
}

function drawPhotos(doc, photos = []) {
  drawSectionTitle(doc, 'Registro fotográfico');

  if (!photos.length) {
    doc
      .font('Helvetica')
      .fontSize(10.5)
      .fillColor('#64748b')
      .text('Este registro no tiene fotografías asociadas.');
    doc.moveDown();
    return;
  }

  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 14;
  const cols = 2;
  const imageWidth = (usableWidth - gap) / cols;
  const imageHeight = 180;

  let col = 0;

  for (let i = 0; i < photos.length; i += 1) {
    const photo = photos[i];
    const filePath = resolvePhotoPath(photo.url);

    if (col === 0 && doc.y + imageHeight + 35 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

    const x =
      doc.page.margins.left + col * (imageWidth + gap);
    const y = doc.y;

    doc
      .roundedRect(x, y, imageWidth, imageHeight, 6)
      .strokeColor('#cbd5e1')
      .stroke();

    if (filePath && fs.existsSync(filePath)) {
      try {
        doc.image(filePath, x + 4, y + 4, {
          fit: [imageWidth - 8, imageHeight - 8],
          align: 'center',
          valign: 'center',
        });
      } catch (error) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#ef4444')
          .text('No se pudo renderizar la imagen', x + 10, y + 80, {
            width: imageWidth - 20,
            align: 'center',
          });
      }
    } else {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text('Imagen no encontrada', x + 10, y + 80, {
          width: imageWidth - 20,
          align: 'center',
        });
    }

    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#475569')
      .text(`Foto ${i + 1}`, x, y + imageHeight + 6, {
        width: imageWidth,
        align: 'center',
      });

    if (col === 1 || i === photos.length - 1) {
      doc.y = y + imageHeight + 24;
      col = 0;
    } else {
      col = 1;
    }
  }

  doc.moveDown();
}

function addPageNumbers(doc) {
  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);

    const pageNumberText = `Página ${i + 1} de ${range.count}`;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#64748b')
      .text(
        pageNumberText,
        doc.page.margins.left,
        doc.page.height - doc.page.margins.bottom + 10,
        {
          width:
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
          align: 'center',
        }
      );
  }
}

function buildResponsePdf(res, payload) {
  const {
    projectName,
    serviceName,
    formName,
    formDescription,
    responseId,
    createdAt,
    fields,
    data,
    photos,
  } = payload;

  const doc = new PDFDocument(A4_OPTIONS);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=formulario-${responseId}.pdf`
  );

  doc.pipe(res);

  drawHeader(
    doc,
    formName || 'Reporte de formulario',
    'Sistema V Ingeniería'
  );

  drawSectionTitle(doc, 'Información general');
  drawMetaRow(doc, 'Proyecto', projectName || 'Sin proyecto');
  drawMetaRow(doc, 'Servicio', serviceName || 'Sin servicio');
  drawMetaRow(doc, 'Formulario', formName || 'Sin formulario');
  drawMetaRow(doc, 'Descripción', formDescription || 'Sin descripción');
  drawMetaRow(
    doc,
    'Fecha de registro',
    createdAt ? new Date(createdAt).toLocaleString('es-CO') : 'Sin fecha'
  );
  drawMetaRow(doc, 'ID del registro', responseId);

  drawSectionTitle(doc, 'Respuestas');

  const fieldsSorted = Array.isArray(fields)
    ? [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  if (!fieldsSorted.length) {
    const entries = Object.entries(data || {});

    if (!entries.length) {
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor('#64748b')
        .text('No hay respuestas registradas.');
    } else {
      entries.forEach(([key, value]) => {
        drawFieldBlock(doc, key, value);
      });
    }
  } else {
    fieldsSorted.forEach((field) => {

  const value = data ? data[field.id] : undefined;

  drawFieldBlock(doc, field.label, value);

});

 const dataKeys = Object.keys(data || {}).filter(
  (key) => !key.startsWith('preview_')
);

const knownIds = new Set(fieldsSorted.map((field) => String(field.id)));

dataKeys
  .filter((key) => !knownIds.has(key))
  .forEach((extraKey) => {

    drawFieldBlock(doc, extraKey, data[extraKey]);

  });
  }

  drawPhotos(doc, photos);

  addPageNumbers(doc);

  doc.end();
}

module.exports = {
  buildResponsePdf,
};
