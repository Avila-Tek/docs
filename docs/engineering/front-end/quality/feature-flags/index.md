---
title: Feature flags
sidebar_position: 1
slug: /frontend/quality/feature-flags
---

# Feature flags

## Overview

Las feature flags, también conocidas como feature toggles o flags, son una técnica de desarrollo de software que permite activar o desactivar funcionalidades específicas de una aplicación sin necesidad de volver a desplegar el código. Se implementan mediante condicionales en el código que verifican el estado de una flag antes de ejecutar una determinada funcionalidad.

### ¿Para qué sirven?

- **Lanzar nuevas funcionalidades de forma controlada**: Permiten liberar una nueva característica a un grupo reducido de usuarios (beta testers) antes de habilitarla para el resto, lo que ayuda a detectar posibles errores o problemas de rendimiento en un entorno real.
- **Realizar pruebas A/B**: Facilitan la comparación del rendimiento de diferentes versiones de una funcionalidad para determinar cuál ofrece mejores resultados.
- **Activar o desactivar funcionalidades según el contexto**: Permiten adaptar el comportamiento de la aplicación en función de factores como la ubicación geográfica, el tipo de usuario o el dispositivo utilizado.
- **Gestionar el riesgo**: Ofrecen la posibilidad de desactivar rápidamente una funcionalidad en caso de que cause problemas o no cumpla las expectativas.
- **Experimentar con nuevas ideas**: Permiten probar nuevas funcionalidades sin comprometer la estabilidad de la aplicación principal.

En resumen, las feature flags son una herramienta muy útil para los desarrolladores de software que buscan mejorar la flexibilidad, el control y la seguridad en el proceso de creación y mantenimiento de aplicaciones.
