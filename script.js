// =========================
// GLOBAL
// =========================

let strategy = [];

// =========================
// INIT
// =========================

window.onload = function () {

    addDriver();

};

// =========================
// DRIVER
// =========================

function addDriver() {

    const container =
        document.getElementById(
            "driversContainer"
        );

    const card =
        document.createElement("div");

    card.className =
        "driver-card";

    card.innerHTML = `

        <div class="driver-top">

            <input
                type="text"
                placeholder="Nom pilote"
                class="driver-name"
                oninput="updateSOF(); updateStartingDrivers();">

            <input
                type="number"
                placeholder="iRating"
                class="driver-ir"
                oninput="updateSOF()">

            <button
                class="remove-btn"
                type="button"
                onclick="removeDriver(this)">

                ✕

            </button>

        </div>

        <div class="field" style="margin-top:15px;">

            <label>
                Indisponibilités
            </label>

            <button
                class="small-btn"
                type="button"
                onclick="addUnavailability(this)">

                + INDISPO

            </button>

            <div class="unavailability-list"></div>

        </div>

    `;

    container.appendChild(card);

}

function removeDriver(button) {

    button.closest(".driver-card")
        .remove();

    updateSOF();

    updateStartingDrivers();

}

// =========================
// SOF
// =========================

function updateSOF() {

    const irInputs =
        document.querySelectorAll(
            ".driver-ir"
        );

    let total = 0;

    let count = 0;

    irInputs.forEach(input => {

        const value =
            parseInt(input.value);

        if (!isNaN(value)) {

            total += value;

            count++;

        }

    });

    document.getElementById(
        "sofValue"
    ).innerText =
        count > 0
            ? Math.round(total / count)
            : 0;

}

// =========================
// START DRIVER
// =========================

function updateStartingDrivers() {

    const select =
        document.getElementById(
            "startingDriver"
        );

    const current =
        select.value;

    select.innerHTML = `

        <option value="">
            Choisir pilote
        </option>

    `;

    document
        .querySelectorAll(".driver-name")
        .forEach(input => {

            const name =
                input.value.trim();

            if (name !== "") {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = name;

                option.innerText = name;

                select.appendChild(option);

            }

        });

    select.value = current;

}

// =========================
// UNAVAILABILITY
// =========================

function addUnavailability(button) {

    const list =
        button.parentElement
            .querySelector(
                ".unavailability-list"
            );

    const row =
        document.createElement("div");

    row.className =
        "unavailability-row";

    row.style.marginTop =
        "10px";

    row.innerHTML = `

        <div style="display:flex; gap:10px; align-items:center;">

            <input
                type="time"
                class="unavailable-start">

            <input
                type="time"
                class="unavailable-end">

            <button
                class="remove-btn"
                type="button"
                onclick="removeUnavailability(this)">

                ✕

            </button>

        </div>

    `;

    list.appendChild(row);

}

function removeUnavailability(button) {

    button.closest(
        ".unavailability-row"
    ).remove();

}

// =========================
// TIME
// =========================

function timeToSeconds(timeString) {

    const split =
        timeString.split(":");

    return (

        parseInt(split[0]) * 3600 +

        parseInt(split[1]) * 60

    );

}

function lapTimeToSeconds(time) {

    const split =
        time.split(":");

    return (

        parseInt(split[0]) * 60 +

        parseFloat(split[1])

    );

}

function formatTime(seconds) {

    seconds =
        Math.floor(seconds);

    const hours =
        Math.floor(seconds / 3600) % 24;

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    return (

        String(hours).padStart(2, "0") +

        ":" +

        String(minutes).padStart(2, "0")

    );

}

// =========================
// UNAVAILABLE CHECK
// =========================

function isDriverUnavailable(
    driver,
    stintStart,
    stintEnd
) {

    const startDay =
        stintStart % 86400;

    const endDay =
        stintEnd % 86400;

    for (
        let i = 0;
        i < driver.unavailabilities.length;
        i++
    ) {

        const unavailable =
            driver.unavailabilities[i];

        const unavailableStart =
            timeToSeconds(
                unavailable.start
            );

        const unavailableEnd =
            timeToSeconds(
                unavailable.end
            );

        if (

            startDay < unavailableEnd &&

            endDay > unavailableStart

        ) {

            return true;

        }

    }

    return false;

}

// =========================
// GENERATE STRATEGY
// =========================


function generateStrategy() {

    strategy = [];

    // =====================
    // INPUTS
    // =====================

    const raceDuration =
        parseInt(
            document.getElementById(
                "raceDuration"
            ).value
        );

    const lapTime =
        document.getElementById(
            "lapTime"
        ).value;

    const fuelCapacity =
        parseFloat(
            document.getElementById(
                "fuelCapacity"
            ).value
        );

    const fuelPerLap =
        parseFloat(
            document.getElementById(
                "fuelPerLap"
            ).value
        );

    const startTime =
        document.getElementById(
            "startTime"
        ).value;

    const relayType =
        document.getElementById(
            "relayType"
        ).value;

    const startingDriver =
        document.getElementById(
            "startingDriver"
        ).value;

    if (

        !raceDuration ||

        !lapTime ||

        !fuelCapacity ||

        !fuelPerLap ||

        !startTime ||

        !startingDriver

    ) {

        alert(
            "Complète tous les champs."
        );

        return;

    }

    // =====================
    // DRIVERS
    // =====================

    let drivers = [];

    document.querySelectorAll(
        ".driver-card"
    ).forEach(card => {

        const name =
            card.querySelector(
                ".driver-name"
            ).value;

        const ir =
            card.querySelector(
                ".driver-ir"
            ).value;

        let unavailabilities = [];

        card.querySelectorAll(
            ".unavailability-row"
        ).forEach(row => {

            unavailabilities.push({

                start:
                    row.querySelector(
                        ".unavailable-start"
                    ).value,

                end:
                    row.querySelector(
                        ".unavailable-end"
                    ).value

            });

        });

        if (name.trim() !== "") {

            drivers.push({

                name,
                ir,
                unavailabilities,
                totalLaps: 0,
                relayBlocks: 0

            });

        }

    });

    // =====================
    // TIMES
    // =====================

    const lapTimeSeconds =
        lapTimeToSeconds(
            lapTime
        );

    const lapsPerStint =
        Math.floor(
            fuelCapacity / fuelPerLap
        );

    const stintDuration =
        lapsPerStint *
        lapTimeSeconds;

    const totalRaceSeconds =
        raceDuration * 60;

    const estimatedTotalLaps =
        Math.floor(
            totalRaceSeconds /
            lapTimeSeconds
        );

    const minimumLaps =
        Math.floor(
            estimatedTotalLaps /
            drivers.length
        );

    const split =
        startTime.split(":");

    let currentTime =

        parseInt(split[0]) * 3600 +

        parseInt(split[1]) * 60;

    let remaining =
        totalRaceSeconds;

    let stintNumber = 1;

    // =====================
    // START DRIVER
    // =====================

    let currentDriver =
        drivers.find(
            d =>
                d.name ===
                startingDriver
        );

    if (!currentDriver) {

        currentDriver =
            drivers[0];

    }

    // =====================
    // MAIN LOOP
    // =====================

    while (remaining > 0) {

        // =====================
        // RELAY COUNT
        // =====================

      
let relayCount = 1;

if (
    relayType === "double" &&
    stintNumber !== 1
) {

    relayCount = 2;

}

        // =====================
        // RUN BLOCK
        // =====================

        let blockLaps = 0;

        for (
            let i = 0;
            i < relayCount;
            i++
        ) {

            if (remaining <= 0)
                break;

            // =====================
            // UNAVAILABLE
            // =====================

            let attempts = 0;

            while (

                isDriverUnavailable(
                    currentDriver,
                    currentTime,
                    currentTime + stintDuration
                ) &&

                attempts < drivers.length

            ) {

                currentDriver =
                    drivers[
                        (drivers.indexOf(
                            currentDriver
                        ) + 1) %
                        drivers.length
                    ];

                attempts++;

            }

            const actualDuration =
                Math.min(
                    stintDuration,
                    remaining
                );

            const actualLaps =
                Math.floor(
                    actualDuration /
                    lapTimeSeconds
                );

            blockLaps +=
                actualLaps;

            strategy.push({

                stint:
                    stintNumber,

                driver:
                    currentDriver.name,

                start:
                    formatTime(
                        currentTime
                    ),

                end:
                    formatTime(
                        currentTime +
                        actualDuration
                    ),

                laps:
                    actualLaps

            });

            currentDriver.totalLaps +=
                actualLaps;

            currentTime +=
                actualDuration;

            remaining -=
                actualDuration;

            stintNumber++;

        }

        currentDriver.relayBlocks++;

        // =====================
        // NEXT DRIVER SELECTION
        // =====================

        let availableDrivers =
            drivers.filter(driver => {

                return !isDriverUnavailable(

                    driver,

                    currentTime,

                    currentTime +
                    stintDuration

                );

            });

        if (
            availableDrivers.length === 0
        ) {

            availableDrivers =
                drivers;

        }

        // =====================
        // IRACING SAFETY
        // =====================

        let criticalDrivers =
            availableDrivers.filter(driver => {

                const remainingNeeded =

                    minimumLaps -
                    driver.totalLaps;

                return (
                    remainingNeeded >
                    0
                );

            });

        // =====================
        // PRIORITY:
        // DRIVERS UNDER MINIMUM
        // =====================

        if (
            criticalDrivers.length > 0
        ) {

            criticalDrivers.sort(
                (a, b) =>

                    a.totalLaps -
                    b.totalLaps

            );

            currentDriver =
                criticalDrivers[0];

        }

        // =====================
        // NORMAL BALANCE
        // =====================

        else {

            availableDrivers.sort(
                (a, b) => {

                    // PRIORITY 1:
                    // LOWEST LAPS

                    if (
                        a.totalLaps !==
                        b.totalLaps
                    ) {

                        return (

                            a.totalLaps -
                            b.totalLaps

                        );

                    }

                    // PRIORITY 2:
                    // LOWEST BLOCKS

                    return (

                        a.relayBlocks -
                        b.relayBlocks

                    );

                }
            );

            currentDriver =
                availableDrivers[0];

        }

    }

    // =====================
    // FINAL
    // =====================

    renderStrategy();

    updateIncidentStints();

    updateIRacingRule();

}

function renderStrategy() {

    const tbody =
        document.getElementById(
            "strategyTable"
        );

    tbody.innerHTML = "";

    strategy.forEach(stint => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${stint.stint}</td>
            <td>${stint.start}</td>
            <td>${stint.end}</td>
            <td>${stint.driver}</td>
            <td>${stint.laps}</td>

        `;

        tbody.appendChild(row);

    });

}

// =========================
// INCIDENTS
// =========================

function updateIncidentStints() {

    const select =
        document.getElementById(
            "incidentStint"
        );

    select.innerHTML = `

        <option value="">
            Choisir un relais
        </option>

    `;

    strategy.forEach(stint => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            stint.stint;

        option.innerText =

            "Relais " +
            stint.stint +
            " - " +
            stint.driver;

        select.appendChild(option);

    });

}


function applyIncident() {

    const selectedStint =
        parseInt(
            document.getElementById(
                "incidentStint"
            ).value
        );

    const restartTime =
        document.getElementById(
            "incidentTime"
        ).value;

    const driverMode =
        document.getElementById(
            "incidentDriverMode"
        ).value;

    if (
        !selectedStint ||
        !restartTime
    ) {

        alert(
            "Complète les infos incident."
        );

        return;

    }

    const impactedIndex =
        strategy.findIndex(
            s =>
                s.stint === selectedStint
        );

    if (impactedIndex < 0)
        return;

    // =========================
    // GARDE AVANT INCIDENT
    // =========================

    let rebuiltStrategy =
        strategy.slice(
            0,
            impactedIndex
        );

    const raceDurationSeconds =
        parseInt(
            document.getElementById(
                "raceDuration"
            ).value
        ) * 60;

    const raceStart =
        timeToSeconds(
            document.getElementById(
                "startTime"
            ).value
        );

    const raceEnd =
        raceStart +
        raceDurationSeconds;

    const lapTimeSeconds =
        lapTimeToSeconds(
            document.getElementById(
                "lapTime"
            ).value
        );

    const fuelCapacity =
        parseFloat(
            document.getElementById(
                "fuelCapacity"
            ).value
        );

    const fuelPerLap =
        parseFloat(
            document.getElementById(
                "fuelPerLap"
            ).value
        );

    const relayType =
        document.getElementById(
            "relayType"
        ).value;

    const lapsPerStint =
        Math.floor(
            fuelCapacity / fuelPerLap
        );

    const stintDuration =
        lapsPerStint *
        lapTimeSeconds;

    // =========================
    // DRIVERS
    // =========================

    let drivers = [];

    document.querySelectorAll(
        ".driver-card"
    ).forEach(card => {

        drivers.push({

            name:
                card.querySelector(
                    ".driver-name"
                ).value

        });

    });

    // =========================
    // PILOTE INCIDENT
    // =========================

    const impactedDriver =
        strategy[
            impactedIndex
        ].driver;

    let restartDriver =
        impactedDriver;

    // =========================
    // NEXT DRIVER
    // =========================

    if (
        driverMode === "next"
    ) {

        for (
            let i = impactedIndex + 1;
            i < strategy.length;
            i++
        ) {

            if (
                strategy[i].driver !==
                impactedDriver
            ) {

                restartDriver =
                    strategy[i].driver;

                break;

            }

        }

    }

    let driverIndex =
        drivers.findIndex(
            d =>
                d.name === restartDriver
        );

    if (driverIndex < 0)
        driverIndex = 0;

    let currentTime =
        timeToSeconds(
            restartTime
        );

    let remainingTime =
        raceEnd - currentTime;

    let stintNumber =
        rebuiltStrategy.length + 1;

    // =========================
    // FIRST RESTART FLAG
    // =========================

    let firstRestart = true;

    // =========================
    // MAIN LOOP
    // =========================

    while (remainingTime > 0) {

        let currentDriver =
            drivers[driverIndex];

        let relayCount = 1;

        // =========================
        // DOUBLE RELAY
        // =========================

        if (
            relayType === "double"
        ) {

            // =========================
            // SAME DRIVER
            // => only ONE relay restart
            // =========================

            if (
                driverMode === "same" &&
                firstRestart
            ) {

                relayCount = 1;

            }

            // =========================
            // NORMAL DOUBLE
            // =========================

            else {

                relayCount = 2;

            }

        }

        // =========================
        // BUILD RELAYS
        // =========================

        for (
            let i = 0;
            i < relayCount;
            i++
        ) {

            if (
                remainingTime <= 0
            ) {

                break;

            }

            let endTime =
                currentTime +
                stintDuration;

            if (
                endTime >
                raceEnd
            ) {

                endTime =
                    raceEnd;

            }

            const actualDuration =
                endTime -
                currentTime;

            if (
                actualDuration < 300
            ) {

                remainingTime = 0;

                break;

            }

            rebuiltStrategy.push({

                stint:
                    stintNumber,

                driver:
                    currentDriver.name,

                start:
                    formatTime(
                        currentTime
                    ),

                end:
                    formatTime(
                        endTime
                    ),

                laps:
                    Math.floor(
                        actualDuration /
                        lapTimeSeconds
                    )

            });

            currentTime =
                endTime;

            remainingTime =
                raceEnd -
                currentTime;

            stintNumber++;

        }

        // =========================
        // AFTER FIRST RESTART
        // =========================

        firstRestart = false;

        // =========================
        // NEXT DRIVER
        // =========================

        driverIndex++;

        if (
            driverIndex >= drivers.length
        ) {

            driverIndex = 0;

        }

    }

    strategy =
        rebuiltStrategy;

    renderStrategy();

    updateIncidentStints();

    updateIRacingRule();

}


// =========================
// IRACING RULE
// =========================




function updateIRacingRule() {

    const result =
        document.getElementById(
            "iracingRuleResult"
        );

    if (
        strategy.length === 0
    ) {

        result.innerHTML =
            "Aucun planning généré.";

        return;

    }

    // =========================
    // TOTAL LAPS
    // =========================

    let totalLaps = 0;

    strategy.forEach(stint => {

        totalLaps +=
            stint.laps;

    });

    // =========================
    // DRIVER STATS
    // =========================

    const drivers = {};

    strategy.forEach(stint => {

        // =====================
        // CREATE DRIVER
        // =====================

        if (
            !drivers[
                stint.driver
            ]
        ) {

            drivers[
                stint.driver
            ] = {

                laps: 0,
                driveTime: 0

            };

        }

        // =====================
        // LAPS
        // =====================

        drivers[
            stint.driver
        ].laps += stint.laps;

        // =====================
        // DRIVE TIME
        // =====================

        const startSeconds =
            timeToSeconds(
                stint.start
            );

        const endSeconds =
            timeToSeconds(
                stint.end
            );

        let duration =
            endSeconds -
            startSeconds;

        // PASSAGE MINUIT

        if (
            duration < 0
        ) {

            duration += 86400;

        }

        drivers[
            stint.driver
        ].driveTime += duration;

    });

    // =========================
    // FAIR SHARE
    // =========================

    const driverCount =
        Object.keys(
            drivers
        ).length;

    const equalShare =
        Math.floor(
            totalLaps /
            driverCount
        );

    const minimum =
        Math.ceil(
            equalShare * 0.25
        );

    // =========================
    // DISPLAY
    // =========================

    let html = `

        <div style="margin-bottom:15px;">

            Minimum requis :
            <strong>
                ${minimum} tours
            </strong>

        </div>

    `;

    Object.keys(drivers)
        .forEach(driver => {

            const laps =
                drivers[driver].laps;

            const driveTime =
                drivers[driver].driveTime;

            const hours =
                Math.floor(
                    driveTime / 3600
                );

            const minutes =
                Math.floor(
                    (driveTime % 3600) / 60
                );

            const ok =
                laps >= minimum;

            html += `

                <div style="
                    margin-bottom:15px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                ">

                    <span>
                        ${driver}
                    </span>

                    <strong style="
                        color:
                        ${ok ? '#2ecc71' : '#ff3b5f'};
                    ">

                        ${laps} tours<br>
                        • ${hours}h${String(minutes).padStart(2, "0")}
                        ${ok ? '✅' : '❌'}

                    </strong>

                </div>

            `;

        });

    result.innerHTML =
        html;

}


// =========================
// EXPORT CONFIG
// =========================

function exportConfig() {

    const raceName =
        document.getElementById(
            "raceName"
        ).value ||
        "ascendia_config";

    const config = {

        raceName:
            document.getElementById(
                "raceName"
            ).value,

        raceDuration:
            document.getElementById(
                "raceDuration"
            ).value,

        startTime:
            document.getElementById(
                "startTime"
            ).value,

        lapTime:
            document.getElementById(
                "lapTime"
            ).value,

        fuelCapacity:
            document.getElementById(
                "fuelCapacity"
            ).value,

        fuelPerLap:
            document.getElementById(
                "fuelPerLap"
            ).value,

        pitTime:
            document.getElementById(
                "pitTime"
            ).value,

        relayType:
            document.getElementById(
                "relayType"
            ).value,

        startingDriver:
            document.getElementById(
                "startingDriver"
            ).value,

        strategy,

        drivers: []

    };

    document.querySelectorAll(
        ".driver-card"
    ).forEach(card => {

        let driver = {

            name:
                card.querySelector(
                    ".driver-name"
                ).value,

            ir:
                card.querySelector(
                    ".driver-ir"
                ).value,

            unavailabilities: []

        };

        card.querySelectorAll(
            ".unavailability-row"
        ).forEach(row => {

            driver.unavailabilities.push({

                start:
                    row.querySelector(
                        ".unavailable-start"
                    ).value,

                end:
                    row.querySelector(
                        ".unavailable-end"
                    ).value

            });

        });

        config.drivers.push(driver);

    });

    const blob =
        new Blob(
            [
                JSON.stringify(
                    config,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        raceName + ".json";

    a.click();

}

// =========================
// IMPORT CONFIG
// =========================

function importConfig() {

    const input =
        document.createElement("input");

    input.type = "file";

    input.accept = ".json";

    input.onchange = function (
        event
    ) {

        const file =
            event.target.files[0];

        if (!file)
            return;

        const reader =
            new FileReader();

        reader.onload = function (e) {

            const config =
                JSON.parse(
                    e.target.result
                );

            document.getElementById(
                "raceName"
            ).value =
                config.raceName || "";

            document.getElementById(
                "raceDuration"
            ).value =
                config.raceDuration || "";

            document.getElementById(
                "startTime"
            ).value =
                config.startTime || "";

            document.getElementById(
                "lapTime"
            ).value =
                config.lapTime || "";

            document.getElementById(
                "fuelCapacity"
            ).value =
                config.fuelCapacity || "";

            document.getElementById(
                "fuelPerLap"
            ).value =
                config.fuelPerLap || "";

            document.getElementById(
                "pitTime"
            ).value =
                config.pitTime || "";

            document.getElementById(
                "relayType"
            ).value =
                config.relayType || "simple";

            document.getElementById(
                "driversContainer"
            ).innerHTML = "";

            config.drivers.forEach(
                driver => {

                    addDriver();

                    const cards =
                        document.querySelectorAll(
                            ".driver-card"
                        );

                    const card =
                        cards[
                            cards.length - 1
                        ];

                    card.querySelector(
                        ".driver-name"
                    ).value =
                        driver.name;

                    card.querySelector(
                        ".driver-ir"
                    ).value =
                        driver.ir;

                    const list =
                        card.querySelector(
                            ".unavailability-list"
                        );

                    driver.unavailabilities.forEach(
                        unavailable => {

                            const row =
                                document.createElement(
                                    "div"
                                );

                            row.className =
                                "unavailability-row";

                            row.style.marginTop =
                                "10px";

                            row.innerHTML = `

                                <div style="display:flex; gap:10px; align-items:center;">

                                    <input
                                        type="time"
                                        class="unavailable-start"
                                        value="${unavailable.start}">

                                    <input
                                        type="time"
                                        class="unavailable-end"
                                        value="${unavailable.end}">

                                    <button
                                        class="remove-btn"
                                        type="button"
                                        onclick="removeUnavailability(this)">

                                        ✕

                                    </button>

                                </div>

                            `;

                            list.appendChild(
                                row
                            );

                        });

                }
            );

            updateSOF();

            updateStartingDrivers();

            if (
                config.startingDriver
            ) {

                document.getElementById(
                    "startingDriver"
                ).value =
                    config.startingDriver;

            }

            if (
                config.strategy
            ) {

                strategy =
                    config.strategy;

                renderStrategy();

                updateIncidentStints();

                updateIRacingRule();

            }

        };

        reader.readAsText(file);

    };

    input.click();

}

// =========================
// EXPORT IMAGE
// =========================

function exportImage() {

    const exportBlock =
        document.getElementById(
            "planningExport"
        );

    const raceName =
        document.getElementById(
            "raceName"
        ).value ||
        "Ascendia Planning";

    document.getElementById(
        "exportRaceTitle"
    ).innerText =
        raceName;

    document.getElementById(
        "exportSOF"
    ).innerText =
        document.getElementById(
            "sofValue"
        ).innerText;

    exportBlock.classList.add(
        "export-mode"
    );

    html2canvas(exportBlock, {

        backgroundColor:
            "#0b0f17",

        scale: 2

    }).then(canvas => {

        const link =
            document.createElement(
                "a"
            );

        link.download =
            raceName + ".png";

        link.href =
            canvas.toDataURL();

        link.click();

        exportBlock.classList.remove(
            "export-mode"
        );

    });

}

