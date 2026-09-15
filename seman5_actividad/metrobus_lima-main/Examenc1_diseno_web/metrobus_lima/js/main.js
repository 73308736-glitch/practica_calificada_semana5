/* =========================================================
   MetroBus Lima - main.js
   Mejoras de programación (JavaScript) + guardado tipo
   "base de datos" usando localStorage del navegador,
   ya que el sitio no cuenta con servidor/backend.
   ========================================================= */

const CLAVE_HISTORIAL = "metrobus_recargas";

/* ----- Acceso al "almacén" de recargas (localStorage) ----- */
function obtenerHistorial() {
  const datos = localStorage.getItem(CLAVE_HISTORIAL);
  return datos ? JSON.parse(datos) : [];
}

function guardarRegistro(registro) {
  const historial = obtenerHistorial();
  historial.push(registro);
  localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
}

function formatearFecha(isoFecha) {
  const fecha = new Date(isoFecha);
  return fecha.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

/* ----- Pintar el historial guardado en la página ----- */
function renderizarHistorial() {
  const lista = document.getElementById("lista-historial");
  if (!lista) return;

  const historial = obtenerHistorial();
  lista.innerHTML = "";

  if (historial.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "historial-vacio";
    vacio.textContent = "Todavía no registraste ninguna recarga en este navegador.";
    lista.appendChild(vacio);
    return;
  }

  historial
    .slice()
    .reverse()
    .forEach((registro) => {
      const item = document.createElement("li");
      const ocultos = registro.numero.slice(-4);
      item.textContent =
        "Tarjeta ****" + ocultos + " · S/ " + registro.monto.toFixed(2) + " · " + formatearFecha(registro.fecha);
      lista.appendChild(item);
    });
}

/* ----- Mostrar el mensaje de confirmación / error con animación ----- */
function mostrarMensaje(texto, esError) {
  const caja = document.getElementById("confirmacion-recarga");
  if (!caja) return;

  caja.textContent = texto;
  caja.classList.toggle("confirmacion-error", Boolean(esError));

  // Se retira y se vuelve a poner la clase para poder repetir
  // la animación CSS aunque el mensaje anterior ya estuviera visible.
  caja.classList.remove("mostrar-confirmacion");
  void caja.offsetWidth;
  caja.classList.add("mostrar-confirmacion");
}

/* ----- Validación y guardado del formulario de recarga ----- */
function inicializarFormularioRecarga() {
  const formulario = document.getElementById("form-recarga");
  if (!formulario) return;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const numero = document.getElementById("numero-tarjeta").value.trim();
    const monto = parseFloat(document.getElementById("monto").value);

    if (!/^[0-9]{10}$/.test(numero)) {
      mostrarMensaje("El número de tarjeta debe tener exactamente 10 dígitos.", true);
      return;
    }
    if (Number.isNaN(monto) || monto < 2) {
      mostrarMensaje("El monto mínimo de recarga es S/ 2.00.", true);
      return;
    }

    guardarRegistro({
      numero: numero,
      monto: monto,
      fecha: new Date().toISOString(),
    });

    renderizarHistorial();
    mostrarMensaje("✔ Recarga guardada correctamente. Tu saldo se actualizará en unos minutos.", false);
    formulario.reset();
  });
}

/* ----- Buscador en vivo de estaciones (rutas.html) ----- */
function inicializarBuscadorEstaciones() {
  const buscador = document.getElementById("buscador-estaciones");
  if (!buscador) return;

  buscador.addEventListener("input", () => {
    const texto = buscador.value.trim().toLowerCase();
    document.querySelectorAll(".estaciones-lista li").forEach((item) => {
      const coincide = item.textContent.toLowerCase().includes(texto);
      item.style.display = coincide ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarFormularioRecarga();
  renderizarHistorial();
  inicializarBuscadorEstaciones();
});
