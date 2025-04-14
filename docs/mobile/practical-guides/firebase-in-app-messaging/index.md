---
sidebar_position: 6
---

# Firebase In-App Messaging

**Firebase In-App Messaging** es una herramienta para enviar mensajes contextuales y específicos dentro de una aplicación. Su objetivo principal es interactuar con los usuarios activos de la app para guiarlos, alentarlos a realizar ciertas acciones o informarles de algo importante sin ser intrusivo como una notificación push.

:::warning
Esta guía fue redactada usando la versión 3.24.0 de `flutter`
:::

## Setup

Importa las dependencias [`firebase_core`](https://pub.dev/packages/firebase_core) y [`firebase_in_app_messaging`](https://pub.dev/packages/firebase_in_app_messaging) al proyecto de flutter en el archivo `pubspec.yaml`.

```yaml
dependencies:
  firebase_core: ^3.1.1
  firebase_in_app_messaging: ^0.8.0+5
```

:::note
Para el funcionamiento de la dependencia de firebase in app messaging es necesario que previamente se haya [**configurado Firebase**](/docs/practical-guides/firebase-config/index.md) para cada ambiente de la aplicación.
:::

**Firebase In-App Messaging** recupera mensajes del servidor únicamente una vez al día, lo que puede complicar el proceso de pruebas. Para facilitarlo, la consola de Firebase permite designar un dispositivo de prueba que puede mostrar los mensajes de manera inmediata bajo demanda.

Para configurar esto, sigue los pasos de esta guía proporcionada por [**Firebase Docs**](https://firebase.google.com/docs/in-app-messaging/get-started?platform=flutter#send_a_test_message).

Por último, ingresa a [Google Cloud Console](https://console.cloud.google.com/) para habilitar el API de Firebase In-App Messaging. Para esto, ingresa a la sección de **APIs & Services > API Library** y escribe en el buscador *"firebase in app messaging"*.

![APIs & Services > API Library](/img/in-app-messaging-api.png)

Seleccionas el servicio y presionas ***Habilitar**.

![Enable Firebase In-App Messaging](/img/enable-in-app-messaging.png)

Una vez completados estos pasos, ya puedes comenzar a enviar mensajes in app desde la consola de Firebase.