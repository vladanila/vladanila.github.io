// Global variable to hold the current canvas data for download use.
let currentCanvas = null;

/* Toggle sidebar menu with GSAP animation */
function toggleMenu() {
  const sidebar = document.getElementById("sidebar-menu");
  const menuIcon = document.getElementById("menu-icon");
  if (sidebar.style.left === "0px") {
    gsap.to(sidebar, { duration: 0.4, left: "-280px", ease: "power2.out" });
    menuIcon.classList.remove("open");
  } else {
    gsap.to(sidebar, { duration: 0.4, left: "0px", ease: "power2.out" });
    menuIcon.classList.add("open");
  }
}

/* Reset the form (except the download button, which remains visible) */
function resetForm() {
  document.getElementById("upload").value = "";
  document.getElementById("file-name").textContent = "";
  document.getElementById("width").value = "";
  document.getElementById("height").value = "";
  document.getElementById("ready-message").style.opacity = "0";
  document.getElementById("image-preview-container").style.opacity = "0";
  currentCanvas = null;
}

/* Toggle between light and dark mode with GSAP animation */
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
  gsap.fromTo(
    modeIcon,
    { rotation: 0 },
    { duration: 1, rotation: 360, ease: "elastic.out(1, 0.3)" }
  );
}

/* Handle image upload */
document.getElementById("upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    alert("Image successfully uploaded!");
    document.getElementById("file-name").textContent = file.name;
  }
});

/* Resize image and display preview with animations */
function resizeImage() {
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;

  if (!width || !height) {
    alert("Please enter both width and height.");
    return;
  }

  const fileInput = document.getElementById("upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload an image first.");
    return;
  }

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

      // Save the current canvas globally for download use.
      currentCanvas = canvas;

      // Set the preview image source to the resized image.
      const previewImage = document.getElementById("preview-image");
      previewImage.src = canvas.toDataURL();

      // Animate image preview and ready message.
      gsap.to("#image-preview-container", { duration: 0.8, opacity: 1, ease: "power2.out" });
      gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
      // Animate the download button to make it visible.
      gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    };
  };
  reader.readAsDataURL(file);
}

/* New Download Button Function */
function downloadImage() {
  if (!currentCanvas) {
    alert("Please resize an image first.");
    return;
  }
  
  // Create a temporary link to trigger download.
  const link = document.createElement("a");
  link.href = currentCanvas.toDataURL("image/png");
  link.download = "resized-image.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Animate the download button for feedback.
  gsap.fromTo(
    "#download-button",
    { scale: 1 },
    { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" }
  );
}
