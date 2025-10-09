---
sidebar_position: 5
title: Pruebas de estrés
description: Todo lo relacionado a generación automática de pruebas de estrés
---

# Agregar Proyectos al Sistema de Generación Automática de Reportes de Estrés

Esta guía explica cómo los desarrolladores pueden contribuir y agregar sus proyectos al sistema de pruebas de estrés y generación automática de reportes utilizado por la Fábrica de Software Avila-Tek.

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Requisitos de Estructura del Proyecto](#requisitos-de-estructura-del-proyecto)
3. [Archivos de Configuración](#archivos-de-configuración)
4. [Desarrollo de Scripts de Prueba K6](#desarrollo-de-scripts-de-prueba-k6)
5. [Integración con Prometheus](#integración-con-prometheus)
6. [Notificaciones por Email](#notificaciones-por-email)
7. [Pruebas de tu Proyecto](#pruebas-de-tu-proyecto)
8. [Integración CI/CD](#integración-cicd)
9. [Mejores Prácticas](#mejores-prácticas)
10. [Resolución de Problemas](#resolución-de-problemas)
11. [Ejemplos y Plantillas](#ejemplos-y-plantillas)

## 🎯 Resumen

El sistema de pruebas de estrés automático permite a los desarrolladores:

- Ejecutar pruebas de carga en sus aplicaciones usando k6
- Generar reportes PDF completos con métricas de rendimiento
- Integrar con Prometheus para métricas del servidor
- Enviar notificaciones por email automáticas
- Subir reportes a S3 para almacenamiento centralizado
- Usar análisis con IA para insights de rendimiento

## 📁 Requisitos de Estructura del Proyecto

Cada proyecto debe seguir esta estructura exacta de carpetas:

```
projects/
└── tu-nombre-proyecto/
    ├── test.js                    # Script principal de k6 (REQUERIDO)
    ├── config.json                # Configuración de email y notificaciones (REQUERIDO)
    ├── prometheus_config.json     # Configuración de integración con Prometheus (REQUERIDO)
    ├── results.json               # Generado por k6 (auto-generado)
    ├── summary.json               # Generado por k6 (auto-generado)
    └── scripts/                   # Opcional: Módulos adicionales de prueba
        ├── common.js              # Utilidades compartidas
        ├── auth.js                # Ayudantes de autenticación
        └── endpoints.js           # Definiciones de endpoints de API
```

### Archivos Requeridos

1. **`test.js`** - Script principal de k6
2. **`config.json`** - Configuración de email y notificaciones
3. **`prometheus_config.json`** - Configuración de métricas de Prometheus

### Archivos Auto-Generados

Estos archivos se crean automáticamente cuando se ejecutan las pruebas:

- `results.json` - Resultados detallados de la prueba
- `summary.json` - Métricas de resumen de la prueba
- `report.html` - Reporte HTML de k6

## ⚙️ Archivos de Configuración

### 1. config.json - Email y Notificaciones

Este archivo controla las notificaciones por email y la configuración de reportes.

#### Estructura Básica

```json
{
  "email": {
    "enabled": true,
    "recipients": ["developer@avilatek.dev", "team-lead@avilatek.dev"],
    "subject_template": "Reporte de Prueba de Carga - {project_name}",
    "include_s3_link": true
  },
  "notifications": {
    "on_success": true,
    "on_failure": true,
    "include_test_summary": true
  }
}
```

#### Explicación Detallada de Campos

**Sección `email`:**

- `enabled` (boolean): Habilita o deshabilita las notificaciones por email
- `recipients` (array): Lista de direcciones de email que recibirán los reportes
- `subject_template` (string): Plantilla del asunto del email. Usa `{project_name}` para el nombre del proyecto
- `include_s3_link` (boolean): Incluye enlace de descarga de S3 en el email

**Sección `notifications`:**

- `on_success` (boolean): Enviar notificaciones cuando las pruebas sean exitosas
- `on_failure` (boolean): Enviar notificaciones cuando las pruebas fallen
- `include_test_summary` (boolean): Incluir resumen de la prueba en la notificación

#### Ejemplos de Configuración

**Configuración Mínima:**

```json
{
  "email": {
    "enabled": true,
    "recipients": ["tu-email@avilatek.dev"],
    "subject_template": "Test Report - {project_name}",
    "include_s3_link": true
  },
  "notifications": {
    "on_success": true,
    "on_failure": true,
    "include_test_summary": true
  }
}
```

**Configuración Avanzada:**

```json
{
  "email": {
    "enabled": true,
    "recipients": [
      "desarrollador@avilatek.dev",
      "tech-lead@avilatek.dev",
      "qa-team@avilatek.dev"
    ],
    "subject_template": "[{project_name}] Reporte de Pruebas de Carga - {timestamp}",
    "include_s3_link": true
  },
  "notifications": {
    "on_success": true,
    "on_failure": true,
    "include_test_summary": true
  }
}
```

### 2. prometheus_config.json - Integración con Prometheus

Este archivo configura la integración con Prometheus para obtener métricas del servidor durante las pruebas.

#### Estructura Básica

```json
{
  "prometheus": {
    "url": "https://tu-instancia-prometheus/api/prom",
    "auth": {
      "type": "basic",
      "username": "tu_usuario",
      "password": "tu_contraseña",
      "bearer_token": ""
    },
    "queries": {
      "cpu_usage": "tu_query_cpu_aqui",
      "memory_usage_percentage_over_time": "tu_query_memoria_aqui",
      "disk_io_utilization_over_time": "tu_query_disco_aqui",
      "network_traffic_bytes_per_second": "tu_query_red_aqui"
    }
  }
}
```

#### Explicación Detallada de Campos

**Sección `prometheus`:**

- `url` (string): URL de tu instancia de Prometheus (debe incluir `/api/prom`)

**Sección `auth`:**

- `type` (string): Tipo de autenticación - "basic" o "bearer"
- `username` (string): Usuario para autenticación básica
- `password` (string): Contraseña para autenticación básica
- `bearer_token` (string): Token para autenticación Bearer (dejar vacío si usas basic)

**Sección `queries`:**

- `cpu_usage`: Query para obtener uso de CPU
- `memory_usage_percentage_over_time`: Query para obtener uso de memoria
- `disk_io_utilization_over_time`: Query para obtener utilización de disco
- `network_traffic_bytes_per_second`: Query para obtener tráfico de red

#### Queries de Prometheus Comunes

**Para Node Exporter (más común):**

```json
{
  "queries": {
    "cpu_usage": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
    "memory_usage_percentage_over_time": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
    "disk_io_utilization_over_time": "rate(node_disk_io_time_seconds_total[5m]) * 100",
    "network_traffic_bytes_per_second": "rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])"
  }
}
```

**Para Aplicaciones Específicas:**

```json
{
  "queries": {
    "cpu_usage": "rate(process_cpu_seconds_total{job=\"tu-app\"}[5m]) * 100",
    "memory_usage_percentage_over_time": "process_resident_memory_bytes{job=\"tu-app\"} / 1024 / 1024",
    "disk_io_utilization_over_time": "rate(process_disk_io_read_bytes{job=\"tu-app\"}[5m]) + rate(process_disk_io_write_bytes{job=\"tu-app\"}[5m])",
    "network_traffic_bytes_per_second": "rate(process_network_receive_bytes{job=\"tu-app\"}[5m]) + rate(process_network_transmit_bytes{job=\"tu-app\"}[5m])"
  }
}
```

#### Ejemplos de Configuración

**Configuración con Autenticación Básica:**

```json
{
  "prometheus": {
    "url": "https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom",
    "auth": {
      "type": "basic",
      "username": "1787269",
      "password": "glc_e...",
      "bearer_token": ""
    },
    "queries": {
      "cpu_usage": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "memory_usage_percentage_over_time": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
      "disk_io_utilization_over_time": "rate(node_disk_io_time_seconds_total[5m]) * 100",
      "network_traffic_bytes_per_second": "rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])"
    }
  }
}
```

**Configuración con Bearer Token:**

```json
{
  "prometheus": {
    "url": "https://tu-instancia-prometheus/api/prom",
    "auth": {
      "type": "bearer",
      "username": "",
      "password": "",
      "bearer_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "queries": {
      "cpu_usage": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "memory_usage_percentage_over_time": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
      "disk_io_utilization_over_time": "rate(node_disk_io_time_seconds_total[5m]) * 100",
      "network_traffic_bytes_per_second": "rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])"
    }
  }
}
```

## 🧪 Desarrollo de Scripts de Prueba K6

### 3. test.js - Script Principal de Pruebas

Este es el archivo más importante de tu proyecto. Contiene toda la lógica de las pruebas de carga usando k6.

#### Estructura Básica de un test.js

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { Counter } from 'k6/metrics';

// Métricas personalizadas para tracking
const http2xx3xxResponses = new Counter('http_status_2xx_3xx');
const http4xxResponses = new Counter('http_status_4xx');
const http5xxResponses = new Counter('http_status_5xx');

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up
    { duration: '2m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  // Tu lógica de prueba aquí
  const response = http.get('https://tu-api.com/endpoint');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
    'report.html': htmlReport(data),
  };
}
```

#### Explicación Detallada de Cada Sección

**1. Imports Necesarios:**

```javascript
import http from 'k6/http'; // Para hacer requests HTTP
import { check, sleep } from 'k6'; // Para validaciones y pausas
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'; // Para resumen en consola
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'; // Para reporte HTML
import { Counter } from 'k6/metrics'; // Para métricas personalizadas
```

**2. Métricas Personalizadas:**

```javascript
// Contadores para diferentes códigos de respuesta
const http2xx3xxResponses = new Counter('http_status_2xx_3xx');
const http4xxResponses = new Counter('http_status_4xx');
const http5xxResponses = new Counter('http_status_5xx');

// También puedes crear métricas más específicas
const apiResponseTime = new Counter('api_response_time');
const businessLogicErrors = new Counter('business_logic_errors');
```

**3. Configuración de Opciones (options):**

```javascript
export const options = {
  // Patrones de carga - define cómo se comportan los usuarios virtuales
  stages: [
    { duration: '30s', target: 5 }, // Subir gradualmente a 5 usuarios en 30s
    { duration: '1m', target: 10 }, // Mantener 10 usuarios por 1 minuto
    { duration: '2m', target: 20 }, // Subir a 20 usuarios por 2 minutos
    { duration: '1m', target: 0 }, // Bajar a 0 usuarios en 1 minuto
  ],

  // Umbrales de rendimiento - define qué se considera exitoso
  thresholds: {
    // Tiempo de respuesta general
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],

    // Tasa de errores
    http_req_failed: ['rate<0.05'], // Menos del 5% de errores

    // Tasa de checks exitosos
    checks: ['rate>0.95'], // 95% de checks deben pasar

    // Umbrales específicos por endpoint
    'http_req_duration{name:GET /api/users}': ['p(95)<1000'],
    'http_req_duration{name:POST /api/login}': ['p(95)<2000'],
  },

  // Configuración adicional
  noConnectionReuse: true, // No reutilizar conexiones
  discardResponseBodies: false, // Mantener cuerpos de respuesta
  timeout: '30s', // Timeout por request
};
```

**4. Función Principal (export default function):**

```javascript
export default function () {
  // Esta función se ejecuta para cada usuario virtual

  // Ejemplo: Probar endpoint de login
  const loginPayload = {
    username: 'test_user',
    password: 'test_password',
  };

  const loginResponse = http.post(
    'https://api.example.com/login',
    JSON.stringify(loginPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /login' },
    }
  );

  // Validar respuesta
  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 2s': (r) => r.timings.duration < 2000,
    'login returns token': (r) => {
      try {
        const data = r.json();
        return data.token !== undefined;
      } catch {
        return false;
      }
    },
  });

  // Pausa entre requests
  sleep(1);
}
```

**5. Función de Resumen (handleSummary):**

```javascript
export function handleSummary(data) {
  return {
    // Resumen en consola
    stdout: textSummary(data, { indent: ' ', enableColors: true }),

    // Archivo JSON con datos detallados (requerido para el generador de reportes)
    'summary.json': JSON.stringify(data, null, 2),

    // Reporte HTML de k6
    'report.html': htmlReport(data),
  };
}
```

#### Patrones de Carga Comunes

**1. Prueba de Carga Gradual:**

```javascript
stages: [
  { duration: '2m', target: 10 }, // Ramp up lento
  { duration: '5m', target: 10 }, // Mantener carga
  { duration: '2m', target: 0 }, // Ramp down
];
```

**2. Prueba de Estrés:**

```javascript
stages: [
  { duration: '1m', target: 10 },
  { duration: '2m', target: 50 },
  { duration: '2m', target: 100 },
  { duration: '2m', target: 200 },
  { duration: '1m', target: 0 },
];
```

**3. Prueba de Spike:**

```javascript
stages: [
  { duration: '1m', target: 10 },
  { duration: '1m', target: 100 }, // Spike súbito
  { duration: '1m', target: 10 }, // Volver a normal
  { duration: '1m', target: 0 },
];
```

#### Ejemplos de Tests Específicos

**1. Test de API REST Simple:**

```javascript
export default function () {
  // Test de health check
  const healthResponse = http.get('https://api.example.com/health');
  check(healthResponse, {
    'health check status': (r) => r.status === 200,
  });

  // Test de endpoint principal
  const dataResponse = http.get('https://api.example.com/api/data');
  check(dataResponse, {
    'data endpoint status': (r) => r.status === 200,
    'data response time': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

**2. Test de API con Autenticación:**

```javascript
let authToken = null;

export function setup() {
  // Obtener token de autenticación
  const loginResponse = http.post('https://api.example.com/auth/login', {
    username: 'test_user',
    password: 'test_password',
  });

  if (loginResponse.status === 200) {
    const data = loginResponse.json();
    authToken = data.token;
  }

  return { authToken };
}

export default function (data) {
  const token = data.authToken;

  // Usar token en requests autenticados
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = http.get('https://api.example.com/api/protected', {
    headers,
  });
  check(response, {
    'authenticated request status': (r) => r.status === 200,
  });

  sleep(1);
}
```

**3. Test de GraphQL:**

```javascript
export default function () {
  const query = `
    query GetUsers {
      users {
        id
        name
        email
      }
    }
  `;

  const response = http.post(
    'https://api.example.com/graphql',
    JSON.stringify({ query }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'GraphQL GetUsers' },
    }
  );

  check(response, {
    'GraphQL status': (r) => r.status === 200,
    'GraphQL response time': (r) => r.timings.duration < 2000,
    'GraphQL valid response': (r) => {
      try {
        const data = r.json();
        return data.data && data.data.users;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
```

#### Mejores Prácticas para test.js

**1. Organización del Código:**

```javascript
// Al inicio del archivo: configuración y constantes
const API_BASE_URL = 'https://api.example.com';
const TEST_USERS = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
];

// Funciones auxiliares
function makeAuthenticatedRequest(endpoint, token) {
  return http.get(`${API_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Función principal
export default function () {
  // Lógica de prueba
}
```

**2. Manejo de Errores:**

```javascript
export default function () {
  const response = http.get('https://api.example.com/data');

  if (response.status !== 200) {
    console.error(`Request failed with status ${response.status}`);
    return;
  }

  // Continuar con la lógica normal
}
```

**3. Uso de Tags para Métricas:**

```javascript
const response = http.get('https://api.example.com/users', {
  tags: {
    name: 'GET /users',
    endpoint: 'users',
    method: 'GET',
  },
});
```

**4. Validaciones Robustas:**

```javascript
check(response, {
  'status is 200': (r) => r.status === 200,
  'response time < 2s': (r) => r.timings.duration < 2000,
  'has valid JSON': (r) => {
    try {
      r.json();
      return true;
    } catch {
      return false;
    }
  },
  'response has required fields': (r) => {
    try {
      const data = r.json();
      return data.users && Array.isArray(data.users);
    } catch {
      return false;
    }
  },
});
```

## 📁 Archivos Adicionales Opcionales

### 4. scripts/ - Módulos de Código Reutilizable

Puedes crear archivos adicionales en la carpeta `scripts/` para organizar mejor tu código:

#### scripts/common.js - Utilidades Comunes

```javascript
// Funciones de utilidad compartidas
export function generateRandomEmail() {
  return `test${Math.random().toString(36).substr(2, 9)}@example.com`;
}

export function getRandomUser() {
  const users = [
    { username: 'user1', password: 'pass1' },
    { username: 'user2', password: 'pass2' },
    { username: 'user3', password: 'pass3' },
  ];
  return users[Math.floor(Math.random() * users.length)];
}

export function sleepRandom(min = 1, max = 3) {
  const delay = Math.random() * (max - min) + min;
  sleep(delay);
}
```

#### scripts/auth.js - Manejo de Autenticación

```javascript
import http from 'k6/http';

export function login(username, password) {
  const response = http.post('https://api.example.com/auth/login', {
    username: username,
    password: password,
  });

  if (response.status === 200) {
    const data = response.json();
    return data.token;
  }

  return null;
}

export function makeAuthenticatedRequest(
  url,
  token,
  method = 'GET',
  payload = null
) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const params = { headers };

  if (method === 'POST' && payload) {
    return http.post(url, JSON.stringify(payload), params);
  } else if (method === 'PUT' && payload) {
    return http.put(url, JSON.stringify(payload), params);
  } else if (method === 'DELETE') {
    return http.del(url, null, params);
  } else {
    return http.get(url, params);
  }
}
```

#### scripts/endpoints.js - Definición de Endpoints

```javascript
export const ENDPOINTS = {
  BASE_URL: 'https://api.example.com',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    GET: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
  },
  DATA: {
    LIST: '/api/data',
    CREATE: '/api/data',
    GET: (id) => `/api/data/${id}`,
  },
};

export function getFullUrl(endpoint) {
  return `${ENDPOINTS.BASE_URL}${endpoint}`;
}
```

### 5. README.md - Documentación del Proyecto

Crea un archivo `README.md` en tu carpeta de proyecto para documentar:

````markdown
# Mi Proyecto - Load Testing

## Descripción

Este proyecto contiene las pruebas de carga para la API de Mi Proyecto.

## Configuración

- **API Base URL**: https://api.miproyecto.com
- **Autenticación**: Bearer Token
- **Endpoints principales**: /api/users, /api/data

## Ejecutar Pruebas

```bash
# Ejecutar localmente
./run-load-tests.sh single mi-proyecto

# Generar reporte
python src/main.py project mi-proyecto
```
````

## Configuración de Prometheus

- **URL**: https://prometheus.miproyecto.com/api/prom
- **Métricas**: CPU, Memoria, Disco, Red

## Contacto

- Desarrollador: tu-email@avilatek.dev
- Equipo: equipo@avilatek.dev



## 📊 Integración con Prometheus

### Configuración de Queries de Prometheus

El sistema obtiene automáticamente métricas del servidor durante la ejecución de las pruebas. Configura estas queries en `prometheus_config.json`:

```json
{
  "queries": {
    "cpu_usage": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
    "memory_usage_percentage_over_time": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
    "disk_io_utilization_over_time": "rate(node_disk_io_time_seconds_total[5m]) * 100",
    "network_traffic_bytes_per_second": "rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])"
  }
}
```

### Queries de Prometheus Comunes

- **Uso de CPU**: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- **Uso de Memoria**: `100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)`
- **I/O de Disco**: `rate(node_disk_io_time_seconds_total[5m]) * 100`
- **Tráfico de Red**: `rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])`

## 📧 Notificaciones por Email

### Configuración de Email

Configura las notificaciones por email en el archivo `config.json` de tu proyecto:

```json
{
  "email": {
    "enabled": true,
    "recipients": ["tu-email@avilatek.dev", "team-lead@avilatek.dev"],
    "subject_template": "Load Test Report - {project_name} - {timestamp}",
    "include_s3_link": true
  }
}
```

### Triggers de Notificación

- **Éxito**: Cuando las pruebas se completen exitosamente
- **Falla**: Cuando las pruebas fallen o excedan umbrales
- **Resumen**: Incluir resumen de la prueba en el cuerpo del email

## 🚀 Guía Paso a Paso: Crear un Proyecto Completo

### Paso 1: Crear la Estructura del Proyecto

```bash
# Crear directorio del proyecto
mkdir projects/mi-nuevo-proyecto
cd projects/mi-nuevo-proyecto

# Crear archivos requeridos
touch test.js config.json prometheus_config.json
mkdir scripts
```

### Paso 2: Configurar config.json

```json
{
  "email": {
    "enabled": true,
    "recipients": ["tu-email@avilatek.dev"],
    "subject_template": "Reporte de Prueba de Carga - {project_name}",
    "include_s3_link": true
  },
  "notifications": {
    "on_success": true,
    "on_failure": true,
    "include_test_summary": true
  }
}
```

### Paso 3: Configurar prometheus_config.json

```json
{
  "prometheus": {
    "url": "https://tu-prometheus-instance.com/api/prom",
    "auth": {
      "type": "basic",
      "username": "tu_usuario",
      "password": "tu_password",
      "bearer_token": ""
    },
    "queries": {
      "cpu_usage": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
      "memory_usage_percentage_over_time": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
      "disk_io_utilization_over_time": "rate(node_disk_io_time_seconds_total[5m]) * 100",
      "network_traffic_bytes_per_second": "rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])"
    }
  }
}
```

### Paso 4: Crear test.js Básico

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  const response = http.get('https://tu-api.com/health');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
    'report.html': htmlReport(data),
  };
}
```

### Paso 5: Probar Localmente

```bash
# Volver al directorio raíz
cd ../..

# Ejecutar prueba
./run-load-tests.sh single mi-nuevo-proyecto

# Generar reporte
python src/main.py project mi-nuevo-proyecto
```

### Paso 6: Validar y Refinar

1. **Verificar que la prueba funcione**
2. **Ajustar umbrales según los resultados**
3. **Agregar más endpoints si es necesario**
4. **Configurar autenticación si es requerida**

## 🧪 Pruebas de tu Proyecto

### Pruebas Locales

1. **Ejecutar Prueba de Proyecto Individual**:

   ```bash
   ./run-load-tests.sh single tu-nombre-proyecto
   ```

2. **Generar Solo Reporte**:

   ```bash
   python src/main.py project tu-nombre-proyecto
   ```

3. **Listar Proyectos Disponibles**:

   ```bash
   ./run-load-tests.sh discover
   ```

### Validación de Pruebas

Antes de enviar tu proyecto, asegúrate de:

1. ✅ El script de prueba se ejecuta sin errores
2. ✅ Todos los archivos requeridos están presentes
3. ✅ Los archivos de configuración son JSON válidos
4. ✅ Las queries de Prometheus devuelven datos
5. ✅ La configuración de email es correcta
6. ✅ Los umbrales son realistas para tu aplicación

## 🚀 Integración CI/CD

### Pipeline de Jenkins

El sistema incluye un pipeline de Jenkins que:

- Ejecuta pruebas automáticamente
- Genera reportes PDF
- Sube reportes a S3
- Envía notificaciones por email
- Soporta ejecución paralela

### Parámetros del Pipeline

- **TEST_SCOPE**: Ejecutar todos los proyectos o específicos
- **PROJECTS**: Lista separada por comas de proyectos
- **SEND_EMAILS**: Habilitar/deshabilitar notificaciones por email
- **MAX_WORKERS**: Número de workers concurrentes

### Ejecución Programada

Las pruebas se ejecutan automáticamente:

- **Semanalmente**: Todos los domingos a las 2:00 AM
- **Manual**: Activado vía interfaz de Jenkins
- **Webhook**: Activado por eventos externos

## 📝 Mejores Prácticas

### Diseño de Pruebas

1. **Patrones de Carga Realistas**: Usar ramp-up y ramp-down graduales
2. **Umbrales Apropiados**: Establecer expectativas de rendimiento realistas
3. **Cobertura Integral**: Probar flujos críticos de usuario
4. **Manejo de Errores**: Incluir verificación de errores y logging apropiados

### Consideraciones de Rendimiento

1. **Duración de Pruebas**: Mantener pruebas entre 5-15 minutos
2. **Usuarios Virtuales**: Comenzar con 10-20 usuarios, escalar según capacidad
3. **Tiempo de Pensamiento**: Incluir delays realistas entre requests
4. **Gestión de Datos**: Usar datos de prueba realistas

### Organización del Código

1. **Estructura Modular**: Dividir pruebas complejas en módulos
2. **Funciones Reutilizables**: Crear utilidades comunes en `scripts/`
3. **Nombres Claros**: Usar nombres descriptivos para funciones y variables
4. **Documentación**: Agregar comentarios explicando lógica compleja

### Gestión de Configuración

1. **Variables de Entorno**: Usar variables de entorno para datos sensibles
2. **Validación**: Validar configuración antes de ejecutar pruebas
3. **Valores por Defecto**: Proporcionar valores por defecto sensatos
4. **Mensajes de Error**: Incluir mensajes de error útiles para configuraciones incorrectas

## 🔧 Resolución de Problemas

### Problemas Comunes

1. **Errores de Script de Prueba**:

   - Verificar sintaxis de JavaScript
   - Validar uso de API de k6
   - Asegurar que todos los imports sean correctos

2. **Problemas de Configuración**:

   - Validar sintaxis JSON
   - Verificar campos requeridos
   - Verificar direcciones de email

3. **Conexión a Prometheus**:

   - Verificar URL y credenciales
   - Probar queries manualmente
   - Verificar conectividad de red

4. **Generación de Reportes**:

   - Asegurar que k6 genere summary.json
   - Verificar permisos de archivos
   - Verificar dependencias de Python

### Comandos de Debug

```bash
# Logging verboso
python src/main.py project tu-nombre-proyecto -v

# Probar conexión a Prometheus
python -c "from src.prometheus.client import PrometheusClient; print('OK')"

# Validar configuración
python -c "import json; json.load(open('projects/tu-proyecto/config.json'))"
```

## 📚 Ejemplos y Plantillas

### Plantilla de Proyecto

Crea un nuevo proyecto usando esta plantilla:

```bash
# Copiar plantilla
cp -r projects/template projects/tu-nombre-proyecto
cd projects/tu-nombre-proyecto
```

### Script de Ejemplo

Ver proyectos existentes para referencia:

- `projects/kaizen/test.js` - Pruebas de API GraphQL
- `projects/motivapp/test.js` - Pruebas de API REST
- `projects/negdig/test.js` - Pruebas complejas multi-endpoint

### Ejemplos de Configuración

- `projects/kaizen/config.json` - Configuración básica de email
- `projects/kaizen/prometheus_config.json` - Configuración de Prometheus
- `projects/motivapp/config.json` - Configuración avanzada de notificaciones

## 🤝 Proceso de Contribución

1. **Fork del Repositorio**: Crear tu propio fork
2. **Crear Rama**: `git checkout -b feature/tu-nombre-proyecto`
3. **Agregar Proyecto**: Seguir esta guía para agregar tu proyecto
4. **Probar Localmente**: Asegurar que todo funcione
5. **Enviar PR**: Crear pull request con descripción
6. **Revisión de Código**: Abordar feedback del equipo
7. **Merge**: Una vez aprobado, mergear a rama principal

## 📞 Soporte

Para preguntas o problemas:

1. **Revisar Documentación**: Consultar esta guía y README.md
2. **Issues Existentes**: Buscar issues de GitHub
3. **Crear Issue**: Enviar reporte detallado de bug o solicitud de feature
4. **Chat del Equipo**: Contactar al equipo de DevOps en Slack

## 🔄 Actualizaciones

Esta documentación se actualiza regularmente. Revisar por:

- Nuevas características y capacidades
- Opciones de configuración actualizadas
- Nuevas mejores prácticas
- Soluciones de resolución de problemas

---

**¡Feliz Testing! 🚀**

Recuerda: El objetivo es crear pruebas de carga confiables y mantenibles que proporcionen insights valiosos sobre el rendimiento de tu aplicación bajo estrés.
````
