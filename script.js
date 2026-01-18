let drivers = [];

window.onload = function () {
  document.getElementById("addDriverBtn").onclick = addDriver;
  document.getElementById("generateBtn").onclick = generatePlan;
};

function addDriver() {
  const input = document.getElementById("driverName");
  const name = input.value.trim();
  if (!name) return;

  drivers.push({
    name: name,
    total: 0,
    mode: "single"
  });

  input.value = "";
  renderDrivers();
}

function removeDriver(index) {
  drivers.splice(index, 1);
  renderDrivers();
}

function setDriverMode(index, mode) {
  drivers[index].mode = mode;
}

function renderDrivers() {
  const tbody = document.getElementById("driversTable");
  tbody.innerHTML = "";

  drivers.forEach((d, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.name}</td>
      <td>
        <select onchange="setDriverMode(${i}, this.value)">
          <option value="single" ${d.mode === "single" ? "selected" : ""}>Simple</option>
          <option value="double" ${d.mode === "double" ? "selected" : ""}>Double</option>
        </select>
      </td>
      <td>
        <button onclick="removeDriver(${i})">❌</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function parseTimeToSeconds(t) {
  const parts = t.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function formatTime(totalMinutes) {
  let m = Math.round(totalMinutes);
  m = ((m % (24 * 60)) + (24 * 60)) % (24 * 60);

  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const min = Math.floor(m % 60).toString().padStart(2, "0");

  return `${h}:${min}`;
}

function generatePlan() {
  if (drivers.length === 0) {
    alert("Ajoute au moins un pilote");
    return;
  }

  const startTimeStr = document.getElementById("startTime").value;
  const raceHours = parseFloat(document.getElementById("raceDuration").value);
  const pitSeconds = parseFloat(document.getElementById("pitSeconds").value);

  const fuelCapacity = parseFloat(document.getElementById("fuelCapacity").value);
  const fuelPerLap = parseFloat(document.getElementById("fuelPerLap").value);
  const lapTimeStr = document.getElementById("lapTime").value;

  const lapTimeSeconds = parseTimeToSeconds(lapTimeStr);

  const lapsPerStint = Math.floor(fuelCapacity / fuelPerLap);
  const stintSeconds = lapsPerStint * lapTimeSeconds;

  const stintMinutes = stintSeconds / 60;
  const pitMinutes = pitSeconds / 60;

  document.getElementById("stintInfo").innerText =
    `Relais: ${lapsPerStint} tours ≈ ${Math.round(stintMinutes)} min`;

  const [startH, startM] = startTimeStr.split(":").map(Number);
  const baseStart = startH * 60 + startM;

  const table = document.getElementById("planTable");
  table.innerHTML = "";

  drivers.forEach(d => d.total = 0);

  let elapsed = 0;
  let currentTime = baseStart;
  const totalMinutes = raceHours * 60;

  while (elapsed < totalMinutes - 0.01) {
    drivers.sort((a, b) => a.total - b.total);
    const driver = drivers[0];

    const repeats = driver.mode === "double" ? 2 : 1;

    for (let r = 0; r < repeats; r++) {
      if (elapsed >= totalMinutes - 0.01) break;

      const start = currentTime;
      const end = currentTime + stintMinutes;

      addRow(start, end, driver.name);

      driver.total += stintMinutes;

      currentTime = end + pitMinutes;
      elapsed = currentTime - baseStart;
    }
  }
}

function addRow(startMin, endMin, driver) {
  const table = document.getElementById("planTable");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${formatTime(startMin)}</td>
    <td>${formatTime(endMin)}</td>
    <td>${driver}</td>
  `;

  table.appendChild(tr);
}
