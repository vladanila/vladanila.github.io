// Function to toggle between light and dark mode
function toggleMode() {
    const body = document.body;
    const modeButton = document.getElementById("mode-toggle");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        modeButton.textContent = "🌞"; // Change button text to Sun emoji for Light mode
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        modeButton.textContent = "🌙"; // Change button text to Moon emoji for Dark mode
    }
}

// Image upload functionality with popup confirmation
document.getElementById("upload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        alert("Image successfully uploaded!");
        document.getElementById("file-name").textContent = file.name;
    }
});

// Function to resize image and show download button
function resizeImage() {
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const fileInput = document.getElementById("upload").files[0];

    if (!fileInput) {
        alert("Please upload an image first.");
        return;
    }

    if (!width || !height) {
        alert("Please enter valid width and height values.");
        return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = function(event) {
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const resizedImageUrl = canvas.toDataURL("image/png");

            // Create or update the download button
            let downloadButton = document.getElementById("download-button");
            if (!downloadButton) {
                downloadButton = document.createElement("button");
                downloadButton.id = "download-button";
                downloadButton.textContent = "Download";
                downloadButton.style.backgroundColor = "red";
                downloadButton.style.color = "white";
                downloadButton.style.padding = "10px 20px";
                downloadButton.style.border = "none";
                downloadButton.style.borderRadius = "5px";
                downloadButton.style.fontSize = "16px";
                downloadButton.style.cursor = "pointer";
                downloadButton.style.marginTop = "10px";
                downloadButton.style.transition = "0.3s ease";

                // Add hover effect
                downloadButton.onmouseover = function() {
                    downloadButton.style.transform = "scale(1.05)";
                };
                downloadButton.onmouseout = function() {
                    downloadButton.style.transform = "scale(1)";
                };

                document.getElementById("resize-options").appendChild(downloadButton);
            }

            downloadButton.onclick = function() {
                const link = document.createElement("a");
                link.href = resizedImageUrl;
                link.download = "resized-image.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        };
    };

    reader.readAsDataURL(fileInput);
}
