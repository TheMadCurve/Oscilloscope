// WebSocket connection
let ws = null;
let isConnected = false;

// Canvas and video elements
const canvas = document.getElementById('effectCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const video = document.getElementById('sourceVideo');
const loading = document.getElementById('loading');

// Settings (will be updated from dock)
let settings = {
    cameraDeviceId: null,
    cameraActive: false,
    phosphorColor: '#00ff00',
    backgroundColor: '#001100',
    edgeIntensity: 3.0,
    glowIntensity: 20,
    scanlineStrength: 0.3,
    gridOpacity: 0.3,
    brightness: 1.2,
    showGrid: true,
    showScanlines: true,
    edgeDetection: true,
    phosphorGlow: true
};

let cameraActive = false;
let animationId = null;

// Initialize
init();

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    connectWebSocket();
    startRenderLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// WebSocket connection
function connectWebSocket() {
    // Try to connect to Streamer.bot WebSocket
    // Default port is 8080, adjust if needed
    const host = '127.0.0.1';
    const port = '8080';
    
    try {
        ws = new WebSocket(`ws://${host}:${port}/`);
        
        ws.onopen = () => {
            isConnected = true;
            console.log('Widget WebSocket connected');
        };
        
        ws.onclose = () => {
            isConnected = false;
            console.log('Widget WebSocket disconnected');
            // Try to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
            console.error('Widget WebSocket error:', error);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (err) {
                console.error('Error parsing message:', err);
            }
        };
        
    } catch (err) {
        console.error('WebSocket connection error:', err);
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
    }
}

// Handle incoming WebSocket messages
function handleMessage(data) {
    if (data.event === 'OscilloscopeSettings') {
        // Update settings from dock
        const newSettings = data.data;
        
        // Check if camera state changed
        if (newSettings.cameraActive !== settings.cameraActive) {
            if (newSettings.cameraActive) {
                startCamera(newSettings.cameraDeviceId);
            } else {
                stopCamera();
            }
        }
        
        // Update all settings
        Object.assign(settings, newSettings);
        console.log('Settings updated:', settings);
    }
}

// Camera control
async function startCamera(deviceId) {
    if (!deviceId) {
        console.error('No camera device ID provided');
        return;
    }
    
    try {
        const constraints = {
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        video.onloadeddata = () => {
            cameraActive = true;
            loading.classList.add('hidden');
            console.log('Camera started');
        };
        
    } catch (err) {
        console.error('Camera error:', err);
        loading.querySelector('p').textContent = 'Camera error: ' + err.message;
    }
}

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    cameraActive = false;
    loading.classList.remove('hidden');
    loading.querySelector('p').textContent = 'Camera stopped';
    console.log('Camera stopped');
}

// Hex to RGB converter
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 0 };
}

// Sobel edge detection
function detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const edges = new Uint8ClampedArray(data.length);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);
                    
                    gx += gray * sobelX[kernelIdx];
                    gy += gray * sobelY[kernelIdx];
                }
            }
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const idx = (y * width + x) * 4;
            edges[idx] = edges[idx + 1] = edges[idx + 2] = magnitude;
            edges[idx + 3] = 255;
        }
    }
    
    return new ImageData(edges, width, height);
}

// Draw grid overlay
function drawGrid() {
    const phosphorRgb = hexToRgb(settings.phosphorColor);
    ctx.strokeStyle = `rgba(${phosphorRgb.r}, ${phosphorRgb.g}, ${phosphorRgb.b}, ${settings.gridOpacity})`;
    ctx.lineWidth = 1;
    
    const divisions = 20;
    const stepX = canvas.width / divisions;
    const stepY = canvas.height / divisions;
    
    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
        ctx.beginPath();
        ctx.moveTo(i * stepX, 0);
        ctx.lineTo(i * stepX, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * stepY);
        ctx.lineTo(canvas.width, i * stepY);
        ctx.stroke();
    }
    
    // Center crosshair (brighter)
    ctx.strokeStyle = `rgba(${phosphorRgb.r}, ${phosphorRgb.g}, ${phosphorRgb.b}, ${settings.gridOpacity * 2})`;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

// Main render function
function render() {
    // Fill background
    const bgRgb = hexToRgb(settings.backgroundColor);
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!cameraActive || video.paused || video.ended) {
        // Show grid even when camera is off
        if (settings.showGrid) {
            drawGrid();
        }
        animationId = requestAnimationFrame(render);
        return;
    }
    
    // Draw video to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Edge detection if enabled
    let edgeData = null;
    if (settings.edgeDetection) {
        edgeData = detectEdges(imageData);
    }
    
    const phosphorRgb = hexToRgb(settings.phosphorColor);
    
    // Process pixels
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to grayscale
        const gray = (r + g + b) / 3;
        
        // Get edge value if enabled
        let edge = 0;
        if (settings.edgeDetection && edgeData) {
            edge = edgeData.data[i] * settings.edgeIntensity;
        }
        
        // Combine gray and edge
        const intensity = (gray + edge) * settings.brightness;
        
        // Apply phosphor color
        data[i] = (phosphorRgb.r / 255) * intensity;
        data[i + 1] = (phosphorRgb.g / 255) * intensity;
        data[i + 2] = (phosphorRgb.b / 255) * intensity;
    }
    
    // Apply scanlines
    if (settings.showScanlines) {
        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                data[i] *= (1 - settings.scanlineStrength);
                data[i + 1] *= (1 - settings.scanlineStrength);
                data[i + 2] *= (1 - settings.scanlineStrength);
            }
        }
    }
    
    // Put processed image back
    ctx.putImageData(imageData, 0, 0);
    
    // Add glow effect
    if (settings.phosphorGlow) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = `blur(${settings.glowIntensity}px)`;
        ctx.globalAlpha = 0.3;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // Draw grid overlay
    if (settings.showGrid) {
        drawGrid();
    }
    
    animationId = requestAnimationFrame(render);
}

// Start render loop
function startRenderLoop() {
    render();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    stopCamera();
    if (ws) {
        ws.close();
    }
});