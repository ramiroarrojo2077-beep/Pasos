# 👟 PASOS

Contador de pasos con torneos entre amigos y mapa de cafeterías y lugares de
comida cerca. Hecha con Expo (React Native): **el mismo código genera el APK de
Android y la app de iPhone**, y además corre en el navegador.

Interfaz **retro arcade**: paleta de fósforo sobre CRT oscuro, tipografía pixel
(Press Start 2P + Silkscreen), iconos pixel-art dibujados a mano sobre una
grilla de 12x12, marcos con esquinas en escalón, sombras duras y líneas de
barrido. Textos en español rioplatense.

## Qué hace

**Pasos**
- Cuenta los pasos del día leyendo el podómetro del teléfono.
- Meta diaria configurable, progreso en vivo, km y kcal estimadas.
- Gráfico de los últimos 7 días y estadísticas de 30 días.
- Carga manual de pasos (por si saliste sin el teléfono o usás la web).

**Torneos**
- Creá torneos de 3 días, 1 semana, 2 semanas o 1 mes.
- Elegís nombre, emblema, premio ("el último del ranking paga el café") y jugadores.
- Tabla de posiciones con corona y podio, tu puesto y cuántos pasos te faltan
  para alcanzar al primero.
- Código de invitación para compartir por WhatsApp.

**Mapa**
- Cafeterías, restaurantes, heladerías y jugueras cerca tuyo.
- Datos reales de **OpenStreetMap** (sin API key ni tarjeta de crédito).
- Filtros por categoría, favoritos, distancia y minutos caminando.
- Ficha de cada lugar con horarios, Wi-Fi, mesas afuera, teléfono, web y "Cómo llegar".
- En el teléfono usa el mapa real con un estilo CRT neón y chinches pixeladas.
  En el navegador dibuja una ciudad pixel generada a partir de tus coordenadas
  (calles, manzanas, parques, río y ventanas encendidas), porque
  `react-native-maps` no corre en web.

**Amigos**
- Ranking de hoy / semana / mes.
- Se agregan con un código de 6 caracteres.
- Cada jugador elige un personaje pixel (fantasma, invader, robot, gato,
  calavera o pájaro) en uno de los colores de fósforo.

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

## Descargar la app

**Android — un solo link, sin cuenta de GitHub:**

### 📥 [Bajar Pasos.apk](https://raw.githubusercontent.com/ramiroarrojo2077-beep/Pasos/descargas/Pasos.apk)

<sub>Espejo: [desde Releases](https://github.com/ramiroarrojo2077-beep/Pasos/releases/latest/download/Pasos.apk) — si tu navegador se queda en "Descargando..." al 100%, usá el link de arriba, que no pasa por redirecciones.</sub>

<img src="docs/qr-apk.png" width="180" alt="Código QR para bajar el APK">

Pesa 35 MB. Abrí ese link desde el teléfono (o escaneá el QR con la cámara) y
tocá el archivo cuando termine de bajar. La primera vez Android pide habilitar
"Instalar apps desconocidas" para el navegador o para WhatsApp: se acepta y
listo. Ese link siempre apunta a la última versión compilada, así que podés
mandárselo a tus amigos una vez y no cambia nunca.

**iPhone:**

### [Bajar Pasos.ipa](https://raw.githubusercontent.com/ramiroarrojo2077-beep/Pasos/descargas/Pasos.ipa)

Apple no deja firmar apps sin cuenta de desarrollador, así que el `.ipa` va
**sin firmar**. Se instala con [Sideloadly](https://sideloadly.io) o AltStore
desde una PC o Mac: enchufás el iPhone, arrastrás el archivo, ponés tu Apple ID
común. Dura 7 días y se renueva volviendo a enchufarlo. Para que dure como una
app normal hace falta una cuenta de Apple Developer (99 USD/año) y se distribuye
por TestFlight.

### Compilar una versión nueva

Cada vez que quieras regenerar los archivos:

1. Entrá a la pestaña **Actions** del repositorio.
2. **Compilar apps** → **Run workflow** → `ambas`.
3. Cuando termina (15-25 minutos), los links de arriba ya apuntan a lo nuevo.

Los archivos también quedan como *artifacts* de cada corrida, por si querés una
versión vieja en particular.

### Firmar el APK con tu propia clave

Por defecto el APK va firmado con la clave de depuración, que alcanza para
instalarlo y compartirlo. Si querés una clave propia y estable —necesaria para
actualizar la app sin desinstalarla, y para Google Play— generá un keystore con
**estos valores exactos**:

```bash
keytool -genkeypair -v -keystore pasos.keystore -alias androiddebugkey \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android
base64 -w0 pasos.keystore
```

Pegá el resultado en Settings → Secrets and variables → Actions → New secret,
con el nombre `ANDROID_KEYSTORE_BASE64`. El workflow lo detecta solo. Guardá el
archivo: si lo perdés, no podés volver a actualizar la app.

### Para las tiendas (Google Play y App Store)

Ese camino va por EAS, que maneja la firma por vos:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production   # .aab para Google Play
eas build -p ios --profile production       # para App Store / TestFlight
```

También está el workflow **Compilar con EAS** en Actions: cargás el secret
`EXPO_TOKEN` (lo sacás de expo.dev → Settings → Access tokens) y lo lanzás
desde la web, sin instalar nada.

## Correr el proyecto en tu máquina

```bash
npm install
npx expo start
```

Escaneá el QR con Expo Go para una prueba rápida, o `npx expo start --web` para
el navegador.

> Health Connect y los mapas nativos necesitan un *development build*, no Expo Go:
> `eas build --profile development --platform android`

## Cómo está armado

```
app/                      rutas (expo-router)
  _layout.js              providers, fuentes pixel y guard de onboarding
  onboarding.js           pantalla de atracción + armado del jugador
  (tabs)/                 Inicio · Mapa · Torneos · Amigos · Perfil
  torneo/[id].js          detalle del torneo y tabla de posiciones
  torneo/nuevo.js         crear torneo
  lugar/[id].js           ficha del lugar
  agregar-amigo.js        alta de jugador por código
src/
  components/sprites.js   35 sprites 12x12 dibujados a mano
  components/PixelIcon.js render SVG de los sprites (agrupa píxeles por fila)
  components/ui.js        kit arcade: paneles, botones, chips, medidores, CRT
  components/pixelCity.js generador determinista de la ciudad pixel del mapa
  components/PlacesMap.*  mapa nativo (react-native-maps) y mapa web pixel
  services/steps.js       lectura de pasos (iOS CMPedometer / Android Health Connect)
  services/places.js      búsqueda de lugares en OpenStreetMap + respaldo offline
  state/store.js          estado global + persistencia en AsyncStorage
  state/steps.js          provider único del podómetro
  state/places.js         provider de lugares cercanos
  theme.js                paleta de fósforo, tipografía y espaciados
```

Los iconos no son emoji: son sprites propios de 12x12 renderizados como SVG,
así se ven exactamente igual en Android, iPhone y web. La Press Start 2P no
tiene mayúsculas acentuadas (los gabinetes de los 80 eran ASCII puro), así que
los títulos van sin tildes a propósito; el texto corrido y los campos usan
Silkscreen, que sí las tiene.

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

## Requisitos

- **Android 8.0 (API 26) o superior.** Lo impone Health Connect, que es de
  donde leemos los pasos con la app cerrada; por debajo de esa versión ni
  siquiera existe.
- **iOS 15.1 o superior**, el piso de Expo SDK 57.

## Permisos que pide

- **Actividad física / movimiento**: para contar los pasos.
- **Ubicación (mientras se usa)**: para buscar lugares cerca. Si la rechazás, la
  app igual funciona con un centro por defecto.

Créditos de datos de lugares: [OpenStreetMap](https://www.openstreetmap.org/copyright).
