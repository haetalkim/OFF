
let currentPage = 0;
const ON_IMAGE_URL =
  "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F273aU%2FbtsLjtvKXgO%2FQkuo2wpEHwVrc7pzxa3fD0%2Fimg.png"; 
const OFF_IMAGE_URL =
  "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FA91wN%2FbtsLjE423Yk%2Fx6kWSD6CxBFtKaaCGKgaCK%2Fimg.png"; // OFF Image

document.addEventListener("DOMContentLoaded", () => {
  const maxPages = 5;

  // Track task states
  const taskStates = {
    labels: new Array(maxPages).fill(null),
    proofs: new Array(maxPages).fill(null),
    uploadDates: new Array(maxPages).fill(null),
    themes: new Array(maxPages).fill("light") // page theme (light or dark)
  };

  const resetButton = document.getElementById("reset-button");
  const navigationDots = document.querySelectorAll("#navigation-dots .dot");
  const leftArrow = document.getElementById("left-arrow");
  const rightArrow = document.getElementById("right-arrow");
  const slider = document.getElementById("slider");
  const taskList = document.getElementById("task-list");

  leftArrow.addEventListener("click", prevPage);
  rightArrow.addEventListener("click", nextPage);
  resetButton.addEventListener("click", resetCurrentPage);

  navigationDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const pageNumber = parseInt(dot.getAttribute("data-page"));
      switchPage(pageNumber);
    });
  });

  initializePage1();
  const firstPage = document.querySelector("#slider .page:nth-child(1)");
  if (taskStates.themes[0] === "dark") {
    firstPage.classList.add("bg-dark", "text-white");
  } else {
    firstPage.classList.add("bg-light", "text-dark");
  }

  initializeAddNewPages();

  function initializePage1() {
    const toggleSwitch1 = document.getElementById("toggle-switch1");
    const labelBtn1 = document.getElementById("label-btn1");
    const proofBtn1 = document.getElementById("proof-btn1");

    toggleSwitch1.addEventListener("click", () => toggleSwitch(1, false));
    labelBtn1.addEventListener("click", () => setLabel(1));
    proofBtn1.addEventListener("click", () => handleProofClick(1));
  }

  function initializeAddNewPages() {
    const allPages = slider.querySelectorAll(".page");
    allPages.forEach((page, index) => {
      if (index > 0) {
        const overlay = page.querySelector(".overlay");
        overlay?.addEventListener("click", () => transformPage(index + 1));
      }
    });
  }

  function getLabel(page) {
    const display = document.getElementById(`label-display${page}`);
    if (display && !display.classList.contains("d-none")) {
      return display.textContent;
    }
    return null;
  }

  function canToggle(page) {
    // The user can only toggle if they have labeled and uploaded proof OR if the switch has already been toggled down once.
    // Once both are done, we do an automatic toggle. After that, user can freely toggle.
    const labelSet = taskStates.labels[page - 1] !== null;
    const proofSet = taskStates.proofs[page - 1] !== null;
    return labelSet && proofSet;
  }

  function toggleSwitch(page, force) {
    const toggleSwitch = document.getElementById(`toggle-switch${page}`);
    const toggleText = document.getElementById(`toggle-text${page}`);
    const pageElement = document.querySelector(`#slider .page:nth-child(${page})`);
    const giantTitle = pageElement.querySelector(".giant-title");

    // If not forced and conditions not met:
    if (!force && !canToggle(page)) {
      alert("Please label your task and upload proof first! For the future you :) ");
      return;
    }

    // Play toggle sound
    const audio = new Audio(
      "https://raw.githubusercontent.com/Guiyoung-Jeon/Open-source/main/light-switch-flip-272436.mp3"
    );
    audio.play();

    // Check current theme
    const isCurrentlyDark = taskStates.themes[page - 1] === "dark";
    const newTheme = isCurrentlyDark ? "light" : "dark";

    // Update theme state
    taskStates.themes[page - 1] = newTheme;

    // Change the image and text
    toggleSwitch.src = newTheme === "dark" ? OFF_IMAGE_URL : ON_IMAGE_URL;
    toggleText.textContent =
      newTheme === "dark"
        ? "It's already off. Check for yourself."
        : "Just Flick it. And Take a snap!";

    if (newTheme === "dark") {
      pageElement.classList.add("bg-dark", "text-white");
      pageElement.classList.remove("bg-light", "text-dark");
      document.body.classList.add("bg-dark", "text-white");
      document.body.classList.remove("bg-light", "text-dark");
      if (giantTitle) giantTitle.style.color = "#fff";
    } else {
      pageElement.classList.add("bg-light", "text-dark");
      pageElement.classList.remove("bg-dark", "text-white");
      document.body.classList.add("bg-light", "text-dark");
      document.body.classList.remove("bg-dark", "text-white");
      if (giantTitle) giantTitle.style.color = "#000";
    }
  }

  function setLabel(page) {
    const input = document.getElementById(`label${page}`);
    const display = document.getElementById(`label-display${page}`);
    const button = document.getElementById(`label-btn${page}`);

    if (!input || !display || !button) {
      console.error("Label elements not found for page:", page);
      return;
    }

    if (input.value.trim() === "") {
      alert("Please enter a label.");
      return;
    }

    taskStates.labels[page - 1] = input.value.trim();

    input.classList.add("d-none");
    button.classList.add("d-none");
    display.classList.remove("d-none");
    display.textContent = input.value;

    display.addEventListener("dblclick", () => editLabel(page));

    // After setting label, check if we can auto-toggle
    maybeAutoToggle(page);
  }

  function editLabel(page) {
    const input = document.getElementById(`label${page}`);
    const display = document.getElementById(`label-display${page}`);
    const button = document.getElementById(`label-btn${page}`);

    if (!input || !display || !button) {
      console.error("Label elements not found for page:", page);
      return;
    }

    input.classList.remove("d-none");
    button.classList.remove("d-none");
    display.classList.add("d-none");
    input.value = display.textContent.trim();
    button.textContent = "OK";

    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener("click", () => setLabel(page));
  }

  function handleProofClick(page) {
    // If proof already exists, just show the proof preview
    if (taskStates.proofs[page - 1]) {
      showProofModal(page);
    } else {
      // No proof yet, upload proof
      uploadProof(page);
    }
  }

  function showProofModal(page) {
    document.getElementById("previewImage").src = taskStates.proofs[page - 1];
    const previewDate = document.getElementById("previewDate");
    previewDate.textContent = `Uploaded on: ${taskStates.uploadDates[page - 1]}`;
    new bootstrap.Modal(document.getElementById("previewModal")).show();
  }

  function uploadProof(page) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        // Store proof
        taskStates.proofs[page - 1] = reader.result;
        const currentDate = new Date();
        taskStates.uploadDates[page - 1] = currentDate.toLocaleString();

        const proofBtn = document.getElementById(`proof-btn${page}`);
        if (proofBtn) {
          proofBtn.textContent = "Check Proof";
          proofBtn.classList.remove("btn-upload-proof");
          proofBtn.classList.add("btn-check-proof");

          const newProofBtn = proofBtn.cloneNode(true);
          proofBtn.parentNode.replaceChild(newProofBtn, proofBtn);
          newProofBtn.addEventListener("click", () => showProofModal(page));
        }

        document.body.removeChild(input);
        // After uploading proof, check if we can auto-toggle
        maybeAutoToggle(page);
      };

      reader.readAsDataURL(file);
    });

    input.click(); 
  }

  function maybeAutoToggle(page) {
    // If both label and proof are done, and currently theme is light, auto toggle
    const labelDone = taskStates.labels[page - 1] !== null;
    const proofDone = taskStates.proofs[page - 1] !== null;
    const themeIsLight = taskStates.themes[page - 1] === "light";

    if (labelDone && proofDone && themeIsLight) {
      // Auto toggle with force = true (skip checks)
      toggleSwitch(page, true);
    }
  }

  function transformPage(page) {
    const targetIndex = page - 1;
    const allPages = slider.querySelectorAll(".page");

    if (!allPages[targetIndex].classList.contains("add-new-page")) {
      return;
    }

    allPages[targetIndex].classList.remove("add-new-page");
    allPages[targetIndex].innerHTML = `
    <h1 class="giant-title">Off.</h1>
    <p id="toggle-text${page}">Just Flick it. And Take a snap!</p>
    <img id="toggle-switch${page}" src="${ON_IMAGE_URL}" alt="Toggle Switch" class="toggle-switch">
    <div class="label-input-wrapper my-3 d-flex justify-content-center align-items-center gap-2">
      <input type="text" id="label${page}" class="form-control w-50" placeholder="Label your task">
      <button class="btn btn-primary" id="label-btn${page}">OK</button>
    </div>
    <h1 id="label-display${page}" class="d-none"></h1>
    <button class="btn btn-upload-proof mb-2" id="proof-btn${page}">Upload Your Proof</button>
  `;

    const theme = taskStates.themes[targetIndex];
    const pageElement = document.querySelector(`#slider .page:nth-child(${targetIndex + 1})`);
    if (theme === "dark") {
      pageElement.classList.add("bg-dark", "text-white");
      pageElement.classList.remove("bg-light", "text-dark");
    } else {
      pageElement.classList.add("bg-light", "text-dark");
      pageElement.classList.remove("bg-dark", "text-white");
    }

    document.getElementById(`toggle-switch${page}`).addEventListener("click", () => toggleSwitch(page, false));
    document.getElementById(`label-btn${page}`).addEventListener("click", () => setLabel(page));
    document.getElementById(`proof-btn${page}`).addEventListener("click", () => handleProofClick(page));

    resetButton.classList.remove("d-none");
  }

  function resetCurrentPage() {
    if (currentPage === 0) {
      alert("Page 1 cannot be reset.");
      return;
    }

    const allPages = slider.querySelectorAll(".page");
    allPages[currentPage].classList.add("add-new-page");
    allPages[currentPage].innerHTML = `
      <div class="overlay">
          <h1>Click Here to Add New</h1>
      </div>
    `;

    taskStates.labels[currentPage] = null;
    taskStates.proofs[currentPage] = null;
    taskStates.uploadDates[currentPage] = null;
    taskStates.themes[currentPage] = "light";

    const pageElement = document.querySelector(`#slider .page:nth-child(${currentPage + 1})`);
    if (pageElement) {
      pageElement.classList.add("bg-light", "text-dark");
      pageElement.classList.remove("bg-dark", "text-white");
    }

    document.body.classList.add("bg-light", "text-dark");
    document.body.classList.remove("bg-dark", "text-white");

    const overlay = allPages[currentPage].querySelector(".overlay");
    overlay.addEventListener("click", () => transformPage(currentPage + 1));

    resetButton.classList.add("d-none");
  }

  function switchPage(pageNumber) {
    slider.style.transform = `translateX(-${pageNumber * 100}%)`;
    navigationDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === pageNumber);
    });

    currentPage = pageNumber;

    const theme = taskStates.themes[pageNumber];
    if (theme === "dark") {
      document.body.classList.add("bg-dark", "text-white");
      document.body.classList.remove("bg-light", "text-dark");
    } else {
      document.body.classList.add("bg-light", "text-dark");
      document.body.classList.remove("bg-dark", "text-white");
    }

    const pageElement = document.querySelector(`#slider .page:nth-child(${pageNumber + 1})`);
    const giantTitle = pageElement.querySelector(".giant-title");
    if (theme === "dark" && giantTitle) {
      giantTitle.style.color = "#fff";
    } else if (giantTitle) {
      giantTitle.style.color = "#000";
    }

    if (pageNumber >= 1 && pageNumber <= 4) {
      const pageEl = document.querySelectorAll(".page")[pageNumber];
      resetButton.classList.toggle(
        "d-none",
        pageEl.classList.contains("add-new-page")
      );
    } else {
      resetButton.classList.add("d-none");
    }
  }

  function nextPage() {
    const totalPages = document.querySelectorAll(".page").length;
    if (currentPage < totalPages - 1) {
      switchPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      switchPage(currentPage - 1);
    }
  }

  function isSwitchOn(page) {
    const toggleSwitch = document.getElementById(`toggle-switch${page}`);
    if (!toggleSwitch) return false;
    return toggleSwitch.src === ON_IMAGE_URL;
  }

  function updateCheckUpModal() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    for (let i = 1; i <= maxPages; i++) {
      const label = getLabel(i);
      if (label) {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";

        const taskInfo = document.createElement("div");
        taskInfo.className = "d-flex align-items-center gap-3";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = label;
        labelSpan.style.cursor = "pointer";
        labelSpan.className = "text-primary";
        labelSpan.onclick = () => {
          switchPage(i - 1);
          bootstrap.Modal.getInstance(document.getElementById("checkUpModal")).hide();
        };

        const statusBadge = document.createElement("span");
        const isOn = isSwitchOn(i);
        statusBadge.className = `badge ${isOn ? "bg-danger" : "bg-success"}`;
        statusBadge.textContent = isOn ? "ON" : "OFF";

        const proofIndicator = document.createElement("span");
        proofIndicator.className = "text-muted small";

        const proofExists = taskStates.proofs[i - 1];
        const uploadDate = taskStates.uploadDates[i - 1];

        proofIndicator.textContent = proofExists
          ? `📎 Proof uploaded (${uploadDate || "Date not available"})`
          : "No proof";

        taskInfo.appendChild(labelSpan);
        taskInfo.appendChild(statusBadge);
        taskInfo.appendChild(proofIndicator);

        li.appendChild(taskInfo);
        taskList.appendChild(li);
      }
    }

    if (taskList.children.length === 0) {
      const li = document.createElement("li");
      li.className = "list-group-item text-center text-muted";
      li.textContent =
        "No labeled tasks yet. Add your labels first!";
      taskList.appendChild(li);
    }
  }

  const checkUpModalEl = document.getElementById("checkUpModal");
  checkUpModalEl.addEventListener("show.bs.modal", updateCheckUpModal);
});
