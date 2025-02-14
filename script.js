// Global variables
let currentMode = "resize"; // modes: "resize", "crop", "convert", "filter", "watermark", "collage", "border"
let currentCanvas = null;
let cropperInstance = null;
let originalImageURL = null;
let uploadedFile = null;
let convertedImageURL = null;
let convertedFileType = "";
let currentFilterType = "none";
let currentFilter = "none";
let watermarkedImageURL = null;
let collageImageURL = null;
let borderedImageURL = null;
let collageImages = [null, null, null, null];
let watermarkPosition = "bottom-right"; // default position
let watermarkFontSize = 30; // default size in px

// Home button: animate and refresh
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

/* Toggle sidebar menu */
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

/* Reset form */
function resetForm() {
  document.getElementById("upload").value = "";
  document.getElementById("file-name").innerHTML = "";
  document.getElementById("width").value = "";
  document.getElementById("height").value = "";
  document.getElementById("ready-message").style.opacity = "0";
  document.getElementById("preview-wrapper").style.opacity = "0";
  currentCanvas = null;
  convertedImageURL = null;
  watermarkedImageURL = null;
  collageImageURL = null;
  borderedImageURL = null;
  currentFilter = "none";
  currentFilterType = "none";
  collageImages = [null, null, null, null];
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

/* Toggle light/dark mode */
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
  gsap.fromTo(modeIcon, { rotation: 0 }, { duration: 1, rotation: 360, ease: "elastic.out(1, 0.3)" });
}

/* Handle image upload */
document.getElementById("upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    uploadedFile = file;
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
      if (currentMode === "crop") {
        if (cropperInstance) cropperInstance.destroy();
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
      if (["convert", "filter", "watermark", "collage", "border"].includes(currentMode)) {
        gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
      }
    };
    reader.readAsDataURL(file);
  }
});

/* Resize image */
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
      document.getElementById("preview-image").src = canvas.toDataURL();
      gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
      gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    };
  };
  reader.readAsDataURL(file);
}

/* Helper: Close sidebar if open */
function closeSidebarIfOpen() {
  const sidebar = document.getElementById("sidebar-menu");
  if (sidebar.style.left === "0px") toggleMenu();
}

/* Show original upload button (for non-collage modes) */
function showUploadButton() {
  document.getElementById("image-container").style.display = "block";
}

/* --- Mode Switch Functions --- */

// Crop Mode
function switchToCropMode() {
  currentMode = "crop";
  showUploadButton();
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("filter-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "none";
  document.getElementById("collage-section").style.display = "none";
  document.getElementById("border-section").style.display = "none";
  document.getElementById("cropper-controls").style.display = "flex";
  document.getElementById("modern-text").textContent = "Crop your image";
  document.getElementById("download-button").textContent = "Download Cropped Image";
  closeSidebarIfOpen();
  
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.add("crop-mode");
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    if (cropperInstance) cropperInstance.destroy();
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

// Convert Mode
function switchToConvertMode() {
  currentMode = "convert";
  showUploadButton();
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("filter-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "none";
  document.getElementById("collage-section").style.display = "none";
  document.getElementById("border-section").style.display = "none";
  document.getElementById("conversion-section").style.display = "block";
  document.getElementById("conversion-options").style.display = "flex";
  document.getElementById("modern-text").textContent = "Convert image type";
  document.getElementById("download-button").textContent = "Download Converted Image";
  closeSidebarIfOpen();
  
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.remove("crop-mode");
  gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) imgElement.src = originalImageURL;
}

// Filter Mode with slider
function switchToFilterMode() {
  currentMode = "filter";
  showUploadButton();
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "none";
  document.getElementById("collage-section").style.display = "none";
  document.getElementById("border-section").style.display = "none";
  document.getElementById("filter-section").style.display = "block";
  document.getElementById("modern-text").textContent = "Apply Filter Effects";
  document.getElementById("download-button").textContent = "Download Filtered Image";
  closeSidebarIfOpen();
  
  const previewWrapper = document.getElementById("preview-wrapper");
  previewWrapper.style.display = "flex";
  previewWrapper.classList.remove("crop-mode");
  gsap.to("#preview-wrapper", { duration: 0.8, opacity: 1, ease: "power2.out" });
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    imgElement.style.filter = "none";
    currentFilterType = "none";
    document.getElementById("filter-slider-container").style.display = "none";
  }
}

// Watermark Mode with size and position controls
function switchToWatermarkMode() {
  currentMode = "watermark";
  showUploadButton();
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("filter-section").style.display = "none";
  document.getElementById("collage-section").style.display = "none";
  document.getElementById("border-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "block";
  document.getElementById("modern-text").textContent = "Add a Watermark";
  document.getElementById("download-button").textContent = "Download Watermarked Image";
  closeSidebarIfOpen();
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    imgElement.style.filter = "none";
  }
}

// Collage Mode: hide original upload button
function switchToCollageMode() {
  currentMode = "collage";
  document.getElementById("image-container").style.display = "none";
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("filter-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "none";
  document.getElementById("border-section").style.display = "none";
  document.getElementById("collage-section").style.display = "block";
  document.getElementById("modern-text").textContent = "Make a Collage (Upload 4 Images)";
  document.getElementById("download-button").textContent = "Download Collage";
  collageImages = [null, null, null, null];
  closeSidebarIfOpen();
}

// Border Mode
function switchToBorderMode() {
  currentMode = "border";
  showUploadButton();
  document.getElementById("resize-options").style.display = "none";
  document.getElementById("cropper-controls").style.display = "none";
  document.getElementById("conversion-section").style.display = "none";
  document.getElementById("filter-section").style.display = "none";
  document.getElementById("watermark-section").style.display = "none";
  document.getElementById("collage-section").style.display = "none";
  document.getElementById("border-section").style.display = "block";
  document.getElementById("modern-text").textContent = "Add a Border";
  document.getElementById("download-button").textContent = "Download Image with Border";
  closeSidebarIfOpen();
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    imgElement.style.filter = "none";
  }
}

/* Filter: Select filter type and show slider if needed */
function selectFilterType(filterType) {
  currentFilterType = filterType;
  if (filterType === "none") {
    document.getElementById("filter-slider-container").style.display = "none";
    updateFilter();
  } else {
    document.getElementById("filter-slider-container").style.display = "block";
    updateFilter();
  }
}

/* Update filter based on slider */
function updateFilter() {
  const sliderVal = document.getElementById("filter-slider").value;
  const imgElement = document.getElementById("preview-image");
  let filterStr = "";
  if (currentFilterType === "none") {
    filterStr = "none";
  } else if (currentFilterType === "grayscale" || currentFilterType === "sepia" || currentFilterType === "invert") {
    filterStr = currentFilterType + "(" + sliderVal + "%)";
  } else if (currentFilterType === "brightness" || currentFilterType === "contrast") {
    filterStr = currentFilterType + "(" + (parseInt(sliderVal) + 50) + "%)";
  } else if (currentFilterType === "blur") {
    filterStr = "blur(" + (sliderVal / 20).toFixed(2) + "px)";
  }
  currentFilter = filterStr;
  imgElement.style.filter = filterStr;
}

/* Event listener for filter slider */
document.getElementById("filter-slider").addEventListener("input", updateFilter);

/* Apply Watermark */
function applyWatermark() {
  const watermarkText = document.getElementById("watermark-text").value;
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  if (!watermarkText) {
    alert("Please enter watermark text.");
    return;
  }
  // Get watermark font size from slider
  const size = parseInt(document.getElementById("watermark-size-slider").value);
  watermarkFontSize = size;
  // Determine watermark position based on global variable
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.font = watermarkFontSize + "px Poppins";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    
    // Set text alignment and position based on watermarkPosition
    let x, y;
    switch(watermarkPosition) {
      case "top-left":
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        x = 10;
        y = 10;
        break;
      case "top-right":
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        x = canvas.width - 10;
        y = 10;
        break;
      case "bottom-left":
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        x = 10;
        y = canvas.height - 10;
        break;
      case "center":
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        x = canvas.width / 2;
        y = canvas.height / 2;
        break;
      case "bottom-right":
      default:
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        x = canvas.width - 10;
        y = canvas.height - 10;
        break;
    }
    ctx.fillText(watermarkText, x, y);
    watermarkedImageURL = canvas.toDataURL("image/png");
    document.getElementById("preview-image").src = watermarkedImageURL;
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    document.getElementById("ready-message").textContent = "Watermark applied successfully!";
  };
  img.src = originalImageURL;
}

/* Update watermark size label */
document.getElementById("watermark-size-slider").addEventListener("input", function() {
  const size = this.value;
  document.getElementById("watermark-size-label").textContent = size + "px";
});

/* Set watermark position */
function setWatermarkPosition(pos) {
  watermarkPosition = pos;
}

/* Collage: add event listeners for each collage upload */
for (let i = 1; i <= 4; i++) {
  document.getElementById("collage-upload-" + i).addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        collageImages[i - 1] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

/* Create Collage */
function createCollage() {
  for (let i = 0; i < 4; i++) {
    if (!collageImages[i]) {
      alert("Please upload 4 images for the collage.");
      return;
    }
  }
  const canvas = document.createElement("canvas");
  const cellSize = 200;
  canvas.width = cellSize * 2;
  canvas.height = cellSize * 2;
  const ctx = canvas.getContext("2d");
  const positions = [
    { x: 0, y: 0 },
    { x: cellSize, y: 0 },
    { x: 0, y: cellSize },
    { x: cellSize, y: cellSize }
  ];
  let imagesLoaded = 0;
  for (let i = 0; i < 4; i++) {
    let img = new Image();
    img.onload = function() {
      ctx.drawImage(img, positions[i].x, positions[i].y, cellSize, cellSize);
      imagesLoaded++;
      if (imagesLoaded === 4) {
        collageImageURL = canvas.toDataURL("image/png");
        document.getElementById("preview-image").src = collageImageURL;
        gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
        gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
        document.getElementById("ready-message").textContent = "Collage created successfully!";
      }
    };
    img.src = collageImages[i];
  }
}

/* Apply Border */
function applyBorder() {
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  const thickness = parseInt(document.getElementById("border-thickness").value);
  if (isNaN(thickness) || thickness <= 0) {
    alert("Please enter a valid border thickness.");
    return;
  }
  const borderColor = document.getElementById("border-color").value;
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth + 2 * thickness;
    canvas.height = img.naturalHeight + 2 * thickness;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, thickness, thickness);
    borderedImageURL = canvas.toDataURL("image/png");
    document.getElementById("preview-image").src = borderedImageURL;
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    document.getElementById("ready-message").textContent = "Border applied successfully!";
  };
  img.src = originalImageURL;
}

/* Toggle More Conversion Options */
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

/* Convert Image */
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
    if (targetType === "jpeg") mimeType = "image/jpeg";
    else if (targetType === "png") mimeType = "image/png";
    else if (targetType === "webp") mimeType = "image/webp";
    else if (targetType === "gif") mimeType = "image/gif";
    else if (targetType === "bmp") mimeType = "image/bmp";
    else if (targetType === "ico") mimeType = "image/x-icon";
    else mimeType = "image/png";
    const dataURL = canvas.toDataURL(mimeType);
    convertedFileType = targetType;
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

/* Cropper Actions */
function cropperAction(action, param) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  if (action === "rotate") cropperInstance.rotate(param);
  else if (action === "zoom") cropperInstance.zoom(param);
  else if (action === "reset") cropperInstance.reset();
}

/* Set Crop Aspect Ratio */
function setAspectRatio(ratio) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  cropperInstance.setAspectRatio(ratio);
}

/* Download Image based on mode */
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
  } else if (currentMode === "filter") {
    if (!originalImageURL) {
      alert("Please upload an image first.");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = currentFilter;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "filtered-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
    };
    img.src = originalImageURL;
  } else if (currentMode === "watermark") {
    if (!watermarkedImageURL) {
      alert("Please apply watermark first.");
      return;
    }
    const link = document.createElement("a");
    link.href = watermarkedImageURL;
    link.download = "watermarked-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else if (currentMode === "collage") {
    if (!collageImageURL) {
      alert("Please create a collage first.");
      return;
    }
    const link = document.createElement("a");
    link.href = collageImageURL;
    link.download = "collage-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else if (currentMode === "border") {
    if (!borderedImageURL) {
      alert("Please apply border first.");
      return;
    }
    const link = document.createElement("a");
    link.href = borderedImageURL;
    link.download = "bordered-image.png";
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

/* Filter: When a filter button is clicked */
function selectFilterType(filterType) {
  currentFilterType = filterType;
  if (filterType === "none") {
    document.getElementById("filter-slider-container").style.display = "none";
    updateFilter();
  } else {
    document.getElementById("filter-slider-container").style.display = "block";
    updateFilter();
  }
}

/* Update filter based on slider */
function updateFilter() {
  const sliderVal = document.getElementById("filter-slider").value;
  const imgElement = document.getElementById("preview-image");
  let filterStr = "";
  if (currentFilterType === "none") {
    filterStr = "none";
  } else if (currentFilterType === "grayscale" || currentFilterType === "sepia" || currentFilterType === "invert") {
    filterStr = currentFilterType + "(" + sliderVal + "%)";
  } else if (currentFilterType === "brightness" || currentFilterType === "contrast") {
    filterStr = currentFilterType + "(" + (parseInt(sliderVal) + 50) + "%)";
  } else if (currentFilterType === "blur") {
    filterStr = "blur(" + (sliderVal / 20).toFixed(2) + "px)";
  }
  currentFilter = filterStr;
  imgElement.style.filter = filterStr;
}

/* Listen for filter slider changes */
document.getElementById("filter-slider").addEventListener("input", updateFilter);

/* Watermark: Apply watermark with custom size and position */
function applyWatermark() {
  const watermarkText = document.getElementById("watermark-text").value;
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  if (!watermarkText) {
    alert("Please enter watermark text.");
    return;
  }
  const size = parseInt(document.getElementById("watermark-size-slider").value);
  watermarkFontSize = size;
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.font = watermarkFontSize + "px Poppins";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    
    let x, y;
    switch(watermarkPosition) {
      case "top-left":
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        x = 10;
        y = 10;
        break;
      case "top-right":
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        x = canvas.width - 10;
        y = 10;
        break;
      case "center":
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        x = canvas.width / 2;
        y = canvas.height / 2;
        break;
      case "bottom-left":
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        x = 10;
        y = canvas.height - 10;
        break;
      case "bottom-right":
      default:
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        x = canvas.width - 10;
        y = canvas.height - 10;
        break;
    }
    ctx.fillText(watermarkText, x, y);
    watermarkedImageURL = canvas.toDataURL("image/png");
    document.getElementById("preview-image").src = watermarkedImageURL;
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    document.getElementById("ready-message").textContent = "Watermark applied successfully!";
  };
  img.src = originalImageURL;
}

/* Update watermark size label */
document.getElementById("watermark-size-slider").addEventListener("input", function() {
  document.getElementById("watermark-size-label").textContent = this.value + "px";
});

/* Set watermark position */
function setWatermarkPosition(pos) {
  watermarkPosition = pos;
}

/* Collage: Set event listeners for each collage upload */
for (let i = 1; i <= 4; i++) {
  document.getElementById("collage-upload-" + i).addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        collageImages[i - 1] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

/* Create Collage */
function createCollage() {
  for (let i = 0; i < 4; i++) {
    if (!collageImages[i]) {
      alert("Please upload 4 images for the collage.");
      return;
    }
  }
  const canvas = document.createElement("canvas");
  const cellSize = 200;
  canvas.width = cellSize * 2;
  canvas.height = cellSize * 2;
  const ctx = canvas.getContext("2d");
  const positions = [
    { x: 0, y: 0 },
    { x: cellSize, y: 0 },
    { x: 0, y: cellSize },
    { x: cellSize, y: cellSize }
  ];
  let imagesLoaded = 0;
  for (let i = 0; i < 4; i++) {
    let img = new Image();
    img.onload = function() {
      ctx.drawImage(img, positions[i].x, positions[i].y, cellSize, cellSize);
      imagesLoaded++;
      if (imagesLoaded === 4) {
        collageImageURL = canvas.toDataURL("image/png");
        document.getElementById("preview-image").src = collageImageURL;
        gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
        gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
        document.getElementById("ready-message").textContent = "Collage created successfully!";
      }
    };
    img.src = collageImages[i];
  }
}

/* Apply Border */
function applyBorder() {
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  const thickness = parseInt(document.getElementById("border-thickness").value);
  if (isNaN(thickness) || thickness <= 0) {
    alert("Please enter a valid border thickness.");
    return;
  }
  const borderColor = document.getElementById("border-color").value;
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth + 2 * thickness;
    canvas.height = img.naturalHeight + 2 * thickness;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, thickness, thickness);
    borderedImageURL = canvas.toDataURL("image/png");
    document.getElementById("preview-image").src = borderedImageURL;
    gsap.to("#download-button", { duration: 0.8, opacity: 1, ease: "power2.out" });
    gsap.to("#ready-message", { duration: 0.8, opacity: 1, ease: "power2.out", delay: 0.5 });
    document.getElementById("ready-message").textContent = "Border applied successfully!";
  };
  img.src = originalImageURL;
}

/* Toggle More Conversion Options */
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

/* Convert Image */
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
    if (targetType === "jpeg") mimeType = "image/jpeg";
    else if (targetType === "png") mimeType = "image/png";
    else if (targetType === "webp") mimeType = "image/webp";
    else if (targetType === "gif") mimeType = "image/gif";
    else if (targetType === "bmp") mimeType = "image/bmp";
    else if (targetType === "ico") mimeType = "image/x-icon";
    else mimeType = "image/png";
    const dataURL = canvas.toDataURL(mimeType);
    convertedFileType = targetType;
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

/* Cropper Actions */
function cropperAction(action, param) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  if (action === "rotate") cropperInstance.rotate(param);
  else if (action === "zoom") cropperInstance.zoom(param);
  else if (action === "reset") cropperInstance.reset();
}

/* Set Crop Aspect Ratio */
function setAspectRatio(ratio) {
  if (!cropperInstance) {
    alert("Cropper is not initialized.");
    return;
  }
  cropperInstance.setAspectRatio(ratio);
}

/* Download Image based on mode */
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
  } else if (currentMode === "filter") {
    if (!originalImageURL) {
      alert("Please upload an image first.");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = currentFilter;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "filtered-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
    };
    img.src = originalImageURL;
  } else if (currentMode === "watermark") {
    if (!watermarkedImageURL) {
      alert("Please apply watermark first.");
      return;
    }
    const link = document.createElement("a");
    link.href = watermarkedImageURL;
    link.download = "watermarked-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else if (currentMode === "collage") {
    if (!collageImageURL) {
      alert("Please create a collage first.");
      return;
    }
    const link = document.createElement("a");
    link.href = collageImageURL;
    link.download = "collage-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    gsap.fromTo("#download-button", { scale: 1 }, { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
  } else if (currentMode === "border") {
    if (!borderedImageURL) {
      alert("Please apply border first.");
      return;
    }
    const link = document.createElement("a");
    link.href = borderedImageURL;
    link.download = "bordered-image.png";
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
