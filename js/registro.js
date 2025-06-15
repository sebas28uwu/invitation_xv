const form = document.getElementById('confirmar-asistencia');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre   = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad').value, 10);

  // Genera el HTML para los invitados
  let invitadosHTML = '';
  for (let i = 2; i <= cantidad; i++) {
    invitadosHTML += `
      <div class="form-group">
        <label>Nombre del invitado ${i - 1}:</label>
        <input type="text" name="invitado_${i-1}" required>
      </div>`;
  }

  // Segundo formulario
  const segundoForm = `
    <form id="datos-invitados">
      <h2>Ingresa los nombres de tus invitados</h2>
      <div class="form-group">
        <label>Tu nombre:</label>
        <input type="text" name="nombre" value="${nombre}" readonly>
      </div>
      <div class="form-group">
        <label>Tu apellido:</label>
        <input type="text" name="apellido" value="${apellido}" readonly>
      </div>
      ${invitadosHTML}
      <div class="form-group">
        <label>Tu número de WhatsApp:</label>
        <input type="text" name="whatsapp" pattern="\\d{9,15}" required placeholder="Solo números">
      </div>
      <button type="submit">Confirmar asistencia</button>
    </form>
  `;
  document.getElementById('form-ui').innerHTML = segundoForm;

  // Envío final
  document.getElementById('datos-invitados')
    .addEventListener('submit', async function(ev) {
      ev.preventDefault();
      const fd = new FormData(this);
      const datos = {
        data: {
          nombre:   fd.get('nombre'),
          apellido: fd.get('apellido'),
          cantidad_invitados: cantidad,
          movil:    fd.get('whatsapp')
        }
      };
      for (let i = 2; i <= cantidad; i++) {
        datos.data[`invitado_${i-1}`] = fd.get(`invitado_${i-1}`);
      }
      await fetch('https://sheetdb.io/api/v1/fouso319wc8rv', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(datos)
      });
      document.getElementById('form-ui').innerHTML =
        "<h2>¡Gracias! Recibirás tu entrada por WhatsApp.</h2>";
    });
});

