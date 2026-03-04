const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow () {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    backgroundColor: '#121212',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false 
    }
  });

  win.maximize();
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

// Universal Python Executor
ipcMain.handle('python:execute', async (event, command, args) => {
    return new Promise((resolve, reject) => {
        // Run: python bridge.py <command> <arg1> <arg2>
        const pythonProcess = spawn('python', ['bridge.py', command, ...args]);
        
        let pythonOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            try {
                // Return parsed JSON data directly to JS
                const result = JSON.parse(pythonOutput);
                resolve(result);
            } catch (e) {
                resolve({ status: 'error', message: 'Parse error', raw: pythonOutput });
            }
        });
    });
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});