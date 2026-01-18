function parseTimeToSeconds(t) {
  const parts = t.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function formatTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = Math.floor(min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generatePlan() {
  const startTimeStr = document.getElementById("startTime").value;
  const raceHours = parseFloat(document.getElementById("raceDuration").value);
  const pitSeconds = parseFloat(document.getElementById("pitSeconds").value);

  const fuelCapacity = parseFloat(document.getElementById("fuelCapacity").value);
  const fuelPerLap = parseFloat(document.getElementById("fuelPerLap").value);
  const lapTimeStr = document.getElementById("lapTime").value;

  if (!startTimeStr) {
    alert("Heure de départ invalide");
    return;
  }

  const lapTimeSeconds = parseTimeToSeconds(lapTimeStr);

  const lapsPerStint = Math.floor(fuelCapacity / fuelPerLap);
  const stintSeconds = lapsPerStint * lapTimeSeconds;

  const stintMinutes = stintSeconds / 60;
  const pitMinutes = pitSeconds / 60;

  document.getElementById("stintInfo").innerText =
    `Relais: ${lapsPerStint} tours ≈ ${Math.round(stintMinutes)} min`;

  const drivers = [];
  document.querySelectorAll("#driversList li").forEach(li => {
    drivers.push({ name: li.firstChild.textContent.trim(), total: 0 });
  });

  if (drivers.length === 0) {
    alert("Ajoute des pilotes");
    return;
  }

  const [startH, startM] = startTimeStr.split(":").map(Number);
  let currentTime = startH * 60 + startM;
  const totalMinutes = raceHours * 60;

  const table = document.getElementById("planTable");
  table.innerHTML = "";

  let elapsed = 0;

  while (elapsed < totalMinutes - 0.1) {
    drivers.sort((a, b) => a.total - b.total);
    const driver = drivers[0];

    const start = currentTime;
    const end = currentTime + stintMinutes;

    addRow(start, end, driver.name);

    driver.total += stintMinutes;
    currentTime = end + pitMinutes;
    elapsed = currentTime - (startH * 60 + startM);
  }

  renderDrivers(drivers);
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

function renderDrivers(drivers) {
  const ul = document.getElementById("driversList");
  ul.innerHTML = "";
  drivers.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.name} (${Math.round(d.total)} min)`;
    ul.appendChild(li);
  });
}
