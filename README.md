# 👟 Pasos

App para contar pasos, competir en torneos con amigos y encontrar cafeterías y
lugares de comida cerca. Hecha con Expo (React Native): **el mismo código genera
el APK de Android y la app de iPhone**, y además corre en el navegador.

Estética pixel-art sobre fondo oscuro, en español rioplatense.

## Qué hace

**Pasos**
- Cuenta los pasos del día leyendo el podómetro del teléfono.
- Meta diaria configurable, progreso en vivo, km y kcal estimadas.
- Gráfico de los últimos 7 días y estadísticas de 30 días.
- Carga manual de pasos (por si saliste sin el teléfono o usás la web).

**Torneos**
- Creá torneos de 3 días, 1 semana, 2 semanas o 1 mes.
- Elegís nombre, ícono, premio/castigo ("el último paga el café") y participantes.
- Tabla de posiciones con medallas, tu puesto y cuántos pasos te faltan para el primero.
- Código de invitación para compartir por WhatsApp.

**Mapa**
- Cafeterías, restaurantes, heladerías y jugueras cerca tuyo.
- Datos reales de **OpenStreetMap** (sin API key ni tarjeta de crédito).
- Filtros por categoría, favoritos, distancia y minutos caminando.
- Ficha de cada lugar con horarios, Wi-Fi, mesas afuera, teléfono, web y "Cómo llegar".

**Amigos**
- Ranking de hoy / semana / mes.
- Se agregan con un código de 6 letras.

## Conteo en segundo plano sin gastar batería

La app **no ejecuta ningún proceso en segundo plano**. No hay servicio en primer
plano, ni tareas periódicas, ni GPS prendido. Eso es justamente lo que la hace
liviana en batería.

El truco es que el teléfono ya cuenta los pasos solo, en hardware dedicado, las
24 horas — aunque la app esté cerrada. Pasos simplemente **lee ese registro**
cuando la abrís o volvés a ella:

| Plataforma | De dónde salen los pasos | Batería extra |
|---|---|---|
| iPhone | CMPedometer (coprocesador de movimiento), historial de 7 días | ~0 |
| Android | Health Connect, que guarda lo que registra el sensor del sistema | ~0 |
| Android sin Health Connect | Sensor en vivo, sólo mientras la app está abierta | mínima |
| Web | No hay podómetro: carga manual | — |

Si estuviste tres días sin abrir la app, al abrirla se completan esos tres días
de golpe. En el Perfil ves si el modo "Segundo plano activo" está andando y
podés forzar una sincronización.

En Android, la primera vez hay que tocar **Conectar** en el Perfil para darle
permiso a Health Connect (viene instalado en Android 14+; en versiones anteriores
se baja de Play Store).

## Correr el proyecto

```bash
npm install
npx expo start
```

Escaneá el QR con Expo Go para una prueba rápida, o `npx expo start --web` para
el navegador.

> Health Connect y los mapas nativos necesitan un *development build*, no Expo Go:
> `npx eas build --profile development --platform android`

## Generar el APK y la app de iPhone

Necesitás una cuenta gratis de Expo:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

**APK de Android** (se instala directo en el teléfono):

```bash
npm run build:apk          # eas build -p android --profile preview
```

Cuando termina, EAS te da un link para descargar el `.apk`. Pasáselo a tus
amigos y que lo instalen habilitando "Orígenes desconocidos".

**iPhone**:

```bash
npm run build:ios          # eas build -p ios --profile preview
```

Para instalarlo en iPhones hace falta una cuenta de Apple Developer (99 USD/año)
y registrar los dispositivos con `eas device:create`. Sin eso, la alternativa es
correrla con Expo Go o compilar en una Mac con Xcode.

**Para las tiendas**:

```bash
eas build -p android --profile production   # .aab para Google Play
eas build -p ios --profile production       # para App Store
```

**Versión web** (para subir a Netlify, Vercel o GitHub Pages):

```bash
npx expo export --platform web
```

## Cómo está armado

```
app/                      rutas (expo-router)
  _layout.js              providers, fuentes, guard de onboarding
  onboarding.js           bienvenida + armado de perfil
  (tabs)/                 Inicio · Mapa · Torneos · Amigos · Perfil
  torneo/[id].js          detalle del torneo y tabla de posiciones
  torneo/nuevo.js         crear torneo
  lugar/[id].js           ficha del lugar
  agregar-amigo.js        alta de amigo por código
src/
  services/steps.js       lectura de pasos (iOS CMPedometer / Android Health Connect)
  services/places.js      búsqueda de lugares en OpenStreetMap + respaldo offline
  state/store.js          estado global + persistencia en AsyncStorage
  state/steps.js          provider único del podómetro
  state/places.js         provider de lugares cercanos
  components/             UI pixel: tarjetas, botones, rankings, mapa
  hooks/                  usePedometer, useNearbyPlaces
  theme.js                colores, tipografía y espaciados
```

El mapa usa `react-native-maps` en el teléfono y, en web, un mini-mapa pixel
dibujado a mano (react-native-maps no corre en el navegador).

## Estado actual de los datos

Todo se guarda **en el teléfono** (AsyncStorage). No hay servidor, así que:

- Tus pasos, torneos y favoritos son tuyos y no salen del dispositivo.
- Los amigos que agregás aparecen en el ranking, pero sus pasos no se
  sincronizan solos entre teléfonos: para eso hace falta un backend.
- La app arranca con amigos y un torneo de ejemplo para que se entienda el flujo;
  se borran desde Perfil → "Borrar mis datos".

Si más adelante querés que los pasos se compartan de verdad entre teléfonos, el
lugar para engancharlo es `src/state/store.js` (las acciones ya están separadas
del resto de la app) más un endpoint que reciba `{ code, history }`.

## Permisos que pide

- **Actividad física / movimiento**: para contar los pasos.
- **Ubicación (mientras se usa)**: para buscar lugares cerca. Si la rechazás, la
  app igual funciona con un centro por defecto.

Créditos de datos de lugares: [OpenStreetMap](https://www.openstreetmap.org/copyright).
