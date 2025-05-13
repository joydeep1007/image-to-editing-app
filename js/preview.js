// Preview Management

// Update the preview display
function updatePreviewDisplay() {
    const previewDisplay = document.getElementById('preview-display');
    
    // Clear the preview display
    previewDisplay.innerHTML = '';
    
    if (images.length === 0) {
        // Show placeholder if no images
        previewDisplay.innerHTML = '<p>Upload images to start creating your video</p>';
        return;
    }
    
    // Display the current image
    if (currentPreviewIndex >= images.length) {
        currentPreviewIndex = 0; // Reset if out of bounds
    }
    
    const currentImage = images[currentPreviewIndex];
    const img = document.createElement('img');
    img.src = currentImage.src;
    img.alt = currentImage.name;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    previewDisplay.appendChild(img);
    
    // Show image info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'preview-info';
    infoDiv.innerHTML = `
        <span>${currentPreviewIndex + 1}/${images.length}</span>
        <span>${currentImage.name}</span>
    `;
    infoDiv.style.position = 'absolute';
    infoDiv.style.bottom = '10px';
    infoDiv.style.left = '10px';
    infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    infoDiv.style.color = 'white';
    infoDiv.style.padding = '5px 10px';
    infoDiv.style.borderRadius = '4px';
    infoDiv.style.fontSize = '0.8rem';
    
    previewDisplay.appendChild(infoDiv);
}

// Start the preview playback
function startPreview() {
    if (images.length === 0) {
        app.showToast('No images to preview', 'error');
        return;
    }
    
    if (isPlaying) return; // Already playing
    
    isPlaying = true;
    app.showToast('Preview started');
    
    // Clear any existing interval
    if (previewInterval) clearInterval(previewInterval);
    
    // Set interval to cycle through images
    previewInterval = setInterval(() => {
        currentPreviewIndex = (currentPreviewIndex + 1) % images.length;
        applyTransitionEffect(images[currentPreviewIndex].transition);
        updatePreviewDisplay();
    }, slideDuration * 1000);
}

// Pause the preview playback
function pausePreview() {
    if (!isPlaying) return; // Not playing
    
    isPlaying = false;
    clearInterval(previewInterval);
    app.showToast('Preview paused');
}

// Stop the preview playback
function stopPreview() {
    isPlaying = false;
    clearInterval(previewInterval);
    currentPreviewIndex = 0;
    updatePreviewDisplay();
    app.showToast('Preview stopped');
}

// Apply transition effect
function applyTransitionEffect(transitionType) {
    const previewDisplay = document.getElementById('preview-display');
    
    // Remove any existing transition classes
    previewDisplay.classList.remove('fade-transition', 'slide-transition', 'zoom-transition');
    
    // Add the appropriate transition class
    switch(transitionType) {
        case 'fade':
            previewDisplay.classList.add('fade-transition');
            break;
        case 'slide':
            previewDisplay.classList.add('slide-transition');
            break;
        case 'zoom':
            previewDisplay.classList.add('zoom-transition');
            break;
    }
    
    // Add transition styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .fade-transition img {
            animation: fadeEffect ${transitionDuration}s ease;
        }
        
        .slide-transition img {
            animation: slideEffect ${transitionDuration}s ease;
        }
        
        .zoom-transition img {
            animation: zoomEffect ${transitionDuration}s ease;
        }
        
        @keyframes fadeEffect {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        @keyframes slideEffect {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        
        @keyframes zoomEffect {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    
    // Remove any existing transition styles
    const existingStyle = document.querySelector('style[data-transition]');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.setAttribute('data-transition', 'true');
    document.head.appendChild(style);
}

// Navigate to the next image in preview
function nextImage() {
    if (images.length === 0) return;
    
    currentPreviewIndex = (currentPreviewIndex + 1) % images.length;
    updatePreviewDisplay();
}

// Navigate to the previous image in preview
function prevImage() {
    if (images.length === 0) return;
    
    currentPreviewIndex = (currentPreviewIndex - 1 + images.length) % images.length;
    updatePreviewDisplay();
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    } else if (e.key === ' ') { // Space bar
        if (isPlaying) {
            pausePreview();
        } else {
            startPreview();
        }
    }
});

// Export preview functions to global scope
window.updatePreviewDisplay = updatePreviewDisplay;
window.startPreview = startPreview;
window.pausePreview = pausePreview;
window.stopPreview = stopPreview;
window.applyTransitionEffect = applyTransitionEffect;
window.nextImage = nextImage;
window.prevImage = prevImage;