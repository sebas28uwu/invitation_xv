// Al cargar, lee parametros y dispara generación automática
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get("nombre");
  const cantidad = params.get("cantidad");
  if (nombre) {
    document.getElementById("nombre").value = nombre;
  }
  if (cantidad) {
    document.getElementById("cantidad").value = cantidad;
  }
  if (nombre || cantidad) {
    // Oculta controles para vista limpia opcionalmente
    document.getElementById("controles").style.display = "none";
    // Dispara la generación
    setTimeout(() => document.getElementById("btn-generar").click(), 100);
  }
});

// Tu lógica original
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-generar");
  const nombreIn = document.getElementById("nombre");
  const cantIn = document.getElementById("cantidad");
  const txtNombre = document.getElementById("txt-nombre");
  const txtCantidad = document.getElementById("txt-cantidad");
  const qrDiv = document.getElementById("qr-code");
  const invitDiv = document.getElementById("invitacion");

  btn.addEventListener("click", () => {
    const nombre = nombreIn.value.trim() || "[Nombre]";
    const cant = cantIn.value.trim() || "0";
    txtNombre.textContent = nombre;
    txtCantidad.textContent = ` ${cant}`;

    // El QR llevará un JSON con nombre y cantidad
    qrDiv.innerHTML = "";
    const qrPayload = JSON.stringify({ nombre: nombre, cantidad: cant });
    new QRCode(qrDiv, {
      text: qrPayload,
      width: 100,
      height: 100,
      colorDark: "#efa0a1",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Genera PNG de alta resolución
    html2canvas(invitDiv, {
      scale: 4,
      useCORS: true,
      backgroundColor: null,
    })
      .then((canvas) => {
        canvas.toBlob(
          (blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `invitacion_${nombre.replace(/\s+/g, "_")}.png`;
            link.click();
            URL.revokeObjectURL(link.href);
          },
          "image/png",
          1
        );
      })
      .catch((err) => console.error(err));
  });
});
