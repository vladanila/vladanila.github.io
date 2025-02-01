// Toggle between light and dark mode
function toggleMode() {
    const body = document.body;
    const modeIcon = document.getElementById("mode-icon");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        modeIcon.src = "images-assets/sun.png";
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        modeIcon.src = "images-assets/moon.png";
    }
}

// Handle image upload
document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        alert("Image successfully uploaded!");
        document.getElementById("file-name").textContent = file.name;
    }
});

// Resize image and show download button, message, and resize prompt
function resizeImage() {
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    if (!width || !height) {
        alert("Please enter both width and height.");
        return;
    }

    // Simulate resizing logic (replace this with actual resizing logic)
    console.log(`Resizing image to ${width}x${height}...`);

    // Show the "ready" message and download button with fade-in animation
    const readyMessage = document.getElementById("ready-message");
    const downloadButton = document.getElementById("download-button");

    readyMessage.style.opacity = "1";
    downloadButton.style.opacity = "1";

    // Show the resize prompt after 2 seconds
    setTimeout(() => {
        const resizePrompt = document.getElementById("resize-prompt");
        resizePrompt.style.opacity = "1";
    }, 2000); // 2 seconds delay
}

// Handle download button click (replace this with actual download logic)
document.getElementById("download-button").addEventListener("click", function () {
    alert("Downloading image...");
});

// Handle "Resize Another Image" button click
document.getElementById("resize-another").addEventListener("click", function () {
    // Reset the form and hide the prompt
    document.getElementById("upload").value = ""; // Clear file input
    document.getElementById("file-name").textContent = ""; // Clear file name
    document.getElementById("width").value = ""; // Clear width input
    document.getElementById("height").value = ""; // Clear height input
    document.getElementById("ready-message").style.opacity = "0"; // Hide ready message
    document.getElementById("download-button").style.opacity = "0"; // Hide download button
    document.getElementById("resize-prompt").style.opacity = "0"; // Hide resize prompt
});
