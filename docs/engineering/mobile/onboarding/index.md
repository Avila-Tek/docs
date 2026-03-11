---
sidebar_position: 1
title: Onboarding
keywords: [onboarding, welcome]
---

# Bienvenida al equipo

:::info tl;dr
Para nuestros queridos lectores que sean flojos, existe una versión corta de esta guía, [aquí](/docs/engineering/mobile/onboarding/welcome-tldr).
:::

Bienvenido a la guía de desarrollo móvil con Flutter!

Supongo que entraste a esta sección porque: **A)** decidiste iniciar tu rumbo en el desarrollo móvil, mejor conocido como el camino de la luz 😎; ó **B)** porque eres nuevo en la compañía y estas buscando la información necesaria para alinearte al resto del equipo. Si alguna de las dos opciones es tu caso, entonces estás en el lugar correcto. Así que empecemos esta hermosa travesía…

![https://media.tenor.com/jMQKNxAYbi4AAAAd/voldemort.gif](https://media.tenor.com/jMQKNxAYbi4AAAAd/voldemort.gif)

Dividiré esta guía en dos partes: Una parte dirigida al grupo **A**, y la otra al grupo **B**.

Si eres del primer grupo (A), significa que no sabes nada y quieres comenzar de cero. Así que te daré todo lo necesario para tener tu primer proyecto de Flutter arriba y andando.

Para el segundo grupo (B), preparé la segunda sección donde asumo que ya estás familiarizado con Flutter; ahí te explicaré todo sobre la infraestructuras de nuestros proyectos en Avila, junto con las librerías y herramientas de apoyo que te harán odiar un poco menos tu decisión de dedicarte a la programación.

Lo más importante es que tomaste una buena decisión al dedicarte al desarrollo móvil, ya que según un estudio de eMarketer, [las personas dedican el 90% de su tiempo en el teléfono usando aplicaciones móviles](https://www.mobiloud.com/blog/mobile-apps-vs-mobile-websites#:~:text=People%20Spend%2090%25%20of%20their,internet%20per%20day%20in%202020.).

<!-- ![Untitled](Getting%20Started%208bf79fcfe9b644a3bd387b8058ad9cb6/Untitled.png) -->

**Tabla de contenidos**

# Desde cero con Flutter #WIP

Antes que nada, aclaremos qué es Flutter…

Flutter es un framework de desarrollo **multi-plataformas** que compila a código nativo en iOS, Android, web, Windows, Linux y Mac (quizás en un futuro añadan soporte para microondas), todo con **un sólo código fuente**.

El cómo Flutter es capaz de lograr todo eso es algo más técnico, y quizás sea mejor explicarlo más adelante.

### Cómo instalar Flutter

Para qué reinventar la rueda 🤷‍♂️… Sigue las instrucciones de la [documentación oficial de Flutter](https://docs.flutter.dev/get-started/install) para instalar el SDK.

A pesar de que no es obligatorio utilizar un IDE en específico, recomendamos que utilicen [Visual Studio Code](https://code.visualstudio.com/), ya que cuenta con una amplia librería de extensiones que facilitan el desarrollo en Flutter.

![https://media.tenor.com/uhqmRys705gAAAAC/bernie-sanders-were-working-on-it.gif](https://media.tenor.com/uhqmRys705gAAAAC/bernie-sanders-were-working-on-it.gif)

<aside>
🚧 Trabajo en progreso…

</aside>

# Si ya sabes Flutter

_Ah, veo que eres una persona de cultura…_

En nuestro equipo establecimos ciertas reglas, lineamientos y el uso de algunas herramientas, con la finalidad de mejorar tanto la calidad final de nuestros productos como nuestra calidad de vida como desarrolladores.

## Manejador de estados: BLoC

Para comenzar, **utilizamos Bloc como manejador de estados**. Si no lo conoces, te recomiendo que leas la [documentación](https://bloclibrary.dev/#/) completa para que entiendas la estructura de nuestros proyectos. Si eres como el 99.99% de la población y te aburre leer, la documentación cuenta con varios tutoriales que explican de forma práctica cómo funciona Bloc… Bueno, los tutoriales son escritos así que quizás si tengas que leer un poco 😅.

![https://media.tenor.com/tWRcR564JVAAAAAd/i-hate-books-hate-reading.gif](https://media.tenor.com/tWRcR564JVAAAAAd/i-hate-books-hate-reading.gif)

## Arquitectura de los proyectos

Básicamente nuestros proyectos siguen una arquitectura de 4 capas:

- La capa de datos
- La capa de dominio
- La capa de aplicación ← Que se divide en las capas de presentación y lógica de negocio.

<!-- ![Untitled](Getting%20Started%208bf79fcfe9b644a3bd387b8058ad9cb6/Untitled%201.png) -->

**La capa de aplicación** está compuesta por dos subcapas: La capa de presentación y la capa de lógica de negocio.

- **La capa de presentación** es dónde residen todos nuestros Widgets relacionados a la interfaz de usuario. La única responsabilidad de esta capa es mostrar al usuario los componentes visuales, y actualizarlos cuando hayan cambios de estado, cosa que explicaremos a continuación.
- **La capa de lógica de negocio** es donde residirán nuestros Blocs y Cubits, que son los componentes fundamentales que hacen de Bloc (la librería) un manejador de estados maravilloso.

![https://media.tenor.com/VDhPmAxBEbIAAAAC/torino_beta.gif](https://media.tenor.com/VDhPmAxBEbIAAAAC/torino_beta.gif)

Esta capa se encarga básicamente de emitir _estados_ a la capa de presentación, que hacen que el UI cambie. La emisión de estados puede ocurrir por dos razones:

1. La interacción del usuario con el UI (Por ejemplo, al pisar un botón).
2. Alguna respuesta de la capa de dominio (Por ejemplo, una respuesta del servidor).

Un ejemplo es en la página de inicio de sesión de una aplicación. Luego de que el usuario ingresa su correo y contraseña, pisa el botón de “iniciar de sesión”. Al pisar ese botón, un objeto Bloc se encarga de mandar la información al servidor, y emite un estado de carga mientras espera la respuesta para que el UI muestre el estado de carga y el usuario sepa que se está procesando su petición. Cuando el bloc recibe la respuesta del servidor, emite un estado nuevo que actualiza el UI muestra ; por ejemplo, un estado autenticado si la respuesta es exitosa, o un estado fallido si la petición no se cumplió correctamente.

La **capa de datos** se encarga de la integración con APIs. Puede incluir los modelos serializados de las respuestas del API. Esta capa debe ser lo más abstraído posible del dominio de la aplicación, con el fin de que pueda ser implementada en diferentes sistemas.

Por ejemplo, si habláramos del API de un procesador de pagos como Ubii, toda la implementación de los _endpoints_ del API, así como los modelos de datos que retorne cada _endpoint_ estarán en esta capa. De esta manera, podemos convertir esto en una librería externa y reutilizarla en otros proyectos que dependan del procesador de pago.

La **capa de dominio** se encarga de la implementación específica de la capa de datos en nuestra aplicación, así como de la persistencia datos entre blocs.

Por ejemplo, una aplicación que se alimenta de un API REST de películas tiene un modelo `Movie` en la capa de datos con todos los atributos que retorna el _endpoint_ `/get_movies`. Si en el front sólo se necesitan algunos de esos atributos, podemos crear otro modelo `Movie` a nivel de dominio de la aplicación.

Otro ejemplo sería una aplicación que realice el proceso de autenticación con OAuth, pero que necesita integrar el servicio _CredoLab_ para el procesamiento de metadatos del usuario en el registro. En este caso, podemos crear un método en la capa de dominio que maneje la llamada a ambos APIs. Dicho método estará expuesto a la capa de aplicación y manejará ambos procesos internamente sin que la capa de aplicación se entere de esto. Adicionalmente, si en un futuro quisiéramos cambiar el proveedor del servicio de autenticación a otro, por ejemplo _Firebase Authentication_, simplemente cambiaríamos la implementación en la capa de dominio sin afectar la capa de aplicación (la interfaz).

<aside>
💡 Esta arquitectura no es una decisión absoluta. Dependiendo del proyecto puede que otras arquitecturas sean más adecuadas. En dicho caso, se debe tomar la decisión del cambio arquitectónico correcto cuando se considere necesario.

</aside>

## Estructura de los _features_

En los proyectos seguimos una estructura _folder-by-feature,_ es decir, una carpeta por _feature._ Los _features_ por lo general son las vistas, y van en la ruta `lib/ui/` del proyecto. La clase `App` debe ir en un archivo `app.dart` en la carpeta `lib`.

A continuación te muestro un ejemplo de cómo se estructuran los features. En el ejemplo el _feature_ es login.

```json
├── login
│   ├── bloc
│  │   ├── bloc.dart
│   │   ├── bloc_event.dart
│   │   └── bloc_state.dart
│   ├── view
│   │   └── login_page.dart
│   ├── widgets
│   │   ├── login_body.dart
│   │   └── widgets.dart
│   └── login.dart
└── ...
```

Cada `feature` tiene internamente una carpeta `view` y `widgets`, y adicionalmente, si requiere de un manejador de estados, habrá una carpeta con todas las clases del manejador de estado. En el ejemplo anterior el manejador es Bloc, y contiene el archivo `bloc.dart` con la clase `Bloc`, `bloc_event.dart` con los eventos y `bloc_state.dart` con los estados.

```json
├── login
│   ├── cubit
│   │   ├── cubit.dart
│   │   ├── login_cubit.dart
│   │   └── login_state.dart
│   ├── view
│   │   └── login_page.dart
│   ├── widgets
│   │   ├── login_body.dart
│   │   └── widgets.dart
│   └── login.dart
└── ...
```

Si el feature no requiere un manejador de estados, se omite por completo esa carpeta.

El archivo `login_page.dart` contiene las clases `LoginPage` y `LoginView`.

```dart
import 'package:flutter/material.dart';
import 'package:perkin_manager/ui/login/bloc/bloc.dart';
import 'package:perkin_manager/ui/login/widgets/login_body.dart';

// "Aquí irá la descripción del feature".
//
// Esta clase contiene el [BlocProvider] y el [Scaffold] de la página. El
// [Scaffold] es donde colocaremos nuestro [AppBar], [Drawer],
// [BottomNavigationBar], etc. (si es necesario)
class LoginPage extends StatelessWidget {
  /// {@macro login_page}
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => LoginBloc(),
      child: const Scaffold(
        body: LoginView(),
      ),
    );
  }
}

// Muestra el Body de LoginView y contiene el BlocListener de ser necesario.
// Esta clase no contiene ningun widget visual. Todo eso lo manejará [LoginBody].
class LoginView extends StatelessWidget {
  /// {@macro login_view}
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    return const LoginBody();
  }
}
```

```dart
import 'package:flutter/material.dart';
import 'package:perkin_manager/ui/login/bloc/bloc.dart';

// Aquí mostraremos todo el contenido del body de la pagina. Esto incluye
// los [BlocBuilder]s, pero excluye todo lo que va en el [Scaffold] en
// [LoginPage]
class LoginBody extends StatelessWidget {
  /// {@macro login_body}
  const LoginBody({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LoginBloc, LoginState>(
      builder: (context, state) {
        return Text("Hola mundo");
      },
    );
  }
}
```

Para el contenido de los Blocs y Cubits te recomiendo que leas la documentación oficial de Bloc, y sigas las convenciones de nombrado que también son importantes.

[BLoC: Convenciones](https://www.notion.so/BLoC-Convenciones-8d92cf330dce4a61a5230e1abe3b6aee?pvs=21)

Es probable que a estas alturas te estés preguntando como rayos vas a crear toda esa estructura para cada feature…

![https://media.tenor.com/me3hImQRMr0AAAAC/drake-confused.gif](https://media.tenor.com/me3hImQRMr0AAAAC/drake-confused.gif)

Pero… ¿Y si te dijera que puedes crear todo esto en un solo comando?…

![https://media.tenor.com/kHcmsxlKHEAAAAAC/rock-one-eyebrow-raised-rock-staring.gif](https://media.tenor.com/kHcmsxlKHEAAAAAC/rock-one-eyebrow-raised-rock-staring.gif)

Así es, existe una forma de hacerlo y se llama **Mason**.

### Mason

[Mason](https://pub.dev/packages/mason_cli) es una bendición 😭. Si no lo conoces, te recomiendo personalmente que te tomes un tiempo para aprender a usarlo (tampoco es muy complicado) porque te va a dar una ventaja importante frente a los que no lo utilizan.

En resumen, Mason es un generador de plantillas de código que con un solo comando, puede generar estructuras completas (como las que viste antes para el feature). Esas plantillas las llaman bloques o _bricks_, y hay toda una comunidad dedicada a crear y publicar bricks para el resto del mundo en una plataforma similar a pub.dev, llamada [brickhub.dev](https://brickhub.dev/).

Nosotros particularmente utilizamos en nuestros proyectos [feature_brick](https://brickhub.dev/bricks/feature_brick/0.6.1), que genera la estructura que ya te mostramos en el punto anterior.

Para utilizar mason y crear un _feature_, debemos ejecutar los siguientes comandos:

```bash
# 🎯 Activa mason desde https://pub.dev
dart pub global activate mason_cli

# 🚀 Inicializa mason en el proyecto (opcional, solo si aún no ha sido inicializado)
mason init

# Agrega el brick *feature_brick*, similar a *flutter pub add*
mason add feature_brick

# Genera una carpeta con una estructura predefinida.
# NOTA: Debes ejecutar este comando en la ruta donde quieres que se genere
# la carpeta.
mason make feature_brick
```

Finalmente, nos quedará una estructura como la siguiente:

1. Si elegimos **bloc** como manejador de estado:

```json
--feature_name login --state_management bloc

├── login
│   ├── bloc
│   │   ├── bloc.dart
│   │   ├── login_bloc.dart
│   │   ├── login_event.dart
│   │   └── login_state.dart
│   ├── view
│   │   └── login_page.dart
│   ├── widgets
│   │   ├── login_body.dart
│   │   └── widgets.dart
│   └── login.dart
└── ...
```

1. Si elegimos **cubit**:

```
--feature_name login --state_management cubit
├── login
│   ├── cubit
│   │   ├── cubit.dart
│   │   ├── login_cubit.dart
│   │   └── login_state.dart
│   ├── view
│   │   └── login_page.dart
│   ├── widgets
│   │   ├── login_body.dart
│   │   └── widgets.dart
│   └── login.dart
└── ...
```

Podemos elegir otros manejadores de estado, pero por lo general serán bloc, cubit o ninguno (en caso de ser un feature que no requiera manejar ningún estados).

De esta forma, ahorrarás mucho tiempo creando features con un solo comando.

<aside>
📌 Quiero aclarar una diferencia importante entre [mason_cli](https://pub.dev/packages/mason_cli) y [mason](https://pub.dev/packages/mason). La primera librería es el CLI que genera el código y es la que vamos a utilizar; la segunda librería se usa para crear tus propias plantillas.

</aside>

## Estructura de los modelos (Clases)

Los modelos son la representación en código Dart de los elementos que componen la base de datos. Dependiendo de tu experiencia, puede que ya tengas claro esto.

La estructura de nuestras clases modelo puede variar dependiendo de aspectos como la base de datos de origen. Sin embargo, aquí les mostraré la estructura típica implementada en nuestros proyectos:

```dart
class User {
 // [1] Constructor
  const User({
    required this.id,
    required this.email,
  this.name,
  });

 // [3] Factory fromMap() para construir el objeto desde un JSON o un [Map]
  factory User.fromMap(Map<String, dynamic> data) {
    final id = data['_id'] as String?;
  // [4] (Opcional) -> Evaluamos si el campo vino null de la BD, y arrojamos una
  // excepción en ese caso.
    if (id == null) {
      throw UnsupportedError('Invalid data: $data -> Field  "_id" is missing');
    }

    final email = data['email'] as String?;
    if (email == null) {
      throw UnsupportedError(
        'Invalid data: $data -> Field  "email" is missing',
      );
    }

  // [5] Parámetro opcional (anulable). No necesitamos arrojar una excepción
  // en caso de que ser null.
    final name = data['name'] as String?;

    return User(
      id: id,
      name: name,
      email: email,
    );
  }

 // [2] Atributos
  final String id;
  final String? name;
  final String email;

 // [6] Estructura del query de GraphQL para obtener este objeto.
 static const query = '''
  << QUERY BODY GOES HERE >>
 '''
}
```

Vamos a explicar el ejemplo anterior por partes.

1. **Constructor**: No tiene nada del otro mundo. El constructor de los modelos deben tener parámetros nombrados y no posicionales (Nota: esta regla no es obligatoria para Widgets, solo modelos). Debe ser constante (`const`), a menos que uno de los atributos no lo sea, como por ejemplo atributos de tipo `DateTime`s.
2. **Atributos**: Igualmente, nada del otro mundo. Deben ser `final` o habrán errores. En caso de ser anulable, debes declararlo explícitamente (con `?` luego del tipo).
3. **Factory fromMap()**: En caso de que nuestro modelo venga de un objeto JSON o de un `Map`, debe tener un factory que cree la instancia a partir del Map. Siempre tendrá el nombre `fromMap()` y recibirá el parámetro `Map<String, dynamic>` con nombre “data”.
4. **Atrapar errores de datos**: A veces los objetos pueden venir con campos incompletos. Si no manejamos estos casos de forma correcta, debuggear este tipo de errores en tiempo de ejecución se puede volver complicado. Para evitar esos problemas, debes validar cada dato y manejar aquellos datos nulos inesperados. De esta manera, cuando uno de los atributos de un objeto llegue vacío incorrectamente, el mensaje de error nos dirá específicamente el atributo que generó la falla y el objeto completo que falló.
5. **Parámetros opcionales**: Para aquellos parámetros opcionales pueden ser nulos, no es necesario validarlos como en el punto 4.
6. Esta será la forma en cómo manejaremos el cuerpo de los queries de GraphQL para cada modelo. [Aquí puedes leer más sobre GraphQL](https://www.notion.so/Getting-Started-8bf79fcfe9b644a3bd387b8058ad9cb6?pvs=21).

### Y para los atributos de tipo List y Map?

Hay una forma muy limpia de obtener los datos cuando sean iterables.

```dart
class MyObject {
 ...
 factory MyObject.fromMap(Map<String,dynamic> data) {
  ...
 }
}

class MyList {
 ...



 factory MyList.fromMap(Map<String,dynamic> data) {
  ...

  final listVariable = (data['someListVariable'] as List<dynamic>? ?? [])
   ..removeWhere((element) => element == null);

  return MyList(
   ...
   listVariable: listVariable
    .map((dynamic element) => MyObject.fromMap(element as Map<String, dynamic>))
          .toList()
 }
 ...
}
```

En el ejemplo anterior, estamos obteniendo una lista desde un mapa de objetos.

En caso de que `data['someListVariable']` sea nulo, retornamos una lista vacía `[]`.

`..removeWhere((element) => element == null)` elimina cualquier elemento nulo en la lista original, ya que esto puede ocasionar errores y es típico en MongoDB que esto suceda.

Finalmente, casteamos la lista a tipo `List<MyObject>`.

**Nota**: Vean que le decimos a Dart que asuma que la lista del mapa es de tipo `List<dynamic>`. Si no hacemos esto, es probable que arroje un error porque Dart a veces tiene problemas para inferir este tipo de datos.

## Ambientes de desarrollo

Nuestros proyectos cuentan con tres ambientes de desarrollo, cada uno cuenta con su propio [\*flavor](https://docs.flutter.dev/deployment/flavors)* de la app. El [*Bundle ID*](https://developer.apple.com/documentation/appstoreconnectapi/bundle_ids) (conocido como [*ID de la app\* en Android](https://developer.android.com/studio/build/application-id?hl=es-419)) de la aplicación dependerá del flavor.

A continuación, cada ambiente con su respectivo ID del _flavor_.

- Development: `com.avilatek.appname.dev`
- Staging: `com.avilatek.appname.stg`
- Producción `com.avilatek.appname`

El **ambiente de development** es el ambiente de pruebas locales. Este ambiente no se despliega en ninguna plataforma y sirve únicamente para el proceso de desarrollo del equipo. El host del API de este ambiente suele ser local (el servicio del backend se corre localmente en la máquina).

Por otro lado, el **ambiente de _staging_** es para las pruebas externas y QA. El desarrollo aprobado para salir a producción pasa primero por este ambiente, donde se realizan las pruebas y _quality assurance_ para verificar que la app funcione correctamente. Generalmente, esta versión de la aplicación se despliega a TestFlight en iOS, y al Beta Track en Android. El host del API debe ser un dominio público de pruebas.

Por último, el **ambiente de producción** es la versión final desplegada en tiendas. Este ambiente contiene todos los cambios testeados y aprobados en el ambiente de _staging_. El host del API debe ser el dominio público de producción.

## Control de versiones

El control de versiones se hace con… adivina… **git** (sorpresa 🤯). Sin embargo, las contribuciones al proyecto siguen cierta burocracia para que todo salga correctamente, como ya te explicaré a continuación.

### Estrategia de _branching_ y contribuciones

La estrategia de _branching_ de nuestros proyectos es bastante sencilla. Cada ambiente cuenta con su propia rama y contiene todos los cambios aprobados para salir en dicha etapa. Por ejemplo, los cambios en la rama `development` que hayan sido aprobados para ir a pruebas en el ambiente de _staging_ son unidos (merged) a la rama `staging` del proyecto.

Al trabajar en una HU debes hacer una rama con base en `development` y con el nombre del ID de la HU (por ejemplo, `SPAC-123`). Luego de terminar el _feature,_ hacer commit, y pushear los cambios a remoto, debes abrir un [Pull Requests](https://docs.github.com/es/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (PR) que deberá ser revisado por el líder técnico del proyecto.

<aside>
💡 La revisión de Pull Requests se hace bajo las [políticas de Code Review del equipo](https://www.notion.so/Pol-tica-de-Code-Review-c66b664538d34f38a35ccb16f621f87f?pvs=21)

</aside>

En caso de ser aprobado el PR, tus cambios serán agregados a la rama `development`; en caso contrario tendrás que resolver los problemas que hayan sido señalados antes de poder unir tus cambios a la rama principal.

<aside>
⛔ Los cambios nunca se unen (hacer *merge*) directamente con ninguna rama principal (`development`, **`staging` o `main`). Debe abrirse un Pull Request y ser aprobado por otro miembro del equipo autorizado para aprobar PRs.

</aside>

### Cómo hacer commits correctamente

Quizás pueda parecer un poco obvio el cómo hacer commits, pero eso es completamente diferente a “cómo hacer commits **correctamente**”. En la organización los commits siguen la convención de [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#summary). Sin excepción. La razón de esto se debe a que:

1. Es una buena práctica.
2. Es fácil de llevar el control de cambios con commits estructurados convencionalmente.
3. Podemos hacer uso de herramientas externas de auto-versionado y autogeneración de changelogs, como [melos](https://melos.invertase.dev/).

## Mono-repos y Melos

Actualmente, los proyectos móviles con al menos dos aplicaciones móviles y un API en común se manejan con la estructura de _mono-repos_ (puedes leer [esta página increíble donde explican a detalle lo que es un mono repo](https://monorepo.tools/)). _Long-story short_: En un mono-repo se maneja un solo repositorio para múltiples aplicaciones, a diferencia de un repositorio por aplicación.

Un ejemplo de esto es un proyecto que cuente con una aplicación cliente y una aplicación de administrador. Ambas aplicaciones se alimentan del mismo API (backend) y puede que compartan elementos visuales (como widgets, tema, etc.). Normalmente, se crea un repositorio para cada proyecto y se manejan por separado. En el caso de los mono-repos, ambas aplicaciones se manejan en un solo repositorio.

En caso de que el proyecto cuente con una sola aplicación en Flutter, manejaremos los repositorios de forma convencional.

<aside>
📌 Al igual que la arquitectura de los proyectos, la decisión de la estructura del repositorio puede cambiar si se determina que es mejor para el proyecto por razones objetivas.

</aside>

### Melos

[Melos](https://melos.invertase.dev/) es un CLI creado para manejar mono-repos en Dart. Cuenta con una serie de comandos útiles y te permite escribir tus propios scripts para gestionar los proyectos. Dentro de todas sus funcionalidades, Melos puede:

- Versionar automáticamente las apps y paquetes.
- Vincular los paquetes locales.
- Generar changelogs automaticamente.
- Ejecutar comandos en múltiples proyectos al mismo tiempo (como `flutter pub get`, por ejemplo)

Aunque es probable que no tengas que utilizar mucho Melos, ya que es responsabilidad del tech lead del proyecto, es bueno que lo conozcas y sepas para que funciona.

## Very Good CLI - _Opcional, pero cool_ 😎

Es un CLI desarrollado por [Very Good Ventures](https://verygood.ventures/), y se encarga de toda la configuración inicial del proyecto de forma rápida, siguiendo buenas prácticas y añadiendo varias características importantes para el proceso de desarrollo. Los pasos para su instalación se pueden conseguir [aquí](https://pub.dev/packages/very_good_cli). Te recomiendo leer la documentación para aprender a utilizarlo. No te quitará mucho tiempo.

Al crear un proyecto de Flutter con **`very_good_cli`**, viene con varias características útiles como el **`very_good_analysis`**, el cual es un [linter](https://www.testim.io/blog/what-is-a-linter-heres-a-definition-and-quick-start-guide/?utm_source=google&utm_medium=cpc&utm_campaign=InMarket-Geo&utm_campaign=InMarket-Geo&utm_term=&utm_medium=cpc&utm_source=google&hsa_kw=&hsa_mt=&hsa_grp=136083397617&hsa_tgt=dsa-19959388920&hsa_net=adwords&hsa_cam=17604197648&hsa_ver=3&hsa_acc=6463132548&hsa_src=g&hsa_ad=606595308934&gclid=Cj0KCQjw5ZSWBhCVARIsALERCvxPR7r8tcjM-vfrDONbg2W5nA6-fzfB9Bh3jIySp6-mXazTL9jt9XQaAr4cEALw_wcB) con los estándares de código de Very Good Ventures para Dart. Es útil para que todo nuestro equipo siga la misma sintaxis de código.

Otra característica que configura el CLI son los ambientes de desarrollo. Se configuran tres ambientes: **development**, **staging** y **production**; convenientemente los ambiente que manejamos en el equipo. Cada ambiente cuenta con su propio archivo main. `main_development.dart`, `main_staging.dart` , y `main_production.dart` respectivamente.

Por último, el CLI crea la carpeta **`l10n`**, donde se encuentra un template inicial con todas las configuraciones necesarias para la localización (traducción) de la app. Para saber más sobre cómo funciona l10n, te recomiendo que leas la [documentación sobre l10n de Dart](https://pub.dev/documentation/l10n/latest/).

<aside>
📌 **Importante**: Las aplicaciones se crean con `very_good flutter_app` y los paquete se crean con `very_good flutter_package` o `very_good dart_package`, dependiendo del tipo de paquete. **Esto es obligatorio.**

</aside>

## GraphQL

![https://media.tenor.com/dLZ4cQ91MRgAAAAC/im-working-on-it-stan-marsh.gif](https://media.tenor.com/dLZ4cQ91MRgAAAAC/im-working-on-it-stan-marsh.gif)
