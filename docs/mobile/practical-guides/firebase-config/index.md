---
sidebar_position: 1
---

# Configuración de Firebase

### Configurando Firebase para varios ambientes

La configuración de Firebase en nuestros proyectos requiere de algunos pasos manuales para que funcione con los múltiples ambientes (flavors) de la aplicación. Acá te explico los pasos a seguir:

### Requerimientos previos

1. Haber creado el proyecto de Firebase y tener acceso a tu cuenta.
2. Agregar en Flutter la dependencia `firebase_core`
3. Tener instalado [flutterfire](https://firebase.flutter.dev/docs/overview/). 
    1. Para instalarlo, corre los siguientes comandos
    
    ```bash
    # Install the CLI if not already done so
    dart pub global activate flutterfire_cli
    
    # Run the `configure` command, select a Firebase project and platforms
    flutterfire configure
    ```

### Paso 1. Configurar Firebase en Flutter

### Paso 1.1. Ejecutar comando `flutterfire`

Para este paso es necesario el **ID del proyecto de Firebase**. Para obtenerlo, dirígete a la vista de *Configuración del proyecto* en Firebase console.

Corre el siguiente comando reemplazando las variables correspondientes: ID del proyecto, Bundle ID (o App ID en Android) y el nombre del archivo resultante específico para el flavor (por ejemplo: `lib/firebase/production_firebase_config.dart`)

```bash
flutterfire configure --project=*id_proyecto_firebase* --android-package-name=*com.app.bundleid* --ios-bundle-id=*com.app.bundleid* --platforms=ios,android --out=lib/firebase/*flavor*_firebase_options.dart
```

<aside>
💡 Si tu app tiene soporte a una plataforma en particular, puedes modificar las variables del comando para configurar únicamente la plataforma necesaria.

</aside>

### Paso 1.2. Crear carpeta config (Solo iOS)

Al finalizar la ejecución del comando, crea una carpeta `config` fuera del proyecto (no importa la ubicación, pronto la vamos a reubicar), y dentro crea una carpeta para cada ambiente que vas a configurar con el mismo nombre del flavor de la app (Ejemplo: `development`, `staging`, `production`) y mueve el archivo `GoogleService-Info.plist` generado por el comando dentro de la carpeta del respectivo flavor creada anteriormente. El archivo plist está ubicado en ubicado en `ios/Runner`.

### Paso 1.3. Ejecutar comando `flutterfire` para el resto de ambientes/flavors

Ejecuta el comando anterior por cada flavor, intercambiando los valores de  `--ios-bundle-id` y `--android-package-name` por su respectivo ID del flavor. Por ejemplo, `com.example.app.stg`, `com.example.app.dev`.

Repite el paso 1.1 si tu proyecto cuenta con soporte para iOS.

### Paso 2. Configuración en Xcode (Solo iOS)

### Paso 2.1. Copiar la carpeta *config* a Xcode

Luego de haber seguido los pasos 1.1 y 1.2 para cada flavor, abre el proyecto de Flutter en Xcode y arrastra la carpeta config dentro del proyecto Runner raíz. Asegúrate de marcar las casillas como muestra la imagen.

![Runner - Config Folder](/img/runner-config-folder.png)

Finalmente te debe quedar así. Verifica que las carpetas se muestran de color azul. Si aparecen en color amarillo, o cualquier otro color, debes agregar la carpeta **desde Xcode**, no desde VSCode o desde el explorador. 

![Config - Copy Archives Options](/img/config-copy-options.png)

### Paso 2.2. Configurar Build Phases

Una vez hayas agregado la carpeta `config` a Xcode, ve a la pestaña Build Phases en el app Runner y crea un nuevo **Run Script Phase** (botón + justo encima de la lista de build phases).

Nombra el script como *Copy GoogleService-Info.plist file* ****y pega el siguiente script.

```bash
environment="default"

# Regex to extract the scheme name from the Build Configuration
# We have named our Build Configurations as Debug-dev, Debug-prod etc.
# Here, dev and prod are the scheme names. This kind of naming is required by Flutter for flavors to work.
# We are using the $CONFIGURATION variable available in the XCode build environment to extract 
# the environment (or flavor)
# For eg.
# If CONFIGURATION="Debug-prod", then environment will get set to "prod".
if [[ $CONFIGURATION =~ -([^-]*)$ ]]; then
environment=${BASH_REMATCH[1]}
fi

echo $environment

# Name and path of the resource we're copying
GOOGLESERVICE_INFO_PLIST=GoogleService-Info.plist
GOOGLESERVICE_INFO_FILE=${PROJECT_DIR}/config/${environment}/${GOOGLESERVICE_INFO_PLIST}

# Make sure GoogleService-Info.plist exists
echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_FILE}"
if [ ! -f $GOOGLESERVICE_INFO_FILE ]
then
echo "No GoogleService-Info.plist found. Please ensure it's in the proper directory."
exit 1
fi

# Get a reference to the destination location for the GoogleService-Info.plist
# This is the default location where Firebase init code expects to find GoogleServices-Info.plist file
PLIST_DESTINATION=${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app
echo "Will copy ${GOOGLESERVICE_INFO_PLIST} to final destination: ${PLIST_DESTINATION}"

# Copy over the prod GoogleService-Info.plist for Release builds
cp "${GOOGLESERVICE_INFO_FILE}" "${PLIST_DESTINATION}"
```

Coloca el script debajo de *Link Binary with Libraries* y verifica que las casillas estén marcadas como muestra la siguiente imagen.

![Build Phases - Xcode](/img/xcode-build-phases.png)

Y *voilà*! Cada vez que tu aplicación compile para iOS se copiara el archivo GoogleService-Info.plist correspondiente al flavor en ejecución.

### Paso 3. Inicializar Firebase en Flutter

En tu archivo main (o archivos main si sigues la estructura convencional de nuestros proyectos) inicializa Firebase con el siguiente código. 

```dart
try {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
} catch (e) {
  log(
    '❌🔥 Failed to initialize Firebase',
    error: e,
  );
}
```

Asegúrate de importar el archivo de configuración correspondiente al flavor.

La inicialización debe hacerse después de llamar `WidgetsFlutterBinding.ensureInitialized()`. Si tu clase `App` está envuelta en una función bootstrap, puedes llamar al método .ensureInitialized() ahí en lugar de `main()`, queda a tu criterio.

<aside>
❗ Inicializa Firebase únicamente en los proyectos configurados en la consola de Firebase, de lo contrario puede generar fallos. También, si usas otros servicios de Firebase (Messaging, Remote Config, Analytics, etc.), asegurate de manejar correctamente los casos en los que Firebase no esté inicializado.

</aside>

Y listo! Tu app ahora cuenta con integración a Firebase para distintos ambientes.