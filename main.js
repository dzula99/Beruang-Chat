const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        icon: path.join(__dirname, 'favicon.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false, // Disarankan false untuk keamanan saat memuat URL eksternal
            contextIsolation: true
        }
    });

    // Arahkan langsung ke URL Vercel milikmu
    win.loadURL('https://beruang-chat.vercel.app');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});