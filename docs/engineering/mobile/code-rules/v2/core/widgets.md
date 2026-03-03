---
sidebar_position: 12
---

# Widgets compartidos

`lib/core/widgets/` contiene los building blocks de UI reutilizables organizados por categoría. Son widgets **feature-agnostic**: no contienen lógica de negocio ni dependen de BLoCs de features específicos.

## Catálogo

| Carpeta | Contenido |
|---|---|
| `wrappers/` | Listeners globales del árbol raíz |
| `buttons/` | Botones de uso común |
| `inputs/` | Campos de texto y entradas especializadas |
| `bottom_sheets/` | Sheets de sistema para permisos, servicios, pagos |
| `cards/` | Tarjetas para distintos tipos de datos |
| `layout/` | Contenedores y layouts base |
| `app_bars/` | AppBars personalizados |
| `bottom_navigation_bar/` | Barra de navegación inferior |
| `list_tile/` | Tiles de lista |
| `tags/` | Badges y etiquetas de estado |
| `skeletons/` | Placeholders de carga |
| `loaders/` | Spinners e indicadores de progreso |
| `snack_bars/` | Snackbars personalizados |
| `general/` | Widgets de propósito general |

## Cuándo un widget pertenece al core

Un widget debe vivir en `lib/core/widgets/` si cumple **todos** estos criterios:

### 1. Es completamente feature-agnostic

El widget no importa nada de `lib/src/[feature]/`. Funciona con datos que le pasan por props, sin conocer el dominio de ningún feature.

```dart
// ✅ Pertenece al core — solo datos primitivos o entidades genéricas
class EmptyInfoWidget extends StatelessWidget {
  const EmptyInfoWidget({required this.message, this.icon, super.key});

  final String message;
  final IconData? icon;
  ...
}

// ❌ No pertenece al core — depende de un dominio específico
class ProductCardWidget extends StatelessWidget {
  const ProductCardWidget({required this.product, super.key});

  final Product product;  // Product es del dominio de products
  ...
}
```

### 2. Es usado por al menos dos features distintos

Si solo un feature usa el widget, pertenece en `lib/src/[feature]/presentation/widgets/`.

### 3. No tiene estado de negocio propio

Los widgets del core son `StatelessWidget` o tienen estado únicamente de UI (animaciones, scroll, interacciones). No hacen llamadas a repositorios ni contienen BLoCs de features.

## Reglas para agregar un nuevo widget al core

### 1. Definir la carpeta correcta

Agregar el widget a la subcarpeta temática que mejor corresponda. Si no existe una categoría adecuada, crear una nueva.

### 2. Solo props, sin dependencias ocultas

El widget recibe **todo** lo que necesita por constructor. No accede a BLoCs de features con `context.read<FeatureBloc>()` internamente.

```dart
// ✅ Correcto — todo por props
class InfoCard extends StatelessWidget {
  const InfoCard({
    required this.title,
    required this.subtitle,
    this.onTap,
    super.key,
  });

  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  ...
}

// ❌ Incorrecto — dependencia oculta de un BLoC de feature
class InfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final productBloc = context.read<ProductBloc>(); // acoplamiento oculto
    ...
  }
}
```

### 3. Usar el design system

Los widgets del core **siempre** usan las constantes de `variables/` y los estilos de `theme/`. Nunca hardcodean colores, tamaños o fuentes.

```dart
// ✅ Correcto
Container(
  padding: EdgeInsets.all(AppSpacing.md),
  color: context.colorScheme.surface,
)

// ❌ Incorrecto
Container(
  padding: EdgeInsets.all(16),
  color: Colors.white,
)
```

### 4. Barrel file de la categoría

Agregar el nuevo widget al barrel file de su carpeta:

```dart title="lib/core/widgets/buttons/buttons.dart"
export 'custom_text_button.dart';
export 'custom_back_button.dart';
export 'base_layout_action_button.dart';
export 'copy_button.dart';
export 'new_button.dart';  // ← nuevo
```

## Estructura de archivos

```
lib/
└── core/
    └── widgets/
        ├── wrappers/
        │   └── wrappers.dart
        ├── buttons/
        │   └── buttons.dart
        ├── inputs/
        │   └── inputs.dart
        ├── bottom_sheets/
        │   └── bottom_sheets.dart
        ├── cards/
        │   └── cards.dart
        ├── layout/
        │   └── layout.dart
        ├── app_bars/
        │   └── app_bars.dart
        ├── bottom_navigation_bar/
        │   └── bottom_navigation_bar.dart
        ├── list_tile/
        │   └── list_tile.dart
        ├── tags/
        │   └── tags.dart
        ├── skeletons/
        │   └── skeletons.dart
        ├── loaders/
        │   └── loaders.dart
        ├── snack_bars/
        │   └── snack_bars.dart
        ├── general/
        │   └── general.dart
        └── svg/
            └── svg.dart
```
