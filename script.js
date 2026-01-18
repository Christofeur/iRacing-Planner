let drivers = [];

function addDriver() {
  alert("Le bouton fonctionne !");
  
  const input = document.getElementById("driverName");
  const name = input.value.trim();
  if (!name) return;

  drivers.push(name);
  input.value = "";
  renderDrivers();
}

function renderDrivers() {
  const ul = document.getElementById("driversList");
  ul.innerHTML = "";

  drivers.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    ul.appendChild(li);
  });
}
