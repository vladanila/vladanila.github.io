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
let watermarkPosition = "bottom-right";
let watermarkFontSize = 30;
let undoStack = [];
let redoStack = [];

// Home button: simply reload without animation
function goHome() {
  window.location.reload();
}

/* Toggle sidebar menu without animation */
function toggleMenu() {
  const sidebar = document.getElementById("sidebar-menu");
  const menuIcon = document.getElementById("menu-icon");
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-280px";
    menuIcon.classList.remove("open");
  } else {
    sidebar.style.left = "0px";
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
  undoStack = [];
  redoStack = [];
}

/* Toggle light/dark mode without animation */
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
      // Ensure preview is visible
      const previewWrapper = document.getElementById("preview-wrapper");
      previewWrapper.style.display = "flex";
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
        previewWrapper.style.opacity = "1";
        document.getElementById("download-button").style.opacity = "1";
      }
      if (["convert", "filter", "watermark", "collage", "border"].includes(currentMode)) {
        previewWrapper.style.opacity = "1";
      }
      updateUndoStack(originalImageURL); // Add the original image to the undo stack
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
      updateUndoStack(canvas.toDataURL());
      currentCanvas = canvas;
      document.getElementById("preview-image").src = canvas.toDataURL();
      document.getElementById("preview-wrapper").style.opacity = "1";
      document.getElementById("download-button").style.opacity = "1";
    };
  };
  reader.readAsDataURL(file);
}

/* Helper: Close sidebar if open */
function closeSidebarIfOpen() {
  const sidebar = document.getElementById("sidebar-menu");
  if (sidebar.style.left === "0px") toggleMenu();
}

/* Helper: Show upload button (for non-collage modes) */
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
    previewWrapper.style.opacity = "1";
    document.getElementById("download-button").style.opacity = "1";
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
  previewWrapper.style.opacity = "1";
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) imgElement.src = originalImageURL;
}

// Filter Mode with Slider and Percentage Display
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
  previewWrapper.style.opacity = "1";
  
  const imgElement = document.getElementById("preview-image");
  if (originalImageURL) {
    imgElement.src = originalImageURL;
    imgElement.style.filter = "none";
    currentFilterType = "none";
    document.getElementById("filter-slider-container").style.display = "none";
    document.getElementById("download-button").style.opacity = "0";
  }
}

// Watermark Mode with Size, Opacity & Position Controls
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
    document.getElementById("download-button").style.opacity = "0";
  }
}

// Collage Mode
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
  // The download button will appear after createCollage is clicked.
}

// Border Mode with Thickness Slider
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
    document.getElementById("download-button").style.opacity = "0";
  }
}

/* Filter: Select filter type */
function selectFilterType(filterType) {
  currentFilterType = filterType;
  if (filterType === "none") {
    document.getElementById("filter-slider-container").style.display = "none";
    updateFilter();
  } else {
    document.getElementById("filter-slider-container").style.display = "block";
    updateFilter();
  }
  document.getElementById("download-button").style.opacity = "1";
}

/* Update filter based on slider and update percentage label */
function updateFilter() {
  const sliderVal = document.getElementById("filter-slider").value;
  const imgElement = document.getElementById("preview-image");
  let filterStr = "";
  if (currentFilterType === "none") {
    filterStr = "none";
    document.getElementById("filter-percentage").textContent = "";
  } else if (currentFilterType === "grayscale" || currentFilterType === "sepia" || currentFilterType === "invert") {
    filterStr = currentFilterType + "(" + sliderVal + "%)";
    document.getElementById("filter-percentage").textContent = sliderVal + "%";
  } else if (currentFilterType === "brightness" || currentFilterType === "contrast") {
    let value = parseInt(sliderVal) + 50;
    filterStr = currentFilterType + "(" + value + "%)";
    document.getElementById("filter-percentage").textContent = value + "%";
  } else if (currentFilterType === "blur") {
    let blurPx = (sliderVal / 20).toFixed(2);
    filterStr = "blur(" + blurPx + "px)";
    document.getElementById("filter-percentage").textContent = blurPx + "px";
  }
  currentFilter = filterStr;
  imgElement.style.filter = filterStr;
  updateUndoStack(imgElement.src);
}

/* Listen for filter slider changes */
document.getElementById("filter-slider").addEventListener("input", updateFilter);

/* Watermark: Apply watermark with size, opacity and position */
function applyWatermark() {
  const watermarkText = document.getElementById("watermark-text").value;
  const watermarkImage = document.getElementById("watermark-image").files[0];
  if (!originalImageURL) {
    alert("Please upload a base image first.");
    return;
  }
  if (!watermarkText && !watermarkImage) {
    alert("Please provide either text or an image watermark.");
    return;
  }
  const size = parseInt(document.getElementById("watermark-size-slider").value);
  watermarkFontSize = size;
  const opacityVal = parseInt(document.getElementById("watermark-opacity-slider").value);
  const opacityDecimal = opacityVal / 100;
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    
    if (watermarkText) {
      ctx.font = watermarkFontSize + "px Poppins";
      ctx.fillStyle = "rgba(255,255,255," + opacityDecimal + ")";
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
    }

    if (watermarkImage) {
      const watermarkImg = new Image();
      watermarkImg.onload = function() {
        const watermarkWidth = canvas.width * 0.2;
        const watermarkHeight = watermarkImg.naturalHeight * (watermarkWidth / watermarkImg.naturalWidth);
        ctx.globalAlpha = opacityDecimal;
        ctx.drawImage(watermarkImg, canvas.width - watermarkWidth - 10, canvas.height - watermarkHeight - 10, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1;
        watermarkedImageURL = canvas.toDataURL("image/png");
        updateUndoStack(watermarkedImageURL);
        document.getElementById("preview-image").src = watermarkedImageURL;
        document.getElementById("download-button").style.opacity = "1";
        document.getElementById("ready-message").style.opacity = "1";
        document.getElementById("ready-message").textContent = "Watermark applied successfully!";
      };
      watermarkImg.src = URL.createObjectURL(watermarkImage);
    } else {
      watermarkedImageURL = canvas.toDataURL("image/png");
      updateUndoStack(watermarkedImageURL);
      document.getElementById("preview-image").src = watermarkedImageURL;
      document.getElementById("download-button").style.opacity = "1";
      document.getElementById("ready-message").style.opacity = "1";
      document.getElementById("ready-message").textContent = "Watermark applied successfully!";
    }
  };
  img.src = originalImageURL;
}

/* Reapply watermark in realtime when size or opacity changes */
document.getElementById("watermark-size-slider").addEventListener("input", function() {
  document.getElementById("watermark-size-label").textContent = this.value + "px";
  if(document.getElementById("watermark-text").value || document.getElementById("watermark-image").files[0]) {
    applyWatermark();
  }
});
document.getElementById("watermark-opacity-slider").addEventListener("input", function() {
  document.getElementById("watermark-opacity-label").textContent = this.value + "%";
  if(document.getElementById("watermark-text").value || document.getElementById("watermark-image").files[0]) {
    applyWatermark();
  }
});

/* Set watermark position */
function setWatermarkPosition(pos) {
  watermarkPosition = pos;
  if(document.getElementById("watermark-text").value || document.getElementById("watermark-image").files[0]) {
    applyWatermark();
  }
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
        updateUndoStack(collageImageURL);
        document.getElementById("preview-image").src = collageImageURL;
        document.getElementById("download-button").style.opacity = "1";
        document.getElementById("ready-message").style.opacity = "1";
        document.getElementById("ready-message").textContent = "Collage created successfully!";
      }
    };
    img.src = collageImages[i];
  }
}

/* Undo/Redo functionality */
function updateUndoStack(newState) {
  undoStack.push({ url: newState });
  redoStack = [];
}

function undoAction() {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop());
    const lastState = undoStack[undoStack.length - 1];
    document.getElementById("preview-image").src = lastState.url;
    if (currentMode === "filter") {
      document.getElementById("preview-image").style.filter = lastState.filter || "none";
    }
  } else {
    alert("No more actions to undo!");
  }
}

function redoAction() {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop());
    const nextState = undoStack[undoStack.length - 1];
    document.getElementById("preview-image").src = nextState.url;
    if (currentMode === "filter") {
      document.getElementById("preview-image").style.filter = nextState.filter || "none";
    }
  } else {
    alert("No more actions to redo!");
  }
}

/* Cropper actions: rotate, zoom, reset */
function cropperAction(action, value) {
  if (!cropperInstance) return;
  switch(action) {
    case 'rotate':
      cropperInstance.rotate(value);
      break;
    case 'zoom':
      cropperInstance.zoom(value);
      break;
    case 'reset':
      cropperInstance.reset();
      break;
  }
}

/* Set aspect ratio for cropper */
function setAspectRatio(ratio) {
  if (!cropperInstance) return;
  cropperInstance.setAspectRatio(ratio);
}

/* Apply border using canvas */
function applyBorder() {
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  const borderThickness = document.getElementById("border-thickness-slider").value;
  const borderColor = document.getElementById("border-color").value;
  const img = new Image();
  img.src = originalImageURL;
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth + parseInt(borderThickness) * 2;
    canvas.height = img.naturalHeight + parseInt(borderThickness) * 2;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, borderThickness, borderThickness);
    borderedImageURL = canvas.toDataURL("image/png");
    updateUndoStack(borderedImageURL);
    document.getElementById("preview-image").src = borderedImageURL;
    document.getElementById("download-button").style.opacity = "1";
  };
}

/* Convert image type */
function convertTo(type) {
  if (!originalImageURL) {
    alert("Please upload an image first.");
    return;
  }
  const img = new Image();
  img.src = originalImageURL;
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    convertedImageURL = canvas.toDataURL("image/" + type);
    updateUndoStack(convertedImageURL);
    document.getElementById("preview-image").src = convertedImageURL;
    document.getElementById("download-button").style.opacity = "1";
  };
}

/* Toggle more conversion options */
function toggleMoreOptions() {
  const moreOptions = document.getElementById("more-convert-options");
  if (moreOptions.style.display === "none" || moreOptions.style.display === "") {
    moreOptions.style.display = "flex";
  } else {
    moreOptions.style.display = "none";
  }
}

/* Download the final image */
function downloadImage() {
  if (currentMode === "crop" && cropperInstance) {
    const canvas = cropperInstance.getCroppedCanvas();
    const link = document.createElement("a");
    link.download = "cropped_image.png";
    link.href = canvas.toDataURL();
    link.click();
  } else {
    const link = document.createElement("a");
    link.download = "edited_image.png";
    link.href = document.getElementById("preview-image").src;
    link.click();
  }
}

/* Initialize Drag and Drop */
function initDragAndDrop() {
  const dropZone = document.getElementById('drag-drop-zone');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  dropZone.addEventListener('drop', handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    dropZone.classList.add('dragover');
  }

  function unhighlight(e) {
    dropZone.classList.remove('dragover');
  }

  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
  }
}

/* Handle dropped files */
function handleFiles(files) {
  ([...files]).forEach(uploadFile);
}

/* Upload file via drag-and-drop */
function uploadFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    originalImageURL = e.target.result;
    const imgElement = document.getElementById("preview-image");
    imgElement.src = originalImageURL;
    document.getElementById("file-name").textContent = file.name;
    if (currentMode === "crop") {
      if (cropperInstance) cropperInstance.destroy();
      cropperInstance = new Cropper(imgElement, {});
    }
    updateUndoStack(originalImageURL);
    // Ensure preview is visible
    const previewWrapper = document.getElementById("preview-wrapper");
    previewWrapper.style.display = "flex";
    previewWrapper.style.opacity = "1";
  };
  reader.readAsDataURL(file);
}

/* Update preview for different modes */
function updatePreview() {
  switch(currentMode) {
    case "filter":
      updateFilter();
      break;
    case "watermark":
      applyWatermark();
      break;
    case "collage":
      if (collageImages.every(img => img !== null)) {
        createCollage();
      }
      break;
    case "border":
      applyBorder();
      break;
  }
}

/* Initialize when DOM content is loaded */
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  document.getElementById('undo-action').addEventListener('click', undoAction);
  document.getElementById('redo-action').addEventListener('click', redoAction);
});
