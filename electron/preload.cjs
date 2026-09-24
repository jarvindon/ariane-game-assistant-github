const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getApiKey: () => ipcRenderer.invoke("openai-key:get"),
  saveApiKey: (key) => ipcRenderer.invoke("openai-key:set", key),
  deleteApiKey: () => ipcRenderer.invoke("openai-key:delete")
});
