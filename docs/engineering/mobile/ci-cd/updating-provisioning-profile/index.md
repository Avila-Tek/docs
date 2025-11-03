# Certificados y Provisioning Profiles de Apple

Los provisioning profiles son archivos que permiten a las aplicaciones iOS ejecutarse en dispositivos físicos. Estos archivos contienen información sobre la aplicación, como su identificador, el equipo de desarrollo y los dispositivos autorizados para ejecutar la aplicación.

Estos provisioning profiles se crean en el [Apple Developer Portal](https://developer.apple.com/account/resources/profiles/list) y se utilizan para firmar la aplicación antes de enviarla a la App Store o distribuirla a través de TestFlight.

Los provisioning profiles se crean a partir de un [certificado de distribución o desarrollo](https://developer.apple.com/help/account/certificates/certificates-overview). Estos certificados tienen una duración de un año y deben renovarse periódicamente. Cuando el certificado expira, los provisioning profiles asociados dejan de ser válidos y deben actualizarse.

> Nota: Se pueden crear multiples provisioning profiles a partir de un certificado.

## Actualización de Provisioning Profiles (Codemagic)

En esta guía nos enfocaremos en la actualización de los provisioning profiles en Codemagic; si estás leyendo esta guía es muy probable que sea exactamente lo que estás buscando. Para actualizar los certificados y provisioning profiles en Codemagic, tendremos que:

1. Generar un nuevo certificado en Apple Developer desde Codemagic.
2. Crear un nuevo provisioning profile para la aplicación que queremos compilar.
3. Descargar el provisioning profile en Codemagic.


### Generar un nuevo certificado en Apple Developer desde Codemagic

1. En Codemagic, ve a la sección **Teams** y selecciona tu equipo.
2. Expande la sección **Code signing identities**. 
3. En la pestaña **iOS certificates** verás los certificados registrados en Codemagic bajo la sección **Code signing certificates**. Elimina el certificado expirado.
4. Luego de eliminar el certificado expirado, dale al botón **Generate certificate** en la sección más arriba. Selecciona el tipo de certificado (por lo general, con el de distribución es suficiente), selecciona el API key de la organización en la cual quieras generarlo y dale a **Create certificate**. Si pregunta si deseas descargarlo, elige que no lo haga.
   
Esto creará un nuevo certificado en Apple Developer asociado a Codemagic. Ahora creemos el provisioning profile. 

### Crear un nuevo provisioning profile

1. Dirigete a la sección de [Profiles de Apple Developer](https://developer.apple.com/account/resources/profiles/list).
2. Elimina el o los provisioning profiles expirado (si existe).
3. Dale al botón **+** para crear un nuevo provisioning profile. En el tipo de profile, elige la opción **App Store Connect** bajo **Distribution** y ve a la siguiente pantalla.
4. Selecciona el bundle ID de la app. Para múltiples ambientes, debes crear un provisioning profile por flavor. Dale a continuar.
5. Por último, selecciona el certificado que generaste en Codemagic y dale a continuar. No es necesario descargar el provisioning profile.

### Descargar el provisioning profile en Codemagic

Por último, dirigete de vuelta a Codemagic en la sección **Code signing identities** y ve a la pestaña **iOS provisioning profiles**. Dale al botón **Fetch profiles** y selecciona el API key del equipo en cuestión. Esto cargará la lista de provisioning asociados al certificado que subiste unos pasos antes. Selecciona el o los provisioning profiles que creaste y dales un nombre. Una vez hecho esto, dale a **Download selected**.

¡Y listo! Ahora podrás compilar tu app en Codemagic sin problemas. Recuerda que si cambias de certificado o de provisioning profile, debes repetir este proceso.
