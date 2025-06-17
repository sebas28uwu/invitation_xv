// admin.js

const SHEETDB_URL = "https://sheetdb.io/api/v1/fouso319wc8rv"; // tu URL
const ADMIN_PASS  = "admin123"; // tu contraseña

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const panelSection = document.getElementById('panel-section');
  const loginError   = document.getElementById('login-error');
  const btnLogin     = document.getElementById('btn-login');
  const passInput    = document.getElementById('admin-pass');

  btnLogin.addEventListener('click', () => {
    if (passInput.value === ADMIN_PASS) {
      loginSection.style.display = 'none';
      panelSection.style.display = 'block';
      cargarSolicitudes();
    } else {
      loginError.textContent = 'Contraseña incorrecta';
    }
  });
});

// Carga la lista de solicitudes
function cargarSolicitudes() {
  const cont = document.getElementById('solicitudes-list');
  cont.innerHTML = "<em>Cargando...</em>";

  fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        cont.innerHTML = "<div class='alert alert-warning'>No hay solicitudes.</div>";
        return;
      }

      let html = `
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Invitados</th>
              <th>WhatsApp</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach((fila, i) => {
        const nombre  = encodeURIComponent(fila.nombre || "");
        const cantidad= encodeURIComponent(fila.cantidad_invitados || "");

        html += `
          <tr>
            <td>${i+1}</td>
            <td>${fila.nombre || ""}</td>
            <td>${fila.apellido || ""}</td>
            <td>${fila.cantidad_invitados || ""}</td>
            <td>${fila.movil || ""}</td>
            <td>${fila.estado   || "Pendiente"}</td>
            <td>
              <button 
                class="btn btn-success btn-sm"
                onclick="actualizarEstado('${fila.id}','Aprobado')">
                Aprobar
              </button>
              <button 
                class="btn btn-danger btn-sm"
                onclick="actualizarEstado('${fila.id}','Rechazado')">
                Rechazar
              </button>
              ${
                fila.estado === "Aprobado"
                  ? `<button 
                       class="btn btn-warning btn-sm"
                       onclick="openInvitacion('${nombre}','${cantidad}')">
                       Generar invitación
                     </button>`
                  : ""
              }
            </td>
          </tr>
        `;
      });

      html += "</tbody></table>";
      cont.innerHTML = html;
    });
}

// Actualiza el estado en SheetDB
function actualizarEstado(rowId, estado) {
  fetch(`${SHEETDB_URL}/id/${rowId}`, {
    method: "PATCH",
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ data: { estado: estado } })
  })
  .then(res => res.json())
  .then(() => {
    alert(`Solicitud actualizada a: ${estado}`);
    cargarSolicitudes();
  });
}

// Abre la página de invitación pasándole nombre y cantidad
function openInvitacion(nombreEnc, cantEnc) {
  const nombre   = decodeURIComponent(nombreEnc);
  const cantidad = decodeURIComponent(cantEnc);
  const url = `/html/invitacion.html?nombre=${encodeURIComponent(nombre)}&cantidad=${encodeURIComponent(cantidad)}`;
  window.open(url, '_blank');
}
