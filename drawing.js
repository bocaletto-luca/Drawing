/*
 * drawing-app.js - Drawing Application using HTML5 Canvas
 * Author: Bocaletto Luca
 * License: GPL v3
 *
 * Description:
 *   This application provides a basic drawing tool using the HTML5 Canvas API.
 *   Users can draw with a brush, use an eraser, select different colors and brush sizes,
 *   clear the canvas, and save their artwork as a PNG image locally.
 */

document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to fill parent container width and a fixed height
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 500;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'brush';

  // DOM elements for controls
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const brushToolBtn = document.getElementById('brushTool');
  const eraserToolBtn = document.getElementById('eraserTool');
  const clearCanvasBtn = document.getElementById('clearCanvas');
  const saveDrawingBtn = document.getElementById('saveDrawing');

  // Set initial drawing context settings
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Switch to brush tool
  brushToolBtn.addEventListener('click', function () {
    currentTool = 'brush';
    brushToolBtn.classList.add('active');
    eraserToolBtn.classList.remove('active');
    ctx.strokeStyle = colorPicker.value;
  });

  // Switch to eraser tool
  eraserToolBtn.addEventListener('click', function () {
    currentTool = 'eraser';
    eraserToolBtn.classList.add('active');
    brushToolBtn.classList.remove('active');
    ctx.strokeStyle = '#ffffff'; // assuming white canvas background
  });

  // Update color if brush is selected
  colorPicker.addEventListener('change', function () {
    if (currentTool === 'brush') {
      ctx.strokeStyle = colorPicker.value;
    }
  });

  // Update brush size
  brushSize.addEventListener('change', function () {
    ctx.lineWidth = brushSize.value;
  });

  // Get mouse position relative to canvas
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Mouse events for drawing
  canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  });

  canvas.addEventListener('mouseup', function () {
    isDrawing = false;
  });

  canvas.addEventListener('mouseout', function () {
    isDrawing = false;
  });

  // Clear the canvas
  clearCanvasBtn.addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Save the drawing as an image (PNG)
  saveDrawingBtn.addEventListener('click', function () {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
