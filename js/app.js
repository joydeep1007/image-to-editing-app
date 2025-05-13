// Main Application Logic

// Global variables
let images = [];
let selectedTransition = 'fade';
let slideDuration = 2; // seconds
let transitionDuration = 0.5; // seconds
let isPlaying = false;
let currentPreviewIndex = 0;
let previewInterval;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    const uploadBtn = document.getElementById('upload-btn');
    const imageUpload = document.getElementById('image-upload');
    const transitionBtns = document.querySelectorAll('.transition-btn');
    const slideDurationInput = document.getElementById('slide-duration');
    const transitionDurationInput = document.getElementById('transition-duration');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const exportBtn = document.getElementById('export-btn');
    const previewDisplay = document.getElementById('preview-display');
    const timelineTrack = document.querySelector('.timeline-track');

    // Initialize timeline with SortableJS
    initializeTimeline(timelineTrack);

    // Event Listeners
    uploadBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Setup drag and drop for the preview area
    previewDisplay.addEventListener('dragover', handleDragOver);
    previewDisplay.addEventListener('drop', handleDrop);
    previewDisplay.addEventListener('dragleave', handleDragLeave);

    // Transition selection
    transitionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all transition buttons
            transitionBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update selected transition
            selectedTransition = btn.dataset.transition;
            showToast(`Transition set to: ${selectedTransition}`);
        });
    });

    // Duration controls
    slideDurationInput.addEventListener('change', () => {
        slideDuration = parseFloat(slideDurationInput.value);
        showToast(`Slide duration set to: ${slideDuration}s`);
    });

    transitionDurationInput.addEventListener('change', () => {
        transitionDuration = parseFloat(transitionDurationInput.value);
        showToast(`Transition duration set to: ${transitionDuration}s`);
    });

    // Preview controls
    playBtn.addEventListener('click', startPreview);
    pauseBtn.addEventListener('click', pausePreview);
    stopBtn.addEventListener('click', stopPreview);

    // Export button
    exportBtn.addEventListener('click', exportVideo);

    // Set initial state
    updatePreviewDisplay();
    transitionBtns[0].classList.add('active'); // Set first transition as active by default
});

// Handle image upload
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    Array.from(files).forEach(file => {
        if (!file.type.match('image.*')) {
            showToast('Please upload image files only', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: generateId(),
                src: e.target.result,
                name: file.name,
                transition: selectedTransition,
                duration: slideDuration
            };
            
            images.push(imageData);
            addImageToTimeline(imageData);
            updatePreviewDisplay();
            showToast(`Added image: ${file.name}`);
        };
        reader.readAsDataURL(file);
    });

    // Reset the file input
    event.target.value = '';
}

// Drag and Drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length > 0) {
        const fileInput = document.getElementById('image-upload');
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
}

// Helper functions
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function showToast(message, type = 'success') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export functions to be used by other modules
window.app = {
    images,
    selectedTransition,
    slideDuration,
    transitionDuration,
    isPlaying,
    currentPreviewIndex,
    showToast,
    handleImageUpload
};

// Make sure images array is globally accessible
window.images = images;