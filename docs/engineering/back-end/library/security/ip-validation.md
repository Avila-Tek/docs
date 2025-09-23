---
title: Validación de IPs
sidebar_position: 4
slug: /backend/security/ip-validation
keywords: [library, security, ips, validations]
---

Al momento que queramos hacer una validación de IPs mediante un whitelist, hay varias cosas que tenemos que tomar en consideración. En este artículo veremos cada una de ellas y como esto nos lleva a la implementación final.

## El flujo de una IP ✉️

Es normal pensar que los request que recibimos en nuestras APIs provienen directamente desde el cliente, pero la realidad es que es bastante frecuente que hayan intermediarios de por medio, los cuales llamamos reverse proxies. Estos servicios proveen diferentes funcionalidades: Render provee balanceadores de carga para nuestro proyectos, Cloudflare puede ayudar con temas de seguridad, etc.

Con esto en mente, la realidad es que cuando recibimos un request, es probable que la IP actual que detectemos ya no sea necesariamente la del cliente original. Sin embargo, esta información no se pierde. El estándar de la industria es utilizar un header HTTP llamado `X-Forwarded-For` para ir almacenando las IPs de los servicios previos:

<div style={{textAlign:'center', margin:'0px 0px 20px 0px'}}>
  <img src="/img/backend/security/reverse-proxy.png" />
</div>

Usando esta imagen como ejemplo, podemos ver que la IP del cliente original sigue presente en el request dentro del header que mencionamos antes. Lo que ocurrió es que cada reverse proxy tuvo la tarea de hacer append de las IPs anteriores a este header.

## El whitelist ✅

Para poder validar las IPs de un whitelist con lo que acabamos de ver todo pareciera ser bastante sencillo, pero en realidad no tanto. Hay ciertas consideraciones de seguridad que debemos tomar en cuenta:

### Spoofing 🎭

En ciberseguridad tenemos el concepto de spoofing, que usamos para ataques donde un usuario no autorizado se hace pasar por otra persona, servicio o entidad. Hay diferentes maneras en que este tipo de ataques pueden ocurrir, pero uno de ellos es la introducción de IPs en headers HTTP esperando que las validaciones del servidor no noten nada extraño.

<div style={{textAlign:'center', margin:'0px 0px 20px 0px'}}>
  <img src="/img/backend/security/reverse-proxy-spoofing.png" />
</div>

Nuevamente, usando esta imagen como ejemplo, un atacante introduciría la IP de algún servicio externo que nosotros usemos. Si no tenemos cuidado con nuestras validaciones y solamente buscamos cualquier IP válida dentro del header `X-Forwarded-For`, este ataque acabaría siendo exitoso.

### La implementación 🔧

Es por esto que las validaciones de IPs al utilizar este header deben seguir un orden específico:

1. Idealmente debemos tener la lista de IPs disponibles por cada reverse proxy que conozcamos en nuestro sistema (en este ejemplo vendrían siendo Cloudflare y Render).
2. Validar que todas las IPs desde el final en adelante del header provengan de las fuentes que esperamos.
3. Finalmente es que debemos validar si la IP inmediatamente a continuación es del servicio que esperemos, de lo contrario algo raro ocurrió.

<div style={{textAlign:'center', margin:'0px 0px 20px 0px'}}>
  <img src="/img/backend/security/x-forwarded-for-sample.png" style={{width:'60%'}} />
</div>

El atacante solo puede llegar tan lejos como introducir la primera IP en el header. De ahí en adelante no tiene más control sobre los servicios por los que pasa el request.

Es importante validar que la fuente de origen sean los proxies esperados, puesto que un atacante también puede intentar alterar el request mandado el mismo header múltiples veces, esperando que alguno de los servicios o nuestro propio código se confundan y llegue inalterado a la validación final:

```
GET /webhook HTTP/1.1
Host: your-api.com
X-Forwarded-For: 203.0.113.1
X-Forwarded-For: 198.51.100.9
```
