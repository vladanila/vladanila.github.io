// Global variables
let currentMode = "resize";
let currentCanvas = null;
let cropperInstance = null;
let originalImageURL = null;

/* Toggle the sidebar menu */
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

/* Reset the form and destroy cropper instance if needed */
function resetForm() {
  document.getElementById("upload").value = "";
  document.getElementById("file-name").textContent = "";
  document.getElementById("width").value = "";
  document.getElementById("height").value = "";
  document.getElementById("ready-message").style.opacity = "0";
  document.getElementById("preview-wrapper").style.opacity = "0";
  currentCanvas = null;
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

/* Toggle between light and dark modes */
function toggleMode() {
  const body = document.body;
  const modeIcon = document.getElementById("mode-icon");
  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    // Use the minimal sun icon for dark mode (SVG path remains the same, but CSS forces its color to white)
    modeIcon.innerHTML = '<path d="M12 4V2m0 20v-2m8-8h2M2 12H4m15.364-7.364l1.414-1.414M4.222 19.778l1.414-1.414m12.728 1.414l1.414-1.414M4.222 4.222l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    // Use the minimal moon icon for light mode
    modeIcon.innerHTML = '<path d="M21 12.79A9 9 0 0112.21 3 7.5 7.5 0 0012 21a9 9 0 009-8.21z"/>';
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
    const reader = new FileReader();
    reader.onload = function (e) {
      originalImageURL = e.target.result;
      const imgElement = document.getElementById("preview-image");
      imgElement.src = originalImageURL;
      if (currentMode === "crop") {
        if (cropperInstance) {
          cropperInstance.destroy();
        }
        cropperInstance = new Cropper(imgElement, {
          aspectRatio: NaN,
          viewMode: 1,
          autoCropArea: 1,
          responsive: true,
          dragMode: 'crop'
        });
        gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
        gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
      }
    };
    reader.readAsDataURL(file);
  }
});

/* Resize image (resize mode) */
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
      currentCanvas = canvas;
      const previewImage = document.getElementById("preview-image");
      previewImage.src = canvas.toDataURL();
      gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
      gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
      gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    };
  };
  reader.readAsDataURL(file);
}

/* Switch to Crop Mode */
function switchToCropMode() {
  currentMode = "crop";
  // Hide resize options and update texts
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("modern-text").textContent = "Crop your image";
  document.getElementById("download-button").textContent = "Download Cropped Image";
  
  // Automatically close the sidebar (hamburger menu) if it is open
  const sidebar = document.getElementById("sidebar-menu");
  if (sidebar.style.left === "0px") {
    toggleMenu();
  }
  
  // Show preview-wrapper as flex and display cropper controls
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.add("crop-mode");
  document.getElementById("cropper-controls").style.display = "flex";
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    if (cropperInstance) {
      cropperInstance.destroy();
    }
    cropperInstance = new Cropper(imgElement, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      dragMode: 'crop'
    });
    gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
  }
  // If no image is uploaded, do nothing (no alert)
}

/* Cropper Actions */
function cropperAction(action, param) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  if (action === 'rotate') {
    cropperInstance.rotate(param);
  } else if (action === 'zoom') {
    cropperInstance.zoom(param);
  } else if (action === 'reset') {
    cropperInstance.reset();
  }
}

/* Set Aspect Ratio */
function setAspectRatio(ratio) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  cropperInstance.setAspectRatio(ratio);
}

/* Download the image (behavior depends on mode) */
function downloadImage() {
  if (currentMode === "crop") {
    if (!cropperInstance) {
      alert("Please crop your image first.");
      return;
    }
    const croppedCanvas = cropperInstance.getCroppedCanvas();
    if (!croppedCanvas) {
      alert("Crop your image first.");
      return;
    }
    const link = document.createElement("a");
    link.href = croppedCanvas.toDataURL("image/png");
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else {
    if (!currentCanvas) {
      alert("Please resize an image first.");
      return;
    }
    const link = document.createElement("a");
    link.href = currentCanvas.toDataURL("image/png");
    link.download = "resized-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  }
}
