const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // A single, powerful gateway to execute any Python command in bridge.py
    runPython: (command, args = []) => ipcRenderer.invoke('python:execute', command, args)
});