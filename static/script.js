    const textElement = document.getElementById('text-display');

const op = document.getElementById("output");

async function loadData() {
    const response = await fetch("/static/jobs.json");
    webArray = await response.json();
}

async function startApp() {
    await loadData();   // wait until JSON loads
    
    console.log("Jobs loaded:", webArray);

    initializeUI();     // start your app after data exists
}

function initializeUI() {
    console.log("App started");
    main();
}

startApp();

function generateTable(dataArray) {
    const table = document.getElementById("placesWorked");

    // Populate table with shuffled data
    dataArray.forEach((item, index) => {
        let row = table.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);

            // add column classes
        cell2.classList.add("col-desktop-only");

        cell1.textContent = item.company;
        cell2.textContent = item.industry;
        cell3.textContent = item.resumeEntry.split('|')[0].trim();
        cell4.textContent = item.project;

         row.addEventListener('click', () => openpopup(item.jobId-1));

    });

    sortTable(0);
    console.log("sorting !");
}

function main() {

    // Close the popup if the user clicks outside of the content
    window.onclick = function(event) {
        const popup = document.getElementById('tablePopup');
        if (event.target == popup) {
            closepopup();
        }
    }

    // Load the array and update the display

    generateTable(webArray);

}

    function openpopup(rowIndex) {
        const user = webArray[rowIndex];
    // Populate the popup with data from the array
        document.getElementById('resumeEntry').innerHTML = formatResumeEntry(user.resumeEntry);
        document.getElementById('tablePopup').classList.add('active');
    }

    function closepopup() {
    // Hide the popup
        document.getElementById('tablePopup').classList.remove('active');
    }

    function sortTable(n) {
    var table = document.getElementById("placesWorked");
    var rows = table.rows;
    var switching = true;
    var dir = "asc";
    var switchcount = 0;

    while (switching) {
        switching = false;
        for (var i = 1; i < (rows.length - 1); i++) {
        var shouldSwitch = false;
        var x = rows[i].getElementsByTagName("TD")[n];
        var y = rows[i + 1].getElementsByTagName("TD")[n];

        if (dir == "asc") {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
            }
        } else if (dir == "desc") {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
            }
        }
        }
        if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
        } else {
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
        }
    }
    }


function formatResumeEntry(text) {
    if (!text) return "";

    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);

    const header = lines[0] || "";
    const description = lines[1] || "";

    // Case-insensitive detection
    const rolesLine = lines.find(l => l.toLowerCase().startsWith("roles:")) || "";
    const skillsLine = lines.find(l => l.toLowerCase().startsWith("skills used:")) || "";

    const bullets = lines
        .filter(l => l.startsWith("-"))
        .map(l => l.replace(/^- /, "").trim());

    const bulletHTML = bullets.map(item => `<li>${item}</li>`).join("");

    // 🔑 Preserve original label exactly as written
    const rolesMatch = rolesLine.match(/^(Roles:)\s*(.*)$/i);
    const skillsMatch = skillsLine.match(/^(Skills used:)\s*(.*)$/i);

    const rolesLabel = rolesMatch ? rolesMatch[1] : "Roles:";
    const roles = rolesMatch ? rolesMatch[2] : "";

    const skillsLabel = skillsMatch ? skillsMatch[1] : "Skills used:";
    const skills = skillsMatch ? skillsMatch[2] : "";

    return `
        <div>
            <h2>${header}</h2>
            <h3>${description}</h3>
            <ul>${bulletHTML}</ul>
            ${roles ? `<h4><span class="lineHead">${rolesLabel}</span> ${roles}</h4>` : ""}
            ${skills ? `<h4><span class="lineHead">${skillsLabel}</span> ${skills}</h4>` : ""}
        </div>
    `;
}
