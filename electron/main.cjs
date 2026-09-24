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
  const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
  nextProcess = spawn(process.platform === "win32" ? process.execPath : "node", [nextBin, "start", "-p", "3210"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    windowsHide: true
  });
  nextProcess.on("error", (error) => console.error("Next server error:", error));
}

async function createWindow() {
  startNext();
  await new Promise((resolve) => setTimeout(resolve, 1200));
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#070b14",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false }
  });
  await mainWindow.loadURL("http://localhost:3210");
}

ipcMain.handle("openai-key:get", () => readKey());
ipcMain.handle("openai-key:set", (_event, value) => {
  if (typeof value !== "string" || !value.startsWith("sk-")) throw new Error("Clé OpenAI invalide.");
  writeKey(value.trim());
});
ipcMain.handle("openai-key:delete", () => {
  const fs = require("fs");
  if (fs.existsSync(keyFile())) fs.rmSync(keyFile());
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (nextProcess) nextProcess.kill(); if (process.platform !== "darwin") app.quit(); });
