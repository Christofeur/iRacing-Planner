let drivers = [];

function addDriver() {
  const input = document.getElementById("driverName");
  const name = input.value.trim();
  if (!name) return;

  drivers.push({
    name: name,
    total: 0
  });

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

  drivers.forEach((d, i) => {
    const li = document.createElement("li");
    li.textContent = d.name + " ";

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => removeDriver(i);

    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function parseTimeToSeconds(t) {
  const parts = t.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function formatTime(min) {
  min = ((min % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = Math.floor(min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
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

    const start = currentTime;
    const end = currentTime + stintMinutes;

    addRow(start, end, driver.name);

    driver.total += stintMinutes;

    currentTime = end + pitMinutes;
    elapsed = currentTime - baseStart;
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
