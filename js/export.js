// Export Management

// Export the video
function exportVideo() {
    if (images.length === 0) {
        app.showToast('No images to export', 'error');
        return;
    }
    
    app.showToast('Preparing to export video...');
    
    // Create a loading indicator
    const exportBtn = document.getElementById('export-btn');
    const originalBtnText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<div class="loading"></div> Exporting...';
    exportBtn.disabled = true;
    
    // Use setTimeout to allow the UI to update before starting the export process
    setTimeout(() => {
        try {
            // Create a canvas for rendering frames
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size (720p)
            canvas.width = 1280;
            canvas.height = 720;
            
            // Prepare frames
            prepareVideoFrames(canvas, ctx)
                .then(frames => {
                    // Create video from frames
                    return createVideoFromFrames(frames);
                })
                .then(videoBlob => {
                    // Create download link
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(videoBlob);
                    downloadLink.download = 'video_export_' + new Date().getTime() + '.mp4';
                    
                    // Trigger download
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Reset button
                    exportBtn.innerHTML = originalBtnText;
                    exportBtn.disabled = false;
                    
                    app.showToast('Video exported successfully!');
                })
                .catch(error => {
                    console.error('Export error:', error);
                    app.showToast('Error exporting video: ' + error.message, 'error');
                    
                    // Reset button
                    exportBtn.innerHTML = originalBtnText;
                    exportBtn.disabled = false;
                });
        } catch (error) {
            console.error('Export setup error:', error);
            app.showToast('Error setting up export: ' + error.message, 'error');
            
            // Reset button
            exportBtn.innerHTML = originalBtnText;
            exportBtn.disabled = false;
        }
    }, 100);
}

// Prepare video frames from images
async function prepareVideoFrames(canvas, ctx) {
    const frames = [];
    const fps = 30; // Frames per second
    
    // Calculate total frames needed
    let totalFrames = 0;
    images.forEach(image => {
        // Frames for the image duration
        const imageDurationFrames = Math.round(image.duration * fps);
        // Frames for the transition
        const transitionFrames = Math.round(transitionDuration * fps);
        
        totalFrames += imageDurationFrames + transitionFrames;
    });
    
    app.showToast(`Generating ${totalFrames} frames...`);
    
    // Process each image
    for (let i = 0; i < images.length; i++) {
        const currentImage = images[i];
        const nextImage = images[(i + 1) % images.length];
        
        // Load current image
        const img1 = new Image();
        img1.src = currentImage.src;
        await new Promise(resolve => { img1.onload = resolve; });
        
        // Load next image (for transition)
        const img2 = new Image();
        img2.src = nextImage.src;
        await new Promise(resolve => { img2.onload = resolve; });
        
        // Calculate frames for this image
        const imageDurationFrames = Math.round(currentImage.duration * fps);
        const transitionFrames = Math.round(transitionDuration * fps);
        
        // Generate frames for the image duration
        for (let frame = 0; frame < imageDurationFrames; frame++) {
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the current image (centered and scaled to fit)
            drawImageProp(ctx, img1, 0, 0, canvas.width, canvas.height);
            
            // Capture frame
            frames.push(canvas.toDataURL('image/jpeg', 0.9));
        }
        
        // Generate frames for the transition to the next image
        for (let frame = 0; frame < transitionFrames; frame++) {
            // Calculate transition progress (0 to 1)
            const progress = frame / transitionFrames;
            
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Apply transition effect based on the transition type
            switch (currentImage.transition) {
                case 'fade':
                    // Draw the current image with decreasing opacity
                    ctx.globalAlpha = 1 - progress;
                    drawImageProp(ctx, img1, 0, 0, canvas.width, canvas.height);
                    
                    // Draw the next image with increasing opacity
                    ctx.globalAlpha = progress;
                    drawImageProp(ctx, img2, 0, 0, canvas.width, canvas.height);
                    
                    // Reset alpha
                    ctx.globalAlpha = 1;
                    break;
                    
                case 'slide':
                    // Draw the current image sliding out
                    drawImageProp(ctx, img1, -canvas.width * progress, 0, canvas.width, canvas.height);
                    
                    // Draw the next image sliding in
                    drawImageProp(ctx, img2, canvas.width * (1 - progress), 0, canvas.width, canvas.height);
                    break;
                    
                case 'zoom':
                    // Draw the current image zooming out
                    const scale1 = 1 + progress * 0.5;
                    const offsetX1 = (canvas.width * scale1 - canvas.width) / 2;
                    const offsetY1 = (canvas.height * scale1 - canvas.height) / 2;
                    
                    ctx.globalAlpha = 1 - progress;
                    drawImageProp(ctx, img1, -offsetX1, -offsetY1, canvas.width * scale1, canvas.height * scale1);
                    
                    // Draw the next image zooming in
                    const scale2 = 0.5 + progress * 0.5;
                    const offsetX2 = (canvas.width - canvas.width * scale2) / 2;
                    const offsetY2 = (canvas.height - canvas.height * scale2) / 2;
                    
                    ctx.globalAlpha = progress;
                    drawImageProp(ctx, img2, offsetX2, offsetY2, canvas.width * scale2, canvas.height * scale2);
                    
                    // Reset alpha
                    ctx.globalAlpha = 1;
                    break;
                    
                default:
                    // Default to fade
                    ctx.globalAlpha = 1 - progress;
                    drawImageProp(ctx, img1, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = progress;
                    drawImageProp(ctx, img2, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 1;
            }
            
            // Capture frame
            frames.push(canvas.toDataURL('image/jpeg', 0.9));
        }
        
        // Update progress
        if (i % 2 === 0) { // Update every other image to avoid too many toasts
            app.showToast(`Processing image ${i + 1} of ${images.length}...`);
        }
    }
    
    return frames;
}

// Create video from frames using ffmpeg.js
async function createVideoFromFrames(frames) {
    app.showToast('Creating video file...');
    
    return new Promise((resolve, reject) => {
        try {
            // For this implementation, we'll use a simpler approach
            // In a production app, you would use ffmpeg.js to create a proper video
            // This is a simplified version that creates an animated WebM video
            
            // Create a canvas for the video
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');
            
            // Create a MediaRecorder to record the canvas
            const stream = canvas.captureStream(30); // 30 FPS
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps
            });
            
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };
            
            // Start recording
            recorder.start();
            
            // Draw each frame on the canvas
            let frameIndex = 0;
            const fps = 30;
            const frameDuration = 1000 / fps; // ms per frame
            
            function drawNextFrame() {
                if (frameIndex < frames.length) {
                    // Load the frame image
                    const img = new Image();
                    img.onload = () => {
                        // Draw the frame
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Schedule the next frame
                        frameIndex++;
                        if (frameIndex < frames.length) {
                            setTimeout(drawNextFrame, frameDuration);
                        } else {
                            // Stop recording after the last frame
                            setTimeout(() => recorder.stop(), frameDuration * 2);
                        }
                    };
                    img.src = frames[frameIndex];
                }
            }
            
            // Start drawing frames
            drawNextFrame();
            
        } catch (error) {
            reject(error);
        }
    });
}

// Export export functions to global scope
window.exportVideo = exportVideo;
window.prepareVideoFrames = prepareVideoFrames;
window.createVideoFromFrames = createVideoFromFrames;

// Helper function to draw an image properly scaled and centered
function drawImageProp(ctx, img, x, y, w, h) {
    // Default offset is center
    const offsetX = 0.5;
    const offsetY = 0.5;
    
    // Keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;
    
    // Calculate dimensions to maintain aspect ratio
    let iw = img.width;
    let ih = img.height;
    let r = Math.min(w / iw, h / ih);
    let nw = iw * r; // New width
    let nh = ih * r; // New height
    let cx, cy, cw, ch;
    
    // Decide which gap to fill
    if (nw < w) {
        cx = x + (w - nw) * offsetX;
        cw = nw;
    } else {
        cx = x;
        cw = w;
    }
    
    if (nh < h) {
        cy = y + (h - nh) * offsetY;
        ch = nh;
    } else {
        cy = y;
        ch = h;
    }
    
    // Draw the image
    ctx.drawImage(img, cx, cy, cw, ch);
}