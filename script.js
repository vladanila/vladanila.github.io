// Toggle between light and dark mode
function toggleMode() {
    const body = document.body;
    const modeIcon = document.getElementById("mode-icon");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        modeIcon.src = "images-assets/sun.png"; // Change icon to sun
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        modeIcon.src = "images-assets/moon.png"; // Change icon to moon
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

// Resize image and show preview, ready message, and download button
function resizeImage() {
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    if (!width || !height) {
        alert("Please enter both width and height.");
        return;
    }

    // Get the uploaded file
    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    // Create a FileReader to read the image file
    const reader = new FileReader();

    reader.onload = function (event) {
        // Create an image element to resize
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            // Create a canvas to resize the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set canvas dimensions to the desired width and height
            canvas.width = width;
            canvas.height = height;

            // Draw the image on the canvas with the new dimensions
            ctx.drawImage(img, 0, 0, width, height);

            // Set the preview image source to the resized image
            const previewImage = document.getElementById("preview-image");
            previewImage.src = canvas.toDataURL();

            // Show the preview container with fade-in animation
            const previewContainer = document.getElementById("image-preview-container");
            previewContainer.style.opacity = "1";

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
        };
    };

    // Read the uploaded file as a data URL
    reader.readAsDataURL(file);
}

// Handle download button click
document.getElementById("download-button").addEventListener("click", function () {
    const previewImage = document.getElementById("preview-image");
    const link = document.createElement("a");
    link.href = previewImage.src;
    link.download = "resized-image.png"; // Default filename
    link.click();
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
    document.getElementById("image-preview-container").style.opacity = "0"; // Hide preview
});

// Handle close prompt button click
document.getElementById("close-prompt").addEventListener("click", function () {
    const resizePrompt = document.getElementById("resize-prompt");
    resizePrompt.style.opacity = "0"; // Fade out the prompt
});
