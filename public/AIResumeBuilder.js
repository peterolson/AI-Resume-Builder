// Prevent XSS attacks
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Collect all values from the form fields
function getFormData() {
  const fields = [
    "name",
    "email",
    "education",
    "workExperience",
    "skills",
    "design",
  ];

  for (const id of fields) {
    if (!document.getElementById(id)) {
      console.error(`Form field not found: #${id}`);
      throw new Error(`Missing form field: ${id}`);
    }
  }
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    education: document.getElementById("education").value,
    workExperience: document.getElementById("workExperience").value,
    skills: document.getElementById("skills").value,
    designClass: document.getElementById("design").value,
  };
}

// Build the resume HTML string from form data
function buildResumeHTML(data) {
  return `
    <h1>${escapeHTML(data.name)}</h1>
    <p><strong>Email: </strong>${escapeHTML(data.email)}</p>
    <p><strong>Education: </strong>${escapeHTML(data.education)}</p>
    <p><strong>Work Experience: </strong>${escapeHTML(data.workExperience)}</p>
    <p><strong>Skills: </strong>${escapeHTML(data.skills)}</p>
  `;
}

// Send data to the AI endpoint and return improved resume HTML
async function fetchAIImprovedResume(data) {
  const response = await fetch("/api/ai-improve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.improvedResume) {
    throw new Error("No improved resume returned from AI");
  }

  return result.improvedResume;
}

// Handle the AI Improve button click inside the new window
function setupAIImproveButton(newWindow, data) {
  newWindow.document
    .getElementById("aiImproveBtn")
    .addEventListener("click", async function () {
      const btn = newWindow.document.getElementById("aiImproveBtn");
      const errorMsg = newWindow.document.getElementById("errorMsg");

      btn.textContent = "Improving...";
      btn.disabled = true;
      errorMsg.textContent = "";

      try {
        const improvedHTML = await fetchAIImprovedResume(data);
        newWindow.document.getElementById("resume").innerHTML = improvedHTML;
      } catch (err) {
        console.error("AI improve failed:", err.message);
        errorMsg.textContent = "Something went wrong. Please try again.";
      } finally {
        btn.textContent = "AI Improve";
        btn.disabled = false;
      }
    });
}

// Handle the Download PDF button click inside the new window
function setupDownloadButton(newWindow) {
  newWindow.document
    .getElementById("downloadBtn")
    .addEventListener("click", function () {
      const resume = newWindow.document.getElementById("resume");
      const options = {
        margin: 0.5,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      newWindow.html2pdf().set(options).from(resume).save();
    });
}

// Open a new window and write the resume HTML into it
function openResumeWindow(data, resumeContent) {
  const newWindow = window.open("", "_blank");

  if (!newWindow) {
    console.error("Failed to open new window — likely blocked by browser");
    document.getElementById("formError").textContent =
      "Could not open resume window. Please allow popups for this site.";
    return;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>Resume - ${escapeHTML(data.name)}</title>
        <link rel="stylesheet" href="AIResumeBuilder.css">
      </head>
      <body>
        <div id="resume" class="${data.designClass}">
          ${resumeContent}
        </div>
        <p id="errorMsg" class="error-msg"></p>
        <button id="aiImproveBtn">AI Improve</button>
        <button id="downloadBtn">Download as PDF</button>
      </body>
    </html>
  `);

  newWindow.document.close();

  // Load html2pdf dynamically then set up buttons
  const script = newWindow.document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  script.onload = function () {
    setupAIImproveButton(newWindow, data);
    setupDownloadButton(newWindow);
  };
  newWindow.document.head.appendChild(script);
}

// Main form submit handler — ties everything together
document.getElementById("resumeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("formError").textContent = "";

  try {
    const data = getFormData();
    const resumeContent = buildResumeHTML(data);
    openResumeWindow(data, resumeContent);
  } catch (err) {
    console.error("Form submission failed:", err.message);
    document.getElementById("formError").textContent =
      "Something went wrong. Please refresh and try again.";
  }
});
