/*
 * drawing.js - Drawing Application using HTML5 Canvas
 * Author: Bocaletto Luca
 * License: GPL v3
 *
 * Description:
 *   Drawing-JS is a comprehensive drawing application built with HTML5 Canvas.
 *   It supports multiple tools: Brush, Eraser, Rectangle, Circle, Line, and Text.
 *   Additional features include adjustable brush size, opacity, shadow and gradient effects,
 *   undo/redo functionality, saving in PNG/JPEG formats, and auto-saving to Local Storage.
 *   The drawing is loaded on startup.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');

  // Setup canvas dimensions (set once on load)
  function setupCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 500;
  }
  setupCanvas();

  // -----------------------------
  // State Variables
  // -----------------------------
  let currentTool = 'brush'; // Tools: brush, eraser, rectangle, circle, line, text
  let isDrawing = false;
  let startX = 0, startY = 0; // For shapes and text
  let lastX = 0, lastY = 0;   // For freehand drawing

  // Undo/Redo stacks (each element is an ImageData captured from the canvas)
  let undoStack = [];
  let redoStack = [];

  // -----------------------------
  // DOM Elements for Controls
  // -----------------------------
  const toolButtons = {
    brush: document.getElementById('toolBrush'),
    eraser: document.getElementById('toolEraser'),
    rectangle: document.getElementById('toolRectangle'),
    circle: document.getElementById('toolCircle'),
    line: document.getElementById('toolLine'),
    text: document.getElementById('toolText')
  };
  const colorPicker = document.getElementById('colorPicker');
  const brushSizeInput = document.getElementById('brushSize');
  const opacityInput = document.getElementById('opacitySlider');
  const shadowToggle = document.getElementById('shadowToggle');
  const gradientToggle = document.getElementById('gradientToggle');
  const saveFormat = document.getElementById('saveFormat');

  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn = document.getElementById('saveBtn');

  // -----------------------------
  // Update Canvas Context Settings
  // -----------------------------
  function updateContext() {
    ctx.lineWidth = brushSizeInput.value;
    ctx.globalAlpha = opacityInput.value;
    // Set shadow if enabled
    if (shadowToggle.checked) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = colorPicker.value;
    } else {
      ctx.shadowBlur = 0;
    }
  }
  updateContext();

  // -----------------------------
  // Tool Selection & UI Update
  // -----------------------------
  function setActiveTool(tool) {
    currentTool = tool;
    // Update the active class on button group
    for (let t in toolButtons) {
      if (t === tool) {
        toolButtons[t].classList.add('active');
      } else {
        toolButtons[t].classList.remove('active');
      }
    }
    // Set default stroke color based on tool
    if (tool === 'brush') {
      ctx.strokeStyle = colorPicker.value;
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff'; // assuming canvas background is white
    }
  }
  // Bind tool button events
  for (let tool in toolButtons) {
    toolButtons[tool].addEventListener('click', () => setActiveTool(tool));
  }
  setActiveTool('brush');

  // -----------------------------
  // Control Changes
  // -----------------------------
  colorPicker.addEventListener('change', () => {
    if (currentTool === 'brush') ctx.strokeStyle = colorPicker.value;
    updateContext();
  });
  brushSizeInput.addEventListener('change', updateContext);
  opacityInput.addEventListener('change', updateContext);
  shadowToggle.addEventListener('change', updateContext);
  gradientToggle.addEventListener('change', updateContext);

  // -----------------------------
  // Undo / Redo Functionality
  // -----------------------------
  function pushState() {
    try {
      undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch (e) {
      console.error("Error pushing state", e);
    }
    // Whenever a new action occurs, clear the redoStack.
    redoStack = [];
    autoSave();
  }
  function undo() {
    if (undoStack.length > 0) {
      redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      const state = undoStack.pop();
      ctx.putImageData(state, 0, 0);
      autoSave();
    }
  }
  function redo() {
    if (redoStack.length > 0) {
      undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      const state = redoStack.pop();
      ctx.putImageData(state, 0, 0);
      autoSave();
    }
  }

  // -----------------------------
  // Auto-save / Load from Local Storage
  // -----------------------------
  function autoSave() {
    localStorage.setItem("drawingJSImage", canvas.toDataURL('image/png'));
  }
  function loadSaved() {
    const dataURL = localStorage.getItem("drawingJSImage");
    if (dataURL) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Reset undo/redo stacks
        undoStack = [];
        redoStack = [];
        pushState();
      };
      img.src = dataURL;
    } else {
      pushState(); // push initial blank state
    }
  }

  // -----------------------------
  // Shape Drawing Functions
  // -----------------------------
  function drawRectangle(x1, y1, x2, y2) {
    updateContext();
    if (gradientToggle.checked) {
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, colorPicker.value);
      grad.addColorStop(1, "#ffffff");
      ctx.strokeStyle = grad;
    }
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
    if (gradientToggle.checked) ctx.strokeStyle = colorPicker.value;
  }
  function drawCircle(x1, y1, x2, y2) {
    updateContext();
    const radius = Math.hypot(x2 - x1, y2 - y1);
    if (gradientToggle.checked) {
      const grad = ctx.createRadialGradient(x1, y1, 0, x1, y1, radius);
      grad.addColorStop(0, colorPicker.value);
      grad.addColorStop(1, "#ffffff");
      ctx.strokeStyle = grad;
    }
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
    if (gradientToggle.checked) ctx.strokeStyle = colorPicker.value;
  }
  function drawLine(x1, y1, x2, y2) {
    updateContext();
    if (gradientToggle.checked) {
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, colorPicker.value);
      grad.addColorStop(1, "#ffffff");
      ctx.strokeStyle = grad;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (gradientToggle.checked) ctx.strokeStyle = colorPicker.value;
  }

  // -----------------------------
  // Saving File Functionality
  // -----------------------------
  function saveFile() {
    const format = saveFormat.value;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataURL = canvas.toDataURL(mimeType);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `drawing.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // -----------------------------
  // Utility: Get Mouse Position
  // -----------------------------
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // -----------------------------
  // Canvas Mouse Event Handlers
  // -----------------------------
  canvas.addEventListener('mousedown', (e) => {
    updateContext();
    const pos = getMousePos(e);
    // For freehand drawing (brush, eraser)
    if (currentTool === 'brush' || currentTool === 'eraser') {
      isDrawing = true;
      lastX = pos.x;
      lastY = pos.y;
    }
    // For shape tools, save starting point
    else if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
      isDrawing = true;
      startX = pos.x;
      startY = pos.y;
    }
    // For text, prompt and draw immediately
    else if (currentTool === 'text') {
      const text = prompt("Enter text:");
      if (text) {
        ctx.font = `${brushSizeInput.value * 2}px sans-serif`;
        ctx.fillStyle = colorPicker.value;
        ctx.globalAlpha = opacityInput.value;
        ctx.fillText(text, pos.x, pos.y);
        pushState();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    // Freehand drawing
    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    }
    // (Optional: implement live preview for shapes)
  });

  canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    if (currentTool === 'rectangle') {
      drawRectangle(startX, startY, pos.x, pos.y);
    } else if (currentTool === 'circle') {
      drawCircle(startX, startY, pos.x, pos.y);
    } else if (currentTool === 'line') {
      drawLine(startX, startY, pos.x, pos.y);
    }
    isDrawing = false;
    pushState();
  });

  canvas.addEventListener('mouseout', () => {
    if (isDrawing) {
      isDrawing = false;
      pushState();
    }
  });

  // -----------------------------
  // Button Event Listeners
  // -----------------------------
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushState();
  });
  resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
    localStorage.removeItem("drawingJSImage");
    pushState();
  });
  saveBtn.addEventListener('click', saveFile);

  // -----------------------------
  // Load Saved Drawing on Startup
  // -----------------------------
  loadSaved();
});
