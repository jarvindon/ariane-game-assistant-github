const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let nextProcess;
const keyFile = () => path.join(app.getPath("userData"), "openai-key.bin");

function readKey() {
  if (!safeStorage.isEncryptionAvailable()) return "";
  try {
    const fs = require("fs");
    if (!fs.existsSync(keyFile())) return "";
    return safeStorage.decryptString(fs.readFileSync(keyFile()));
  } catch {
    return "";
  }
}

function writeKey(value) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Le chiffrement Windows n’est pas disponible.");
  const fs = require("fs");
  fs.mkdirSync(path.dirname(keyFile()), { recursive: true });
  fs.writeFileSync(keyFile(), safeStorage.encryptString(value), { mode: 0o600 });
}

function startNext() {
  const serverPath = path.join(process.resourcesPath, "standalone", "server.js");
  nextProcess = spawn(process.execPath, [serverPath], {
    cwd: path.dirname(serverPath),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", PORT: "3210", HOSTNAME: "127.0.0.1" },
    windowsHide: true
  });
  nextProcess.on("error", (error) => console.error("Next server error:", error));
  nextProcess.stderr?.on("data", (data) => console.error(`Next: ${data}`));
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Le serveur Ariane n’a pas démarré.");
}

async function createWindow() {
  const isDevelopment = process.env.ELECTRON_DEV === "1";
  const url = isDevelopment ? "http://localhost:3000" : "http://127.0.0.1:3210";
  if (!isDevelopment) {
    startNext();
    await waitForServer(url);
  }
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#070b14",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false }
  });
  await mainWindow.loadURL(url);
}

ipcMain.handle("openai-key:get", () => readKey());
ipcMain.handle("openai-key:set", (_event, value) => {
  if (typeof value !== "string" || !value.trim().startsWith("sk-")) throw new Error("Clé OpenAI invalide.");
  writeKey(value.trim());
});
ipcMain.handle("openai-key:delete", () => {
  const fs = require("fs");
  if (fs.existsSync(keyFile())) fs.rmSync(keyFile());
});

app.whenReady().then(createWindow).catch((error) => {
  console.error("Ariane failed to start:", error);
  app.quit();
});
app.on("window-all-closed", () => { if (nextProcess) nextProcess.kill(); if (process.platform !== "darwin") app.quit(); });
