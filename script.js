document.getElementById("resizeBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("imageUpload").files[0];
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput) {
        alert("Please upload an image first!");
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(fileInput);
    img.onload = function () {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        document.getElementById("downloadBtn").style.display = "block";
    };
});

document.getElementById("downloadBtn").addEventListener("click", function () {
    const canvas = document.getElementById("canvas");
    const link = document.createElement("a");
    link.download = "resized-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

// 🌙 Light/Dark Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Check for saved theme in local storage
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggle.textContent = "☀️"; // Change the icon to the sun
} else {
    themeToggle.textContent = "🌙"; // Default icon
}

// Toggle theme on button click
themeToggle.addEventListener("click", function () {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️"; // Sun for dark mode
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙"; // Moon for light mode
    }
});
