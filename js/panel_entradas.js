document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const securityPanel = document.getElementById('security-panel');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;
        if (usuario === 'admin' && password === 'admin123') {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            securityPanel.style.display = 'none';
            loginError.textContent = '';
            // Aquí se cargará el panel de admin
            adminPanel.innerHTML = '<h2 style="font-family: \'Dancing Script\', cursive; color: #a14a7b; font-size: 2.1rem; margin-bottom: 1.5rem;">Panel de Administración</h2><div id="admin-content"></div>';
            fetchInvitados();
        } else if (usuario === 'seguridad' && password === 'seguridad123') {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'none';
            securityPanel.style.display = 'block';
            loginError.textContent = '';
            // Aquí se cargará el panel de seguridad
            securityPanel.innerHTML = '<h2 style="font-family: \'Dancing Script\', cursive; color: #a14a7b; font-size: 2.1rem; margin-bottom: 1.5rem;">Panel de Seguridad</h2><div id="security-content"></div>';
            fetchInvitados().then(() => {
                renderSecurityPanel();
            });
        } else {
            loginError.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
});

let invitados = [];

async function fetchInvitados() {
  try {
    const res = await fetch('https://sheetdb.io/api/v1/fouso319wc8rv');
    const data = await res.json();
    // Filtrar registros válidos (con nombre y apellido)
    invitados = data.filter(inv => inv.nombre && inv.apellido);
    console.log('Datos cargados exitosamente:', invitados.length, 'invitados');
    renderAdminTable();
    return invitados; // Retornar los datos
  } catch (e) {
    console.error('Error al cargar datos:', e);
    const adminContent = document.getElementById('admin-content');
    if (adminContent) adminContent.innerHTML = '<div style="color:red;">Error al cargar los datos de invitados.</div>';
    throw e; // Re-lanzar el error
  }
}

function renderAdminTable() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  let html = `<h3 style="color: #8b5a8b; font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; text-align: center;">👑 Panel de Administración</h3>`;
  html += `<table class="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>Acompañantes</th>
        <th>Móvil</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>`;
  invitados.forEach((inv, idx) => {
    const acompanantes = [inv.invitado_1, inv.invitado_2, inv.invitado_3].filter(Boolean).join(', ');
    html += `<tr>
      <td>${inv.id || '-'}</td>
      <td>${inv.nombre}</td>
      <td>${inv.apellido}</td>
      <td>${acompanantes || '-'}</td>
      <td>${inv.movil || '-'}</td>
      <td>${inv.estado ? inv.estado.charAt(0).toUpperCase() + inv.estado.slice(1) : '-'}</td>
      <td>`;
    if (inv.estado === 'pendiente' || !inv.estado) {
      html += `<button class="btn-aceptar" onclick="aceptarInvitado('${idx}')">Aceptar</button>
               <button class="btn-rechazar" onclick="rechazarInvitado('${idx}')">Rechazar</button>`;
    } else if (inv.estado.toLowerCase() === 'aprobado' || inv.estado.toLowerCase() === 'aceptado') {
      html += `<button class="btn-previsualizar" onclick="previsualizarInvitacion('${idx}')">Previsualizar</button>
               <button class="btn-enviar" onclick="enviarPorWhatsApp('${idx}')">Enviar por WhatsApp</button>`;
    } else {
      html += '-';
    }
    html += `</td></tr>`;
  });
  html += `</tbody></table>`;
  // Botón de descarga fuera de la imagen, solo si existe un canvas generado
  html += `<div id="descargar-invitacion-container" style="text-align:center;margin:1.5rem 0 0 0;"></div>`;
  adminContent.innerHTML = html;
  // Si existe un canvas, mostrar el botón de descarga
  setTimeout(() => {
    const container = document.getElementById('descargar-invitacion-container');
    if (document.getElementById('preview-canvas')) {
      container.innerHTML = '<button class="btn-previsualizar" onclick="descargarUltimaInvitacion()">Descargar invitación previsualizada</button>';
    } else {
      container.innerHTML = '';
    }
  }, 100);
}

window.aceptarInvitado = function(idx) {
  if (!invitados[idx]) return;
  invitados[idx].estado = 'Aprobado';
  renderAdminTable();
};
window.rechazarInvitado = function(idx) {
  if (!invitados[idx]) return;
  invitados[idx].estado = 'Rechazado';
  renderAdminTable();
};
window.previsualizarInvitacion = function(idx) {
  const inv = invitados[idx];
  if (!inv) return;
  
  // Mostrar overlay de previsualización
  let overlay = document.getElementById('preview-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'preview-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(24, 20, 28, 0.92)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '4000';
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <button onclick="cerrarPreview()" style="position:fixed;top:32px;right:32px;z-index:4100;background:#a14a7b;color:#fff;border:none;border-radius:50%;width:44px;height:44px;font-size:1.7rem;cursor:pointer;box-shadow:0 2px 8px rgba(139,90,139,0.18);">&times;</button>
    <div style="position:relative;background:#fff;border-radius:18px;box-shadow:0 4px 32px rgba(0,0,0,0.18);padding:0;max-width:851px;margin:0 auto;">
      <canvas id="preview-canvas" width="851" height="315" style="display:block;border-radius:18px;"></canvas>
    </div>
  `;
  
  // Generar imagen en el canvas de previsualización
  setTimeout(() => {
    generarImagenInvitacion(inv, 'preview-canvas');
  }, 100);
};

window.descargarInvitacion = function(idx) {
  const inv = invitados[idx];
  if (!inv) return;
  
  // Crear canvas temporal para generar la imagen
  const canvas = document.createElement('canvas');
  canvas.width = 851;
  canvas.height = 315;
  
  generarImagenInvitacion(inv, canvas).then(() => {
    const link = document.createElement('a');
    link.download = `invitacion_${inv.nombre}_${inv.apellido}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

window.enviarPorWhatsApp = function(idx) {
  const inv = invitados[idx];
  if (!inv) return;
  
  // Crear canvas temporal para generar la imagen
  const canvas = document.createElement('canvas');
  canvas.width = 851;
  canvas.height = 315;
  
  generarImagenInvitacion(inv, canvas).then(() => {
    // Descargar la imagen primero
    const link = document.createElement('a');
    link.download = `invitacion_${inv.nombre}_${inv.apellido}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Abrir WhatsApp Web con mensaje prellenado
    const mensaje = `¡Hola ${inv.nombre}! Aquí tienes tu invitación personalizada para mi XV años. ¡Espero verte ahí! 💕`;
    const urlWhatsApp = `https://wa.me/${inv.movil.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    
    alert('Se ha descargado la invitación. Por favor, adjunta la imagen manualmente en WhatsApp Web.');
  });
};

// Función auxiliar para generar la imagen
function generarImagenInvitacion(inv, canvasElement) {
  return new Promise((resolve) => {
    // Si es un string (ID del canvas), obtener el elemento
    const canvas = typeof canvasElement === 'string' ? document.getElementById(canvasElement) : canvasElement;
    if (!canvas) {
      console.error('Canvas no encontrado');
      resolve();
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Cargar imagen de fondo
    const fondo = new Image();
    fondo.src = '/img/entrada_generada.png';
    fondo.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fondo, 0, 0, 851, 315);
      
      // Generar QR
      const qrData = JSON.stringify({ 
        nombre: inv.nombre + ' ' + inv.apellido, 
        invitados: [inv.invitado_1, inv.invitado_2, inv.invitado_3].filter(Boolean) 
      });
      
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 120;
      qrCanvas.height = 120;
      
      if (window.QRious) {
        new window.QRious({
          element: qrCanvas,
          value: qrData,
          size: 120,
          background: 'transparent',
          foreground: '#f9bbcd'
        });
        ctx.drawImage(qrCanvas, 640, 105, 120, 120);
      }
      
      resolve();
    };
    
    // Cargar QRious si no está disponible
    if (!window.QRious) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
      script.onload = () => generarImagenInvitacion(inv, canvasElement).then(resolve);
      document.body.appendChild(script);
    }
  });
}

window.cerrarPreview = function() {
  const overlay = document.getElementById('preview-overlay');
  if (overlay) {
    overlay.remove();
  }
};

window.descargarUltimaInvitacion = function() {
  if (!window.ultimaInvitacionDataURL) {
    alert('Primero debes previsualizar la invitación.');
    return;
  }
  const link = document.createElement('a');
  link.download = 'invitacion_xv.png';
  link.href = window.ultimaInvitacionDataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Inicializar paneles según login
if (document.getElementById('admin-content')) {
  console.log('Panel de admin detectado, cargando datos...');
  fetchInvitados();
}
if (document.getElementById('security-content')) {
  console.log('Panel de security detectado, cargando datos...');
  // Cargar datos y luego renderizar
  fetchInvitados().then(() => {
    console.log('Datos cargados, renderizando panel de seguridad...');
    renderSecurityPanel();
  }).catch(error => {
    console.error('Error cargando datos para security:', error);
    // Mostrar mensaje de error en el panel de seguridad
    const securityContent = document.getElementById('security-content');
    if (securityContent) {
      securityContent.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="color: #dc3545; font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 1rem;">
            ❌ Error al cargar datos
          </div>
          <div style="color: #6d3576; font-size: 1rem;">
            No se pudieron cargar los datos de invitados. Intenta recargar la página.
          </div>
        </div>
      `;
    }
  });
}

// Panel de Seguridad
function renderSecurityPanel() {
  console.log('renderSecurityPanel ejecutándose...');
  const securityContent = document.getElementById('security-content');
  console.log('securityContent encontrado:', !!securityContent);
  if (!securityContent) return;
  
  console.log('invitados disponibles:', invitados ? invitados.length : 'undefined');
  
  // Mostrar mensaje de carga si no hay datos aún
  if (!invitados || invitados.length === 0) {
    console.log('No hay datos de invitados, mostrando mensaje de carga...');
    securityContent.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div style="color: #8b5a8b; font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 1rem;">
          🔄 Cargando datos...
        </div>
        <div style="color: #6d3576; font-size: 1rem;">
          Obteniendo lista de invitados desde la base de datos
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="scanner-section">
      <h3 style="color: #8b5a8b; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 1.5rem; text-align: center;">🔍 Escáner de Entrada</h3>
      <div id="qr-reader" style="width: 320px; margin: 0 auto 1.5rem auto;"></div>
      <div id="scan-result" class="scan-result"></div>
    </div>
  `;
  
  html += `
    <h3 style="color: #8b5a8b; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 1.5rem; text-align: center;">📋 Lista de Invitados Aprobados</h3>
  `;
  
  const invitadosAprobados = invitados.filter(inv => inv.estado && (inv.estado.toLowerCase() === 'aprobado' || inv.estado.toLowerCase() === 'aceptado'));
  console.log('Invitados aprobados encontrados:', invitadosAprobados.length);
  
  if (invitadosAprobados.length === 0) {
    console.log('No hay invitados aprobados, mostrando mensaje...');
    html += `
      <div style="text-align: center; padding: 2rem; background: #fff8fc; border-radius: 18px; border: 1px solid rgba(139,90,139,0.08);">
        <div style="color: #8b5a8b; font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.5rem;">
          📝 No hay invitados aprobados aún
        </div>
        <div style="color: #6d3576; font-size: 1rem;">
          Los invitados aparecerán aquí una vez que sean aprobados desde el panel de administración
        </div>
      </div>
    `;
  } else {
    console.log('Renderizando tabla con invitados aprobados...');
    html += `<table class="security-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Acompañantes</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>`;
    
    invitadosAprobados.forEach((inv, idx) => {
      const acompanantes = [inv.invitado_1, inv.invitado_2, inv.invitado_3].filter(Boolean).join(', ') || '-';
      html += `
        <tr>
          <td>${inv.nombre} ${inv.apellido}</td>
          <td>${acompanantes}</td>
          <td>${inv.asistido ? '<span style="color: #25d366; font-weight: bold;">✅ Asistido</span>' : '<span style="color: #ff6b6b;">⏳ Pendiente</span>'}</td>
          <td>
            ${!inv.asistido ? 
              `<button class="btn-aceptar" onclick="marcarAsistencia('${inv.id || idx}')">Confirmar Asistencia</button>` : 
              '<span style="color: #25d366; font-weight: bold;">✓ Confirmado</span>'
            }
          </td>
        </tr>
      `;
    });
    
    html += `</tbody></table>`;
  }
  
  securityContent.innerHTML = html;
  console.log('HTML del panel de seguridad insertado');
  
  // Iniciar escáner QR solo si hay invitados aprobados
  if (invitadosAprobados.length > 0) {
    console.log('Iniciando escáner QR...');
    iniciarScannerQR();
  } else {
    console.log('No hay invitados aprobados, no se inicia el escáner');
  }
}

function iniciarScannerQR() {
  if (!window.Html5Qrcode) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.onload = iniciarScannerQR;
    document.body.appendChild(script);
    return;
  }
  
  const qrReaderDiv = document.getElementById('qr-reader');
  if (!qrReaderDiv) return;
  
  qrReaderDiv.innerHTML = '';
  const html5QrCode = new window.Html5Qrcode('qr-reader');
  
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 220 },
    async (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        const nombre = data.nombre || '';
        const invitadosQR = data.invitados || [];
        
        // Buscar invitado por nombre y acompañantes
        const inv = invitados.find(i => {
          const nombreCompleto = i.nombre + ' ' + i.apellido;
          const invitadosActuales = [i.invitado_1, i.invitado_2, i.invitado_3].filter(Boolean);
          return nombreCompleto === nombre && 
                 JSON.stringify(invitadosActuales) === JSON.stringify(invitadosQR) && 
                 (i.estado === 'aprobado' || i.estado === 'aceptado');
        });
        
        if (inv) {
          inv.asistido = true;
          document.getElementById('scan-result').innerHTML = `
            <div style="color: #25d366; font-weight: bold; margin-bottom: 1rem; font-size: 1.2rem;">
              ✅ ¡Asistencia confirmada!
            </div>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 12px; border-left: 4px solid #25d366;">
              <strong>${inv.nombre} ${inv.apellido}</strong><br>
              <span style="color: #6c757d;">Acompañantes: ${[inv.invitado_1, inv.invitado_2, inv.invitado_3].filter(Boolean).join(', ') || 'Sin acompañantes'}</span>
            </div>
          `;
          renderSecurityPanel();
        } else {
          document.getElementById('scan-result').innerHTML = `
            <div style="color: #dc3545; font-weight: bold; margin-bottom: 1rem; font-size: 1.2rem;">
              ❌ Invitado no encontrado
            </div>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 12px; border-left: 4px solid #dc3545;">
              <strong>QR escaneado:</strong><br>
              <span style="color: #6c757d;">${nombre}</span><br>
              <span style="color: #6c757d;">Acompañantes: ${invitadosQR.join(', ') || 'Sin acompañantes'}</span>
            </div>
          `;
        }
      } catch (e) {
        document.getElementById('scan-result').innerHTML = `
          <div style="color: #dc3545; font-weight: bold; margin-bottom: 1rem; font-size: 1.2rem;">
            ❌ QR inválido
          </div>
          <div style="background: #f8f9fa; padding: 1rem; border-radius: 12px; border-left: 4px solid #dc3545;">
            El código QR no contiene información válida de invitación.
          </div>
        `;
      }
      
      // Limpiar resultado después de 5 segundos
      setTimeout(() => { 
        document.getElementById('scan-result').innerHTML = ''; 
      }, 5000);
    },
    (errorMsg) => {
      // No mostrar errores de escaneo continuo
    }
  );
}

window.marcarAsistencia = function(invId) {
  const inv = invitados.find(i => (i.id || '') === invId) || invitados[invId];
  if (inv) {
    inv.asistido = true;
    renderSecurityPanel();
  }
}; 
