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

function generatePlan() {
  const raceHours = Number(document.getElementById("raceHours").value);

  if (drivers.length === 0) {
    alert("Ajoute au moins un pilote");
    return;
  }

  if (raceHours <= 0) {
    alert("Durée de course invalide");
    return;
  }

  // Pour l’instant : 1 relais = 1 heure
  const totalStints = raceHours;

  const plan = [];
  let driverIndex = 0;

  for (let i = 0; i < totalStints; i++) {
    plan.push(drivers[driverIndex]);
    driverIndex = (driverIndex + 1) % drivers.length;
  }

  renderPlan(plan);
}

function renderPlan(plan) {
  const ol = document.getElementById("planList");
  ol.innerHTML = "";

  plan.forEach((driver, i) => {
    const li = document.createElement("li");
    li.textContent = `Relais ${i + 1} : ${driver}`;
    ol.appendChild(li);
  });
}
