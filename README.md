# Oscilloscope Camera Effect for OBS + Streamer.bot

A customizable oscilloscope/CRT monitor effect for your camera that can be controlled via a Streamer.bot dock in OBS.

## Features

- 🎥 Real-time camera processing with oscilloscope/vector monitor effect
- 🎛️ Live controls via OBS Custom Browser Dock
- 🔧 Adjustable edge detection, glow, scanlines, and grid
- 🎨 Customizable phosphor colors
- 💾 Settings saved and synced via Streamer.bot
- 📡 WebSocket communication between dock and widget

## Installation

### Prerequisites

- OBS Studio
- [Streamer.bot](https://streamer.bot/) installed and running

### Step 1: Download the Files

1. Download this repository or clone it
2. Extract the files to a location you can remember (e.g., `C:\StreamTools\oscilloscope-effect\`)

### Step 2: Set Up Streamer.bot

1. Open Streamer.bot
2. Go to **Servers/Clients** → **WebSocket Server**
3. Make sure the WebSocket Server is **enabled** and note the port (default is usually `8080`)
4. Click **Auto Start** so it starts automatically

### Step 3: Add the Control Dock to OBS

1. In OBS, go to **Docks** → **Custom Browser Docks**
2. Add a new dock with these settings:
   - **Dock Name:** `Oscilloscope Controls`
   - **URL:** `file:///C:/StreamTools/oscilloscope-effect/dock/index.html` (adjust path to where you saved the files)
3. Click **Apply**
4. The control panel should now appear in OBS

### Step 4: Add the Widget as a Browser Source

1. In OBS, add a new **Browser Source**
2. Configure it:
   - **Name:** `Oscilloscope Camera Effect`
   - Check **Local file**
   - Browse to: `oscilloscope-effect/widget/index.html`
   - **Width:** 1920
   - **Height:** 1080
   - Check **Shutdown source when not visible** (optional)
   - Check **Refresh browser when scene becomes active** (optional)
3. Click **OK**

### Step 5: Configure WebSocket Connection

1. In the OBS Dock, enter your Streamer.bot WebSocket details:
   - **Host:** `127.0.0.1` (or `localhost`)
   - **Port:** `8080` (or whatever port your WebSocket server is using)
2. Click **Connect**
3. You should see "Connected" status

### Step 6: Select Your Camera and Start

1. In the dock, select your camera from the dropdown
2. Click **START CAMERA**
3. Adjust the effect settings to your liking
4. All changes will sync in real-time to the browser source

## Usage

### Control Panel (Dock)

The control panel in OBS lets you adjust:

- **Camera Selection** - Choose which camera device to use
- **Phosphor Color** - Change the glow color (green, amber, blue, etc.)
- **Background Color** - Adjust the screen background
- **Edge Detection** - Control outline intensity
- **Glow Intensity** - Adjust the phosphor bloom effect
- **Scanline Strength** - CRT scanline visibility
- **Grid Opacity** - Measurement grid visibility
- **Brightness** - Overall brightness adjustment

### Widget (Browser Source)

The widget displays your camera with the oscilloscope effect applied. It receives all settings from the dock via WebSocket and updates in real-time.

## Troubleshooting

### Widget not showing camera
- Make sure you clicked "START CAMERA" in the dock
- Check that you've allowed camera permissions in your browser
- Try refreshing the browser source in OBS

### Dock not connecting to Streamer.bot
- Verify Streamer.bot WebSocket Server is running
- Check the port number matches
- Make sure no firewall is blocking the connection
- Try `127.0.0.1` instead of `localhost` or vice versa

### Settings not syncing
- Ensure both dock and widget are connected to the WebSocket
- Check Streamer.bot logs for any errors
- Try disconnecting and reconnecting in the dock

## Customization

You can edit the files to customize:
- Default colors and settings in `dock/script.js` and `widget/script.js`
- Visual appearance in `dock/style.css` and `widget/style.css`
- Additional effects in `widget/script.js`

## Credits

Inspired by:
- [Multistream Title Updater](https://github.com/nuttylmao/multistream-title-updater) by nuttylmao
- [Spotify Widget](https://github.com/nuttylmao/spotify-widget) by nuttylmao

## License

MIT License - feel free to modify and use as you like!