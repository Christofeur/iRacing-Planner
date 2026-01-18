let drivers = [];

function addDriver() {
  const input = document.getElementById("driverName");
  const name = input.value.trim();
  if (!name) return;

  drivers.push(name);
  input.value = "";
  renderDrivers();
}

function removeDriver(index) {
  drivers.splice(index, 1);
  renderDrivers();
}

function renderDrivers() {
  const ul = document.getElementById("driversList");
  ul.innerHTML = "";

  drivers.forEach((name, i) => {
    const li = document.createElement("li");
    li.textContent = name + " ";

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => removeDriver(i);

    li.appendChild(btn);
    ul.appendChild(li);
  });
}
