const SHEETDB_URL = "https://sheetdb.io/api/v1/fouso319wc8rv"; // Actualiza con tu endpoint

// Busca por nombre y cantidad
async function buscarInvitado(nombre, cantidad) {
  const url = `${SHEETDB_URL}?nombre=${encodeURIComponent(
    nombre
  )}&cantidad_invitados=${encodeURIComponent(cantidad)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data && data.length > 0 ? data[0] : null;
}

// Marca asistencia
async function confirmarAsistencia(id) {
  await fetch(`${SHEETDB_URL}/id/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asistencia: "SI" }),
  });
}

// Inicializa el QR
const info = document.getElementById("info");
let lastQR = "";

function reiniciarScanner(html5QrCode) {
  info.innerHTML = "Esperando escaneo...";
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (qrText) => {
      if (qrText === lastQR) return;
      lastQR = qrText;
      html5QrCode.stop();
      let nombre = "";
      let cantidad = "";
      try {
        // El QR es un JSON
        const qrObj = JSON.parse(qrText);
        nombre = qrObj.nombre || "";
        cantidad = qrObj.cantidad || "";
      } catch (e) {
        info.innerHTML =
          "QR inválido.<br><button id='btn-nuevo'>Escanear otro</button>";
        document.getElementById("btn-nuevo").onclick = () => {
          lastQR = "";
          reiniciarScanner(html5QrCode);
        };
        return;
      }

      info.innerHTML = `<b>Buscando invitado...</b>`;
      const invitado = await buscarInvitado(nombre, cantidad);
      if (invitado) {
        info.innerHTML = `
              <b>Nombre:</b> ${invitado.nombre} <br>
              <b>Cantidad invitados:</b> ${invitado.cantidad_invitados}<br>
              <b>Acompañantes:</b> 
                ${
                  (invitado.invitado_1 || "") +
                  " " +
                  (invitado.invitado_2 || "") +
                  " " +
                  (invitado.invitado_3 || "")
                }
              <br><br>
              <button id="btn-confirmar">Confirmar asistencia</button>
              <button id="btn-nuevo">Escanear otro</button>
            `;
        document.getElementById("btn-confirmar").onclick = async () => {
          await confirmarAsistencia(invitado.id); // el id de tu sheet
          info.innerHTML = `<b>¡Asistencia confirmada!</b><br>
                                <button id="btn-nuevo">Escanear otro</button>`;
          document.getElementById("btn-nuevo").onclick = () => {
            lastQR = "";
            reiniciarScanner(html5QrCode);
          };
        };
        document.getElementById("btn-nuevo").onclick = () => {
          lastQR = "";
          reiniciarScanner(html5QrCode);
        };
      } else {
        info.innerHTML = `No encontrado o datos incorrectos.<br>
                              <button id="btn-nuevo">Intentar de nuevo</button>`;
        document.getElementById("btn-nuevo").onclick = () => {
          lastQR = "";
          reiniciarScanner(html5QrCode);
        };
      }
    },
    (errorMsg) => {
      /* No hacer nada con los errores */
    }
  );
}

window.onload = () => {
  const html5QrCode = new Html5Qrcode("reader");
  reiniciarScanner(html5QrCode);
};
