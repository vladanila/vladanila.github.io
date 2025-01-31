function resizeImage() {
    // Get file input, width and height values
    const fileInput = document.getElementById('upload');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const outputDiv = document.getElementById('output');

    // Check if a file is selected
    if (fileInput.files.length === 0) {
        alert("Please upload an image file.");
        return;
    }

    const file = fileInput.files[0];
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);

    // Check if width and height are valid numbers
    if (isNaN(width) || isNaN(height)) {
        alert("Please enter valid width and height values.");
        return;
    }

    // Create an image element to preview the uploaded image
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        // Resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Create a new image element to display the resized image
        const resizedImage = document.createElement('img');
        resizedImage.src = canvas.toDataURL('image/png');

        // Clear the previous output and show the resized image
        outputDiv.innerHTML = '';
        outputDiv.appendChild(resizedImage);

        // Add the "Download Resized Image" button
        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = 'Download Resized Image';
        downloadBtn.onclick = function() {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'resized-image.png';
            link.click();
        };
        
        // Append the download button to the output div
        outputDiv.appendChild(downloadBtn);
    };
}

