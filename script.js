document.addEventListener("DOMContentLoaded", function () {
    const modeToggle = document.getElementById("mode-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const body = document.body;

    // Load user preference for dark/light mode
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
    } else {
        body.classList.add("light-mode");
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
    }

    // Mode Toggle Functionality
    modeToggle.addEventListener("click", function () {
        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
            localStorage.setItem("theme", "dark");
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
            localStorage.setItem("theme", "light");
        }
    });

    // Image Upload Handling
    const uploadInput = document.getElementById("upload");
    const fileNameDisplay = document.getElementById("file-name");

    uploadInput.addEventListener("change", function () {
        if (uploadInput.files.length > 0) {
            fileNameDisplay.textContent = `Selected: ${uploadInput.files[0].name}`;
        } else {
            fileNameDisplay.textContent = "";
        }
    });
});

// Image Resizing Functionality
function resizeImage() {
    const fileInput = document.getElementById("upload");
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const tooltip = document.getElementById("tooltip");

    if (!fileInput.files.length) {
        tooltip.textContent = "Please select an image first!";
        tooltip.style.display = "block";
        return;
    }

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        tooltip.textContent = "Please enter valid width and height!";
        tooltip.style.display = "block";
        return;
    }

    tooltip.style.display = "none";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to a downloadable image
            const resizedImageUrl = canvas.toDataURL("image/png");
            showDownloadButton(resizedImageUrl);
        };
    };

    reader.readAsDataURL(file);
}

// Show Download Button
function showDownloadButton(resizedImageUrl) {
    let downloadButton = document.getElementById("download-button");
    let readyMessage = document.getElementById("ready-message");

    // If the button doesn't exist, create it dynamically
    if (!downloadButton) {
        downloadButton = document.createElement("a");
        downloadButton.id = "download-button";
        downloadButton.textContent = "Download Resized Image";
        downloadButton.style.display = "inline-block";
        downloadButton.style.backgroundColor = "red";
        downloadButton.style.color = "white";
        downloadButton.style.padding = "10px 20px";
        downloadButton.style.marginTop = "15px";
        downloadButton.style.borderRadius = "5px";
        downloadButton.style.textDecoration = "none";
        downloadButton.style.fontSize = "16px";
        downloadButton.style.transition = "0.3s ease";
        downloadButton.style.opacity = "1";

        downloadButton.addEventListener("mouseover", function () {
            downloadButton.style.transform = "scale(1.05)";
        });

        downloadButton.addEventListener("mouseout", function () {
            downloadButton.style.transform = "scale(1)";
        });

        document.body.appendChild(downloadButton);
    }

    if (!readyMessage) {
        readyMessage = document.createElement("div");
        readyMessage.id = "ready-message";
        readyMessage.textContent = "Your photo is ready!";
        readyMessage.style.fontSize = "1.5em";
        readyMessage.style.color = "#4CAF50";
        readyMessage.style.marginTop = "10px";
        document.body.appendChild(readyMessage);
    }

    // Set download attributes
    downloadButton.href = resizedImageUrl;
    downloadButton.download = "resized-image.png";
    downloadButton.style.opacity = "1";

    readyMessage.style.opacity = "1";

    // Show "Resize Another Photo" Button
    showResizeAnotherButton();
}

// Show "Resize Another Photo" Button
function showResizeAnotherButton() {
    let resizeAnotherButton = document.getElementById("resize-another");

    if (!resizeAnotherButton) {
        resizeAnotherButton = document.createElement("button");
        resizeAnotherButton.id = "resize-another";
        resizeAnotherButton.textContent = "Resize Another Photo";
        resizeAnotherButton.style.display = "block";
        resizeAnotherButton.style.marginTop = "20px";
        resizeAnotherButton.style.padding = "10px 20px";
        resizeAnotherButton.style.border = "none";
        resizeAnotherButton.style.borderRadius = "5px";
        resizeAnotherButton.style.backgroundColor = "#4CAF50";
        resizeAnotherButton.style.color = "white";
        resizeAnotherButton.style.fontSize = "16px";
        resizeAnotherButton.style.cursor = "pointer";
        resizeAnotherButton.style.transition = "0.3s ease";

        resizeAnotherButton.addEventListener("mouseover", function () {
            resizeAnotherButton.style.transform = "scale(1.05)";
        });

        resizeAnotherButton.addEventListener("mouseout", function () {
            resizeAnotherButton.style.transform = "scale(1)";
        });

        resizeAnotherButton.addEventListener("click", function () {
            location.reload();
        });

        document.body.appendChild(resizeAnotherButton);
    }
}
