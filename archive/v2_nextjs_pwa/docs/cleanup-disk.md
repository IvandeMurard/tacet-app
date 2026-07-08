# Nettoyage d'espace disque (émulateur / APK)

Ce document décrit les étapes **manuelles** à effectuer dans Android Studio pour libérer de l'espace après l'installation de l'émulateur et des builds APK.

## Déjà fait automatiquement

- Nettoyage du projet Tacet : `node_modules`, `.expo`, `dist`, `web-build`, `android`, `ios` (puis `npm install`).
- Suppression du cache Gradle : `%USERPROFILE%\.gradle\caches`.
- Suppression des fichiers temporaires de l'émulateur : `%USERPROFILE%\AppData\Local\Temp\AndroidEmulator`.

## À faire manuellement dans Android Studio

### 1. SDK Manager – images système et plateformes

1. Ouvrir **Android Studio**.
2. **Tools** → **SDK Manager** (ou **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**).
3. Onglet **SDK Platforms** : décocher et désinstaller les versions d’API que vous n’utilisez pas (garder une seule, ex. API 34).
4. Onglet **SDK Tools** : cocher **Show Package Details**, puis désinstaller les anciennes versions de **Android SDK Build-Tools** et **Android SDK Platform-Tools** inutiles.
5. Onglet **SDK Platforms** → **Show Package Details** : sous chaque API level, désinstaller les **system images** que vous n’utilisez pas. Chaque image ≈ 1 Go. Garder une seule image (ex. pour API 34) suffit pour l’émulateur.

Ne pas supprimer de dossiers à la main dans le SDK ; utiliser uniquement le SDK Manager.

### 2. AVD Manager – émulateurs

1. **Tools** → **Device Manager** (ou **AVD Manager**).
2. Supprimer les AVD que vous n’utilisez plus (icône poubelle ou menu ⋮ → **Delete**). Chaque AVD occupe plusieurs Go dans `%USERPROFILE%\.android\avd`.

### 3. Optionnel – anciennes versions d’Android Studio

Dans `%LOCALAPPDATA%\Google`, vous pouvez supprimer les dossiers **.AndroidStudioX.Y** des anciennes versions (ex. `.AndroidStudio2022.2`). Vous perdez les réglages de cette version.

## Si vous devez refaire un nettoyage projet

Dans le dossier du projet Tacet :

```powershell
# Supprimer caches et dépendances
Remove-Item -Recurse -Force node_modules, .expo, dist, web-build -ErrorAction SilentlyContinue

# Réinstaller et lancer avec cache vide
npm install
npx expo start --clear
```

## Si le cache Gradle reprend trop de place

À lancer quand aucun build Android n’est en cours :

```powershell
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches
```

Le prochain build Android sera plus long (Gradle retéléchargera les dépendances).
