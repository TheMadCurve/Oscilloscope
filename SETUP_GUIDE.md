# Setup Guide - Oscilloscope Camera Effect

This guide will walk you through setting up the Oscilloscope Camera Effect for OBS with Streamer.bot.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:

- **OBS Studio** (v28.0 or later recommended)
- **Streamer.bot** ([Download here](https://streamer.bot/))
- A webcam or camera device
- Windows 10/11 (recommended) or macOS

## Installation

### Step 1: Download the Project

1. Download this repository as a ZIP file or clone it:
   ```
   git clone https://github.com/yourusername/oscilloscope-camera-effect.git
   ```

2. Extract the files to a permanent location, for example:
   - Windows: `C:\StreamTools\oscilloscope-effect\`
   - Mac: `~/StreamTools/oscilloscope-effect/`

### Step 2: Configure Streamer.bot

1. **Launch Streamer.bot**

2. **Enable the WebSocket Server:**
   - Go to `Servers/Clients` tab
   - Find `WebSocket Server` section
   - Click the toggle to **Enable** it
   - Note the port number (default is `8080`)
   - Check the `Auto Start` option

3. **Start the WebSocket Server:**
   - Click the `Start Server` button
   - You should see "Server Started" or similar confirmation

### Step 3: Add the Control Dock to OBS

1. **Open OBS Studio**

2. **Add Custom Browser Dock:**
   - Go to `Docks` → `Custom Browser Docks...`
   - Click the `+` button to add a new dock

3. **Configure the Dock:**
   - **Dock Name:** `Oscilloscope Controls`
   - **URL:** Enter the file path to your dock HTML:
     - Windows example: `file:///C:/StreamTools/oscilloscope-effect/dock/index.html`
     - Mac example: `file:///Users/YourName/StreamTools/oscilloscope-effect/dock/index.html`
   
   **Important:** Use forward slashes `/` even on Windows, and start with `file:///`

4. **Click Apply**

5. The control panel should now appear as a dock in OBS. You can drag it to position it wherever you like.

### Step 4: Add the Widget as a Browser Source

1. **Create a new Scene** (or use an existing one)

2. **Add a Browser Source:**
   - Click the `+` button in the Sources panel
   - Select `Browser`
   - Name it `Oscilloscope Camera Effect`

3. **Configure the Browser Source:**
   - Check `Local file`
   - Click `Browse` and navigate to `oscilloscope-effect/widget/index.html`
   - **Width:** `1920`
   - **Height:** `1080`
   - **FPS:** `60` (for smooth rendering)
   - Optional: Check `Shutdown source when not visible`
   - Optional: Check `Refresh browser when scene becomes active`

4. **Click OK**

## Configuration

### Connect to Streamer.bot

1. **In the OBS Dock (Oscilloscope Controls):**
   - The WebSocket connection section should show default values:
     - Host: `127.0.0.1`
     - Port: `8080`
   
2. **If your Streamer.bot uses a different port:**
   - Update the Port field with the correct port number
   
3. **Click the `Connect` button**

4. **You should see:**
   - The status indicator turn green
   - Status text change to "Connected"

### Select Your Camera

1. **In the Camera Settings section:**
   - Click the `Camera Device` dropdown
   - Select your webcam/camera from the list
   
2. **Click `START CAMERA`**

3. **The widget should now show your camera with the oscilloscope effect applied!**

## Usage

### Adjusting the Effect

Use the controls in the dock to customize the look:

#### Colors
- **Phosphor Color:** The main color of the effect (default: green)
- **Background:** The background screen color

#### Effect Intensity
- **Edge Detection (0-10):** How prominently edges are highlighted
  - Lower = subtle outlines
  - Higher = strong vector display look
  
- **Glow Intensity (0-50):** The phosphor bloom/glow effect
  - 0 = no glow
  - 20 = classic phosphor glow
  - 40+ = intense bloom
  
- **Scanline Strength (0-1):** Horizontal CRT scanlines
  - 0 = no scanlines
  - 0.3 = subtle (default)
  - 1 = very prominent
  
- **Grid Opacity (0-1):** Visibility of the measurement grid
  - 0 = hidden
  - 0.3 = subtle (default)
  - 1 = very visible
  
- **Brightness (0.5-3):** Overall image brightness
  - 1.0 = normal
  - 1.2 = slightly brighter (default)
  - 2.0+ = very bright

#### Toggle Features
- **Show Grid:** Display the oscilloscope measurement grid
- **Show Scanlines:** Enable CRT scanlines
- **Edge Detection:** Enable edge highlighting
- **Phosphor Glow:** Enable the glow/bloom effect

### Using Presets

Click any preset button for instant looks:

- **Classic Green:** Traditional oscilloscope (green phosphor)
- **Amber CRT:** Vintage computer monitor look
- **Blue Monitor:** Cool blue vector display
- **Vector Display:** High-contrast wireframe style

### Settings Persistence

- All your settings are automatically saved
- When you restart OBS, your last settings will be restored
- Settings sync in real-time between the dock and widget

## Troubleshooting

### Widget shows "Waiting for camera..."

**Solution:**
1. Make sure you clicked "START CAMERA" in the dock
2. Check that the dock is connected to Streamer.bot (green status indicator)
3. Verify your camera is not in use by another application
4. Try selecting a different camera from the dropdown

### Dock won't connect to Streamer.bot

**Solutions:**
1. Verify Streamer.bot WebSocket Server is running (check Servers/Clients tab)
2. Confirm the port number matches (default is 8080)
3. Try `localhost` instead of `127.0.0.1` or vice versa
4. Check your firewall isn't blocking the connection
5. Restart Streamer.bot and try again

### Camera permissions denied

**Solutions:**
1. Grant browser/OBS camera permissions in your system settings
2. Windows: Settings → Privacy → Camera
3. Mac: System Preferences → Security & Privacy → Camera
4. Refresh the browser source in OBS

### Settings not syncing between dock and widget

**Solutions:**
1. Check both dock and widget are connected to WebSocket
2. Look at the connection status in the dock (should be green)
3. Try disconnecting and reconnecting in the dock
4. Refresh both the dock and the browser source

### Performance issues / low FPS

**Solutions:**
1. Lower the browser source resolution (try 1280x720)
2. Reduce the Glow Intensity setting
3. Disable Edge Detection if not needed
4. Close other resource-intensive applications
5. Update your graphics drivers

### The effect looks washed out or too dark

**Solutions:**
1. Adjust the **Brightness** slider
2. Try different **Phosphor Color** options
3. Increase **Edge Detection** for more definition
4. Adjust your camera's exposure settings

## Advanced Tips

### Creating Your Own Presets

You can edit the preset values in `dock/script.js` in the `applyPreset()` function to create custom presets.

### Changing Default Settings

Edit the initial `settings` object in both:
- `dock/script.js`
- `widget/script.js`

### Using Multiple Cameras

If you have multiple cameras, you can create multiple instances:
1. Duplicate the browser source
2. Use the dock to switch cameras
3. Each instance will remember its camera selection

## Need More Help?

If you're still having issues:
1. Check the browser console for errors (F12 in OBS browser source)
2. Check Streamer.bot logs
3. Create an issue on GitHub with details about your problem

---

**Enjoy your oscilloscope camera effect! 🔬**