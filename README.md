<p align="center">
  <img src="https://img.shields.io/badge/Cuaderno_Digital-Cálculo_Binario-0f766e?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Cuaderno Digital de Cálculo Binario"/>
</p>

<h1 align="center">Cuaderno Digital de Cálculo Binario</h1>

<p align="center">
  <strong>Aplicación web educativa</strong> para practicar aritmética binaria y representación de números<br/>
  (enteros con signo · coma fija) — interfaz tipo cuaderno escolar, 100&nbsp;% en el navegador.
</p>

<p align="center">
  <a href="#-características"><img src="https://img.shields.io/badge/Estado-Completo-10b981?style=flat-square" alt="Estado"/></a>
  <a href="#-tecnologías"><img src="https://img.shields.io/badge/Stack-HTML5_·_CSS3_·_JS-e34f26?style=flat-square" alt="Stack"/></a>
  <a href="#-cómo-usar"><img src="https://img.shields.io/badge/Instalación-Ninguna-3b82f6?style=flat-square" alt="Sin instalación"/></a>
  <a href="#-licencia"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square" alt="Licencia AGPL-3.0"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome"/>
</p>

---

## Tabla de contenidos

- [Resumen](#-resumen)
- [Capturas / vista general](#-capturas--vista-general)
- [Características](#-características)
- [Pestañas y funcionalidades](#-pestañas-y-funcionalidades)
  - [Teoría](#1--teoría)
  - [Suma binaria](#2--suma-binaria)
  - [Resta binaria](#3--resta-binaria)
  - [Multiplicación binaria](#4--multiplicación-binaria)
  - [Representación](#5--representación-números-con-signo)
  - [Coma fija](#6--coma-fija)
  - [Calculadora](#7--calculadora)
- [Cuadernos de apoyo](#-cuadernos-de-apoyo)
- [Cómo usar](#-cómo-usar)
- [Tecnologías](#-tecnologías)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Preferencias locales](#-preferencias-locales)
- [Público objetivo](#-público-objetivo)
- [Hoja de ruta / ideas](#-hoja-de-ruta--ideas)
- [Licencia](#-licencia)

---

## Resumen

| | |
|---|---|
| **Qué es** | Un cuaderno interactivo para aprender y practicar cálculo en base 2 y representaciones numéricas en hardware. |
| **Cómo se ejecuta** | Un único archivo HTML. Sin servidor, sin `npm install`, sin build. |
| **Para quién** | Estudiantes y docentes de fundamentos de computadores, arquitectura o sistemas digitales. |
| **Idioma UI** | Español |

**Incluye**

- Operaciones: suma, resta y multiplicación bit a bit  
- Representaciones: signo-magnitud, C1, C2, exceso a \(2^{n-1}-1\)  
- Coma fija (orden signo · entera · fraccionaria)  
- Cuadernos guiados (÷2, ×2, suma de pesos, clic en restos)  
- Conversor decimal ↔ binario ↔ hexadecimal  

---

## Capturas / vista general

> Sustituye estas líneas por capturas reales cuando las tengas (`docs/screenshots/...`).

| Pestaña | Descripción visual |
|--------|---------------------|
| **Teoría** | Tarjetas de reglas (suma, resta, producto, signo, coma fija) sobre fondo de libreta |
| **Suma / Resta** | Rejilla de bits + acarreos/préstamos + teclado 0/1 |
| **Multiplicación** | Productos parciales y suma final |
| **Representación** | Métodos C1/C2/exceso + interruptor Cuaderno (violeta) |
| **Coma fija** | Pesos \(2^{n}\) / \(2^{-k}\) + punto binario + Cuaderno (teal) |
| **Calculadora** | Generador aleatorio y conversor multi-base |

```text
┌─────────────────────────────────────────────────────────────┐
│  📘 Cuaderno Digital de Cálculo Binario     Semilla: 1337  │
│  [Teoría][Suma][Resta][×][Representación][Coma fija][Calc] │
├─────────────────────────────────────────────────────────────┤
│  Enunciado · controles (bits / formato / sentido)           │
│  ┌──── casillas de bits / operación ────┐                   │
│  │  teclado táctil  ·  Corregir  ·  Ayuda │                   │
│  └─ Cuaderno de apoyo (opcional) ───────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Características

### Experiencia de uso

| Característica | Detalle |
|----------------|---------|
| **Semilla reproducible** | PRNG con semilla visible; «Nueva Semilla» regenera la secuencia de ejercicios |
| **Teclado táctil** | Entrada de bits y dígitos pensada para móvil (sin depender del teclado del SO) |
| **Zoom de celdas** | Tamaño 60 %–160 %, recordado entre visitas |
| **Toasts centrados** | Acierto / error fijos al viewport (`aria-live`) |
| **Registro de errores** | Intentos fallidos del ejercicio actual (se borra con «Nuevo») |
| **Responsive** | En móvil prioriza las celdas de bits; etiquetas laterales ceden espacio |
| **Modo aviso** | En suma/resta, resalta columnas críticas (acarreo/préstamo) |
| **Acarreos / préstamos auto** | Interruptor ON/OFF para relleno automático de la fila superior |
| **Reduced motion** | Animaciones desactivadas si el sistema lo solicita |

### Diseño

- Estética de **cuaderno escolar** (cuadrícula, margen rojo, espiral decorativa)  
- Tipografías: *Caveat* / *Indie Flower* (títulos y notas), *Fira Code* (bits), *Special Elite* (sellos)  
- Paleta por módulo: azul (suma), ámbar (resta), esmeralda (×), violeta (representación), **teal** (coma fija)

---

## Pestañas y funcionalidades

### 1. Teoría

Tarjetas de referencia rápida:

| Tarjeta | Contenido |
|---------|-----------|
| **Suma** | \(0+0\), \(0+1\), \(1+1=10\), \(1+1+1=11\) |
| **Resta** | Incluye préstamo (\(0-1\)) |
| **Multiplicación** | Tabla \(0/1 \times 0/1\) |
| **Números con signo** | Signo-magnitud, C1, C2, exceso |
| **Coma fija** | \(A=\sum a_i b^i\); ejemplo **1-4-3** → `11110011` = **−14,375** |

### 2. Suma binaria

- **Bits:** 4 · 6 · 8  
- Fila de **acarreos** (automáticos o manuales)  
- **Modo aviso** (columnas \(0+0\) con carry entrante, etc.)  
- Acciones: *Corregir* · *Ver solución* · *Nuevo*  
- Registro de errores por intento  

### 3. Resta binaria

- **Bits:** 4 · 6 · 8  
- Fila de **préstamos** (automáticos o manuales)  
- **Modo aviso** para columnas con préstamo entrante  
- Misma UX de corrección y ayuda que la suma  

### 4. Multiplicación binaria

- **Bits:** 3 · 4 · 5  
- Una fila de **producto parcial** por bit del multiplicador  
- Suma final con acarreos (pueden ser mayores que 1)  
- *Corregir* / *Ver solución*  

### 5. Representación (números con signo)

Práctica bidireccional:

| Sentido | Objetivo |
|---------|----------|
| **Decimal → Binario** | Escribir la representación según el método |
| **Binario → Decimal** | Interpretar el patrón y obtener el valor |

**Métodos**

| Método | Idea |
|--------|------|
| **Signo-magnitud** | Bit de signo + valor absoluto |
| **Complemento a 1** | Invertir todos los bits |
| **Complemento a 2** | Invertir + 1 (con fila de acarreos) |
| **Exceso** | \(N + (2^{n-1}-1)\) (p. ej. exceso a 127 en 8 bits) |

**Anchos:** 4 · 6 · 8 bits  

El **Cuaderno** (violeta) guía divisiones ÷2, suma de pesos, \(N+\text{sesgo}\) y colocación de bits por clic en restos.  
Detalle en [Cuadernos de apoyo](#-cuadernos-de-apoyo).

### 6. Coma fija

Números reales con **punto binario en posición fija** (signo + magnitud).

**Formatos** (signo – enteros – fraccionarios):

| Formato | Total de bits |
|--------|----------------|
| `1-3-2` | 6 |
| `1-4-3` | 8 *(por defecto)* |
| `1-5-2` | 8 |
| `1-4-4` | 9 |
| `1-6-3` | 10 |

**Sentidos**

- **Decimal → Binario:** rellenar signo · entera · fraccionaria  
- **Binario → Decimal:** leer el patrón y escribir el decimal (coma o punto)

UI con **etiquetas de peso** (\(S\), \(2^{n}\), \(2^{-k}\)), punto binario visual y leyenda de zonas.

El **Cuaderno** (teal) cubre signo → ÷2 → clic en restos → ×2 → clic en bits fraccionarios.  
Detalle abajo.

### 7. Calculadora

Sin modo ejercicio:

| Herramienta | Función |
|-------------|---------|
| **Generador** | Número aleatorio en 4 / 8 / 16 bits (binario + decimal) |
| **Conversor** | Decimal ↔ binario ↔ hexadecimal con validación |

---

## Cuadernos de apoyo

Dos cuadernos independientes, mismos principios pedagógicos: **paso a paso**, teclado propio y feedback al final del flujo (o al validar fases clave).

### Representación (violeta)

```text
Decimal → Binario
  [Exceso]  N + sesgo  ──►  divisiones ÷2  ──►  clic restos → bits
  [Otros]   divisiones ÷2  ──►  clic restos → magnitud (+ signo si SM)

Binario → Decimal
  [C1/C2]   invertir [+1]  ──►  suma de pesos  ──►  decimal
  [Exceso]  suma pesos  ──►  resta sesgo  ──►  decimal
  [SM]      suma magnitud (sin bit de signo)  ──►  ± signo
```

- Residuo de división **automático** (estilo división larga)  
- Bandeja vertical de restos (LSB arriba)  
- Clic **abajo → arriba** para colocar bits en el ejercicio principal  

### Coma fija (teal)

```text
Decimal → Binario
  1. Bit de signo  ──► se escribe en casilla S del ejercicio
  2. ÷2 (parte entera) + residuo auto + bandeja de restos
  3. Clic restos (abajo → arriba)  ──► parte entera
  4. ×2 sucesivo (parte fraccionaria)
  5. Clic bits frac  ──► parte fraccionaria
  6. Toast de acierto al completar el cuaderno

Binario → Decimal
  Suma de pesos (enteros + fraccionarios) + signo
```

- Pulso del interruptor Cuaderno en **color del tema** (teal)  
- Sin toasts de acierto en cada paso intermedio  

---

## Cómo usar

### Opción A — Archivo local

1. Clona o descarga el repositorio.  
2. Abre `cuaderno-binario-comafija.html` con el navegador  
   (doble clic o arrastrar al Chrome / Firefox / Safari / Edge).

### Opción B — Servidor estático (opcional)

```bash
# Python 3
python -m http.server 8080

# Node (si tienes npx)
npx serve .
```

Luego visita `http://localhost:8080/cuaderno-binario-comafija.html`.

### Flujo típico de práctica

1. Elige pestaña (Suma, Representación, Coma fija, …).  
2. Ajusta **bits** o **formato**.  
3. **Nuevo** ejercicio (o **Nueva Semilla** para otra secuencia).  
4. Responde con el teclado en pantalla.  
5. **Corregir** o **Ver solución**.  
6. Activa **Cuaderno** cuando necesites el desglose guiado.

---

## Tecnologías

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome"/>
  <img src="https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" alt="Google Fonts"/>
</p>

| Pieza | Uso en el proyecto |
|-------|--------------------|
| **HTML5** | Estructura semántica, secciones por pestaña, formularios de casillas |
| **CSS3** | Animaciones (toasts, sellos, pulso), grid de bits, cuaderno de división |
| **JavaScript (ES6+)** | Lógica de ejercicios, PRNG, corrección, cuadernos, `localStorage` |
| **Tailwind CSS** *(CDN)* | Utilidades de layout, color y responsive |
| **Font Awesome 6** *(CDN)* | Iconografía de pestañas y botones |
| **Google Fonts** | Caveat, Indie Flower, Special Elite, Inter, Fira Code |

**Principios de arquitectura**

- Sin frameworks SPA  
- Sin empaquetador ni dependencias npm  
- Un solo entregable: el `.html`  
- CDN solo para Tailwind, iconos y fuentes (requiere red la primera vez; el resto es offline una vez cacheado)

---

## Estructura del repositorio

```text
.
├── cuaderno-binario-comafija.html   # Aplicación completa (única dependencia de ejecución)
├── README.md                        # Documentación
└── docs/                            # (opcional) capturas, apuntes de aula
    └── screenshots/
```

---

## Preferencias locales

Se guardan en `localStorage` del navegador del usuario:

| Clave | Descripción |
|-------|-------------|
| `zoomCeldas` | Escala de celdas (60–160) |
| `cuadernoDivision` | Cuaderno de Representación abierto (`1`/`0`) |
| `cuadernoCF` | Cuaderno de Coma fija abierto (`1`/`0`) |

No se envían datos a ningún servidor.

---

## Público objetivo

- Asignaturas de **Fundamentos de Computadores**, **Arquitectura de Computadores**, **Sistemas Digitales**  
- Refuerzo de **binario**, **complementos** y **coma fija** antes de FP o IEEE-754  
- Docentes que quieran demos en clase sin instalar software  

---

## Hoja de ruta / ideas

Ideas opcionales para evolucionar el cuaderno (no implementadas necesariamente):

- [ ] Más formatos de coma fija personalizables (bits enteros/frac libres)  
- [ ] Exportar / imprimir el registro de errores  
- [ ] Modo examen (sin «Ver solución»)  
- [ ] Temas claro/oscuro  
- [ ] Empaquetado PWA para uso offline total  

---

## Licencia

<p>
  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=for-the-badge" alt="License: AGPL v3"/></a>
</p>

Este proyecto está licenciado bajo la **[GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0)**.

En resumen:

- Puedes **usar, estudiar, modificar y distribuir** el software.
- Si redistribuyes versiones modificadas (incluido el uso como servicio de red / SaaS), debes **publicar el código fuente** bajo la misma licencia AGPL-3.0.
- El software se ofrece **sin garantía**.

El texto completo de la licencia se encuentra en el archivo [`LICENSE`](./LICENSE) (o en [gnu.org/licenses/agpl-3.0](https://www.gnu.org/licenses/agpl-3.0)).

---

<p align="center">
  <strong>Cuaderno Digital de Cálculo Binario</strong><br/>
  <em>Suma · Resta · Multiplicación · Representación · Coma fija</em><br/>
  <sub>HTML5 · CSS3 · JavaScript · Tailwind CSS</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hecho_con-♥_y_bits-0f766e?style=flat-square" alt="Hecho con bits"/>
</p>
