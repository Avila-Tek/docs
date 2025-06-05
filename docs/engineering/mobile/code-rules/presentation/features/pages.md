# Page

Este capítulo describe todo lo necesario para elaborar correctamente la clase `Page`, dentro del archivo `view/feature_page.dart`.

## Nombrado

El nombre de la clase `Page` de un `feature` **debe** estar compuesto por el nombre de éste último, seguido del sufijo `Page`, escrito con el estilo _PascalCase_.

```dart
/// Para el feature de iniciar sesión.
class LoginPage {}

/// Para el feature de un perfil.
class ProfilePage {}

/// Para el feature del detalle de un contrato.
class ContractDetailPage {}
```

:::info
El nombrado de ésta clase es generado automáticamente por el `feature_brick`.
:::

## Extensión

La clase `Page` **debe** extender de la clase abstracta `StatelesWidget`.

```dart
/// Para cualquier feature.
class FeatureNamePage extends StatelessWidget {}
```

## Constructor

El constructor de la clase `Page` **debe** ser constante.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();
}
```

### Parámetros del constructor

El constructor **puede** requerir, dependiendo del `feature`, de uno o varios parámetros. En caso de, se **debe** crear una clase dentro del mismo archivo cuyo nombre sea el mismo del `feature`, seguido del sufijo `Params`, que contendrá todos los atributos o parámetros necesarios.

```dart
class FeatureNameParams {

    /// Aquí se declaran todas los atributos que sean parámetros
    /// necesarios del Page.
    final String featureId;
    final bool isToday;
    final int? index;

    const FeatureNameParams({
        required this.featureId,
        this.isToday = false,
        this.index,
    });

}

class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage({
        required this.params,
    });

    final FeatureNameParams params;
}
```

#### A. QueryParams

A su vez, adicional a los parámetros convencionales de la clase `Page`, también existen los denominados `QueryParams`, que son los parámetros que provienen del `uri.queryParameters` de la ruta, y cuyos valores necesitan ser mapeados a los atributos de la clase `Params`, con la ayuda de un método `factory` denominado `fromQueryParams`.

```dart
class FeatureNameParams {

    /// Aquí se declaran todas los atributos que sean parámetros
    /// necesarios del Page.
    final String featureId;
    final bool isToday;
    final int? index;

    const FeatureNameParams({
        required this.featureId,
        this.isToday = false,
        this.index,
    });

    /// Método para obtener los parámetros provenientes del query de la ruta.
    factory FeatureNameParams.fromQueryParams(
        Map<String, dynamic> queryParams,
    ){
        return FeatureNameParams(
            featureId: queryParams['id'] ?? '',
            isToday: queryParams['isToday'] ?? false,
        );
    }

}
```

:::info
Este método factory **debe** ser utilizado en el builder respectivo de la ruta, en caso de que los parámetros pueden ser enviados dentro del mismo query, como ocurre con los `deepLinks`.
:::

## Rutas

Todos los `Pages`, al ser lo primero que se ejecuta en el flujo del código de un `feature`, **deben** tener definido su ruta o dirección, con el fin de poder navegar hacia ellos.

:::warning
Existen dos excepciones a esta regla, como lo son los `Pages` que son un `Tab` dentro un `DefaultTabController`, y los `Step` dentro de un formulario multipágina. En ninguno de estos casos se le **debe** crear una ruta a la clase. Para más información, dirigirse a su respectiva sección documentada.
:::

### Variable `routeName`

Para las rutas nombradas, se **debe** declarar una variable de tipo `String`, estática y constante denominada `routeName`, que contenga el nombre del `feature`. Ésta **debe** estar en minúsculas, y en caso de que el nombre esté conformado por múltiples palabras, se **debe** hacer uso del estilo _kebab_.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    static const routeName = 'feature-name';
}
```

En caso de que la ruta requiera de un identificador único, como en las vistas de detalles de elementos, el mismo se puede indicar luego de la ruta, seguido de una barra con dos puntos (`/:`) y el nombre del identificador.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    static const routeName = 'feature-name/:id';
}
```

### Variable `path`

Para las rutas por path se **debe** declarar una variable de tipo `String`, estática y constante denominada `path`, que debe contener una barra (`/`) seguido del valor de la variable `routeName`.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    static const path = '/$routeName';
}
```

:::warning
Todas las clases `Page` con rutas **deben** obligatoriamente tener declaradas y definidas las variables `routeName` y `path`.
:::

### Método `buildPath`

Cuando una ruta sin importar si es nombrada o por path, requiere de sustituir o agregar el valor de algún parámetro, se **debe** crear un método estático que devuelva el `String` de la ruta con los valores de las llaves. Éste método **puede** ser tan complejo y extenso como la ruta lo necesite.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    static const path = '/$routeName';
    static const routeName = 'feature-name/:id';

    /// Método para reemplazar el texto id por el valor de éste en la ruta.
    static String buildPath(String id) => '/$routeName'.replaceFirst(':id', id);
}


/// Para el feature del detalle de un contrato
class ContractDetailPage extends StatelessWidget {
    const ContractDetailPage();

    static const path = '/$routeName';
    static const routeName = 'contract/:id';

    /// Método para reemplazar los diferentes parámetros que puede o no tener la ruta.
    static String buildPath({
        required String id,
        ContractDetailsTab initialTab = ContractDetailsTab.contract,
        bool? isCommerceContract = false,
    }) {
        var customPath = '/$routeName'.replaceFirst(':id', id);
        if (initialTab.isChat) {
        customPath += '?chat=true';
        }
        if (isCommerceContract == true) {
        customPath += '?commerce=true';
        }

        customPath += '?initialTab=${initialTab.i}';

        /// Al final no necesariamente se sustituyen todos los parámetros, porque hay
        /// algunos obligatorios como el id y el initialTab, y otros que no lo son como
        /// el chat y commerce.
        return customPath;
    }
}
```

### Widget `PopScope`

En caso de que se desee que un `Page` no **pueda** regresar a la vista anterior, se **debe** implementar el widget `PopScope`. Éste **debe** ser el widget de retorno del método `build` de la clase, y **debe** incluir el atributo `canPop` en `false`.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    @override
    Widget build(BuildContext context) {

        /// Implementación del build.
        return PopScope(
            /// Este atributo inhabilita la opción de regresar a una vista anterior.
            canPop: false,
            child: MultiBlocProvider();
        );
    }
}
```

## Declaración de `BlocProviders`

Al utilizar `Bloc` como manejador de estados, el método `build` de la clase `Page` siempre **debe** retornar un `BlocProvider`, con la finalidad de crear las instancias necesarias de los `blocs` implementados en el `feature`. La única excepción a la regla es el uso del widget `PopScope`, en caso de que se desee inhabilitar la navegación hacia atrás en la vista.

Adicionalmente el atributo `child` del `BlocProvider` siempre **debe** ser un `Scaffold`, sin excepciones.

:::danger
El método `build` de la clase `Page` no **debe** retornar ningún otro widget que no sean los inidicados.
:::

### BlocProvider

Todos los `features` contienen su propio bloc, el cuál **debe** ser inyectado al árbol de `widgets` del `feature` a través de su declaración en el `BlocProvider`.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    @override
    Widget build(BuildContext context) {
        return  BlocProvider(
            create: (context) => FeatureNameBloc(
                // Aquí se inyectan las dependencias de los casos de uso y variables
                // requeridas por el Bloc.
            ),
             child: Scaffold(),
        );
    }
}
```

### MultiBlocProvider

En el caso de que el `feature` requiera de más de un `bloc`, éstos **deben** ser declarados en un `MultiBlocProvider`, el cual tiene un atributo denominado `providers`, que recibe la lista de los `BlocProviders` necesarios.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    @override
    Widget build(BuildContext context) {
        return MultiBlocProvider(
            providers: [
                BlocProvider(
                    create: (context) => FeatureNameBloc(),
                ),
                 BlocProvider(
                    create: (context) => OtherFeatureNameBloc(),
                ),
                // Se pueden declarar N BlocProviders como sean necesarios.
            ],
            child: Scaffold(),
        );
    }
}
```

## Scaffolding

Como se menciona en el artículo anterior, `BlocProvider` siempre **deben** retornar un `Scaffold`. Éste a su vez siempre **debe** contener en atributo `body`, una clase denominada `View`, que se **debe** crear siguiendo los lineamientos de su respectivo capítulo.

Por último, el `Scaffold` tiene diferentes propiedades que **pueden** ser añadidas en este punto, como el `appBar` o los botones en la lista de widgets `persistentFooterButtons`.

```dart
class FeatureNamePage extends StatelessWidget {
    const FeatureNamePage();

    @override
    Widget build(BuildContext context) {
        return  BlocProvider(
            create: (context) => FeatureNameBloc(),
             child: Scaffold(
                /// El body siempre debe ser un widget View.
                body: FeatureNameView(),
             ),
        );
    }
}
```

:::info
Para mayor información y detalle sobre el widget `Scaffold`, referirse a su respectiva [documentación oficial](https://api.flutter.dev/flutter/material/Scaffold-class.html?gad_source=1&gclid=Cj0KCQjw3vO3BhCqARIsAEWblcAJIF3pi9BEp9KkxvOTG4RBKNWAfODEH5_bkzftfWqrnHw57wkwJUIaAoXJEALw_wcB&gclsrc=aw.ds).
:::
