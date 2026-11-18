
const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".admin-section");
const quickActions = document.querySelectorAll(".quick-action");
const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

function mostrarSeccion(nombre) {
  sections.forEach(section => {
    section.classList.toggle("active", section.id === nombre);
  });

  menuItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.section === nombre
    );
  });

  const opcionActiva = document.querySelector(
    `.menu-item[data-section="${nombre}"]`
  );

  if (opcionActiva) {
    pageTitle.textContent = opcionActiva.textContent.trim();
  }

  sidebar.classList.remove("open");
}

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    mostrarSeccion(item.dataset.section);
  });
});

quickActions.forEach(action => {
  action.addEventListener("click", () => {
    mostrarSeccion(action.dataset.section);
  });
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});
