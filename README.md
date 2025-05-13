# Image to Video Editor

A web-based application that allows users to create videos from images with custom transitions and effects.

## Features

- **Image Upload**: Upload multiple images from your device
- **Timeline Editor**: Arrange images in sequence with drag-and-drop functionality
- **Transition Effects**: Apply fade, slide, or zoom transitions between images
- **Duration Control**: Set custom durations for slides and transitions
- **Preview**: Preview your video before exporting
- **Export**: Export your creation as a video file

## How to Use

1. **Upload Images**:
   - Click the "Upload Images" button or drag and drop images onto the preview area
   - Your images will appear in the timeline at the bottom of the screen

2. **Arrange Images**:
   - Drag and drop images in the timeline to change their order
   - Click on an image in the timeline to select it

3. **Apply Transitions**:
   - Select an image in the timeline
   - Choose a transition type (Fade, Slide, Zoom) from the tools panel
   - The transition will be applied when moving from the selected image to the next

4. **Set Durations**:
   - Adjust the "Slide Duration" to control how long each image appears
   - Adjust the "Transition Duration" to control how long transitions take

5. **Preview Your Video**:
   - Use the play, pause, and stop buttons to preview your video
   - You can also use keyboard shortcuts: Space (play/pause), Left/Right arrows (previous/next image)

6. **Export Video**:
   - Click the "Export Video" button to create and download your video

## Technical Details

This application is built using:
- HTML5, CSS3, and JavaScript
- SortableJS for drag-and-drop functionality
- Canvas API for image manipulation and video generation
- MediaRecorder API for video creation

## Browser Compatibility

This application works best in modern browsers that support the following features:
- Canvas API
- MediaRecorder API
- ES6 JavaScript

Recommended browsers: Chrome, Firefox, Edge (latest versions)

## Local Development

To run this application locally:

1. Clone or download this repository
2. Open the project folder
3. Start a local server (e.g., using `npx http-server .`)
4. Open your browser and navigate to the local server address (typically http://localhost:8080)

## License

MIT License