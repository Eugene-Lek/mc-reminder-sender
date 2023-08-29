const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
  sendReminders: (binaryExcel) => ipcRenderer.invoke('send-reminders', binaryExcel),
  getMessageTemplates: () => ipcRenderer.invoke('get-message-templates'),
  updateMessageTemplates: (messageTemplates) => ipcRenderer.invoke('update-message-templates', messageTemplates),
  getColumnHeaders: () => ipcRenderer.invoke('get-column-headers'),
  updateColumnHeaders: (columnHeaders) => ipcRenderer.invoke('update-column-headers', columnHeaders)
})