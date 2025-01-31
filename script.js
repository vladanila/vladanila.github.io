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

document.getElementById("upload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        alert("Image successfully uploaded!");
        document.getElementById("file-name").textContent = file.name;
    }
});

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
                downloadButton.style.transition = "opacity 1s ease-in-out, transform 0.3s ease";

                downloadButton.onmouseover = function() {
                    downloadButton.style.transform = "scale(1.05)";
                };
                downloadButton.onmouseout = function() {
                    downloadButton.style.transform = "scale(1)";
                };

                document.getElementById("resize-options").appendChild(downloadButton);
            }

            let readyMessage = document.getElementById("ready-message");
            if (!readyMessage) {
                readyMessage = document.createElement("div");
                readyMessage.id = "ready-message";
                readyMessage.textContent = "Your photo is ready to be downloaded";
                readyMessage.style.color = "red"; 
                readyMessage.style.fontSize = "16px";
                readyMessage.style.marginTop = "10px";
                readyMessage.style.opacity = "0";
                readyMessage.style.transition = "opacity 1s ease-in-out";
                document.getElementById("resize-options").appendChild(readyMessage);
            }

            setTimeout(() => {
                readyMessage.style.opacity = "1";
                downloadButton.style.opacity = "1";
            }, 500);

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
