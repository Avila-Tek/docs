---
title: Activar ambientes Test / Live
sidebar_position: 5
slug: /lovable-setup/test-live-environments
---

Esta guía explica cómo activar **Test / Live environments** en Lovable Cloud para poder trabajar con más seguridad:

- **Test**: donde probamos y construimos cambios.
- **Live**: producción (lo que ven los usuarios reales).

La idea es simple: **trabajamos tranquilos en Test** y solo tocamos Live cuando estemos listos.

> Nota: aquí solo hablamos de ambientes (Test/Live).  
> El manejo de ramas (main/development) se documenta por separado en **Manejo de ramas**.

---

## ¿Cuándo vale la pena activarlo?

En Landscapes, **lo activamos siempre** para evitar errores en producción y poder probar cambios con tranquilidad.

Lo único a tener en cuenta es que Lovable **solo te deja activarlo después del primer Publish**, porque primero necesita crear el ambiente **Live** (producción).  
En la práctica:

1) Haces un **primer Publish** (aunque sea una versión básica).
2) Luego activas **Test / Live** y desde ahí trabajas con más seguridad.

---

## Antes de empezar (requisitos)

Para activar Test/Live:

- El proyecto debe estar usando **Lovable Cloud**.
- Debes **publicar al menos una vez** para que exista el ambiente **Live** (producción).

> En pocas palabras: primero haces un primer Publish “inicial”, y luego activas Test/Live.

---

## Qué cambia cuando activas Test/Live

Cuando lo activas, Lovable crea un ambiente **Test** aparte del **Live**.

### Lo que se copia una sola vez (al activarlo)

- La estructura de la base de datos (tablas/campos).
- Los datos actuales (lo que exista en ese momento).
- Parte de la configuración del Cloud.

Después de eso, **Test y Live se separan**.

### Qué se mueve y qué no

- Al publicar, se sincroniza principalmente **cómo funciona la app** (código) y algunos cambios “seguros” de estructura.
- **No se copian los datos** (los registros) entre Test y Live.
- **No se copian automáticamente configuraciones** como integraciones, secretos, settings de auth, etc. (cada ambiente tiene lo suyo).

---

## Paso a paso para activarlo

1) Entra a **Cloud view** del proyecto.  
2) Ve a **Advanced settings**.  
3) Activa **Enable Test and Live environments**.  
4) Completa el onboarding.  
5) Confirma el botón de activar.

Listo: ahora tendrás un selector para ver **Test** o **Live** dentro de Cloud.

---

## Cómo se trabaja día a día

### Trabajar en Test

- Normalmente construimos y probamos cambios pensando en **Test**.
- Ahí es donde validamos flujos, pantallas y comportamientos.

### Ver Live (producción)

- Puedes cambiar el selector a **Live** para revisar datos/configuración real.

> ⚠️ Ojo: si editas cosas en **Live** (datos o configuración), eso afecta producción **de inmediato**.

---

## Publicar cambios (de Test a Live)

Cuando presionas **Publish**, lo que haces es actualizar producción para que:

- Se comporte igual que lo probado en Test (la app “funcione igual”),
- Sin tocar automáticamente los datos reales de producción.

**Antes de publicar**, revisa:

- [ ] Que los flujos principales funcionan en Test
- [ ] Live tiene su configuración lista (login, integraciones, secretos, etc.)
- [ ] No estás cambiando algo que pueda afectar data real sin querer

---

## Errores comunes

- **Configurar algo en Test y asumir que “ya está” en Live**  
  Muchas configuraciones se manejan por ambiente. Revisa Live antes de publicar.

- **Probar “rápido” en Live**  
  Live es producción. Cualquier cambio ahí impacta a usuarios reales.

- **Pensar que publicar copia datos**  
  Publicar cambia cómo funciona la app, pero **no copia** los datos de Test a Live.
