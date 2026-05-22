// función reutilizable
function setupToggle(groupSelector, dataAttr) {
  const buttons = document.querySelectorAll(`${groupSelector} .btn`);

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // quitar active
      buttons.forEach(b => b.classList.remove("active"));

      // activar el clickeado
      btn.classList.add("active");

      // valor seleccionado
      console.log(btn.dataset[dataAttr]);
    });
  });
}

setupToggle(".palette-size", "size");
setupToggle(".format", "format");   