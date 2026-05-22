

console.log("✅ app.js cargado correctamente");


const paletteEl    = document.getElementById("palette");       
const btnGenerate  = document.getElementById("btn-generate");   
const btnSave      = document.getElementById("btn-save");       
const btnExport    = document.getElementById("btn-export");     
const btnClear     = document.getElementById("btn-clear");      
const toastEl      = document.getElementById("toast");          
const historyList  = document.getElementById("history-list");   
const historySection = document.getElementById("history-section");
const exportCanvas = document.getElementById("export-canvas");  

console.log("🔍 Elementos del DOM encontrados:", {
  paletteEl, btnGenerate, btnSave, btnExport, btnClear
});


let currentSize    = 6;       
let currentFormat  = "hex";     
let currentColors  = [];      
let lockedColors   = {};      
let savedPalettes  = [];      
console.log("🗂 Estado inicial:", { currentSize, currentFormat });


function cargarHistorial() {
  try {
    // getItem devuelve un string o null si no existe
    const guardado = localStorage.getItem("colorfly_palettes");
    if (guardado) {
      savedPalettes = JSON.parse(guardado); // convertir string JSON → array JS
      console.log("📂 Historial cargado desde localStorage:", savedPalettes.length, "paleta(s)");
    }
  } catch (error) {
    console.warn("⚠️ Error al leer localStorage:", error);
  }
}

/* ═══════════════════════════════════════════════════════════════
   4. GUARDAR HISTORIAL EN localStorage
════════════════════════════════════════════════════════════════ */
function guardarEnStorage() {
  try {
    localStorage.setItem("colorfly_palettes", JSON.stringify(savedPalettes));
    console.log("💾 Historial guardado en localStorage:", savedPalettes.length, "paleta(s)");
  } catch (error) {
    console.warn("⚠️ Error al guardar en localStorage:", error);
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. TOAST: notificación flotante de microfeedback
   Aparece abajo en pantalla y desaparece sola
════════════════════════════════════════════════════════════════ */
let toastTimer; // guardamos el timer para poder cancelarlo si se llama otra vez rápido

function mostrarToast(mensaje) {
  console.log("🔔 Toast:", mensaje);

  toastEl.textContent = mensaje;
  toastEl.classList.add("show");

  // Cancelar el timer anterior si existía
  clearTimeout(toastTimer);

  // Ocultar el toast después de 2 segundos
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}

/* ═══════════════════════════════════════════════════════════════
   6. MATH: conversión de colores
   Todos los colores se generan internamente en HSL
   y se convierten a HEX cuando hace falta
════════════════════════════════════════════════════════════════ */

// Genera un número entero aleatorio entre min y max (inclusive)
function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convierte HSL → HEX
// h: 0-360 (matiz), s: 0-100 (saturación), l: 0-100 (luminosidad)
function hslAHex(h, s, l) {
  s = s / 100;
  l = l / 100;

  // Algoritmo estándar de conversión HSL → RGB → HEX
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)       // convertir a hexadecimal
      .padStart(2, "0");  // asegurar 2 dígitos (ej: "0a")
  };

  return "#" + f(0) + f(8) + f(4);
}

// Genera un objeto de color con propiedades h, s, l y hex
function generarColorAleatorio() {
  const h = aleatorio(0, 360);     // cualquier matiz
  const s = aleatorio(45, 90);     // saturación media-alta (colores vivos)
  const l = aleatorio(35, 65);     // luminosidad media (ni muy oscuro ni muy claro)
  const hex = hslAHex(h, s, l);

  return { h, s, l, hex };
}

/* ═══════════════════════════════════════════════════════════════
   7. OBTENER EL TEXTO DEL CÓDIGO SEGÚN FORMATO
════════════════════════════════════════════════════════════════ */

// Devuelve el código en el formato activo (HEX u HSL)
function getCodigoFormato(color, formato) {
  if (formato === "hex") {
    return color.hex.toUpperCase();
  } else {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }
}

// Devuelve el código en el formato secundario (el que NO está activo)
function getCodigoSecundario(color, formato) {
  if (formato === "hex") {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  } else {
    return color.hex.toUpperCase();
  }
}

/* ═══════════════════════════════════════════════════════════════
   8. COPIAR AL PORTAPAPELES
   Usa la API moderna navigator.clipboard
════════════════════════════════════════════════════════════════ */
function copiarAlPortapapeles(texto) {
  // navigator.clipboard.writeText devuelve una Promesa
  navigator.clipboard.writeText(texto)
    .then(() => {
      console.log("📋 Copiado:", texto);
      mostrarToast(`✓ Copiado: ${texto}`);
    })
    .catch((error) => {
      console.warn("⚠️ Error al copiar:", error);
      mostrarToast("No se pudo copiar");
    });
}

/* ═══════════════════════════════════════════════════════════════
   9. RENDERIZAR LA PALETA EN EL DOM
   Crea las tarjetas HTML a partir del array currentColors
════════════════════════════════════════════════════════════════ */
function renderizarPaleta() {
  console.log("🎨 Renderizando paleta:", currentColors.length, "colores · formato:", currentFormat);

  // Limpiar el contenedor antes de insertar nuevas tarjetas
  paletteEl.innerHTML = "";

  // Recorrer cada color y crear su tarjeta
  currentColors.forEach((color, index) => {
    const estaBlockeado = lockedColors[index] === true;
    const codigoPrincipal  = getCodigoFormato(color, currentFormat);
    const codigoSecundario = getCodigoSecundario(color, currentFormat);

    /* --- Crear el article (tarjeta) --- */
    const card = document.createElement("article");
    card.className = "color-card" + (estaBlockeado ? " locked" : "");
    card.setAttribute("aria-label", `Color ${index + 1}: ${codigoPrincipal}`);
    // Retraso escalonado en la animación de entrada
    card.style.animationDelay = (index * 40) + "ms";

    /* --- Bloque superior: el color visual --- */
    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.backgroundColor = color.hex;

    /* --- Botón de candado (bloquear/desbloquear) --- */
    const lockBtn = document.createElement("button");
    lockBtn.className = "lock-btn";
    lockBtn.setAttribute("aria-label", estaBlockeado ? "Desbloquear color" : "Bloquear color");
    lockBtn.setAttribute("aria-pressed", estaBlockeado ? "true" : "false");
    lockBtn.textContent = estaBlockeado ? "🔒" : "🔓";

    // Al hacer clic en el candado: alternar estado bloqueado
    lockBtn.addEventListener("click", (evento) => {
      evento.stopPropagation(); // evitar que el clic llegue a la tarjeta
      lockedColors[index] = !lockedColors[index];
      console.log(`🔐 Color ${index} ${lockedColors[index] ? "bloqueado" : "desbloqueado"}`);
      mostrarToast(lockedColors[index] ? "🔒 Color bloqueado" : "🔓 Color desbloqueado");
      renderizarPaleta(); // volver a dibujar para reflejar el cambio
    });

    /* --- Zona inferior: los códigos clicables --- */
    const info = document.createElement("div");
    info.className = "color-info";

    // Botón con el código PRINCIPAL (HEX o HSL según formato activo)
    const btnCodigo1 = document.createElement("button");
    btnCodigo1.className = "color-code-btn";
    btnCodigo1.textContent = codigoPrincipal;
    btnCodigo1.setAttribute("aria-label", `Copiar ${codigoPrincipal}`);
    btnCodigo1.addEventListener("click", () => copiarAlPortapapeles(codigoPrincipal));

    // Botón con el código SECUNDARIO (el otro formato)
    const btnCodigo2 = document.createElement("button");
    btnCodigo2.className = "color-code-btn";
    btnCodigo2.textContent = codigoSecundario;
    btnCodigo2.setAttribute("aria-label", `Copiar ${codigoSecundario}`);
    btnCodigo2.addEventListener("click", () => copiarAlPortapapeles(codigoSecundario));

    /* --- Ensamblar la tarjeta --- */
    preview.appendChild(lockBtn);
    info.appendChild(btnCodigo1);
    info.appendChild(btnCodigo2);
    card.appendChild(preview);
    card.appendChild(info);

    // Agregar la tarjeta al contenedor en el HTML
    paletteEl.appendChild(card);
  });

  console.log("✅ Paleta renderizada correctamente");
}

/* ═══════════════════════════════════════════════════════════════
   10. GENERAR NUEVA PALETA
   Crea colores aleatorios respetando los bloqueados
════════════════════════════════════════════════════════════════ */
function generarPaleta() {
  console.log("🎲 Generando paleta · tamaño:", currentSize, "· formato:", currentFormat);

  // Crear un array nuevo de colores
  const nuevasPaleta = [];

  for (let i = 0; i < currentSize; i++) {
    if (lockedColors[i] && currentColors[i]) {
      // Si el color i está bloqueado, conservarlo tal cual
      nuevasPaleta.push(currentColors[i]);
      console.log(`  🔒 Color ${i} conservado:`, currentColors[i].hex);
    } else {
      // Si no está bloqueado, generar uno nuevo
      const nuevoColor = generarColorAleatorio();
      nuevasPaleta.push(nuevoColor);
      console.log(`  🎨 Color ${i} generado:`, nuevoColor.hex);
    }
  }

  currentColors = nuevasPaleta;

  // Si el tamaño cambió, limpiar bloqueos que ya no apliquen
  Object.keys(lockedColors).forEach((key) => {
    if (parseInt(key) >= currentSize) {
      delete lockedColors[key];
    }
  });

  renderizarPaleta();
  mostrarToast("🎨 Nueva paleta generada");
}

/* ═══════════════════════════════════════════════════════════════
   11. RENDERIZAR EL HISTORIAL DE PALETAS GUARDADAS
════════════════════════════════════════════════════════════════ */
function renderizarHistorial() {
  console.log("📜 Renderizando historial:", savedPalettes.length, "paleta(s)");

  // Ocultar la sección si no hay nada guardado
  if (savedPalettes.length === 0) {
    historySection.style.display = "none";
    return;
  }

  historySection.style.display = "block";
  historyList.innerHTML = "";

  savedPalettes.forEach((paleta, index) => {
    /* --- Fila de la paleta guardada --- */
    const item = document.createElement("div");
    item.className = "history-item";

    /* --- Tira de colores miniatura --- */
    const strip = document.createElement("div");
    strip.className = "history-strip";

    paleta.colors.forEach((hex) => {
      const chip = document.createElement("div");
      chip.className = "history-chip";
      chip.style.backgroundColor = hex;
      chip.setAttribute("aria-hidden", "true"); // decorativo, no semántico
      strip.appendChild(chip);
    });

    /* --- Texto de fecha/hora --- */
    const meta = document.createElement("span");
    meta.className = "history-meta";
    const fecha = new Date(paleta.timestamp);
    // toLocaleTimeString: formato local de hora (ej: "14:32")
    meta.textContent = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    /* --- Botón de eliminar --- */
    const delBtn = document.createElement("button");
    delBtn.className = "history-del";
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", "Eliminar paleta guardada");

    delBtn.addEventListener("click", () => {
      console.log("🗑 Eliminando paleta del historial en índice:", index);
      savedPalettes.splice(index, 1); // eliminar ese elemento del array
      guardarEnStorage();
      renderizarHistorial();
      mostrarToast("🗑 Paleta eliminada");
    });

    /* --- Ensamblar y agregar --- */
    item.appendChild(strip);
    item.appendChild(meta);
    item.appendChild(delBtn);
    historyList.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════════
   12. GUARDAR PALETA ACTUAL EN EL HISTORIAL
════════════════════════════════════════════════════════════════ */
function guardarPaleta() {
  if (currentColors.length === 0) {
    console.warn("⚠️ No hay colores para guardar");
    mostrarToast("⚠️ Primero genera una paleta");
    return;
    console.log("Guardando:", currentColors);
  }

  const nuevaPaleta = {
    colors: currentColors.map((c) => c.hex), // guardamos solo los HEX
    timestamp: Date.now()                     // marca de tiempo para la hora
  };

  // Agregar al inicio del array (las más recientes arriba)
  savedPalettes.unshift(nuevaPaleta);

  // Limitar el historial a 12 paletas máximo
  if (savedPalettes.length > 12) {
    savedPalettes = savedPalettes.slice(0, 12);
  }

  console.log("💾 Paleta guardada:", nuevaPaleta);

  guardarEnStorage();
  renderizarHistorial();
  mostrarToast("💾 Paleta guardada");
}

/* ═══════════════════════════════════════════════════════════════
   13. EXPORTAR PALETA COMO PNG
   Dibuja los colores en un <canvas> y lo descarga como imagen
════════════════════════════════════════════════════════════════ */
function exportarPNG() {
  if (currentColors.length === 0) {
    console.warn("⚠️ No hay colores para exportar");
    mostrarToast("⚠️ Primero genera una paleta");
    return;
  }

  console.log("📥 Exportando PNG con", currentColors.length, "colores");

  const anchoPorColor = 160;  // ancho de cada franja de color
  const altoCanvas    = 200;  // alto total del canvas
  const altoColor     = 140;  // alto de la franja de color
  const altoTexto     = 60;   // alto del área de texto debajo

  const anchoTotal = anchoPorColor * currentColors.length;

  // Configurar el canvas con las dimensiones correctas
  exportCanvas.width  = anchoTotal;
  exportCanvas.height = altoCanvas;

  const ctx = exportCanvas.getContext("2d"); // contexto 2D para dibujar

  currentColors.forEach((color, index) => {
    const x = index * anchoPorColor; // posición horizontal de esta franja

    /* --- Franja de color --- */
    ctx.fillStyle = color.hex;
    ctx.fillRect(x, 0, anchoPorColor, altoColor);

    /* --- Fondo blanco para el texto --- */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, altoColor, anchoPorColor, altoTexto);

    /* --- Código HEX --- */
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(color.hex.toUpperCase(), x + anchoPorColor / 2, altoColor + 22);

    /* --- Código HSL --- */
    ctx.fillStyle = "#666666";
    ctx.font = "11px monospace";
    ctx.fillText(
      `hsl(${color.h},${color.s}%,${color.l}%)`,
      x + anchoPorColor / 2,
      altoColor + 42
    );
  });

  // Convertir el canvas a URL de imagen y crear un link de descarga
  const urlImagen = exportCanvas.toDataURL("image/png");
  const linkDescarga = document.createElement("a");
  linkDescarga.href     = urlImagen;
  linkDescarga.download = "colorfly-paleta.png"; // nombre del archivo
  linkDescarga.click();  // simular clic para iniciar la descarga

  console.log("✅ PNG exportado correctamente");
  mostrarToast("📥 PNG exportado");
}

/* ═══════════════════════════════════════════════════════════════
   14. LIMPIAR HISTORIAL COMPLETO
════════════════════════════════════════════════════════════════ */
function limpiarHistorial() {
  console.log("🧹 Limpiando historial completo");
  savedPalettes = [];
  guardarEnStorage();
  renderizarHistorial();
  mostrarToast("🧹 Historial limpiado");
}

/* ═══════════════════════════════════════════════════════════════
   15. SETUP DE BOTONES TOGGLE (tamaño y formato)
   Función reutilizable para los grupos de botones tipo "radio"
════════════════════════════════════════════════════════════════ */
function setupToggle(selectorGrupo, atributoDato, alCambiar) {
  // querySelectorAll devuelve todos los botones dentro del grupo
  const botones = document.querySelectorAll(`${selectorGrupo} .btn`);

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Quitar "active" a todos los botones del grupo
      botones.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });

      // Activar el botón clickeado
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      // Leer el valor del data attribute del botón
      const valor = btn.dataset[atributoDato];
      console.log(`🔘 Toggle [${selectorGrupo}] → ${atributoDato}:`, valor);

      // Llamar a la función que maneja el cambio
      alCambiar(valor);
    });
  });

  console.log(`✅ Toggle configurado: ${selectorGrupo} ·`, botones.length, "botones");
}

/* ═══════════════════════════════════════════════════════════════
   16. EVENTOS DE LOS BOTONES PRINCIPALES
════════════════════════════════════════════════════════════════ */

// Botón "Generar paleta"
btnGenerate.addEventListener("click", () => {
  console.log("🖱 Clic en Generar paleta");
  generarPaleta();
});

// Botón "Guardar paleta"
btnSave.addEventListener("click", () => {
  console.log("🖱 Clic en Guardar paleta");
  guardarPaleta();
});

// Botón "Exportar PNG"
btnExport.addEventListener("click", () => {
  console.log("🖱 Clic en Exportar PNG");
  exportarPNG();
});

// Botón "Limpiar historial"
btnClear.addEventListener("click", () => {
  console.log("🖱 Clic en Limpiar historial");
  limpiarHistorial();
});

/* ═══════════════════════════════════════════════════════════════
   17. CONFIGURAR LOS TOGGLES DE TAMAÑO Y FORMATO
════════════════════════════════════════════════════════════════ */

// Toggle de tamaño de paleta (6, 8, 9)
setupToggle(".palette-size", "size", (valor) => {
  currentSize = parseInt(valor); // convertir string → número entero
  lockedColors = {};             // resetear bloqueos al cambiar tamaño
  console.log("📐 Nuevo tamaño:", currentSize);
  generarPaleta();               // generar paleta nueva con el nuevo tamaño
});

// Toggle de formato de color (HEX / HSL)
setupToggle(".format", "format", (valor) => {
  currentFormat = valor;
  console.log("🎨 Nuevo formato:", currentFormat);
  renderizarPaleta(); // solo re-renderizar (sin generar colores nuevos)
});

/* ═══════════════════════════════════════════════════════════════
   18. INICIALIZACIÓN
   Se ejecuta al cargar la página por primera vez
════════════════════════════════════════════════════════════════ */
function init() {
  console.log("🚀 Inicializando Colorfly Studio...");
  cargarHistorial();    // recuperar paletas guardadas del navegador
  renderizarHistorial(); // mostrar el historial si existe
  generarPaleta();      // generar la primera paleta automáticamente
  console.log("✅ App lista");
}

// Llamar a init() para arrancar la aplicación
init();