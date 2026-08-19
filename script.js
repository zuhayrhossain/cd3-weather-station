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

loadFiles();

document.getElementById("lastUpdated").textContent =
    "Last updated: " + new Date().toLocaleString();
