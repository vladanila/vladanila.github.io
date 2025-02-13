// Global variables
let currentMode = "resize"; // possible values: "resize", "crop", "convert"
let currentCanvas = null;
let cropperInstance = null;
let originalImageURL = null;
let uploadedFile = null;      // stores the uploaded file object
let convertedImageURL = null; // stores the converted image data URL
let convertedFileType = "";   // stores the target conversion type (e.g., "jpeg", "png", etc.)

// Home button function: animate and refresh the page
function goHome() {
  gsap.to("#home-button", {
    duration: 0.5,
    scale: 1.2,
    ease: "power1.inOut",
    onComplete: function() {
      window.location.reload();
    }
  });
}

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

/* Reset the form and destroy any existing processor */
function resetForm() {
  document.getElementById("upload").value = "";
  document.getElementById("file-name").innerHTML = "";
  document.getElementById("width").value = "";
  document.getElementById("height").value = "";
  document.getElementById("ready-message").style.opacity = "0";
  document.getElementById("preview-wrapper").style.opacity = "0";
  currentCanvas = null;
  convertedImageURL = null;
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

/* Toggle between light and dark modes */
function toggleMode() {
  const body = document.body;
  const modeIcon = document.getElementById("mode-icon");
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    modeIcon.innerHTML = '<path d="M21 12.79A9 9 0 0112.21 3 7.5 7.5 0 0012 21a9 9 0 009-8.21z"/>';
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    modeIcon.innerHTML = '<path d="M12 4V2m0 20v-2m8-8h2M2 12H4m15.364-7.364l1.414-1.414M4.222 19.778l1.414-1.414m12.728 1.414l1.414-1.414M4.222 4.222l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  gsap.fromTo(
    modeIcon,
    { rotation: 0 },
    { duration: 1, rotation: 360, ease: "elastic.out(1, 0.3)" }
  );
}

/* Handle image upload; update file name and show preview */
document.getElementById("upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    uploadedFile = file; // store file for conversion later
    alert("Image successfully uploaded!");
    let fileName = file.name;
    let dotIndex = fileName.lastIndexOf(".");
    if (dotIndex !== -1) {
      let base = fileName.substring(0, dotIndex);
      let ext = fileName.substring(dotIndex);
      document.getElementById("file-name").innerHTML = base + " <strong>" + ext + "</strong>";
    } else {
      document.getElementById("file-name").textContent = fileName;
    }
    // Show conversion options only if in convert mode
    if (currentMode === "convert") {
      document.getElementById("conversion-options").style.display = "flex";
    } else {
      document.getElementById("conversion-options").style.display = "none";
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      originalImageURL = e.target.result;
      const imgElement = document.getElementById("preview-image");
      imgElement.src = originalImageURL;
      // If in crop mode, initialize Cropper
      if (currentMode === "crop") {
        if (cropperInstance) {
          cropperInstance.destroy();
        }
        cropperInstance = new Cropper(imgElement, {
          viewMode: 1,
          autoCropArea: 1,
          responsive: true,
          background: false,
          modal: true,
          guides: false,
          highlight: false,
          dragMode: 'crop',
          checkOrientation: false,
          cropBoxMovable: true,
          cropBoxResizable: true
        });
        gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
        gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
      }
      // If in convert mode, show preview wrapper
      if (currentMode === "convert") {
        gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
      }
    };
    reader.readAsDataURL(file);
  }
});

/* Resize image (for resize mode) */
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
  // Hide resize and conversion sections; show cropper controls
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("cropper-controls").style.display = "flex";
  document.getElementById("modern-text").textContent = "Crop your image";
  document.getElementById("download-button").textContent = "Download Cropped Image";
  
  // Close sidebar if open
  const sidebar = document.getElementById("sidebar-menu");
  if (sidebar.style.left === "0px") {
    toggleMenu();
  }
  
  // Show preview wrapper and add crop-mode class
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.add("crop-mode");
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    if (cropperInstance) {
      cropperInstance.destroy();
    }
    cropperInstance = new Cropper(imgElement, {
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false,
      modal: true,
      guides: false,
      highlight: false,
      dragMode: 'crop',
      checkOrientation: false,
      cropBoxMovable: true,
      cropBoxResizable: true
    });
    gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
  }
}

/* Switch to Convert Mode */
function switchToConvertMode() {
  currentMode = "convert";
  // Show the conversion section and hide the resize and cropper controls
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("conversion-section").style.display = "block";
  document.getElementById("conversion-options").style.display = "flex";
  document.getElementById("modern-text").textContent = "Convert image type";
  document.getElementById("download-button").textContent = "Download Converted Image";
  
  // Close sidebar if open
  const sidebar = document.getElementById("sidebar-menu");
  if (sidebar.style.left === "0px") {
    toggleMenu();
  }
  
  // Show preview wrapper and remove crop-mode class
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.remove("crop-mode");
  gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
  }
}

/* Toggle More Conversion Options with a slide-right animation */
function toggleMoreOptions() {
  const moreOptions = document.getElementById("more-convert-options");
  if (moreOptions.style.display === "flex") {
    gsap.to(moreOptions, {
      duration: 0.5,
      x: -50,
      opacity: 0,
      onComplete: function() {
        moreOptions.style.display = "none";
        moreOptions.style.transform = "none";
      }
    });
  } else {
    moreOptions.style.display = "flex";
    gsap.fromTo(moreOptions, { x: -50, opacity: 0 }, { duration: 0.5, x: 0, opacity: 1 });
  }
}

/* Convert the uploaded image to a specified file type */
function convertTo(targetType) {
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let mimeType;
    if (targetType === "jpeg") {
      mimeType = "image/jpeg";
    } else if (targetType === "png") {
      mimeType = "image/png";
    } else if (targetType === "webp") {
      mimeType = "image/webp";
    } else if (targetType === "gif") {
      mimeType = "image/gif";
    } else if (targetType === "bmp") {
      mimeType = "image/bmp";
    } else if (targetType === "ico") {
      mimeType = "image/x-icon";
    } else {
      mimeType = "image/png";
    }
    const dataURL = canvas.toDataURL(mimeType);
    convertedFileType = targetType;
    // Show the loading spinner for 2 seconds
    document.getElementById("loading-spinner").style.display = "block";
    const readyMsg = document.getElementById("ready-message");
    readyMsg.textContent = "Processing conversion...";
    setTimeout(function() {
      document.getElementById("loading-spinner").style.display = "none";
      document.getElementById("preview-image").src = dataURL;
      let ext = (targetType === "jpeg") ? ".jpg" : "." + targetType;
      readyMsg.textContent = "Your image is successfully converted to " + ext + " and is ready to be downloaded.";
      convertedImageURL = dataURL;
      gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
      gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    }, 2000);
  };
  img.src = originalImageURL;
}

/* Cropper actions: rotate, zoom, reset */
function cropperAction(action, param) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  if (action === "rotate") {
    cropperInstance.rotate(param);
  } else if (action === "zoom") {
    cropperInstance.zoom(param);
  } else if (action === "reset") {
    cropperInstance.reset();
  }
}

/* Set aspect ratio for cropping */
function setAspectRatio(ratio) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  cropperInstance.setAspectRatio(ratio);
}

/* Download the image based on current mode */
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
  } else if (currentMode === "convert") {
    if (!convertedImageURL) {
      alert("Please convert the image first.");
      return;
    }
    const link = document.createElement("a");
    link.href = convertedImageURL;
    let ext = (convertedFileType === "jpeg") ? "jpg" : convertedFileType;
    link.download = "converted-image." + ext;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else {
    // Resize mode
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
