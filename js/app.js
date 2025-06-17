window.addEventListener('DOMContentLoaded', () => {
  const btn        = document.getElementById('btn-generar');
  const nombreIn   = document.getElementById('nombre');
  const cantIn     = document.getElementById('cantidad');
  const txtNombre  = document.getElementById('txt-nombre');
  const txtCantidad= document.getElementById('txt-cantidad');
  const qrDiv      = document.getElementById('qr-code');
  const invitDiv   = document.getElementById('invitacion');

  btn.addEventListener('click', () => {
    // 1) Actualizar datos
    const nombre = nombreIn.value.trim() || '[Nombre]';
    const cant   = cantIn.value.trim()   || '0';
    txtNombre.textContent   = nombre;
    txtCantidad.textContent = ` ${cant}`;

    // 2) Generar QR rosado
    qrDiv.innerHTML = '';
    const filename = `invitacion_${nombre.replace(/\s+/g,'_')}.png`;
    const urlPNG   = `https://tusitio.com/invitaciones/${filename}`;
    new QRCode(qrDiv, {
      text: urlPNG,
      width: 100, height: 100,
      colorDark: "#efa0a1",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    // 3) Capturar a PNG de alta resolución
    html2canvas(invitDiv, {
        zoom: 10,
        scale: 4,            // 4× más píxeles
      useCORS: true,
      backgroundColor: null
    }).then(canvas => {
      // 4) Forzar descarga como PNG
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png', 1 /* calidad 100% */);
    }).catch(err => console.error(err));
  });
});
