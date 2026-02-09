---
title: Cómo empezar un proyecto
sidebar_position: 1
slug: /frontend/onboarding/starting-a-project
---

import Note from '@site/src/components/Note/index.mdx';

# Cómo empezar un proyecto

### Instalación de dependencias

Para instalar las dependencias del proyecto escribimos lo siguiente en el root del proyecto:

```sh
npm i
```
Para instalar nuevas dependencias en nuestras aplicaciones escribimos lo siguiente en el root del proyecto:

```sh
npm i <dependencia> --workspace=<nombre del workspace>

// Ejemplo
npm i framer-motion --workspace=@avila-tek/client
npm i dayjs --workspace=@avila-tek/ui
```

<Note title="Tip" type="tip">
El nombre del workspace lo puedes conseguir en el `package.json` de dicho workspace, además puedes instalar nuevas dependencias dentro del workspace correspondiente tipo **`~/apps/client$ npm i <dependencia>`**.
</Note>