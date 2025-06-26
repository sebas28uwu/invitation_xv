    <script>
      const slides = [
        [
          "Con todo el amor que nos llena el alma,",
          "hoy celebramos los quince años de nuestra",
          "adorada Cielo Noelia Saori.",
          "Desde su llegada, ilumina nuestra vida",
          "con alegría y un inmenso orgullo.",
        ],
        [
          "Hoy guardo en mis brazos la Estrella divina que fue mi niñez,",
          "y empiezo mi adolescencia con muchas esperanzas y sueños.",
          "Por esa razón quiero que compartas conmigo este día tan especial...",
        ],
        ["Padrinos", "Susan Durand", "y", "Alex Chamba"],
        [
          "Padres",
          "Alex Becerra",
          "y",
          "Marlene Durand",

          "Tenemos el agrado de invitaros a celebrar los 15 años de nuestra hija",
        ],
        [
          "He aprendido que estar con quienes quiero es suficiente para ser feliz.",
          "Ten por seguro que el tiempo y estas letras se borrarían, pero el recuerdo de tu presencia este día nunca lo olvidaré.",
        ],
        [
          "¿Te gustaría confirmar tu asistencia?",
          "Haz clic en la mariposa para continuar...",
        ],
      ];
      let current = 0,
        line = 0,
        ch = 0;
      const intro = document.getElementById("intro"),
        cont = document.getElementById("type-container"),
        typed = document.getElementById("typed");

      function typeWriter() {
        const txt = slides[current],
          done = txt.slice(0, line).join("<br/>");
        typed.innerHTML =
          done + (done ? "<br/>" : "") + txt[line].substring(0, ch);
        if (ch++ < txt[line].length) {
          setTimeout(typeWriter, 150);
        } else if (++line < txt.length) {
          ch = 0;
          setTimeout(typeWriter, 800);
        }
      }

      function showSlide(n) {
        current = n;
        line = ch = 0;
        typed.innerHTML = "";

        // ocultar todos los botones
        cont
          .querySelectorAll(".mariposa")
          .forEach((b) => (b.style.display = "none"));
        // mostrar sólo los de este slide
        cont
          .querySelectorAll(`.mariposa[data-slide="${n}"]`)
          .forEach((b) => (b.style.display = "block"));

        // — NUEVO: limpieza de clases antiguas —
        cont.classList.remove(
          "slide-0",
          "slide-1",
          "slide-2",
          "slide-3",
          "slide-4"
        );
        // y añadimos la que toque
        cont.classList.add(`slide-${n}`);

        typeWriter();
      }

      // Intro → slide 0
      intro.querySelector('.mariposa[data-dir="next"]').onclick = () => {
        intro.style.display = "none";
        cont.style.display = "block";
        showSlide(0);
      };

      // Delegación avanzar/retroceder
      cont.addEventListener("click", (e) => {
        const btn = e.target.closest(".mariposa[data-slide]");
        if (!btn) return;
        const dir = btn.dataset.dir,
          idx = +btn.dataset.slide;
        if (dir === "next" && idx === current && current + 1 < slides.length)
          showSlide(current + 1);
        if (dir === "back" && idx === current) {
          if (current > 0) showSlide(current - 1);
          else {
            cont.style.display = "none";
            intro.style.display = "block";
          }
        }
        if (dir === "extra" && idx === current)
          console.log("Extra en slide", idx);
        // ===== NUEVO: Navegación al formulario =====
        if (dir === "form" && idx === current) {
          cont.style.display = "none";
          document.getElementById("form-container").classList.add("show");
        }
      });

      // ===== NUEVO: Manejo del formulario =====
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
              <label>Invitado ${i - 1}:</label>
              <input type="text" name="invitado_${i-1}" required placeholder="Nombre completo">
            </div>`;
        }

        // Segundo formulario
        const segundoForm = `
          <form id="datos-invitados">
            <h2>Ingresa los nombres de tus invitados</h2>
            <div class="form-fields-container">
              <div class="form-group full-width">
                <label>Tu nombre:</label>
                <input type="text" name="nombre" value="${nombre}" readonly>
              </div>
              <div class="form-group full-width">
                <label>Tu apellido:</label>
                <input type="text" name="apellido" value="${apellido}" readonly>
              </div>
              ${invitadosHTML}
              <div class="form-group full-width">
                <label>Tu número de WhatsApp:</label>
                <input type="text" name="whatsapp" pattern="\\d{9,15}" required placeholder="Solo números">
              </div>
            </div>
            <div class="form-submit-container">
              <button type="submit">Confirmar asistencia</button>
            </div>
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
            
            try {
              await fetch('https://sheetdb.io/api/v1/fouso319wc8rv', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(datos)
              });
              document.getElementById('form-ui').innerHTML =
                "<h2>¡Gracias! Recibirás tu entrada por WhatsApp.</h2>";
            } catch (error) {
              console.error('Error al enviar datos:', error);
              document.getElementById('form-ui').innerHTML =
                "<h2>Hubo un error al enviar los datos. Por favor, intenta de nuevo.</h2>";
            }
          });
      });

      // ===== NUEVO: Manejo del botón de volver =====
      document.getElementById('btn-volver').onclick = () => {
        cont.style.display = "block";
        document.getElementById("form-container").classList.remove("show");
      };
    </script>
