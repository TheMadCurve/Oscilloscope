// WebSocket connection
let ws = null;
let isConnected = false;

// Settings object
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

// DOM elements
const elements = {
    wsHost: document.getElementById('ws-host'),
    wsPort: document.getElementById('ws-port'),
    connectBtn: document.getElementById('connect-btn'),
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.getElementById('status-text'),
    cameraSelect: document.getElementById('camera-select'),
    startCameraBtn: document.getElementById('start-camera-btn'),
    stopCameraBtn: document.getElementById('stop-camera-btn'),
    cameraStatus: document.getElementById('camera-status'),
    phosphorColor: document.getElementById('phosphor-color'),
    bgColor: document.getElementById('bg-color'),
    edgeIntensity: document.getElementById('edge-intensity'),
    edgeValue: document.getElementById('edge-value'),
    glowIntensity: document.getElementById('glow-intensity'),
    glowValue: document.getElementById('glow-value'),
    scanlineStrength: document.getElementById('scanline-strength'),
    scanlineValue: document.getElementById('scanline-value'),
    gridOpacity: document.getElementById('grid-opacity'),
    gridValue: document.getElementById('grid-value'),
    brightness: document.getElementById('brightness'),
    brightnessValue: document.getElementById('brightness-value'),
    showGrid: document.getElementById('show-grid'),
    showScanlines: document.getElementById('show-scanlines'),
    edgeDetection: document.getElementById('edge-detection'),
    phosphorGlow: document.getElementById('phosphor-glow')
};

// Initialize
init();

function init() {
    setupEventListeners();
    loadSettings();
    getCameras();
}

// Load saved settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('oscilloscope-settings');
    if (saved) {
        const savedSettings = JSON.parse(saved);
        Object.assign(settings, savedSettings);
        applySettingsToUI();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('oscilloscope-settings', JSON.stringify(settings));
}

// Apply settings to UI elements
function applySettingsToUI() {
    elements.phosphorColor.value = settings.phosphorColor;
    elements.bgColor.value = settings.backgroundColor;
    elements.edgeIntensity.value = settings.edgeIntensity;
    elements.edgeValue.textContent = settings.edgeIntensity.toFixed(1);
    elements.glowIntensity.value = settings.glowIntensity;
    elements.glowValue.textContent = settings.glowIntensity;
    elements.scanlineStrength.value = settings.scanlineStrength;
    elements.scanlineValue.textContent = settings.scanlineStrength.toFixed(2);
    elements.gridOpacity.value = settings.gridOpacity;
    elements.gridValue.textContent = settings.gridOpacity.toFixed(2);
    elements.brightness.value = settings.brightness;
    elements.brightnessValue.textContent = settings.brightness.toFixed(1);
    elements.showGrid.checked = settings.showGrid;
    elements.showScanlines.checked = settings.showScanlines;
    elements.edgeDetection.checked = settings.edgeDetection;
    elements.phosphorGlow.checked = settings.phosphorGlow;
}

// Setup all event listeners
function setupEventListeners() {
    // WebSocket connection
    elements.connectBtn.addEventListener('click', toggleConnection);
    
    // Camera controls
    elements.cameraSelect.addEventListener('change', (e) => {
        settings.cameraDeviceId = e.target.value;
        saveSettings();
    });
    
    elements.startCameraBtn.addEventListener('click', startCamera);
    elements.stopCameraBtn.addEventListener('click', stopCamera);
    
    // Color controls
    elements.phosphorColor.addEventListener('input', (e) => {
        settings.phosphorColor = e.target.value;
        saveSettings();
        broadcastSettings();
    });
    
    elements.bgColor.addEventListener('input', (e) => {
        settings.backgroundColor = e.target.value;
        saveSettings();
        broadcastSettings();
    });
    
    // Range controls
    elements.edgeIntensity.addEventListener('input', (e) => {
        settings.edgeIntensity = parseFloat(e.target.value);
        elements.edgeValue.textContent = settings.edgeIntensity.toFixed(1);
        saveSettings();
        broadcastSettings();
    });
    
    elements.glowIntensity.addEventListener('input', (e) => {
        settings.glowIntensity = parseInt(e.target.value);
        elements.glowValue.textContent = settings.glowIntensity;
        saveSettings();
        broadcastSettings();
    });
    
    elements.scanlineStrength.addEventListener('input', (e) => {
        settings.scanlineStrength = parseFloat(e.target.value);
        elements.scanlineValue.textContent = settings.scanlineStrength.toFixed(2);
        saveSettings();
        broadcastSettings();
    });
    
    elements.gridOpacity.addEventListener('input', (e) => {
        settings.gridOpacity = parseFloat(e.target.value);
        elements.gridValue.textContent = settings.gridOpacity.toFixed(2);
        saveSettings();
        broadcastSettings();
    });
    
    elements.brightness.addEventListener('input', (e) => {
        settings.brightness = parseFloat(e.target.value);
        elements.brightnessValue.textContent = settings.brightness.toFixed(1);
        saveSettings();
        broadcastSettings();
    });
    
    // Checkbox controls
    elements.showGrid.addEventListener('change', (e) => {
        settings.showGrid = e.target.checked;
        saveSettings();
        broadcastSettings();
    });
    
    elements.showScanlines.addEventListener('change', (e) => {
        settings.showScanlines = e.target.checked;
        saveSettings();
        broadcastSettings();
    });
    
    elements.edgeDetection.addEventListener('change', (e) => {
        settings.edgeDetection = e.target.checked;
        saveSettings();
        broadcastSettings();
    });
    
    elements.phosphorGlow.addEventListener('change', (e) => {
        settings.phosphorGlow = e.target.checked;
        saveSettings();
        broadcastSettings();
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });
}

// Get available cameras
async function getCameras() {
    try {
        // Request permissions first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        elements.cameraSelect.innerHTML = '';
        
        if (videoDevices.length === 0) {
            elements.cameraSelect.innerHTML = '<option value="">No cameras found</option>';
            elements.cameraStatus.textContent = 'No cameras detected';
            return;
        }
        
        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${index + 1}`;
            if (settings.cameraDeviceId === device.deviceId) {
                option.selected = true;
            }
            elements.cameraSelect.appendChild(option);
        });
        
        if (!settings.cameraDeviceId && videoDevices.length > 0) {
            settings.cameraDeviceId = videoDevices[0].deviceId;
            saveSettings();
        }
        
        elements.cameraStatus.textContent = `${videoDevices.length} camera(s) available`;
        
    } catch (err) {
        console.error('Error enumerating cameras:', err);
        elements.cameraSelect.innerHTML = '<option value="">Error loading cameras</option>';
        elements.cameraStatus.textContent = 'Error: ' + err.message;
        elements.cameraStatus.className = 'status-message error';
    }
}

// WebSocket connection functions
function toggleConnection() {
    if (isConnected) {
        disconnect();
    } else {
        connect();
    }
}

function connect() {
    const host = elements.wsHost.value;
    const port = elements.wsPort.value;
    
    try {
        ws = new WebSocket(`ws://${host}:${port}/`);
        
        ws.onopen = () => {
            isConnected = true;
            updateConnectionStatus(true);
            elements.connectBtn.textContent = 'Disconnect';
            console.log('WebSocket connected');
            
            // Send initial settings
            broadcastSettings();
        };
        
        ws.onclose = () => {
            isConnected = false;
            updateConnectionStatus(false);
            elements.connectBtn.textContent = 'Connect';
            console.log('WebSocket disconnected');
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateConnectionStatus(false);
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
        console.error('Connection error:', err);
        updateConnectionStatus(false);
    }
}

function disconnect() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

function updateConnectionStatus(connected) {
    if (connected) {
        elements.statusIndicator.className = 'status-dot connected';
        elements.statusText.textContent = 'Connected';
    } else {
        elements.statusIndicator.className = 'status-dot disconnected';
        elements.statusText.textContent = 'Disconnected';
    }
}

// Broadcast settings to widget via WebSocket
function broadcastSettings() {
    if (!isConnected || !ws) return;
    
    const message = {
        event: 'OscilloscopeSettings',
        data: settings
    };
    
    ws.send(JSON.stringify(message));
}

// Handle incoming WebSocket messages
function handleMessage(data) {
    console.log('Received message:', data);
    // Handle any messages from Streamer.bot or widget if needed
}

// Camera control functions
function startCamera() {
    if (!settings.cameraDeviceId) {
        elements.cameraStatus.textContent = 'Please select a camera first';
        elements.cameraStatus.className = 'status-message error';
        return;
    }
    
    settings.cameraActive = true;
    saveSettings();
    broadcastSettings();
    
    elements.startCameraBtn.disabled = true;
    elements.stopCameraBtn.disabled = false;
    elements.cameraSelect.disabled = true;
    elements.cameraStatus.textContent = 'Camera started - check widget';
    elements.cameraStatus.className = 'status-message success';
}

function stopCamera() {
    settings.cameraActive = false;
    saveSettings();
    broadcastSettings();
    
    elements.startCameraBtn.disabled = false;
    elements.stopCameraBtn.disabled = true;
    elements.cameraSelect.disabled = false;
    elements.cameraStatus.textContent = 'Camera stopped';
    elements.cameraStatus.className = 'status-message';
}

// Apply presets
function applyPreset(preset) {
    switch(preset) {
        case 'classic':
            settings.phosphorColor = '#00ff00';
            settings.backgroundColor = '#001100';
            settings.edgeIntensity = 3.0;
            settings.glowIntensity = 20;
            settings.scanlineStrength = 0.3;
            settings.gridOpacity = 0.3;
            break;
        case 'amber':
            settings.phosphorColor = '#ffaa00';
            settings.backgroundColor = '#110800';
            settings.edgeIntensity = 2.5;
            settings.glowIntensity = 25;
            settings.scanlineStrength = 0.4;
            settings.gridOpacity = 0.2;
            break;
        case 'blue':
            settings.phosphorColor = '#00aaff';
            settings.backgroundColor = '#000811';
            settings.edgeIntensity = 3.5;
            settings.glowIntensity = 18;
            settings.scanlineStrength = 0.25;
            settings.gridOpacity = 0.25;
            break;
        case 'vector':
            settings.phosphorColor = '#00ffcc';
            settings.backgroundColor = '#000000';
            settings.edgeIntensity = 5.0;
            settings.glowIntensity = 30;
            settings.scanlineStrength = 0.1;
            settings.gridOpacity = 0.4;
            break;
    }
    
    applySettingsToUI();
    saveSettings();
    broadcastSettings();
}