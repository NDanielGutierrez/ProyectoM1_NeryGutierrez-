

console.log("app.js cargado correctamente");


const paletteEl = document.getElementById("palette");       
const btnGenerate= document.getElementById("btn-generate");   
const btnSave= document.getElementById("btn-save");       
const btnExport= document.getElementById("btn-export");     
const btnClear= document.getElementById("btn-clear");      
const toastEl= document.getElementById("toast");          
const historyList= document.getElementById("history-list");   
const historySection= document.getElementById("history-section");
const exportCanvas= document.getElementById("export-canvas");  

console.log(" Elementos del DOM encontrados:", {
  paletteEl, btnGenerate, btnSave, btnExport, btnClear
});


let currentSize    = 6;       
let currentFormat  = "hex";     
let currentColors  = [];      
let lockedColors   = {};      
let savedPalettes  = [];      
console.log("Estado inicial:", { currentSize, currentFormat });


function cargarHistorial() {
  try {
    
    const guardado = localStorage.getItem("colorfly_palettes");
    if (guardado) {
      savedPalettes = JSON.parse(guardado); 
      console.log("Historial cargado desde localStorage:", savedPalettes.length, "paleta(s)");
    }
  } catch (error) {
    console.warn("Error al leer localStorage:", error);
  }
}


function guardarEnStorage() {
  try {
    localStorage.setItem("colorfly_palettes", JSON.stringify(savedPalettes));
    console.log("Historial guardado en localStorage:", savedPalettes.length, "paleta(s)");
  } catch (error) {
    console.warn("Error al guardar en localStorage:", error);
  }
}


let toastTimer; 

function mostrarToast(mensaje) {
  console.log("Toast:", mensaje);

  toastEl.textContent = mensaje;
  toastEl.classList.add("show");

  
  clearTimeout(toastTimer);

  
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}




function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function hslAHex(h, s, l) {
  s = s / 100;
  l = l / 100;

  
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)       
      .padStart(2, "0");  
  };

  return "#" + f(0) + f(8) + f(4);
}


function generarColorAleatorio() {
  const h = aleatorio(0, 360);     
  const s = aleatorio(45, 90);     
  const l = aleatorio(35, 65);     
  const hex = hslAHex(h, s, l);

  return { h, s, l, hex };
}




function getCodigoFormato(color, formato) {
  if (formato === "hex") {
    return color.hex.toUpperCase();
  } else {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }
}


function getCodigoSecundario(color, formato) {
  if (formato === "hex") {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  } else {
    return color.hex.toUpperCase();
  }
}


function copiarAlPortapapeles(texto) {
  
  navigator.clipboard.writeText(texto)
    .then(() => {
      console.log(" Copiado:", texto);
      mostrarToast(`✓ Copiado: ${texto}`);
    })
    .catch((error) => {
      console.warn(" Error al copiar:", error);
      mostrarToast("No se pudo copiar");
    });
}


function renderizarPaleta() {
  console.log("Renderizando paleta:", currentColors.length, "colores · formato:", currentFormat);

  
  paletteEl.innerHTML = "";

  
  currentColors.forEach((color, index) => {
    const estaBlockeado = lockedColors[index] === true;
    const codigoPrincipal  = getCodigoFormato(color, currentFormat);
    const codigoSecundario = getCodigoSecundario(color, currentFormat);

    
    const card = document.createElement("article");
    card.className = "color-card" + (estaBlockeado ? " locked" : "");
    card.setAttribute("aria-label", `Color ${index + 1}: ${codigoPrincipal}`);
    
    card.style.animationDelay = (index * 40) + "ms";

    
    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.backgroundColor = color.hex;

    
    const lockBtn = document.createElement("button");
    lockBtn.className = "lock-btn";
    lockBtn.setAttribute("aria-label", estaBlockeado ? "Desbloquear color" : "Bloquear color");
    lockBtn.setAttribute("aria-pressed", estaBlockeado ? "true" : "false");
    lockBtn.textContent = estaBlockeado ? "🔒" : "🔓";

    
    lockBtn.addEventListener("click", (evento) => {
      evento.stopPropagation(); 
      lockedColors[index] = !lockedColors[index];
      console.log(`🔐 Color ${index} ${lockedColors[index] ? "bloqueado" : "desbloqueado"}`);
      mostrarToast(lockedColors[index] ? "🔒 Color bloqueado" : "🔓 Color desbloqueado");
      renderizarPaleta(); 
    });

    
    const info = document.createElement("div");
    info.className = "color-info";

    
    const btnCodigo1 = document.createElement("button");
    btnCodigo1.className = "color-code-btn";
    btnCodigo1.textContent = codigoPrincipal;
    btnCodigo1.setAttribute("aria-label", `Copiar ${codigoPrincipal}`);
    btnCodigo1.addEventListener("click", () => copiarAlPortapapeles(codigoPrincipal));

    
    const btnCodigo2 = document.createElement("button");
    btnCodigo2.className = "color-code-btn";
    btnCodigo2.textContent = codigoSecundario;
    btnCodigo2.setAttribute("aria-label", `Copiar ${codigoSecundario}`);
    btnCodigo2.addEventListener("click", () => copiarAlPortapapeles(codigoSecundario));

    
    preview.appendChild(lockBtn);
    info.appendChild(btnCodigo1);
    info.appendChild(btnCodigo2);
    card.appendChild(preview);
    card.appendChild(info);

    
    paletteEl.appendChild(card);
  });

  console.log("Paleta renderizada correctamente");
}


function generarPaleta() {
  console.log("Generando paleta · tamaño:", currentSize, "· formato:", currentFormat);

  
  const nuevasPaleta = [];

  for (let i = 0; i < currentSize; i++) {
    if (lockedColors[i] && currentColors[i]) {
      
      nuevasPaleta.push(currentColors[i]);
      console.log(`  🔒 Color ${i} conservado:`, currentColors[i].hex);
    } else {
      
      const nuevoColor = generarColorAleatorio();
      nuevasPaleta.push(nuevoColor);
      console.log(`  Color ${i} generado:`, nuevoColor.hex);
    }
  }

  currentColors = nuevasPaleta;

  
  Object.keys(lockedColors).forEach((key) => {
    if (parseInt(key) >= currentSize) {
      delete lockedColors[key];
    }
  });

  renderizarPaleta();
  mostrarToast(" Nueva paleta generada");
}


function renderizarHistorial() {
  console.log("Renderizando historial:", savedPalettes.length, "paleta(s)");

  
  if (savedPalettes.length === 0) {
    historySection.style.display = "none";
    return;
  }

  historySection.style.display = "block";
  historyList.innerHTML = "";

  savedPalettes.forEach((paleta, index) => {
    
    const item = document.createElement("div");
    item.className = "history-item";

    
    const strip = document.createElement("div");
    strip.className = "history-strip";

    paleta.colors.forEach((hex) => {
      const chip = document.createElement("div");
      chip.className = "history-chip";
      chip.style.backgroundColor = hex;
      chip.setAttribute("aria-hidden", "true"); 
      strip.appendChild(chip);
    });

    
    const meta = document.createElement("span");
    meta.className = "history-meta";
    const fecha = new Date(paleta.timestamp);
    
    meta.textContent = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    
    const delBtn = document.createElement("button");
    delBtn.className = "history-del";
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", "Eliminar paleta guardada");

    delBtn.addEventListener("click", () => {
      console.log("🗑 Eliminando paleta del historial en índice:", index);
      savedPalettes.splice(index, 1); 
      guardarEnStorage();
      renderizarHistorial();
      mostrarToast("🗑 Paleta eliminada");
    });

    
    item.appendChild(strip);
    item.appendChild(meta);
    item.appendChild(delBtn);
    historyList.appendChild(item);
  });
}


function guardarPaleta() {
  if (currentColors.length === 0) {
    console.warn("⚠️ No hay colores para guardar");
    mostrarToast("⚠️ Primero genera una paleta");
    return;
    console.log("Guardando:", currentColors);
  }

  const nuevaPaleta = {
    colors: currentColors.map((c) => c.hex), 
    timestamp: Date.now()                     
  };

  
  savedPalettes.unshift(nuevaPaleta);

  
  if (savedPalettes.length > 12) {
    savedPalettes = savedPalettes.slice(0, 12);
  }

  console.log("Paleta guardada:", nuevaPaleta);

  guardarEnStorage();
  renderizarHistorial();
  mostrarToast("Paleta guardada");
}


function exportarPNG() {
  if (currentColors.length === 0) {
    console.warn("No hay colores para exportar");
    mostrarToast("Primero genera una paleta");
    return;
  }

  console.log("Exportando PNG con", currentColors.length, "colores");

  const anchoPorColor = 160;  
  const altoCanvas    = 200;  
  const altoColor     = 140;  
  const altoTexto     = 60;   

  const anchoTotal = anchoPorColor * currentColors.length;

  
  exportCanvas.width  = anchoTotal;
  exportCanvas.height = altoCanvas;

  const ctx = exportCanvas.getContext("2d"); 

  currentColors.forEach((color, index) => {
    const x = index * anchoPorColor; 

    
    ctx.fillStyle = color.hex;
    ctx.fillRect(x, 0, anchoPorColor, altoColor);

    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, altoColor, anchoPorColor, altoTexto);

    
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(color.hex.toUpperCase(), x + anchoPorColor / 2, altoColor + 22);

    
    ctx.fillStyle = "#666666";
    ctx.font = "11px monospace";
    ctx.fillText(
      `hsl(${color.h},${color.s}%,${color.l}%)`,
      x + anchoPorColor / 2,
      altoColor + 42
    );
  });

  
  const urlImagen = exportCanvas.toDataURL("image/png");
  const linkDescarga = document.createElement("a");
  linkDescarga.href     = urlImagen;
  linkDescarga.download = "colorfly-paleta.png"; 
  linkDescarga.click();  

  console.log("✅ PNG exportado correctamente");
  mostrarToast("📥 PNG exportado");
}


function limpiarHistorial() {
  console.log(" Limpiando historial completo");
  savedPalettes = [];
  guardarEnStorage();
  renderizarHistorial();
  mostrarToast("Historial limpiado");
}


function setupToggle(selectorGrupo, atributoDato, alCambiar) {
  
  const botones = document.querySelectorAll(`${selectorGrupo} .btn`);

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      
      botones.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });

      
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      
      const valor = btn.dataset[atributoDato];
      console.log(`🔘 Toggle [${selectorGrupo}] → ${atributoDato}:`, valor);

      
      alCambiar(valor);
    });
  });

  console.log(`Toggle configurado: ${selectorGrupo} ·`, botones.length, "botones");
}




btnGenerate.addEventListener("click", () => {
  console.log("🖱 Clic en Generar paleta");
  generarPaleta();
});


btnSave.addEventListener("click", () => {
  console.log("Clic en Guardar paleta");
  guardarPaleta();
});


btnExport.addEventListener("click", () => {
  console.log("🖱 Clic en Exportar PNG");
  exportarPNG();
});


btnClear.addEventListener("click", () => {
  console.log("Clic en Limpiar historial");
  limpiarHistorial();
});




setupToggle(".palette-size", "size", (valor) => {
  currentSize = parseInt(valor); 
  lockedColors = {};             
  console.log("Nuevo tamaño:", currentSize);
  generarPaleta();               
});


setupToggle(".format", "format", (valor) => {
  currentFormat = valor;
  console.log("Nuevo formato:", currentFormat);
  renderizarPaleta(); 
});


function init() {
  console.log("Inicializando Colorfly Studio...");
  cargarHistorial();    
  renderizarHistorial(); 
  generarPaleta();      
  console.log("✅ App lista");
}


init();