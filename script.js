let drivers = [];

function addDriver() {
  const input = document.getElementById("driverName");
  const name = input.value.trim();
  if (name === "") return;

  drivers.push(name);
  input.value = "";
  renderDrivers();
}

function removeDriver(index) {
  drivers.splice(index, 1);
  renderDrivers();
}

function renderDrivers() {
  const list = document.getElementById("driverList");
  list.innerHTML = "";
  drivers.forEach((d, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${d} <button onclick="removeDriver(${i})">🗑️</button>`;
    list.appendChild(li);
  });
}

function generatePlan() {
  if (drivers.length === 0) {
    alert("Ajoute au moins un pilote !");
    return;
  }

  const raceHours = Number(document.getElementById("raceHours").value);
  const stintMinutes = Number(document.getElementById("stintMinutes").value);
  const pitMinutes = Number(document.getElementById("pitMinutes").value);

  const totalMinutes = raceHours * 60;
  const table = document.getElementById("planTable");
  table.innerHTML = "";

  let currentTime = 0;
  let stintIndex = 0;

  while (currentTime < totalMinutes) {
    const driver = drivers[stintIndex % drivers.length];
    const start = currentTime;
    const end = Math.min(currentTime + stintMinutes, totalMinutes);

    addRow(start, end, driver, "Drive");

    currentTime = end;

    if (currentTime < totalMinutes) {
      addRow(currentTime, currentTime + pitMinutes, "—", "Pit");
      currentTime += pitMinutes;
    }

    stintIndex++;
  }
}

function addRow(startMin, endMin, driver, action) {
  const table = document.getElementById("planTable");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${formatTime(startMin)}</td>
    <td>${formatTime(endMin)}</td>
    <td>${driver}</td>
    <td>${action}</td>
  `;

  table.appendChild(tr);
}

function formatTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = Math.floor(min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
