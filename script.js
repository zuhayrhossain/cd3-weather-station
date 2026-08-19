const GITHUB_USER = "zuhayrhossain";
const GITHUB_REPO = "yorku-cd3.io";
const DATA_FOLDER = "data";


async function loadFiles() {
    const fileList = document.getElementById("fileList");

    try {
        const url =
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${DATA_FOLDER}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not access GitHub repository");
        }
        const files = await response.json();
        fileList.innerHTML = "";
        // Only show files, not folders
        const dataFiles = files.filter(file => file.type === "file");
        dataFiles.forEach(file => {
            const row = document.createElement("div");
            row.className = "file";
            row.innerHTML = `
                <span>📄 ${file.name}</span>
                <a
                    class="download"
                    href="${file.download_url}"
                    download
                >
                    Download
                </a>
            `;
            fileList.appendChild(row);
        });

        if (dataFiles.length === 0) {
            fileList.innerHTML = "No data files found.";
        }

    } catch (error) {

        console.error(error);

        fileList.innerHTML =
            "Unable to load data files.";

    }
}
// --------------------------------------
// Example temperature data
// --------------------------------------

const times = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00"
];

const temperatures = [
    18.2,
    18.8,
    19.6,
    20.4,
    21.1,
    21.5
];


// --------------------------------------
// Create the graph
// --------------------------------------

const ctx = document
    .getElementById("temperatureChart")
    .getContext("2d");

const temperatureChart = new Chart(ctx, {

    type: "line",

    data: {
        labels: times,

        datasets: [{
            label: "Temperature (°C)",
            data: temperatures,

            borderWidth: 2,
            tension: 0.3,

            fill: false
        }]
    },

    options: {

        responsive: true,

        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time"
                }
            },

            y: {
                title: {
                    display: true,
                    text: "Temperature (°C)"
                }
            }
        }
    }
});


// --------------------------------------
// Example file list
// --------------------------------------

const files = [
    "2026-08-19.csv",
    "2026-08-18.csv",
    "2026-08-17.csv"
];

const fileList = document.getElementById("fileList");

fileList.innerHTML = "";

files.forEach(function(file) {

    const row = document.createElement("div");

    row.className = "file";

    row.innerHTML = `
        <span>${file}</span>

        <a
            class="download"
            href="data/${file}"
            download
        >
            Download
        </a>
    `;

    fileList.appendChild(row);

});


// --------------------------------------
// Last updated time
// --------------------------------------

document.getElementById("lastUpdated").textContent =
    "Last updated: " + new Date().toLocaleString();
