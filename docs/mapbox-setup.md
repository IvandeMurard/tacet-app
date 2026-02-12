# Configuration Mapbox pour Tacet

## Tokens nécessaires

Vous avez besoin de **deux tokens** différents de Mapbox :

### 1. Public Access Token (pk.xxx)
- **Utilisation** : Dans l'application pour afficher les cartes
- **Sécurité** : Peut être exposé côté client
- **Variable** : `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Où le trouver** : https://account.mapbox.com/ > Access Tokens

### 2. Secret Download Token (sk.xxx)
- **Utilisation** : Pour télécharger le SDK Mapbox lors des builds natifs
- **Sécurité** : Ne doit JAMAIS être committé
- **Variable** : `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`
- **Scopes requis** : `DOWNLOADS:READ`
- **Comment le créer** :
  1. Allez sur https://account.mapbox.com/access-tokens/
  2. Cliquez sur "Create a token"
  3. Donnez un nom (ex: "Tacet Download Token")
  4. Cochez `DOWNLOADS:READ` dans les scopes
  5. Cliquez sur "Create token"

## Configuration

### Étape 1 : Fichier .env

Copiez `.env.example` vers `.env` et remplissez :

```bash
# Token public pour l'app
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.votre_token_public_ici

# Token pour les builds natifs
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk.votre_token_secret_ici
```

### Étape 2 : Vérifier app.json

Le plugin Mapbox est déjà configuré dans `app.json` :

```json
"plugins": [
  "expo-router",
  ["expo-location", { "locationWhenInUsePermission": "..." }],
  "@rnmapbox/maps"
]
```

### Étape 3 : Rebuild l'app

Après avoir configuré les tokens, vous devez reconstruire l'app native :

```bash
# Pour un build de développement local
npx expo prebuild --clean

# OU pour un build EAS
eas build --profile development --platform android
```

## Utilisation dans le code

### Import du composant MapView

```typescript
import MapView from '@/components/MapView';

// Dans votre composant
<MapView 
  centerCoordinate={[2.3522, 48.8566]} // [longitude, latitude]
  zoomLevel={12}
>
  {/* Ajoutez des marqueurs, etc. */}
</MapView>
```

### Import direct de Mapbox

```typescript
import Mapbox from '@/config/mapbox';

// Mapbox est déjà initialisé avec votre token
// Vous pouvez utiliser tous les composants :
// - Mapbox.MapView
// - Mapbox.Camera
// - Mapbox.PointAnnotation
// - Mapbox.UserLocation
// etc.
```

## Styles de carte disponibles

```typescript
Mapbox.StyleURL.Street     // Carte routière
Mapbox.StyleURL.Outdoors   // Carte extérieure
Mapbox.StyleURL.Light      // Thème clair
Mapbox.StyleURL.Dark       // Thème sombre
Mapbox.StyleURL.Satellite  // Vue satellite
```

## Exemple : Ajouter un marqueur

```typescript
import Mapbox from '@/config/mapbox';
import MapView from '@/components/MapView';

export default function MyScreen() {
  return (
    <MapView centerCoordinate={[2.3522, 48.8566]} zoomLevel={14}>
      <Mapbox.PointAnnotation
        id="paris"
        coordinate={[2.3522, 48.8566]}
      >
        <View style={{ width: 30, height: 30, backgroundColor: 'red', borderRadius: 15 }} />
      </Mapbox.PointAnnotation>
    </MapView>
  );
}
```

## Dépannage

### La carte ne s'affiche pas
1. Vérifiez que `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` est bien défini dans `.env`
2. Vérifiez la console pour les warnings/erreurs
3. Assurez-vous d'avoir rebuild l'app après avoir ajouté le token

### Erreur lors du build
- Vérifiez que `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` est bien configuré
- Le token doit avoir le scope `DOWNLOADS:READ`
- Pour les builds EAS, le token est lu depuis `eas.json`

### "Token not set" dans les logs
- Le token public doit commencer par `pk.`
- Vérifiez que la variable commence bien par `EXPO_PUBLIC_`
- Redémarrez le serveur de développement après avoir modifié `.env`

## Ressources

- Documentation officielle : https://rnmapbox.github.io/
- Exemples : https://github.com/rnmapbox/maps/tree/main/example
- API Reference : https://rnmapbox.github.io/docs/
