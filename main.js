const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#121212',
    webPreferences: {
      // Connect the secure bridge
      preload: path.join(__dirname, 'preload.js'),
      // Security best practices:
      contextIsolation: true,
      nodeIntegration: false 
    }
  })

  win.maximize()
  win.setMenuBarVisibility(false)
  win.loadFile('index.html')
}

// --- THIS IS WHERE NODE LISTENS FOR FRONTEND COMMANDS ---
ipcMain.handle('ytdlp:download', async (event, url) => {
    return new Promise((resolve, reject) => {
        // This invisibly runs: python bridge.py ytdlp_download "https://..."
        const pythonProcess = spawn('python', ['bridge.py', 'ytdlp_download', url]);
        
        let pythonOutput = '';

        // Capture whatever Python prints to the console
        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        // Capture any Python errors
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        // When Python finishes running, send the result back to the UI
        pythonProcess.on('close', (code) => {
            try {
                // We expect Python to print valid JSON
                const result = JSON.parse(pythonOutput);
                resolve(result);
            } catch (e) {
                resolve({ status: 'error', message: 'Failed to parse Python output', raw: pythonOutput });
            }
        });
    });
});

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})