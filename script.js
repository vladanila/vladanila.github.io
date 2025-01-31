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

// Image Resizer Function
function resizeImage() {
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas width and height based on user input or image size
        const newWidth = width || img.width;
        const newHeight = height || img.height;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Download the resized image
        const resizedImage = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = resizedImage;
        a.download = 'resized_image.png';
        a.click();
    };
}

// Tooltip for height and width input
document.getElementById('width').addEventListener('focus', function() {
    document.getElementById('tooltip').style.display = 'block';
});

document.getElementById('width').addEventListener('blur', function() {
    document.getElementById('tooltip').style.display = 'none';
});

document.getElementById('height').addEventListener('focus', function() {
    document.getElementById('tooltip').style.display = 'block';
});

document.getElementById('height').addEventListener('blur', function() {
    document.getElementById('tooltip').style.display = 'none';
});
