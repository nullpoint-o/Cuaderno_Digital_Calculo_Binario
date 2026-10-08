# Cuaderno Digital de Cálculo Binario

Aplicación web educativa para practicar **aritmética binaria** y **representación de números** (enteros con signo y coma fija). Pensada para uso en aula o estudio autónomo: interfaz tipo cuaderno escolar, teclado táctil, corrección inmediata y cuadernos de apoyo paso a paso.

**Un solo archivo HTML** — sin backend, sin instalación. Abre `cuaderno-binario-comafija.html` en cualquier navegador moderno.

---

## Características generales

| Función | Descripción |
|--------|-------------|
| **Semilla reproducible** | Generador pseudoaleatorio con semilla visible; «Nueva Semilla» regenera ejercicios de forma controlada |
| **Teclado táctil** | Entrada de bits/dígitos optimizada para móvil (sin teclado nativo del sistema) |
| **Zoom de celdas** | Control de tamaño de casillas (60 %–160 %), persistido en `localStorage` |
| **Toasts de acierto/error** | Feedback centrado en pantalla, accesible (`aria-live`) |
| **Registro de errores** | Historial de intentos fallidos por ejercicio (se limpia al pulsar «Nuevo») |
| **Diseño responsive** | Cuadrícula adaptativa; en móvil prioriza las celdas de bits frente a etiquetas laterales |
| **Accesibilidad** | Interruptores con `role="switch"`, respeto a `prefers-reduced-motion` |

---

## Pestañas

### 1. Teoría

Resumen visual de las reglas:

- **Suma** — tabla de acarreos (incluido \(1+1+1\))
- **Resta** — préstamos
- **Multiplicación** — productos parciales
- **Números con signo** — signo-magnitud, complemento a 1, complemento a 2, exceso a \(2^{n-1}-1\)
- **Coma fija** — teorema fundamental \(A=\sum a_i\cdot b^i\), orden signo–entera–fraccionaria y ejemplo 1-4-3 → −14,375

### 2. Suma binaria

- Anchos configurables: **4 / 6 / 8 bits**
- Fila de **acarreos** (automáticos o manuales)
- **Modo aviso**: resalta columnas difíciles (p. ej. \(0+0\) con acarreo entrante)
- Corregir / Ver solución / registro de errores

### 3. Resta binaria

- Anchos: **4 / 6 / 8 bits**
- Fila de **préstamos** (automáticos o manuales)
- **Modo aviso** para columnas con préstamo entrante
- Misma estructura de corrección y ayuda que la suma

### 4. Multiplicación binaria

- Anchos: **3 / 4 / 5 bits**
- Productos parciales (una fila por bit del multiplicador)
- Suma final de parciales con **acarreos** (pueden ser > 1)
- Corregir / Ver solución

### 5. Representación (números con signo)

Práctica de conversión en ambos sentidos:

| Sentido | Descripción |
|---------|-------------|
| **Decimal → Binario** | Representar un entero según el método elegido |
| **Binario → Decimal** | Interpretar un patrón de bits |

**Métodos disponibles**

- Signo-magnitud  
- Complemento a 1 (C1)  
- Complemento a 2 (C2) — con fila de acarreos en el +1  
- Exceso a \(2^{n-1}-1\) (p. ej. exceso a 127 en 8 bits)

**Bits:** 4 / 6 / 8

#### Cuaderno de apoyo (Representación)

Interruptor **Cuaderno** (violeta). Guía guiada según el sentido y el método:

**Decimal → Binario**

1. **Exceso:** primero \(N + \text{sesgo}\) (casillas digitables; opcional invertir orden de sumandos)
2. **Divisiones sucesivas ÷ 2** estilo división larga:
   - Residuo calculado **automáticamente** al escribir el cociente
   - Bandeja vertical de **restos** (LSB arriba)
   - Navegación paso a paso
3. Al terminar: **clic en los restos** (abajo → arriba) para colocar los bits en el ejercicio principal

**Binario → Decimal**

- Suma de pesos de los bits a 1  
- En C1/C2 negativos: invertir (y +1 en C2) antes de sumar  
- En exceso: suma de pesos y luego resta del sesgo  
- El decimal del ejercicio se rellena al completar la suma del cuaderno

### 6. Coma fija

Representación de números reales con **punto binario fijo** (estilo signo-magnitud).

**Formatos (orden signo–enteros–fraccionarios)**

| Formato | Bits totales |
|--------|----------------|
| 1-3-2 | 6 |
| 1-4-3 | 8 (por defecto) |
| 1-5-2 | 8 |
| 1-4-4 | 9 |
| 1-6-3 | 10 |

**Sentidos**

- **Decimal → Binario:** escribir el patrón bit a bit  
- **Binario → Decimal:** interpretar el patrón y escribir el número (coma o punto)

Interfaz con **pesos** por casilla (\(S\), \(2^{n}\), \(2^{-k}\)), punto binario visual y leyenda de zonas (signo / entera / fraccionaria).

#### Cuaderno de apoyo (Coma fija)

Interruptor **Cuaderno** (teal, con pulso del color del tema).

**Decimal → Binario** (flujo completo):

1. **Bit de signo** — al acertar, se coloca en la casilla S del ejercicio principal  
2. **Parte entera:** divisiones ÷ 2 con **residuo automático** y bandeja de restos  
3. **Clic en restos** (abajo → arriba) para rellenar la parte entera  
4. **Parte fraccionaria:** multiplicaciones × 2 sucesivas (bit = parte entera del producto)  
5. **Clic en bits fraccionarios** para colocarlos en el ejercicio principal  

**Binario → Decimal**

- Suma de pesos (enteros + fraccionarios) y aplicación del signo  

Feedback de acierto del cuaderno: **solo al completar** el flujo (sin toasts en cada paso intermedio).

### 7. Calculadora

Herramienta libre, sin ejercicios:

- **Generador aleatorio** — 4 / 8 / 16 bits  
- **Conversor** decimal ↔ binario ↔ hexadecimal (validación de entrada)

---

## Cómo usar

1. Abre `cuaderno-binario-comafija.html` en el navegador (Chrome, Firefox, Safari, Edge).  
2. Elige una pestaña de práctica.  
3. Ajusta bits/formato y genera un ejercicio con **Nuevo** o **Nueva Semilla**.  
4. Introduce la respuesta con el teclado en pantalla.  
5. **Corregir ejercicio** o **Ver solución**.  
6. En Representación y Coma fija, activa **Cuaderno** para el apoyo guiado.

No requiere servidor: puedes servirla estáticamente o abrir el archivo en local (`file://`).

---

## Tecnología

- HTML5 + CSS3 + JavaScript (vanilla)
- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [Font Awesome 6](https://fontawesome.com/) (iconos)
- Fuentes Google: Caveat, Indie Flower, Special Elite, Inter, Fira Code

Sin frameworks, sin build step, sin dependencias npm.

---

## Estructura del repositorio

```
├── cuaderno-binario-comafija.html   # Aplicación completa
└── README.md                        # Este archivo
```

---

## Persistencia local

Algunas preferencias se guardan en `localStorage` del navegador:

| Clave | Uso |
|-------|-----|
| `zoomCeldas` | Tamaño de celdas (60–160) |
| `cuadernoDivision` | Estado del cuaderno en Representación |
| `cuadernoCF` | Estado del cuaderno en Coma fija |

---

## Público objetivo

- Estudiantes de **fundamentos de computadores**, arquitectura o sistemas digitales  
- Docentes que necesiten ejercicios interactivos de binario y representaciones  
- Cualquiera que quiera practicar suma, resta, producto, C1/C2/exceso y coma fija

---

## Licencia

Proyecto educativo. Úsalo, adáptalo y compártelo libremente en contextos académicos.

---

## Créditos

Cuaderno Digital de Cálculo Binario — interfaz tipo cuaderno escolar con práctica guiada de cálculo y representación binaria.
