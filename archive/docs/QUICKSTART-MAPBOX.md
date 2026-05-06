# 🚀 Démarrage Rapide Mapbox

## Étapes pour faire fonctionner Mapbox

### 1️⃣ Obtenez vos tokens Mapbox

Allez sur **https://account.mapbox.com/**

#### Token Public (pk.)
- Déjà disponible dans votre compte
- Copiez votre "Default public token"

#### Token Secret (sk.)
- Cliquez sur **"Create a token"**
- Nom : "Tacet Download Token"
- **Cochez DOWNLOADS:READ** ✅
- Créez et copiez le token

### 2️⃣ Configurez votre fichier .env

Dans votre terminal (Terminal 3 - Commandes) :

```powershell
# Décommentez les lignes dans .env et ajoutez vos vrais tokens
notepad .env
```

Modifiez ces lignes :
```bash
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.VOTRE_TOKEN_PUBLIC_ICI
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk.VOTRE_TOKEN_SECRET_ICI
```

### 3️⃣ Rebuild l'application native

**⚠️ IMPORTANT** : Vous devez reconstruire l'app native car Mapbox nécessite du code natif.

#### Option A : Build EAS (Recommandé)
Dans Terminal 3 :
```powershell
eas build --profile development --platform android --local
```

#### Option B : Prebuild + dev-client
Dans Terminal 3 :
```powershell
npx expo prebuild --clean
```

Puis dans Terminal 2, relancez :
```powershell
npx expo start --dev-client
```

### 4️⃣ Testez la carte

1. Dans Terminal 1 : L'émulateur doit tourner
2. Dans Terminal 2 : Le serveur dev doit tourner
3. Appuyez sur **"a"** dans Terminal 2 pour ouvrir sur Android
4. Allez sur l'onglet **"Tab Two"** → Vous devriez voir une carte de Paris ! 🗺️

## 📁 Fichiers créés pour vous

- `config/mapbox.ts` - Configuration Mapbox
- `components/MapView.tsx` - Composant de carte réutilisable
- `app/(tabs)/two.tsx` - Exemple de carte (modifié)
- `docs/mapbox-setup.md` - Documentation complète

## ✅ Checklist

- [ ] J'ai obtenu mon token public (pk.)
- [ ] J'ai créé mon token secret (sk.) avec DOWNLOADS:READ
- [ ] J'ai mis à jour le fichier `.env`
- [ ] J'ai rebuild l'app avec EAS ou prebuild
- [ ] J'ai relancé le dev server
- [ ] Je vois la carte dans l'onglet "Tab Two"

## 🆘 Problèmes courants

### "Mapbox.setAccessToken() not called"
➡️ Vérifiez que `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` est dans `.env` et commence par `pk.`

### "Build failed" lors du EAS build
➡️ Vérifiez que `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` est dans `.env` et commence par `sk.`
➡️ Le token doit avoir le scope `DOWNLOADS:READ`

### La carte ne s'affiche pas
➡️ Avez-vous rebuild l'app après avoir ajouté les tokens ?
➡️ Utilisez-vous `--dev-client` avec `expo start` ?
➡️ Vérifiez les logs dans Metro pour voir les erreurs

## 📚 Prochaines étapes

Consultez `docs/mapbox-setup.md` pour :
- Ajouter des marqueurs
- Afficher la position de l'utilisateur
- Personnaliser le style de la carte
- Plus d'exemples avancés
