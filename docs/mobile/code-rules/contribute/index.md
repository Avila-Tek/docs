---
title: Guía de contribución al Reglamento
---

# Guía de contribución al Reglamento de Estilo de Código

Esta guía describe cómo contribuir al **Reglamento de Estilo de Código del equipo móvil (RECOM)** y tiene como objetivo mantener coherencia en la estructura y contenido del reglamento, así como proporcionar un enfoque objetivo del formato de la documentación.

### Estructura del Reglamento

- El RECOM está compuesto en un primer nivel por _libros_. Los **libros** son un conjunto de _capítulos_ relacionados entre sí.
- Los **capítulos** representan un tema o ámbito general y está compuesto por una serie de _secciones_.
- Las **secciones** son temas específicos del capítulo que las incluye y se componen de _artículos_
- Los **artículos** describen las reglas que se aplican a cada elemento del código. Algunos artículos pueden contener _incisos_.
- Los **incisos** que son detalles o excepciones a las reglas descritas por el artículo que los incluye. Estos son opcionales.

#### Ejemplo de estructura del Reglamento

```markdown
# Data sources <!-- (Capítulo) -->

<!-- Introducción del capítulo -->

## Clases <!-- (Sección) -->

<!-- Descripción breve de la sección (Opcional) -->

### Nombrado de clases <!-- (Artículo 1) -->

#### A. Nombrado de interfaces <!-- (Inciso A) -->

#### B. Nombrado de implementaciones de servicios GraphQL <!-- (Inciso B) -->

### Herencia de clases <!-- (Artículo 2) -->
```

Generalmente, el nombre del Libro no se incluye en el cuerpo de las páginas de la documentación sino que se incluye en la barra de navegación de la página.

### Reglas de titulación

Los títulos de los libros, capítulos, secciones y artículos deben cumplir con las siguientes reglas:

- Los capítulos usan títulos de primer nivel (`#`)
- Las secciones usan títulos de segundo nivel (`##`)
- Los artículos usan títulos de tercer nivel (`###`)
- Los incisos usan títulos de cuarto nivel (`####`)

### Reglas de nombramiento

Los libros, capítulos, secciones y artículos de forma breve y clara, con la primera letra en mayúscula.

Los acrónimos y abreviaturas deben ser escritas en mayúsculas. Evitar abreviaturas y acrónimos en libros, capítulos y secciones, con excepción de los artículos e incisos en el cual su uso es aceptado.

### Reglas de enumeración de incisos

Los incisos de cada artículo deben ser identificados con letras mayúsuculas en orden alfabético. Por ejemplo, el primer inciso de un artículo se identifica con `A.`, el segundo con `B.` y así sucesivamente.

### Introducción de capítulos

Cada capítulo debe tener una introducción que describa de forma breve y general su contenido. Si alguna de las secciones, artículos o incisos del capítulo hacen uso de siglas o acrónimos, se debe hacer uso explicito de la abreviatura o acrónimo en la introducción con el término completo en español seguido de las siglas o acrónimo en mayúscula y dentro de paréntesis.

### Introducción de secciones

Las secciones pueden tener una introducción que describa de forma breve y general su contenido pero no es obligatoria.

### Uso de siglas y acrónimos

#### Escritura

**Puntos y espacios**: Las siglas y acrónimos deben escribirse en mayúsculas, sin incluir puntos o espacios.

> NIF [y no N.I.F. ni N I F]

**Uso en títulos**: Evitar siglas y acrónimos en los títulos de libros, capítulos y secciones, con excepción de los títulos de artículos e incisos en el cual su uso es aceptado siempre que se haya declarado de forma explícita la sigla o acrónimo en la introducción del capítulo.

**Uso dentro de un texto**: La primera vez que se hace uso de una sigla o acrónimo en una página se debe escribir entre paréntesis después del nombre correspondiente.

> [...] La Organización de las Naciones Unidas (ONU) es una organización internacional que tiene como objetivo promover la paz, la seguridad y la estabilidad en el mundo.

Las siglas y los acrónimos lexicalizados se escriben con minúsculas.

> bit (binary digit)
>
> radar (radio detecting and ranging, 'detección y localización por radio')

#### Traducción

La primera vez que se hace uso de siglas o acrónimos de origen extranjero deben venir procedidas del nombre correspondiente en el idioma original.

Es recomendable incluir una descripción corta del término extranjero, a excepción de aquellos términos ampliamente utilizados y conocidos por el público en general.

> [...] DNS (Domain Name System) es un servicio de nombres de dominio que se utiliza para resolver nombres de dominio a direcciones IP.

## Redacción de Artículos

#### Uso de la forma impersonal

Los artículos se escriben de forma impersonal y en lenguaje simple.

> ✅ Las clases deben ser nombradas en inglés (impersonal)

> ❌ Debes nombrar las clases en inglés (personal)

#### Traducción de términos

Favorece el uso de términos en español, salvo aquellos que sean ampliamente conocidos por el público en general en inglés o su traducción al español no se adecue al contexto o introduzca confusión en el significado.

> ✅ Para realizar un cambio en el código, debe hacerse por medio de un **Pull Request** (PR) en GitHub
>
> **Explicación**: Pull Request es un término ampliamente conocido y su traducción al español, Solicitud de Extracción, sería confusa y poco relacionable.

> ❌ Las **entities** describen las partes fundamentales de la aplicación
>
> **Explicación**: El término **entidad** es aceptable y debe preferirse en este contexto.

#### Debe vs. puede

Los verbos _debe_ y _puede_ se usan para expresar la imperatividad de una regla. El verbo _debe_ se usa cuando es obligatorio seguir la regla, mientras que el verbo _puede_ se usa para expresar la posibilidad de una acción, pero no es obligatoria.

La negación de los verbos _debe_ y _puede_ tiene un significado diferente. _No puede_ significa la imposibilidad física de hacer algo, mientras que _no debe_ significa que una acción no es recomendable pero se está en la facultad de hacerla.

Por ejemplo:

> **No puedo** caminar en el Sol: Es imposible.
>
> **No debo** robar: Es delictivo.

:::note
Para efectos de claridad, aquellas reglas que indiquen la prohibición de algo, deben hacer uso únicamente del verbo _no debe_. Evitar el uso del verbo _no puede_.
:::

El uso en artículos de los verbos _debe_ y _puede_, así como su negación, deben ir en negrita.

> Las reglas de código **deben** ser respetadas.
>
> Los miembros del equipo **pueden** sugerir mejoras a las reglas de código.
>
> Las reglas **no deben** ser agregadas sin justificación y **deben** ser revisadas y aprobadas por el equipo antes de ser implementadas.

### Uso de ejemplos en artículos

Los ejemplos en artículos deben ser breves y concisos, y deben incluir el contexto y el resultado o implementación esperados.

Aquellos ejemplos que incluyan código deben ser escritos dentro de [bloques de código](https://docusaurus.io/docs/markdown-features/code-blocks) y deben incluir el lenguaje de [resaltado de sintaxis](https://docusaurus.io/docs/markdown-features/code-blocks#syntax-highlighting) correspondiente. Evitar incluir detalles irrelevantes en el ejemplo, como cuerpo de funciones, variables locales, etc. Por ejemplo:

```dart title="Regla de nombrado de clases"
// ✅ Incluye lo mínimo necesario para entender la regla
class User { }

// ❌ Incluye detalles irrelevantes a la regla (variable `name` y
// constructor)
class User {
  User(this.name);

  String name;
}
```

### Referencia de artefactos de código

Las referencias a artefactos de código como clases, métodos, funciones, variables, nombre de archivos, rutas, etc. deben hacerse con bloques de código en línea (usando _backticks_ ``).

> La clase `User` se encuentra en el archivo `user.dart`.

## Referencias

Cervantes, C. V. (2000, March 1). CVC. Foros. Instituto Cervantes. https://cvc.cervantes.es/foros/leer_asunto1.asp?vCodigo=55924

Colaboradores de Wikipedia. (2024, June 24). Reglamento. Wikipedia, La Enciclopedia Libre. https://es.wikipedia.org/wiki/Reglamento#:~:text=De%20manera%20general%20un%20reglamento,un%20solo%20contenido%20sin%20ambig%C3%BCedades.

De Catalunya, U. O. (n.d.). Siglas y acrónimos - Lengua y estilo de la UOC. https://www.uoc.edu/portal/es/servei-linguistic/convencions/abreviacions/sigles-acronims/index.html
