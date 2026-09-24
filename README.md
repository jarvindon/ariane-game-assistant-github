# Ariane Game Assistant

Ariane est un copilote tactique pour joueurs. Elle capture une fenêtre de jeu, analyse une image avec OpenAI Vision et affiche des conseils rapides dans une interface Windows ou navigateur.

## Utiliser Ariane

### Version Windows

1. Installez **Ariane Game Assistant**.
2. Ouvrez **Configuration**.
3. Créez une clé sur <https://platform.openai.com/api-keys>.
4. Collez votre clé `sk-...`, puis cliquez sur **Enregistrer**.
5. Cliquez sur **Démarrer la capture**.
6. Sélectionnez la fenêtre ou l’écran du jeu.
7. Cliquez sur **Analyser la frame** ou utilisez le microphone.

La clé est chiffrée avec Windows et conservée uniquement sur l’ordinateur de l’utilisateur. Chaque utilisateur utilise son propre compte OpenAI et paie ses propres appels.

Pour désinstaller Ariane : **Paramètres Windows → Applications → Applications installées → Ariane Game Assistant → Désinstaller**. Les données locales Ariane, y compris la clé chiffrée, sont supprimées par l’assistant de désinstallation.

### Version navigateur

Prérequis : Node.js LTS 20 ou plus récent.

Dans l’invite de commandes Windows (**CMD**) :

```bat
cd C:\ariane-game-assistant-github
npm.cmd install
copy .env.example .env.local
notepad .env.local
```

Ajoutez votre clé dans `.env.local` :

```env
OPENAI_API_KEY=sk-votre-cle
```

Puis démarrez Ariane :

```bat
npm.cmd run dev
```

Ouvrez <http://localhost:3000>. Sans clé API, Ariane utilise une réponse de démonstration.

## Développer le projet

Pour lancer l’application Windows en mode développement :

```bat
cd C:\ariane-game-assistant-github
npm.cmd install
npm.cmd run electron:dev
```

Pour créer l’installateur Windows :

```bat
npm.cmd run dist
```

L’installateur est créé dans `dist\Ariane Game Assistant Setup 0.1.0.exe`.

## Sécurité

- Ne partagez jamais une clé OpenAI, un mot de passe ou le contenu de `.env.local`.
- `.env.local`, les dépendances, les builds et les fichiers `.exe` sont exclus de Git.
- L’application Electron utilise `contextIsolation` et désactive `nodeIntegration`.
- Les images sont limitées aux formats JPEG, PNG et WebP et à environ 5 Mo.
- N’envoyez pas de capture contenant des informations personnelles ou sensibles.
- L’EXE n’est pas signé actuellement : Windows peut afficher un avertissement SmartScreen.

## Structure

- `app/` : pages Next.js et route d’analyse OpenAI.
- `components/` : interface Ariane, capture d’écran et assistant vocal.
- `electron/` : application Windows et stockage chiffré de la clé.
- `.github/workflows/` : automatisation de construction Windows.

## Licence et propriété

Ariane est distribuée sous licence **MIT**. Cette licence autorise l’utilisation, la copie, la modification et la redistribution du projet, y compris pour créer des améliorations. Elle ne transfère pas la propriété du projet : le copyright reste attribué à **jarvindon**. Toute redistribution doit conserver l’avis de copyright et le texte de la licence.

Les services et marques OpenAI restent la propriété de leurs détenteurs respectifs. Les coûts liés à l’API OpenAI sont à la charge de chaque utilisateur.
