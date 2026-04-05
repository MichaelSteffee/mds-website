const pages = [
    document.getElementById("Page1"),
    document.getElementById("Page2"),
    document.getElementById("Page3"),
    document.getElementById("Page4"),
    document.getElementById("Page5"),
    document.getElementById("Page6"),
    document.getElementById("Page7"),
    document.getElementById("Page8"),
    document.getElementById("Page9"),
    document.getElementById("Page10"),
    document.getElementById("Page11"),
    document.getElementById("Page12")
];

const pageCaption = [];

pageCaption.push("I had a spreadsheet of my work, but it was put together over years and used skills and jobs inconsistently within the narratives.");
pageCaption.push("So I made a form that turned the skills and roles into yes/no questions, which helped to standardize the information.");
pageCaption.push("Saving the form created a new spreadsheet of my 56 consluting jobs.");
pageCaption.push("I added some formulas to turn the cells into a single python statement that added the job as an array of objects.");
pageCaption.push("Then I added the block of statements to a Python file.");
pageCaption.push("I added a program to loop through the jobs.");
pageCaption.push("Then I created a chat prompt template to pass the job data to openAI.");
pageCaption.push("I sent the data through the chat prompt template into openAI's API.");
pageCaption.push("Saved the output to a file");
pageCaption.push("Opened the file in Word and ran some search and replace macros to remove openAI's messages and add formatting.");
pageCaption.push("Added the formatted output to my resume");


let currentPage = 0;

const back = document.getElementById("back");
const next = document.getElementById("next");

const pageCounter = document.getElementById("pageCounter");
const paperStack = document.getElementById("paper-stack");
const mainDisplay = document.getElementById("book-wrapper");
const closeX = document.getElementById("closeX");
const caption = document.getElementById("caption");

function updateButtons() {

    // BACK BUTTON
    if (currentPage === 0) {
        back.style.background = "linear-gradient(135deg,#6c757d,#495057)";   // grey
        back.disabled = true;
    } else {
        back.style.background = "linear-gradient(#1ac851,#10610a)";   // green
        back.disabled = false;
    }

    // NEXT BUTTON
    if (currentPage === pages.length - 1) {
        next.style.background = "linear-gradient(135deg,#6c757d,#495057)";   // grey
        next.disabled = true;
    } else {
        next.style.background = "linear-gradient(#1ac851,#10610a)";   // green
        next.disabled = false;
    }
}

function showPage(index) {
    if (index < pages.length) {
    pages.forEach(page => page.style.display = "none");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            pages[index].style.display = "block";

    pageCounter.textContent = `${index + 1} / ${pages.length}`;
    updateButtons();    
    caption.innerText = pageCaption[index];
    }
}

next.addEventListener("click", () => {
    if (currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    }
});

back.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    }
});

pages.forEach((page) => 
    page.addEventListener('click', () => {
    if (currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    }
}));

function openProject() {
    mainDisplay.classList.remove("hidden");
    paperStack.classList.add("hidden");
}

function closeProject() {
    mainDisplay.classList.add("hidden");
    paperStack.classList.remove("hidden");
}

paperStack.addEventListener('click', openProject)
closeX.addEventListener('click', closeProject)

showPage(currentPage);
