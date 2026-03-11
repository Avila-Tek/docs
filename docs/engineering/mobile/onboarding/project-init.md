---
sidebar_position: 2
title: Como iniciar un proyecto
keywords: [project, init, atmos_cli, flutter, crear proyecto]
---

# 🚀 Cómo iniciar un proyecto

En Avila Tek usamos **atmos_cli** para crear proyectos Flutter. Es un fork de `very_good_cli` con configuraciones y automatizaciones propias del equipo.

:::info Repositorio
[github.com/andrespd99/atmos_cli](https://github.com/andrespd99/atmos_cli) · [pub.dev/packages/atmos_cli](https://pub.dev/packages/atmos_cli)
:::

---

## 🛠️ Instalación

Activa el CLI globalmente con:

```bash
dart pub global activate atmos_cli
```

Para actualizar a la última versión:

```bash
atmos update
```

:::tip Verifica la instalación
Ejecuta `atmos --version` para confirmar que quedó instalado correctamente.
:::

---

## 📱 Crear una Flutter app

```bash
atmos create flutter_app <nombre_del_proyecto> \
  --desc "Descripción del proyecto" \
  --org com.avilatek
```

**Ejemplo:**

```bash
atmos create flutter_app mi_app \
  --desc "App de gestión de usuarios" \
  --org com.avilatek
```

### Flags disponibles

| Flag | Descripción |
|------|-------------|
| `--desc` | Descripción del proyecto |
| `--org` | Identificador de la organización (usar `com.avilatek`) |
| `--application-id` | ID personalizado si difiere del org |
| `--template` | Variante de template (ej: `wear`) |

---

## ⚡ Lo que el CLI configura automáticamente

Al correr `atmos create flutter_app`, el CLI realiza las siguientes configuraciones sin intervención manual:

- **FVM** — Instala y configura Flutter Version Management con la versión estable más reciente
- **README** — Genera documentación inicial con instrucciones de lanzamiento
- **CI/CD con Codemagic** — Configura pipelines para los ambientes `dev`, `staging` y `production`
- **Routing** — Añade boilerplate de Go Router
- **Theming** — Scaffold del sistema de temas a partir de una paleta de colores
- **Firebase** — Configura entornos aislados por flavor (dev/staging/prod) para iOS y Android

:::note Flavors
El proyecto se crea con tres flavors preconfigurados: `development`, `staging` y `production`, cada uno con su propia configuración de Firebase.
:::

---

## 🧪 Otros comandos útiles

### Ejecutar pruebas

```bash
# Correr todos los tests
atmos test

# Con cobertura
atmos test --coverage

# Exigir un mínimo de cobertura
atmos test --coverage --min-coverage 80

# Recursivo (para monorepos o workspaces)
atmos test -r
```

### Instalar paquetes

```bash
atmos packages get
```

### Validar licencias de dependencias

```bash
atmos packages check licenses --allowed="MIT,Apache-2.0,BSD-3-Clause"
```

---

## 📦 Otros templates disponibles

| Comando | Descripción |
|---------|-------------|
| `atmos create dart_package` | Paquete de Dart |
| `atmos create flutter_package` | Paquete de Flutter |
| `atmos create flutter_plugin` | Plugin de Flutter |
| `atmos create dart_cli` | CLI en Dart |
| `atmos create docs_site` | Sitio de documentación |
| `atmos create flame_game` | Juego con Flame |
