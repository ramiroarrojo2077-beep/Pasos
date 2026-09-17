# Servidor de grupos

Sin esto, cada teléfono guarda sus propios datos y los amigos no se ven entre
sí. Con esto, los que entren con el mismo código de torneo aparecen en la tabla
de todos.

Es un solo archivo, sin dependencias, y guarda todo en un JSON.

## Probarlo en tu computadora

```bash
node servidor/index.js
```

Queda escuchando en `http://localhost:8787`. Para que lo vea el teléfono, en la
app poné esa dirección con la IP de tu computadora en la red de casa, por
ejemplo `http://192.168.0.10:8787`.

## Dejarlo prendido siempre

Cualquier hosting gratuito sirve; sube un solo archivo y no necesita base de
datos. Por ejemplo:

- **Render**, **Railway** o **Fly.io**: apuntan al repo y ejecutan
  `node servidor/index.js`.
- Un VPS propio con `pm2` o un servicio de systemd.

La única variable que conviene fijar es `DATOS`, con la ruta donde guardar el
archivo, si el hosting borra el disco entre reinicios.

## Cómo se conecta la app

En la app: **Perfil → Servidor del grupo** y pegás la dirección. Queda guardada
en el teléfono y desde ahí los torneos se sincronizan solos. Si el campo está
vacío, la app funciona igual pero cada uno ve solo sus propios pasos.

## Qué guarda

Por cada código de torneo, una lista de jugadores con:

- el nombre que eligieron y su personaje
- los pasos por día de los últimos 60 días

Nada más: ni ubicación, ni contactos, ni identificadores del teléfono. Los
códigos son la única llave, así que compartilos solo con quien quieras que
vea la tabla.

## Límites

Cincuenta jugadores por grupo y sesenta días de historial, para que el archivo
no crezca sin control.
