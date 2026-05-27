# Colorfly Studio 🎨

## Índice

- [¿Qué es Colorfly Studio?](#qué-es-colorfly-studio)
- [Funcionalidades](#funcionalidades)
- [Demo](#demo)
- [Instrucciones de uso](#instrucciones-de-uso)
- [Decisiones técnicas](#decisiones-técnicas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Mejoras futuras](#mejoras-futuras)
- [Créditos](#créditos)

---

## ¿Qué es Colorfly Studio?

Colorfly Studio es una aplicación web que genera paletas de colores aleatorias en formato HEX y HSL. Permite bloquear colores individuales, guardar paletas en el historial y exportarlas como imagen PNG.

---

## Funcionalidades

- 🎲 **Generación aleatoria** de paletas de 6, 8 o 9 colores
- 🔒 **Bloqueo de colores** individuales para conservarlos al regenerar
- 📋 **Copia al portapapeles** con un clic en el código HEX o HSL
- 💾 **Historial de paletas** guardadas (máximo 12), persistente entre sesiones
- 📥 **Exportación PNG** con los códigos de color incluidos
- 📱 **Diseño responsive** adaptado a móvil, tablet y escritorio

---

## Demo


[Demo de uso](./images/GIF-DEMO.gif)


---


---

## Instrucciones de uso

La aplicacion se encuentra actualmente en linea en github pages
[text](https://ndanielgutierrez.github.io/ProyectoM1_NeryGutierrez-/)

Tambien puedes descargarla de manera local 

### Ejecutar en local

Si no tienes git [texto](https://www.youtube.com/watch?v=jdXKwLNUfmg)

1. Clona o descarga el repositorio:


```bash
git clone https://github.com/NDanielGutierrez/ProyectoM1_NeryGutierrez-
```

2. Abre el archivo `index.html` directamente en tu navegador.

No necesitas servidor local ni instalar nada más.

---

### Cómo usar la app

**Generar una paleta**
Pulsa el botón `🎲 Generar paleta`. Cada vez que lo pulsas se generan colores aleatorios nuevos.

**Cambiar el tamaño**
Selecciona 6, 8 o 9 en el selector de tamaño. La paleta se regenera automáticamente.

**Cambiar el formato**
Alterna entre HEX y HSL. Los códigos de todas las cards se actualizan al instante.

**Bloquear un color**
Pulsa el candado 🔓 en cualquier card. Ese color quedará fijo la próxima vez que generes. El candado cambia a 🔒 para indicar que está bloqueado.

**Copiar un código**
Haz clic directamente sobre el código HEX o HSL dentro de la card. Se copia al portapapeles y aparece una notificación de confirmación.

**Guardar una paleta**
Pulsa `💾 Guardar paleta`. La paleta actual se añade al historial y se guarda en el navegador aunque recargues la página.

**Exportar como PNG**
Pulsa `📥 Exportar PNG`. Se descarga automáticamente una imagen con los colores y sus códigos.

**Limpiar el historial**
Pulsa `🗑 Limpiar historial` para borrar todas las paletas guardadas.

---

### GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a `Settings → Pages`.
3. En `Source`, selecciona la rama `main` y la carpeta `/ (root)`.
4. GitHub genera automáticamente la URL pública.

---

## Decisiones técnicas

### Actualización independiente del DOM al bloquear
Cuando el usuario bloquea un color, en lugar de redibujar toda la paleta solo se actualizan los atributos de la card afectada. Esto evita que la animación de entrada se dispare innecesariamente en todas las cards.

### Generación de colores en espacio HSL

Los colores se generan en HSL (matiz, saturación, luminosidad) en lugar de RGB aleatorio puro. Esto garantiza que todos los colores generados sean visualmente agradables, evitando tonos demasiado apagados o saturados, al limitar los rangos:

```js
const h = aleatorio(0, 360);   // cualquier matiz
const s = aleatorio(45, 90);   // saturación media-alta
const l = aleatorio(35, 65);   // luminosidad equilibrada
```

### Estado global con variables compartidas

Toda la app comparte un estado central de cinco variables (`currentColors`, `lockedColors`, `currentSize`, `currentFormat`, `savedPalettes`). Este patrón es sencillo y adecuado para una app de esta escala, sin necesidad de gestores de estado externos.

### Toast con timer cancelable

El sistema de notificaciones usa clearTimeout antes de cada setTimeout, lo que evita que aparezcan múltiples toasts solapados si el usuario pulsa botones rápidamente

### Persistencia con localStorage

El historial de paletas se guarda en `localStorage` serializado en JSON. Se limita a 12 paletas para no saturar el almacenamiento del navegador. Toda lectura y escritura está envuelta en `try/catch` para manejar casos donde el usuario tenga el almacenamiento bloqueado.

### Exportación PNG con Canvas API

La exportación se realiza dibujando sobre un elemento `<canvas>` oculto en el DOM, generando la imagen en memoria y disparando una descarga automática sin enviar nada a ningún servidor.

### Bloqueos que sobreviven al cambio de tamaño

Cuando el usuario cambia el número de colores, los bloqueos existentes se conservan en lugar de resetearse. Solo se eliminan los índices que quedan fuera del nuevo tamaño, preservando la intención del usuario.

### Accesibilidad

Se aplicaron atributos ARIA en los elementos interactivos (`aria-label`, `aria-pressed`, `aria-live`, `role`) para mejorar la compatibilidad con lectores de pantalla. Los grupos de botones usan `<fieldset>` y `<legend>` para describir su propósito semánticamente.

---

## Estructura del proyecto

```
colorfly-studio/
├── index.html
├── CSS/
│   └── styles.css
├── JS/
│   └── app.js
├── images/
│   ├── Colorify-logo.png
│   └── (capturas para el README)
└── README.md
```

---

## Mejoras futuras
Este proyecto es bueno para practicar la integracion de funciones en un ambiente controlado por lo que a futuro intentare agregar mas

- [ ] Modo oscuro con alternancia manual
- [ ] Generación de paletas armónicas (complementarias, análogas, triádicas)
- [ ] Previsualización de la paleta aplicada sobre una UI de ejemplo
- [ ] Exportación en formatos adicionales
- [ ] Opción de cargar una imagen y extraer su paleta de colores
- [ ] Compartir paleta mediante URL con los colores codificados en los parámetros

---

## Créditos

Desarrollado por Neri Daniel Gutierrez Madrigal




