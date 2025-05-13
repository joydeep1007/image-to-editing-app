// Timeline Management

// Initialize the timeline with SortableJS
function initializeTimeline(timelineTrack) {
    Sortable.create(timelineTrack, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function() {
            // Update the images array to match the new order in the timeline
            updateImagesOrder();
        }
    });
}

// Add an image to the timeline
function addImageToTimeline(imageData) {
    const timelineTrack = document.querySelector('.timeline-track');
    
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.dataset.id = imageData.id;
    timelineItem.draggable = true;
    
    // Create thumbnail
    const img = document.createElement('img');
    img.src = imageData.src;
    img.alt = imageData.name;
    timelineItem.appendChild(img);
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent selecting the item when removing
        removeImageFromTimeline(imageData.id);
    });
    timelineItem.appendChild(removeBtn);
    
    // Create transition indicator
    const transitionIndicator = document.createElement('div');
    transitionIndicator.className = 'transition-indicator';
    transitionIndicator.title = `Transition: ${imageData.transition}`;
    
    // Set icon based on transition type
    let transitionIcon = '';
    switch(imageData.transition) {
        case 'fade':
            transitionIcon = '<i class="fas fa-adjust"></i>';
            break;
        case 'slide':
            transitionIcon = '<i class="fas fa-arrows-alt-h"></i>';
            break;
        case 'zoom':
            transitionIcon = '<i class="fas fa-search-plus"></i>';
            break;
        default:
            transitionIcon = '<i class="fas fa-adjust"></i>';
    }
    
    transitionIndicator.innerHTML = transitionIcon;
    timelineItem.appendChild(transitionIndicator);
    
    // Add click event to select the item
    timelineItem.addEventListener('click', () => {
        selectTimelineItem(imageData.id);
    });
    
    timelineTrack.appendChild(timelineItem);
}

// Remove an image from the timeline
function removeImageFromTimeline(imageId) {
    // Remove from DOM
    const timelineItem = document.querySelector(`.timeline-item[data-id="${imageId}"]`);
    if (timelineItem) {
        timelineItem.remove();
    }
    
    // Remove from images array
    const index = images.findIndex(img => img.id === imageId);
    if (index !== -1) {
        images.splice(index, 1);
        updatePreviewDisplay();
        app.showToast('Image removed from timeline');
    }
}

// Select a timeline item
function selectTimelineItem(imageId) {
    // Remove selected class from all items
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selected class to the clicked item
    const selectedItem = document.querySelector(`.timeline-item[data-id="${imageId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        
        // Find the image in the array
        const imageData = images.find(img => img.id === imageId);
        if (imageData) {
            // Update the transition buttons to reflect this image's transition
            document.querySelectorAll('.transition-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.transition === imageData.transition) {
                    btn.classList.add('active');
                }
            });
            
            // Update duration inputs
            document.getElementById('slide-duration').value = imageData.duration;
            
            // Update preview to show this image
            const index = images.findIndex(img => img.id === imageId);
            if (index !== -1) {
                currentPreviewIndex = index;
                updatePreviewDisplay();
            }
        }
    }
}

// Update the images array to match the order in the timeline
function updateImagesOrder() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const newOrder = [];
    
    timelineItems.forEach(item => {
        const imageId = item.dataset.id;
        const imageData = images.find(img => img.id === imageId);
        if (imageData) {
            newOrder.push(imageData);
        }
    });
    
    // Replace the images array with the new order
    images = newOrder;
    
    // Update the preview
    updatePreviewDisplay();
}

// Update an image's transition
function updateImageTransition(imageId, transition) {
    const image = images.find(img => img.id === imageId);
    if (image) {
        image.transition = transition;
        
        // Update the transition indicator
        const timelineItem = document.querySelector(`.timeline-item[data-id="${imageId}"]`);
        if (timelineItem) {
            const transitionIndicator = timelineItem.querySelector('.transition-indicator');
            if (transitionIndicator) {
                transitionIndicator.title = `Transition: ${transition}`;
                
                // Update icon
                let transitionIcon = '';
                switch(transition) {
                    case 'fade':
                        transitionIcon = '<i class="fas fa-adjust"></i>';
                        break;
                    case 'slide':
                        transitionIcon = '<i class="fas fa-arrows-alt-h"></i>';
                        break;
                    case 'zoom':
                        transitionIcon = '<i class="fas fa-search-plus"></i>';
                        break;
                    default:
                        transitionIcon = '<i class="fas fa-adjust"></i>';
                }
                
                transitionIndicator.innerHTML = transitionIcon;
            }
        }
    }
}

// Export timeline functions to global scope
window.initializeTimeline = initializeTimeline;
window.addImageToTimeline = addImageToTimeline;
window.removeImageFromTimeline = removeImageFromTimeline;
window.selectTimelineItem = selectTimelineItem;
window.updateImagesOrder = updateImagesOrder;
window.updateImageTransition = updateImageTransition;