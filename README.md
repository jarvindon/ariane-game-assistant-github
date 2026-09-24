# Ariane Game Assistant

Ariane est un copilote tactique pour joueurs : elle capture une fenêtre de jeu, analyse une image avec OpenAI Vision et affiche des conseils rapides. L’application existe en version navigateur et en application Windows Electron.

## Prérequis

- Windows 10/11 pour l’EXE ;
- Node.js LTS 20 ou plus récent pour développer et construire le projet ;
- une clé API OpenAI avec un moyen de paiement configuré pour l’analyse réelle.

## Tester dans le navigateur

Dans l'invite de commandes Windows (**CMD**, pas PowerShell), utilisez :

```bat
cd C:\vs-code
npm.cmd install
copy .env.example .env.local
notepad .env.local
npm.cmd run dev
```

Dans `.env.local`, ajoutez votre clé :

```env
OPENAI_API_KEY=sk-votre-cle
```

Ouvrez ensuite <http://localhost:3000>. Sans clé, Ariane utilise une réponse de démonstration.

## Tester l’application Windows en développement

Dans CMD :

```bat
cd C:\ariane-game-assistant-github
npm.cmd install
npm.cmd run electron:dev
```

Une fenêtre Ariane s’ouvre automatiquement. Autorisez le partage de la fenêtre ou de l’écran du jeu, puis cliquez sur **Analyser la frame**.

## Construire l’EXE

```bat
npm.cmd run dist
```

L’installateur est créé dans `dist\Ariane Game Assistant Setup 0.1.0.exe`. Le premier lancement peut prendre un peu de temps, car Electron démarre le serveur local Next.js.

## Configuration de chaque utilisateur

1. Installer l’EXE.
2. Créer une clé sur <https://platform.openai.com/api-keys>.
3. Ouvrir **Configuration** dans Ariane.
4. Coller la clé `sk-...`, puis cliquer sur **Enregistrer**.
5. Cliquer sur **Démarrer la capture**.
6. Choisir la fenêtre du jeu dans la fenêtre Windows.
7. Cliquer sur **Analyser la frame** ou utiliser le microphone.

Dans l’EXE, la clé est chiffrée avec `safeStorage` et conservée localement dans le profil Windows de l’utilisateur. Elle n’est pas incluse dans l’EXE et n’est jamais commitée dans GitHub. Chaque utilisateur paie les appels effectués avec son propre compte OpenAI. Le bouton **Supprimer** efface la clé locale.

## Désinstaller Ariane complètement

Ouvrez **Paramètres Windows → Applications → Applications installées**, recherchez **Ariane Game Assistant**, puis cliquez sur **Désinstaller**. L’assistant de désinstallation supprime l’application, ses fichiers installés et les données locales Ariane, y compris la clé API chiffrée enregistrée sur cet ordinateur. Il ne supprime pas votre compte OpenAI ni votre dépôt GitHub.

## Sécurité et bonnes pratiques

- Ne publiez jamais `.env.local`, une clé `sk-...` ou un fichier de configuration utilisateur.
- Le fichier `.gitignore` exclut les secrets, dépendances, builds et logs.
- La clé serveur reste dans les variables d’environnement en mode web.
- L’interface Electron utilise `contextIsolation` et désactive `nodeIntegration`.
- Les images sont limitées aux formats JPEG, PNG et WebP et à environ 5 Mo.
- N’envoyez pas de captures contenant des informations personnelles ou des données sensibles.
- Pour une distribution publique, signez l’EXE avec un certificat de code-signing Windows afin d’éviter les avertissements SmartScreen.

## Publier sur GitHub

Le workflow [build-windows.yml](./.github/workflows/build-windows.yml) construit l’EXE sur GitHub Actions lors d’un lancement manuel ou d’un tag `v*`.

```powershell
git add .
git commit -m "Rename project to Ariane"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

Récupérez ensuite l’EXE dans les artefacts du workflow GitHub Actions. Ne mettez jamais `OPENAI_API_KEY` dans les fichiers du dépôt. Pour un déploiement web, ajoutez-la uniquement dans les variables d’environnement du fournisseur d’hébergement.

## Structure

- `app/page.tsx` : point d’entrée du dashboard.
- `components/GameAssistant.tsx` : interface Ariane, historique et configuration.
- `components/ScreenCapture.tsx` : partage d’écran et capture de frames.
- `components/VoiceAssistant.tsx` : reconnaissance et synthèse vocale du navigateur.
- `app/api/analyze/route.ts` : analyse OpenAI Vision et validation d’image.
- `electron/main.cjs` : fenêtre Windows et stockage chiffré de la clé.
- `electron/preload.cjs` : API sécurisée exposée à l’interface.
