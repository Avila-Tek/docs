# Features

Este capítulo describe cómo crear, organizar, nombrar y desarrollar los diferentes elementos y clases que hacen vida dentro de un `Feature`.

## Creación

Para la creación de un `feature` se **debe** hacer uso de la plantilla de Mason llamada `feature_brick`, que permite la rápida creación de un `feature` con toda la estructura necesaria para cumplir con la Arquitectura Limpia. Sin embargo, ésta **debe** ser la disponible en el paquete de [Avila Tek Flutter Common Library (FCL)](https://github.com/Avila-Tek/flutter_common_lib/tree/master/bricks/feature_brick), y no la original de [BrickHub.dev](https://brickhub.dev/bricks/feature_brick/0.6.2), ya que la de Ávila contiene unas pequeñas adaptaciones que se ajustan a la estructura requerida y definida por el departamento de desarollo móvil.

### Comando a ejecutar

Para la creación de un `feature` con la plantilla `feature_brick` de Ávila, se **debe** ejecutar su respectivo comando en la terminal del proyecto, apuntando desde la dirección raíz del mismo, en cualquiera de sus siguientes versiones:

```sh
mason make feature_brick -o <Dirección-de-la-carpeta-de-presentación>

mason make feature_brick --feature_name <Nombre-del-feature> --state_management bloc --output-dir <Dirección-de-la-carpeta-de-presentación>
```

### Explicación del comando

El comando viene con varias opciones o variables que se **pueden** indicar directamente al escribir el comando inicial, o ir respondiendo uno a uno cuando la plantilla te pregunte. Estas opciones son:

#### A. `--output-dir` u `-o`

La ruta dentro del proyecto en donde se creará el `feature` **puede** ser indicada al ejecutar el comando, y en caso de no serlo, se **debe** ejecutar el comando en la terminal desde la dirección en donde se desea crear el `feature`, la cual **debe** ser dentro de la respectiva carpeta de presentación del proyecto.

#### B. `--feature_name`

Aquí se indicará el nombre que tendrá el `feature`, el cual **debe** cumplir con las reglas de nombrado que se explican en su respectiva sección a continuación. De no ser indicado, el mismo por defecto será `login`.

#### C. `--state_management`

El manejador de estados **debe** ser `bloc`. De no indicarse, será este mismo por defecto.

:::danger
No se permitará otro manejador de estados que no sea `bloc`, ya que es el definido por el departamento en su arquitectura.
:::

#### D. ¿Deseas usar equatable con tu bloc?

A diferencia de las opciones anteriores, ésta no tiene una variable que se pueda agregar en el comando, sino que se trata de una pregunta que te hace la plantilla al intentar crear el `feature`. Debido a que se está usando `bloc` como manejador de estado, se **debe** indicar que sí (`true`) se usará el paquete `equatable` para manejar la igualdad entre objetos de una forma sencilla.

#### E. ¿Te gustaría incluir tests en este feature?

Otra pregunta que no incluye una variable, y que en este caso, es totalmente opcional si se desea incluir o no los tests, según la naturaleza del `feature`.

## Nombrado

El nombre de un `feature` **debe** reflejar claramente la funcionalidad que gestionan, sin ningún sufijo o prefijo. Este **debe** ser escrito en singular, aunque **pueden** haber excepciones a esta regla, cuando la funcionalidad es explícitamente plural.

:::info
En caso de que el nombre sea compuesto por más de una palabra, éste **debe** escribirse en estilo **snake_case** al momento de ejecutar el `feature_brick`.
:::

```
presentation/
├─ login/
├─ profile/
├─ contract_detail/
├─ follow_requests/

```

## Estructura General

Todos los `features` **deben** cumplir con la siguiente estructura, que satisface la arquitectura limpia definida:

```
feature/
├─ bloc/
│  ├─ bloc.dart
│  ├─ feature_bloc.dart
│  ├─ feature_event.dart
│  ├─ feature_state.dart
├─ view/
│  ├─ feature_page.dart
├─ widgets/
│  ├─ feature_body.dart
│  ├─ widgets.dart
├─ feature.dart

```

:::info
Los nombres de la carpeta y de los archivos que contienen la palabra `feature`, **deben** ser sustituidos por el nombre del mismo, cumpliendo las reglas establecidas en la sección anterior.
:::

```
login/
├─ bloc/
│  ├─ bloc.dart
│  ├─ login_bloc.dart
│  ├─ login_event.dart
│  ├─ login_state.dart
├─ view/
│  ├─ login_page.dart
├─ widgets/
│  ├─ login_body.dart
│  ├─ widgets.dart
├─ login.dart

```

### Carpeta `bloc/`

Esta carpeta **debe** estar conformada por cuatro (4) archivos que son:

#### A. `feature_bloc.dart`

Es el archivo en donde se definirán los métodos y la lógica a ejecutar cuando un evento del `bloc` es llamado desde la vista.

#### B. `feature_event.dart`

Es el archivo en donde se definirán los eventos del `bloc` junto a sus parámetros, en caso de ser necesario.

#### C. `feature_state.dart`

Es el archivo en donde se definirán los atributos que el `bloc` manejará y compartirá con la vista.

#### D. `bloc.dart`

Es el archivo de barril que permitirá exportar todos los archivos de esta carpeta, al ser importados en otro módulo, mejorando la organización y limpieza del código.

:::info
Para mayor información y detalle sobre los `blocs`, referirse a su respectivo capítulo documentado.
:::

### Carpeta `view/`

Esta carpeta **debe** estar conformada por un único archivo, denominado `feature_page.dart`, en el cual se encuentran diferentes elementos como el `Page` y el `View`, que están documentados en la siguiente sección.

### Carpeta `widgets/`

Esta carpeta **debe** estar conformada por mínimo dos archivos, con posibilidad de agregar tantos como el `feature` lo requiera. Estos son:

#### A. `feature_body.dart`

Es el archivo en donde se desarrollan los `widgets` o elementos de la interfaz gráfica de la aplicación.

#### B. `widgets.dart`

Es el archivo de barril para todos los archivos que se crearán dentro de la carpeta `widgets/`, facilitando el orden y la limpieza del código.

#### C. Otros archivos

Según los requerimientos del `feature` **puede** existir la necesidad, en pro de mantener una estructura legible, mantenible y organizada, de separar los `widgets` o elementos de la interfaz gráfica, en archivos separados.

:::warning
Al momento de refactorizar componentes o elementos de la interfaz gráfica, es importante determinar si estos serán utilizados únicamente por este `widget`, o si **puede** ser reutilizado en diferentes partes de la aplicación. En el primer caso, el `widget` si **debe** ser creado dentro de esta carpeta, pero en caso contrario, este **debe** ser creado dentro la carpeta `shared/` de los recursos compartidos del proyecto.
:::

:::info
Para mayor información y detalle sobre los `widgets`, referirse a su respectivo capítulo documentado.
:::
