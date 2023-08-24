import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { sendReminders } from './src/send-reminders';
import { getMessageTemplates, updateMessageTemplates } from './src/message-templates';
import { getColumnHeaders, updateColumnHeaders } from './src//column-headers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  ipcMain.handle('send-reminders', sendReminders)
  ipcMain.handle('get-message-templates', getMessageTemplates)
  ipcMain.handle('update-message-templates', updateMessageTemplates)
  ipcMain.handle('get-column-headers', getColumnHeaders)
  ipcMain.handle('update-column-headers', updateColumnHeaders)

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: 'C:/Users/perio/Documents/Coding/Nextron/MC Reminder Sender/main/src/preload.js'
    }
  });

  if (isProd) {
    await mainWindow.loadURL('app://./index.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
