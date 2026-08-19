const GITHUB_USER = "zuhayrhossain";
const GITHUB_REPO = "yorku-cd3.io";
const DATA_FOLDER = "data";


// ----------------------------------------
// Get contents of a GitHub folder
// ----------------------------------------

async function getFolderContents(path) {

    const url =
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not access folder: " + path);
    }

    return await response.json();
}


// ----------------------------------------
// Download a single file
// ----------------------------------------

async function downloadFile(file) {

    const response = await fetch(file.download_url);

    if (!response.ok) {
        throw new Error("Could not download " + file.name);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
}


// ----------------------------------------
// Get every file inside a folder
// ----------------------------------------

async function getAllFiles(path, basePath = path) {

    const contents = await getFolderContents(path);

    let files = [];

    for (const item of contents) {

        if (item.type === "file") {

            files.push({
                ...item,

                relativePath:
                    item.path.substring(basePath.length + 1)
            });

        }

        else if (item.type === "dir") {

            const subFiles =
                await getAllFiles(item.path, basePath);

            files = files.concat(subFiles);
        }
    }

    return files;
}


// ----------------------------------------
// Download entire folder as ZIP
// ----------------------------------------

async function downloadFolder(path, folderName, button) {

    try {

        button.textContent = "Creating ZIP...";
        button.disabled = true;

        const files = await getAllFiles(path);

        const zip = new JSZip();

        for (const file of files) {

            const response =
                await fetch(file.download_url);

            if (!response.ok) {
                throw new Error(
                    "Could not download " + file.name
                );
            }

            const blob = await response.blob();

            zip.file(
                file.relativePath,
                blob
            );
        }

        const zipBlob = await zip.generateAsync({
            type: "blob"
        });

        const url =
            window.URL.createObjectURL(zipBlob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            folderName + ".zip";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        button.textContent =
            "Download folder";

        button.disabled = false;

    }

    catch (error) {

        console.error(error);

        button.textContent = "Error";

        button.disabled = false;
    }
}


// ----------------------------------------
// Create a folder in the explorer
// ----------------------------------------

function createFolder(folder) {

    const container =
        document.createElement("div");

    container.className = "folder";


    // Folder header

    const header =
        document.createElement("div");

    header.className = "folder-header";


    // Expand button

    const expand =
        document.createElement("button");

    expand.className =
        "expand-button";

    expand.textContent = "▶";


    // Folder name

    const name =
        document.createElement("span");

    name.textContent =
        "📁 " + folder.name;


    // Download button

    const download =
        document.createElement("button");

    download.className =
        "download";

    download.textContent =
        "Download folder";


    // Files inside folder

    const contents =
        document.createElement("div");

    contents.className =
        "folder-contents";

    contents.style.display =
        "none";


    // Add elements

    header.appendChild(expand);
    header.appendChild(name);
    header.appendChild(download);

    container.appendChild(header);
    container.appendChild(contents);


    // Expand / collapse

    expand.addEventListener("click", async () => {

        const isOpen =
            contents.style.display !== "none";

        if (isOpen) {

            contents.style.display = "none";

            expand.textContent = "▶";

        }

        else {

            contents.style.display = "block";

            expand.textContent = "▼";


            // Load folder contents

            if (!contents.dataset.loaded) {

                contents.textContent =
                    "Loading...";

                await loadFolder(
                    folder.path,
                    contents
                );

                contents.dataset.loaded =
                    "true";
            }
        }
    });


    // Download folder

    download.addEventListener(
        "click",
        () => {

            downloadFolder(
                folder.path,
                folder.name,
                download
            );

        }
    );


    return container;
}


// ----------------------------------------
// Create a file in the explorer
// ----------------------------------------

function createFile(file) {

    const row =
        document.createElement("div");

    row.className =
        "file";

    const name =
        document.createElement("span");

    name.textContent =
        "📄 " + file.name;

    const button =
        document.createElement("button");

    button.className =
        "download";

    button.textContent =
        "Download";


    button.addEventListener(
        "click",
        () => downloadFile(file)
    );


    row.appendChild(name);
    row.appendChild(button);

    return row;
}


// ----------------------------------------
// Load a folder
// ----------------------------------------

async function loadFolder(
    path,
    container
) {

    try {

        const items =
            await getFolderContents(path);

        container.innerHTML = "";


        // Sort folders before files

        items.sort((a, b) => {

            if (a.type === "dir" &&
                b.type !== "dir") {

                return -1;
            }

            if (a.type !== "dir" &&
                b.type === "dir") {

                return 1;
            }

            return a.name.localeCompare(b.name);
        });


        for (const item of items) {

            if (item.type === "dir") {

                container.appendChild(
                    createFolder(item)
                );

            }

            else if (item.type === "file") {

                container.appendChild(
                    createFile(item)
                );
            }
        }

    }

    catch (error) {

        console.error(error);

        container.textContent =
            "Unable to load folder.";
    }
}


// ----------------------------------------
// Load main data directory
// ----------------------------------------

async function loadExplorer() {

    const explorer =
        document.getElementById(
            "fileExplorer"
        );

    explorer.innerHTML = "";

    try {

        const items =
            await getFolderContents(
                DATA_FOLDER
            );


        items.sort((a, b) => {

            if (a.type === "dir" &&
                b.type !== "dir") {

                return -1;
            }

            if (a.type !== "dir" &&
                b.type === "dir") {

                return 1;
            }

            return a.name.localeCompare(b.name);
        });


        for (const item of items) {

            if (item.type === "dir") {

                explorer.appendChild(
                    createFolder(item)
                );

            }

            else if (item.type === "file") {

                explorer.appendChild(
                    createFile(item)
                );
            }
        }

    }

    catch (error) {

        console.error(error);

        explorer.textContent =
            "Unable to load data.";
    }
}


// Start explorer

loadExplorer();
