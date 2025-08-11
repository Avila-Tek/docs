# Body

Este capítulo describe todo lo necesario para elaborar correctamente la clase `Body`, dentro del archivo `widgets/feature_body.dart`.

## Nombrado

El nombre de la clase `Body` de un `feature` **debe** estar compuesto por el nombre de éste último, seguido del sufijo `Body`, escrito con el estilo _PascalCase_.

```dart
/// Para el feature de iniciar sesión.
class LoginBody {}

/// Para el feature de un perfil.
class ProfileBody {}

/// Para el feature del detalle de un contrato.
class ContractDetailBody {}
```

:::info
El nombrado de ésta clase es generado automáticamente por el `feature_brick`.
:::

## Extensión

Los `Body` siempre que sea posible **deben** extender de la clase abstracta `StatelessWidget`. Sin embargo, es muy común que se requiera el uso de algún `mixin` como `AutomaticKeepAliveClientMixin`, `TickerProviderStateMixin`, entre otros, que requieren de que la clase extienda de `StatefulWidget`. Todo dependerá de lo que ésta clase necesite.

## Constructor

El constructor de la clase `Body` **debe** ser constante.

```dart
class FeatureNameBody extends StatelessWidget {
    const FeatureNameBody();
}
```

## Definición de parámetros

Son muy pocos los casos en los que un `Body` necesita definir algún parámetro, pero cuando lo son, estos **deben** ser definidos como finales.

```dart
class FeatureNameBody extends StatelessWidget {
    const FeatureNameBody({
        required this.controller,
    });

    final RefreshController controller;
}
```
