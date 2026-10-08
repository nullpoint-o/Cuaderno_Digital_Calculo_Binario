let seed = 1337;

function setSeed(nuevaSemilla) {
    seed = nuevaSemilla;
    document.getElementById('currentSeedDisplay').innerText = seed;
}

function generarNuevaSemilla() {
    seed = Math.floor(Math.random() * 999999) + 1;
    document.getElementById('currentSeedDisplay').innerText = seed;
    reiniciarPestanaActual();
}

function randomNext() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
}

function randomInt(min, max) {
    return Math.floor(randomNext() * (max - min + 1)) + min;
}

function cambiarPestana(pestana) {
    const secciones = ['teoria', 'suma', 'resta', 'multiplicacion', 'representacion', 'comafija', 'conversor'];
    secciones.forEach(sec => {
        const elSec = document.getElementById(`seccion-${sec}`);
        const elBtn = document.getElementById(`btn-${sec}`);
        if (sec === pestana) {
            elSec.classList.remove('hidden');
            elBtn.className = "tab-btn px-3 py-2 rounded-t-xl font-semibold text-xs sm:text-sm transition bg-white text-blue-800 border-t-4 border-blue-600 shadow-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap";
        } else {
            elSec.classList.add('hidden');
            elBtn.className = "tab-btn px-3 py-2 rounded-t-xl font-semibold text-xs sm:text-sm transition bg-amber-200/60 text-amber-900 hover:bg-white flex items-center gap-1 sm:gap-2 whitespace-nowrap";
        }
    });

    if (pestana === 'suma') reiniciarEjercicioSuma();
    if (pestana === 'resta') reiniciarEjercicioResta();
    if (pestana === 'multiplicacion') reiniciarEjercicioMultiplicacion();
    if (pestana === 'representacion') reiniciarEjercicioRepresentacion();
    if (pestana === 'comafija') reiniciarEjercicioComaFija();
}

function reiniciarPestanaActual() {
    if (!document.getElementById('seccion-suma').classList.contains('hidden')) reiniciarEjercicioSuma();
    else if (!document.getElementById('seccion-resta').classList.contains('hidden')) reiniciarEjercicioResta();
    else if (!document.getElementById('seccion-multiplicacion').classList.contains('hidden')) reiniciarEjercicioMultiplicacion();
    else if (!document.getElementById('seccion-representacion').classList.contains('hidden')) reiniciarEjercicioRepresentacion();
    else if (!document.getElementById('seccion-comafija').classList.contains('hidden')) reiniciarEjercicioComaFija();
}

// FUNCIONES TECLADO INTERACTIVO (Relleno Derecha a Izquierda & Borrado 1 paso)
function insertarDigito(claseInput, digito) {
    const inputs = Array.from(document.querySelectorAll(`.${claseInput}`));
    // Recorrer de derecha a izquierda (último al primero)
    for (let i = inputs.length - 1; i >= 0; i--) {
        if (inputs[i].value === '') {
            inputs[i].value = digito;
            inputs[i].classList.remove('error');
            break;
        }
    }
    if (claseInput === 'suma-res') {
        actualizarAcarreos('suma');
        aplicarAvisosSuma();
    }
    if (claseInput === 'resta-res') {
        actualizarAcarreos('resta');
        aplicarAvisosResta();
    }
}

function borrarDigito(claseInput) {
    const inputs = Array.from(document.querySelectorAll(`.${claseInput}`));
    // Buscar la primera casilla llena empezando desde la izquierda
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value !== '') {
            inputs[i].value = '';
            inputs[i].classList.remove('error');
            break;
        }
    }
    if (claseInput === 'suma-res') {
        actualizarAcarreos('suma');
        aplicarAvisosSuma();
    }
    if (claseInput === 'resta-res') {
        actualizarAcarreos('resta');
        aplicarAvisosResta();
    }
}

// Acarreos de la suma final de los productos parciales (pueden ser mayores que 1).
// Al rellenar la columna i del resultado, su acarreo aparece sobre la columna i-1.
function actualizarAcarreosMult() {
    const ej = ejercicioActualMultiplicacion;
    if (!ej || !ej.parciales) return;
    const W = ej.ancho;
    const lenA = ej.binA.length;
    const resultado = Array.from(document.querySelectorAll('.mult-res'));
    const celdas = Array.from(document.querySelectorAll('.mult-acarreo'));
    if (!celdas.length) return;

    // Suma por columna de los productos parciales reales (columna 0 = bit menos significativo)
    const sumaCol = new Array(W).fill(0);
    ej.parciales.forEach(p => {
        for (let k = 0; k < lenA; k++) {
            if (p.bin[lenA - 1 - k] === '1') sumaCol[p.shift + k]++;
        }
    });

    // salida[pos] = acarreo que genera la columna en la posición pos (de izquierda a derecha)
    const salida = new Array(W).fill(0);
    let entra = 0;
    for (let c = 0; c < W; c++) {
        const total = sumaCol[c] + entra;
        const pos = W - 1 - c;
        salida[pos] = Math.floor(total / 2);
        entra = salida[pos];
    }

    celdas.forEach((celda, idx) => {
        const origen = idx + 1;
        const mostrar = origen <= W - 1 && resultado[origen] && resultado[origen].value !== '' && salida[origen] > 0;
        const nuevo = mostrar ? String(salida[origen]) : '';
        if (celda.value !== nuevo) {
            celda.value = nuevo;
            celda.classList.remove('carry-pop');
            if (nuevo) { void celda.offsetWidth; celda.classList.add('carry-pop'); }
        }
    });
}

// Acarreos (suma) y préstamos (resta) automáticos.
// Al rellenar la columna i, el acarreo/préstamo que genera aparece sobre la columna i-1 (la de su izquierda).
function actualizarAcarreos(tipo, forzar = false) {
    if (!acarreosAuto && !forzar) return;
    if (tipo === 'mult') return actualizarAcarreosMult();
    if (tipo === 'representacion') return actualizarAcarreosRepresentacion();
    const esSuma = tipo === 'suma';
    const ej = esSuma ? ejercicioActualSuma : ejercicioActualResta;
    if (!ej || !ej.binA) return;
    const a = ej.binA.padStart(9, '0');
    const b = ej.binB.padStart(9, '0');
    const resultado = Array.from(document.querySelectorAll(esSuma ? '.suma-res' : '.resta-res'));
    const celdas = Array.from(document.querySelectorAll(esSuma ? '.suma-acarreo' : '.resta-prestamo'));

    // Acarreo/préstamo que sale de cada columna (calculado con los operandos reales)
    const salida = new Array(9).fill(0);
    let entra = 0;
    for (let i = 8; i >= 0; i--) {
        const x = parseInt(a[i]), y = parseInt(b[i]);
        if (esSuma) {
            salida[i] = (x + y + entra) >= 2 ? 1 : 0;
        } else {
            salida[i] = (x - y - entra) < 0 ? 1 : 0;
        }
        entra = salida[i];
    }

    celdas.forEach((celda, idx) => {
        // La celda idx recibe lo que sale de la columna idx+1, si esa columna ya está rellena
        const origen = idx + 1;
        const mostrar = origen <= 8 && resultado[origen] && resultado[origen].value !== '' && salida[origen] === 1;
        const nuevo = mostrar ? '1' : '';
        if (celda.value !== nuevo) {
            celda.value = nuevo;
            celda.classList.remove('carry-pop');
            if (nuevo) { void celda.offsetWidth; celda.classList.add('carry-pop'); }
        }
    });
}

let ejercicioActualSuma = {};

// --- Botón "Nuevo" junto al teclado: solo visible cuando el ejercicio está resuelto ---
function mostrarBotonNuevo(tipo, visible) {
    const btn = document.getElementById('nuevo-' + tipo);
    if (!btn) return;

    btn.classList.toggle('hidden', !visible);
    btn.classList.toggle('flex', visible);

    // No fuerces un reflow con offsetWidth aquí. En móviles, el acceso
    // síncrono al layout justo después de mostrar el feedback puede
    // provocar un frame largo. Dejamos que el navegador pinte primero
    // y arrancamos la animación en el siguiente frame.
    if (visible) {
        btn.classList.remove('carry-pop');
        requestAnimationFrame(() => {
            if (!btn.classList.contains('hidden')) btn.classList.add('carry-pop');
        });
    }
}

// --- Tamaño de las celdas (botones + / −), se recuerda entre visitas ---
let zoomCeldas = 100;
try {
    const z = parseInt(localStorage.getItem('zoomCeldas'));
    if (z >= 60 && z <= 160) zoomCeldas = z;
} catch (e) {}

function aplicarZoomCeldas() {
    document.documentElement.style.setProperty('--zoom', String(zoomCeldas / 100));
    document.querySelectorAll('[data-zoom-label]').forEach(el => { el.textContent = zoomCeldas + '%'; });
    document.querySelectorAll('[data-zoom-menos]').forEach(b => { b.disabled = zoomCeldas <= 60; });
    document.querySelectorAll('[data-zoom-mas]').forEach(b => { b.disabled = zoomCeldas >= 160; });
    // Tras cambiar el tamaño, re-alinear a la derecha para no cortar celdas
    alinearOperacionDerecha();
}

function cambiarZoomCeldas(delta) {
    zoomCeldas = Math.min(160, Math.max(60, zoomCeldas + delta));
    try { localStorage.setItem('zoomCeldas', String(zoomCeldas)); } catch (e) {}
    aplicarZoomCeldas();
}

function restablecerZoomCeldas() {
    cambiarZoomCeldas(100 - zoomCeldas);
}

/** Desplaza cada .grid-wrap al extremo derecho para que los recuadros
 *  de bits queden enteros a la vista; las etiquetas de la izquierda
 *  son lo que «se corta» si no hay espacio. */
function alinearOperacionDerecha() {
    const alinear = () => {
        document.querySelectorAll('.grid-wrap').forEach(wrap => {
            // Solo si realmente desborda
            const max = wrap.scrollWidth - wrap.clientWidth;
            if (max > 0) wrap.scrollLeft = max;
            else wrap.scrollLeft = 0;
        });
    };
    // Doble rAF: espera a que el layout con el nuevo --cell esté listo
    requestAnimationFrame(() => requestAnimationFrame(alinear));
}

// --- Toast centrado en pantalla (acierto / error) ---
// Visible en el centro del viewport sin hacer scroll; animación ~0,45s + ~0,45s de salida.
let toastTimerIn = null;
let toastTimerOut = null;

function mostrarToast(ok, titulo, subtitulo) {
    const viewport = document.getElementById('toast-viewport');
    const card = document.getElementById('toast-card');
    if (!viewport || !card) return;

    // Cancela animaciones pendientes si el usuario corrige otra vez rápido
    if (toastTimerIn) clearTimeout(toastTimerIn);
    if (toastTimerOut) clearTimeout(toastTimerOut);

    card.classList.remove('toast-show', 'toast-hide', 'toast-ok', 'toast-ko');
    // Forzar reflow para reiniciar la animación
    void card.offsetWidth;

    card.classList.add(ok ? 'toast-ok' : 'toast-ko');
    card.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${ok ? '🌟' : '❌'}</span>
        <div class="toast-title">${titulo}</div>
        ${subtitulo ? `<div class="toast-sub">${subtitulo}</div>` : ''}
    `;

    // Visible de inmediato en el centro del viewport
    card.classList.add('toast-show');

    // Mantener ~0,7s visible y luego salir en ~0,45s (total ~1,15s)
    toastTimerIn = setTimeout(() => {
        card.classList.remove('toast-show');
        card.classList.add('toast-hide');
        toastTimerOut = setTimeout(() => {
            card.classList.remove('toast-hide', 'toast-ok', 'toast-ko');
            card.innerHTML = '';
        }, 450);
    }, 700);
}

// --- Sonido de recompensa al acertar (Web Audio API, sin archivos) ---
let audioCtx = null;
function reproducirSonidoAcierto() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const ctx = audioCtx;
        const t0 = ctx.currentTime + 0.02;

        const master = ctx.createGain();
        master.gain.value = 0.22;
        master.connect(ctx.destination);

        const nota = (freq, inicio, dur, tipo, vol) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = tipo;
            osc.frequency.setValueAtTime(freq, t0 + inicio);
            g.gain.setValueAtTime(0.0001, t0 + inicio);
            g.gain.exponentialRampToValueAtTime(vol, t0 + inicio + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + inicio + dur);
            osc.connect(g);
            g.connect(master);
            osc.start(t0 + inicio);
            osc.stop(t0 + inicio + dur + 0.05);
        };

        // Arpegio ascendente (Do-Mi-Sol-Do)
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(f, i * 0.075, 0.28, 'triangle', 0.9));
        // Acorde final brillante
        [1046.5, 1318.5, 1568.0].forEach(f => nota(f, 0.30, 0.7, 'sine', 0.55));
        // Destellos agudos
        nota(2093.0, 0.33, 0.35, 'sine', 0.25);
        nota(2637.0, 0.40, 0.30, 'sine', 0.18);
    } catch (e) {}
}

// --- Modo automático de acarreos / préstamos (se recuerda entre visitas) ---
let acarreosAuto = true;
try {
    const guardado = localStorage.getItem('acarreosAuto');
    if (guardado !== null) acarreosAuto = guardado === '1';
} catch (e) {}

// Sincroniza interruptores y casillas: ON = automáticas (bloqueadas), OFF = las escribe el alumno
function aplicarModoAcarreos() {
    document.querySelectorAll('[data-switch-auto]').forEach(btn => {
        btn.setAttribute('aria-checked', acarreosAuto ? 'true' : 'false');
        btn.querySelector('.switch-estado').textContent = acarreosAuto ? 'ON' : 'OFF';
    });
    document.querySelectorAll('.suma-acarreo, .resta-prestamo, .mult-acarreo, .rep-acarreo, .rep-acarreo-inv').forEach(celda => {
        celda.readOnly = acarreosAuto;
        celda.tabIndex = acarreosAuto ? -1 : 0;
        if (!acarreosAuto) {
            celda.setAttribute('inputmode', 'numeric');
            celda.maxLength = 1;
            celda.autocomplete = 'off';
            // En suma/resta el acarreo es 0 o 1; en multiplicación puede ser 2, 3...
            const permitido = celda.classList.contains('mult-acarreo') ? /[0-9]/ : /[01]/;
            celda.oninput = () => { celda.value = (celda.value.match(permitido) || [''])[0]; };
        } else {
            celda.oninput = null;
        }
    });
}

function alternarAcarreosAuto() {
    acarreosAuto = !acarreosAuto;
    try { localStorage.setItem('acarreosAuto', acarreosAuto ? '1' : '0'); } catch (e) {}
    // Al cambiar de modo se limpian las casillas para empezar limpio
    document.querySelectorAll('.suma-acarreo, .resta-prestamo, .mult-acarreo, .rep-acarreo, .rep-acarreo-inv').forEach(c => { c.value = ''; });
    aplicarModoAcarreos();
    if (acarreosAuto) {
        actualizarAcarreos('suma');
        actualizarAcarreos('resta');
        actualizarAcarreos('mult');
        actualizarAcarreos('representacion');
        if (typeof actualizarAcarreosInverso === 'function') actualizarAcarreosInverso();
    }
}

// --- Modo aviso (solo resta): resalta minuendo=1, sustraendo=0 con préstamo entrante ---
let modoAviso = false;
try {
    const g = localStorage.getItem('modoAviso');
    if (g !== null) modoAviso = g === '1';
} catch (e) {}

// --- Cuaderno de división (decimal → binario por ÷2) ---
let cuadernoDivision = false;
try {
    const gDiv = localStorage.getItem('cuadernoDivision');
    if (gDiv !== null) cuadernoDivision = gDiv === '1';
} catch (e) {}
let ejercicioDivision = null; // { valor, pasos: [...], binario }
let divisionPasoVisible = 1; // cuántos pasos están desbloqueados (1-based count)
let divisionVistaActual = 0; // índice 0-based del paso que se ve en primer plano
let divisionInputActivo = null; // último input editable enfocado
// Valores guardados de cada paso (para no perderlos al cambiar de vista)
let divisionValores = []; // [{cociente, resto, producto}, ...]
let restosClickMode = false; // tras completar división: click abajo→arriba
let restosClickNext = 0;     // cuántos restos ya se han pulsado (desde abajo)
let restosUsados = {};      // índices ya usados
// Fase del cuaderno: 'suma' (exceso: N+sesgo) | 'division'
let cuadernoFase = 'division'; // 'division' | 'suma' | 'suma-inverso'
let sumaExceso = null; // { a, b, resultado, digitos: string, flip: bool }
let sumaExcesoInputActivo = 0; // índice de casilla de resultado
let sumaInverso = null; // { sumandos, total, digitos, metodo, sesgo?, valorFinal?, desdeInversion? }
let progresoCuadernoKey = null; // clave del ejercicio cuyo progreso está en memoria


function sincronizarSwitchAviso() {
    document.querySelectorAll('[data-switch-aviso]').forEach(btn => {
        btn.setAttribute('aria-checked', modoAviso ? 'true' : 'false');
        const est = btn.querySelector('.switch-estado');
        if (est) est.textContent = modoAviso ? 'ON' : 'OFF';
    });
}

function aplicarAvisosResta() {
    sincronizarSwitchAviso();
    const minuendos = document.querySelectorAll('.resta-minuendo');
    const sustraendos = document.querySelectorAll('.resta-sustraendo');
    // Limpia resaltados previos
    minuendos.forEach(c => c.classList.remove('aviso-prestamo'));
    sustraendos.forEach(c => c.classList.remove('aviso-prestamo'));
    if (!modoAviso || !ejercicioActualResta || !ejercicioActualResta.binA) return;

    const a = ejercicioActualResta.binA.padStart(9, '0');
    const b = ejercicioActualResta.binB.padStart(9, '0');
    const resultados = Array.from(document.querySelectorAll('.resta-res'));

    // ¿Están resueltas todas las columnas a la derecha de la posición i?
    // (el alumno rellena de derecha a izquierda; sin eso no hay aviso)
    const columnasDerechaResueltas = (i) => {
        for (let j = i + 1; j < resultados.length; j++) {
            if (!resultados[j] || resultados[j].value === '') return false;
        }
        return true;
    };

    // Recorre de derecha a izquierda calculando el préstamo entrante
    let entra = 0;
    for (let i = 8; i >= 0; i--) {
        const x = parseInt(a[i], 10);
        const y = parseInt(b[i], 10);
        // Aviso solo si:
        //  1) 1 en minuendo, 0 en sustraendo y préstamo entrante
        //  2) las columnas de la derecha (anteriores en el cálculo) ya están rellenadas
        if (x === 1 && y === 0 && entra === 1 && columnasDerechaResueltas(i)) {
            const min = document.querySelector(`.resta-minuendo[data-pos="${i}"]`);
            const sus = document.querySelector(`.resta-sustraendo[data-pos="${i}"]`);
            if (min) min.classList.add('aviso-prestamo');
            if (sus) sus.classList.add('aviso-prestamo');
        }
        const d = x - y - entra;
        entra = d < 0 ? 1 : 0;
    }
}

// --- Modo aviso (suma): resalta sumando A=0, sumando B=0 con acarreo entrante ---
// (ahí el acarreo se "resuelve": 0 + 0 + 1 = 1 y ya no se lleva nada a la izquierda)
function aplicarAvisosSuma() {
    sincronizarSwitchAviso();
    const sumandosA = document.querySelectorAll('.suma-sumando-a');
    const sumandosB = document.querySelectorAll('.suma-sumando-b');
    // Limpia resaltados previos
    sumandosA.forEach(c => c.classList.remove('aviso-acarreo'));
    sumandosB.forEach(c => c.classList.remove('aviso-acarreo'));
    if (!modoAviso || !ejercicioActualSuma || !ejercicioActualSuma.binA) return;

    const a = ejercicioActualSuma.binA.padStart(9, '0');
    const b = ejercicioActualSuma.binB.padStart(9, '0');
    const resultados = Array.from(document.querySelectorAll('.suma-res'));

    // ¿Están resueltas todas las columnas a la derecha de la posición i?
    // (el alumno rellena de derecha a izquierda; sin eso no hay aviso)
    const columnasDerechaResueltas = (i) => {
        for (let j = i + 1; j < resultados.length; j++) {
            if (!resultados[j] || resultados[j].value === '') return false;
        }
        return true;
    };

    // Recorre de derecha a izquierda calculando el acarreo entrante
    let entra = 0;
    for (let i = 8; i >= 0; i--) {
        const x = parseInt(a[i], 10);
        const y = parseInt(b[i], 10);
        // Aviso solo si:
        //  1) 0 en ambos sumandos y acarreo entrante (el acarreo se resuelve aquí)
        //  2) las columnas de la derecha (anteriores en el cálculo) ya están rellenadas
        if (x === 0 && y === 0 && entra === 1 && columnasDerechaResueltas(i)) {
            const sa = document.querySelector(`.suma-sumando-a[data-pos="${i}"]`);
            const sb = document.querySelector(`.suma-sumando-b[data-pos="${i}"]`);
            if (sa) sa.classList.add('aviso-acarreo');
            if (sb) sb.classList.add('aviso-acarreo');
        }
        const t = x + y + entra;
        entra = t >= 2 ? 1 : 0;
    }
}

function alternarModoAviso() {
    modoAviso = !modoAviso;
    try { localStorage.setItem('modoAviso', modoAviso ? '1' : '0'); } catch (e) {}
    aplicarAvisosResta();
    aplicarAvisosSuma();
}

let ejercicioActualResta = {};
let ejercicioActualMultiplicacion = {};
let ejercicioActualRepresentacion = {};

// --- REGISTRO DE ERRORES (suma y resta) ---
// Se vacía cada vez que se genera un ejercicio nuevo (botón "Nuevo").
const logErrores = { suma: [], resta: [], multiplicacion: [], representacion: [] };

// Datos de cada columna con los operandos reales (k = 1 es la columna de la derecha)
function detalleColumnas(tipo) {
    const ej = tipo === 'suma' ? ejercicioActualSuma : ejercicioActualResta;
    const a = ej.binA.padStart(9, '0');
    const b = ej.binB.padStart(9, '0');
    const cols = [];
    let entra = 0;
    for (let i = 8; i >= 0; i--) {
        const x = parseInt(a[i]), y = parseInt(b[i]);
        let bit, sale;
        if (tipo === 'suma') {
            const s = x + y + entra;
            bit = s % 2;
            sale = s >= 2 ? 1 : 0;
        } else {
            const d = x - y - entra;
            sale = d < 0 ? 1 : 0;
            bit = sale ? d + 2 : d;
        }
        cols.push({ k: 9 - i, x, y, entra, sale, bit });
        entra = sale;
    }
    return cols;
}

function registrarError(tipo) {
    const esSuma = tipo === 'suma';
    const esResta = tipo === 'resta';
    const esMultiplicacion = tipo === 'multiplicacion';
    const esRepresentacion = tipo === 'representacion';
    const ej = esSuma ? ejercicioActualSuma : (esResta ? ejercicioActualResta : (esMultiplicacion ? ejercicioActualMultiplicacion : ejercicioActualRepresentacion));
    const errores = [];
    let userBin = '';

    if (esRepresentacion) {
        const filas = obtenerFilasRepresentacion();
        filas.forEach(f => {
            const escrito = leerFilaRepresentacion(f.inputs);
            if (escrito !== f.esperado) errores.push({ tipo: f.tipo, fila: f.nombre, esperado: f.esperado, escrito, vacia: f.inputs.some(inp => inp.value === '') });
        });
        // Acarreos no se registran como error bloqueante (solo filas de bits)

        userBin = filas.map(f => leerFilaRepresentacion(f.inputs)).join('|');
    } else if (esMultiplicacion) {
        // En multiplicación registramos cada fila parcial incorrecta y/o el resultado final.
        ej.parciales.forEach((p, i) => {
            const inputs = Array.from(document.querySelectorAll(`.mult-parcial[data-row="${i}"]`));
            const esperado = p.bin;
            const escrito = leerFilaMultiplicacion(inputs);
            userBin += escrito;
            if (escrito !== esperado) {
                errores.push({
                    tipo: 'parcial', fila: i + 1, bit: p.bit, shift: p.shift,
                    esperado, escrito, vacia: inputs.some(inp => inp.value === '')
                });
            }
        });

        const inputsRes = Array.from(document.querySelectorAll('.mult-res'));
        const esperadoRes = ej.binResultado.padStart(ej.ancho, '0');
        const escritoRes = leerFilaMultiplicacion(inputsRes);
        userBin += escritoRes;
        if (escritoRes !== esperadoRes) {
            errores.push({
                tipo: 'resultado', fila: 'final',
                esperado: esperadoRes, escrito: escritoRes,
                vacia: inputsRes.some(inp => inp.value === '')
            });
        }
    } else {
        const inputs = Array.from(document.querySelectorAll(esSuma ? '.suma-res' : '.resta-res'));
        const cols = detalleColumnas(tipo);
        inputs.forEach((inp, idx) => {
            const raw = inp.value.trim();
            const ub = raw === '1' ? '1' : '0';
            userBin += ub;
            const col = cols[9 - idx - 1];
            if (ub !== String(col.bit)) {
                errores.push({
                    k: col.k, x: col.x, y: col.y, entra: col.entra, sale: col.sale,
                    esperado: col.bit, vacia: raw === '', escrito: ub
                });
            }
        });
    }

    const log = logErrores[tipo];
    if (!log.length || log[log.length - 1].userBin !== userBin) {
        log.push({
            n: log.length + 1,
            userBin,
            userDec: (esMultiplicacion || esRepresentacion) ? null : parseInt(userBin, 2),
            correctoDec: esSuma ? ej.sumaReal : (esResta ? ej.restaReal : (esMultiplicacion ? ej.multReal : ej.numDecimal)),
            errores
        });
    }
    requestAnimationFrame(() => renderizarLogErrores(tipo));
}

function reiniciarLogErrores(tipo) {
    logErrores[tipo] = [];
    renderizarLogErrores(tipo);
}

// Una columna del error, dibujada como la operación principal (cuadros uno debajo del otro)
function columnaErrorHTML(tipo, er) {
    const esSuma = tipo === 'suma';
    const signo = (s, cls) => `<span class="w-4 shrink-0 text-center font-bold ${cls || ''}">${s}</span>`;
    const celda = (txt, cls) => `<div class="binary-cell flex items-center justify-center ${cls}">${txt}</div>`;
    const etiqueta = (txt, cls) => `<span class="w-16 text-left text-[10px] sm:text-xs leading-none ${cls}">${txt}</span>`;
    const fila = (izq, centro, der) => `<div class="flex items-center gap-1">${izq}${centro}${der || etiqueta('', '')}</div>`;
    const neutra = 'bg-gray-50 text-gray-800';

    const carryEntrada = `<div class="cell-slot flex justify-center"><div class="carry-cell flex items-center justify-center">${er.entra ? '1' : ''}</div></div>`;

    return `
        <div class="bg-white border border-red-200 rounded-lg px-2 py-2 flex flex-col items-start font-mono">
            <span class="self-stretch text-center text-[10px] sm:text-xs font-bold text-red-700 mb-1 font-sans">Columna ${er.k}</span>
            <div class="flex flex-col gap-1">
                ${fila(signo(''), carryEntrada, etiqueta(esSuma ? 'acarreo' : 'préstamo', 'text-red-500 handwriting'))}
                ${fila(signo(''), celda(er.x, neutra))}
                ${fila(signo(esSuma ? '+' : '−', esSuma ? 'text-blue-600' : 'text-amber-600'), celda(er.y, neutra))}
                <div class="flex"><div class="border-t-2 border-gray-800 w-12 sm:w-14"></div></div>
                ${fila(signo('✓', 'text-emerald-600'), celda(er.esperado, 'bg-emerald-50 border-emerald-500 text-emerald-700'), etiqueta('debía ser', 'text-emerald-700 font-sans font-semibold'))}
                ${fila(signo('✗', 'text-red-600'), celda(er.vacia ? '·' : er.escrito, 'bg-red-50 border-red-500 text-red-700'), etiqueta(er.vacia ? 'vacía' : 'escribiste', 'text-red-700 font-sans font-semibold'))}
            </div>
            ${er.sale ? `<span class="handwriting text-red-500 text-xs sm:text-sm mt-1">↖ ${esSuma ? 'llevas 1' : 'pides prestado 1'}</span>` : ''}
        </div>`;
}

function renderizarLogErrores(tipo) {
    const cont = document.getElementById('log-' + tipo);
    if (!cont) return;
    const log = logErrores[tipo];
    const esMultiplicacion = tipo === 'multiplicacion';
    const esRepresentacion = tipo === 'representacion';
    const ej = tipo === 'suma' ? ejercicioActualSuma : (tipo === 'resta' ? ejercicioActualResta : (tipo === 'multiplicacion' ? ejercicioActualMultiplicacion : ejercicioActualRepresentacion));
    const binCorrecto = ej && ej.binResultado ? ej.binResultado : '';
    const totalCols = log.reduce((s, e) => s + e.errores.length, 0);

    let cuerpo;
    if (!log.length) {
        cuerpo = `<p class="text-xs sm:text-sm text-gray-500 italic">Todavía no hay errores en este ejercicio. Si te equivocas, aparecerán aquí al pulsar «Corregir Ejercicio».</p>`;
    } else {
        cuerpo = log.slice().reverse().map(e => {
            let detalle;
            if (esRepresentacion) {
                detalle = e.errores.map(er => {
                    const titulo = er.tipo === 'acarreos' ? 'Acarreos' : er.fila;
                    return `<div class="bg-white border border-red-200 rounded-lg px-2 py-2 font-mono min-w-[12rem]">
                        <span class="block text-center text-[10px] sm:text-xs font-bold text-red-700 mb-1 font-sans">${titulo}</span>
                        <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><div class="binary-cell celda-texto flex items-center justify-center bg-emerald-50 border-emerald-500 text-emerald-700">${er.esperado}</div><span class="text-[10px] sm:text-xs text-emerald-700 font-sans font-semibold">debía ser</span></div>
                        <div class="flex items-center gap-2 mt-1"><span class="text-red-600 font-bold">✗</span><div class="binary-cell celda-texto flex items-center justify-center bg-red-50 border-red-500 text-red-700">${er.vacia ? '·' : er.escrito}</div><span class="text-[10px] sm:text-xs text-red-700 font-sans font-semibold">${er.vacia ? 'vacía' : 'escribiste'}</span></div>
                    </div>`;
                }).join('');
            } else if (esMultiplicacion) {
                detalle = e.errores.map(er => {
                    const titulo = er.tipo === 'parcial' ? `Fila ${er.fila} · A × ${er.bit}${er.shift ? ` (←${er.shift})` : ''}` : 'Resultado final';
                    const claseEsperado = 'bg-emerald-50 border-emerald-500 text-emerald-700';
                    const claseEscrito = 'bg-red-50 border-red-500 text-red-700';
                    return `<div class="bg-white border border-red-200 rounded-lg px-2 py-2 font-mono min-w-[12rem] max-w-full">
                        <span class="block text-center text-[10px] sm:text-xs font-bold text-red-700 mb-1 font-sans">${titulo}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <div class="binary-cell celda-texto flex items-center justify-center ${claseEsperado}">${er.esperado}</div>
                            <span class="text-[10px] sm:text-xs text-emerald-700 font-sans font-semibold">debía ser</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-red-600 font-bold">✗</span>
                            <div class="binary-cell celda-texto flex items-center justify-center ${claseEscrito}">${er.vacia ? '·' : er.escrito}</div>
                            <span class="text-[10px] sm:text-xs text-red-700 font-sans font-semibold">${er.vacia ? 'vacía' : 'escribiste'}</span>
                        </div>
                    </div>`;
                }).join('');
            } else {
                detalle = e.errores.slice().sort((a, b) => b.k - a.k).map(er => columnaErrorHTML(tipo, er)).join('');
            }
            const userLabel = esRepresentacion ? `${ej.metodoNombre} · ${ej.numDecimal} decimal` : (esMultiplicacion ? 'respuesta registrada' : `${e.userDec} (${e.userDec.toString(2)})`);
            return `
                <div class="bg-white/80 border border-red-200 rounded-lg p-2.5">
                    <p class="text-xs sm:text-sm font-semibold text-gray-800">
                        Intento ${e.n}: ${userLabel}
                        ${esRepresentacion ? `· Resultado: <span class="code-font">${ej.resultado}</span>` : `en lugar de <span class="code-font">${binCorrecto}</span> (${e.correctoDec})`}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2 justify-start">${detalle}</div>
                </div>`;
        }).join('');
    }

    cont.innerHTML = `
        <div class="border-2 ${log.length ? 'border-red-300 bg-red-50/70' : 'border-gray-200 bg-gray-50/70'} rounded-xl p-3">
            <div class="flex items-center justify-between gap-2 mb-2">
                <h3 class="title-handwriting text-xl sm:text-2xl font-bold ${log.length ? 'text-red-800' : 'text-gray-600'}">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> Registro de errores
                </h3>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full ${log.length ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}">
                    ${log.length ? log.length + (log.length === 1 ? ' intento fallido · ' : ' intentos fallidos · ') + totalCols + (totalCols === 1 ? ' fallo' : ' fallos') : 'Sin errores'}
                </span>
            </div>
            <div class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">${cuerpo}</div>
            <p class="text-[10px] sm:text-xs text-gray-400 mt-2">El registro se borra al pulsar «Nuevo».</p>
        </div>`;
}

// --- 1. SUMA BINARIA ---
function reiniciarEjercicioSuma() {
    const bits = parseInt(document.getElementById('dificultad-suma').value);
    const maxVal = Math.pow(2, bits) - 1;
    const minVal = Math.pow(2, bits - 1);
    const numA = randomInt(minVal, maxVal);
    const numB = randomInt(1, maxVal);
    const sumaReal = numA + numB;

    ejercicioActualSuma = {
        numA,
        numB,
        binA: numA.toString(2),
        binB: numB.toString(2),
        sumaReal,
        binResultado: sumaReal.toString(2)
    };

    reiniciarLogErrores('suma');
    mostrarBotonNuevo('suma', false);
    renderizarFormularioSuma();
    document.getElementById('feedback-suma').classList.add('hidden');
}

function renderizarFormularioSuma() {
    const container = document.getElementById('contenedor-suma');
    const binA = ejercicioActualSuma.binA.padStart(9, '0');
    const binB = ejercicioActualSuma.binB.padStart(9, '0');
    const len = binA.length;

    let html = '';
    
    // Fila de acarreos (Carries)
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-[10px] sm:text-xs text-red-500 handwriting mr-1 sm:mr-2">Acarreos:</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="cell-slot flex justify-center"><input type="text" data-pos="${i}" class="carry-cell suma-acarreo" placeholder="0" readonly tabindex="-1"></div>`;
    }
    html += `</div>`;

    // Número A
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-[10px] sm:text-xs text-gray-400 mr-1 sm:mr-2">(${ejercicioActualSuma.numA})₂</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="binary-cell suma-sumando-a flex items-center justify-center bg-gray-50 text-gray-800" data-pos="${i}">${binA[i]}</div>`;
    }
    html += `</div>`;

    // Número B con signo +
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-blue-600 font-bold mr-1">+</span><span class="text-[10px] sm:text-xs text-gray-400 mr-1 sm:mr-2">(${ejercicioActualSuma.numB})₂</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="binary-cell suma-sumando-b flex items-center justify-center bg-gray-50 text-gray-800" data-pos="${i}">${binB[i]}</div>`;
    }
    html += `</div>`;

    // Línea divisoria
    html += `<div class="w-full border-t-2 border-gray-800 my-1"></div>`;

    // Resultado del usuario
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-xs sm:text-sm text-amber-700 font-bold mr-1 sm:mr-2">Rpta:</span>`;
    for (let i = 0; i < len; i++) {
        html += `<input type="text" inputmode="numeric" maxlength="1" data-pos="${i}" class="binary-cell suma-res focus:ring-2 focus:ring-blue-500" autocomplete="off" readonly>`;
    }
    html += `</div>`;

    container.innerHTML = html;
    container.style.setProperty('--cols', len);
    aplicarModoAcarreos();
    aplicarAvisosSuma();
    alinearOperacionDerecha();
}

function comprobarSuma() {
    // Si ya se ha escrito algo, la operación termina aquí (bien o mal): se ofrece generar una nueva
    if (Array.from(document.querySelectorAll('.suma-res')).some(i => i.value !== '')) mostrarBotonNuevo('suma', true);
    const inputsRes = document.querySelectorAll('.suma-res');
    let usuarioBin = '';
    inputsRes.forEach(inp => {
        usuarioBin += inp.value.trim() === '1' ? '1' : '0';
    });

    const userVal = parseInt(usuarioBin, 2);
    // Ocultar feedback inline antiguo (el aviso va al toast centrado)
    const feedbackEl = document.getElementById('feedback-suma');
    if (feedbackEl) feedbackEl.classList.add('hidden');

    const correctBin = ejercicioActualSuma.binResultado.padStart(9, '0');
    if (userVal === ejercicioActualSuma.sumaReal) {
        inputsRes.forEach(inp => inp.classList.remove('error'));
        mostrarToast(true, '¡Excelente!', `${ejercicioActualSuma.numA} + ${ejercicioActualSuma.numB} = ${ejercicioActualSuma.sumaReal}`);
        setTimeout(reproducirSonidoAcierto, 60);
    } else {
        inputsRes.forEach((inp, idx) => {
            const userBit = inp.value.trim() === '1' ? '1' : '0';
            if (userBit !== correctBin[idx]) {
                inp.classList.add('error');
            } else {
                inp.classList.remove('error');
            }
        });
        registrarError('suma');
        mostrarToast(false, 'Revisa el cálculo', `Era ${ejercicioActualSuma.sumaReal} (${ejercicioActualSuma.binResultado})`);
    }
}

function mostrarAyudaSuma() {
    const correctBin = ejercicioActualSuma.binResultado.padStart(9, '0');
    const inputsRes = document.querySelectorAll('.suma-res');
    inputsRes.forEach((inp, idx) => {
        inp.value = correctBin[idx];
        inp.classList.remove('error');
    });
    actualizarAcarreos('suma', true);
    mostrarBotonNuevo('suma', true);
    const feedbackEl = document.getElementById('feedback-suma');
    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = `<p class="handwriting text-amber-800 text-base sm:text-lg font-bold bg-amber-50 p-2 rounded border border-amber-200">💡 Solución revelada: El resultado es ${ejercicioActualSuma.sumaReal} (${ejercicioActualSuma.binResultado})</p>`;
}


// --- 2. RESTA BINARIA ---
function reiniciarEjercicioResta() {
    const bits = parseInt(document.getElementById('dificultad-resta').value);
    const maxVal = Math.pow(2, bits) - 1;
    const minVal = Math.pow(2, bits - 1);
    let numA = randomInt(minVal, maxVal);
    let numB = randomInt(1, maxVal - 1);
    if (numA < numB) { let aux = numA; numA = numB; numB = aux; }

    const restaReal = numA - numB;

    ejercicioActualResta = {
        numA,
        numB,
        binA: numA.toString(2),
        binB: numB.toString(2),
        restaReal,
        binResultado: restaReal.toString(2)
    };

    reiniciarLogErrores('resta');
    mostrarBotonNuevo('resta', false);
    renderizarFormularioResta();
    document.getElementById('feedback-resta').classList.add('hidden');
}

function renderizarFormularioResta() {
    const container = document.getElementById('contenedor-resta');
    const binA = ejercicioActualResta.binA.padStart(9, '0');
    const binB = ejercicioActualResta.binB.padStart(9, '0');
    const len = binA.length;

    let html = '';

    // Fila de préstamos (opcional, no se corrige): 1 sobre la columna que necesita pedir prestado
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-[10px] sm:text-xs text-red-500 handwriting mr-1 sm:mr-2" title="Aparece solo: si una columna pide prestado, la de su izquierda debe restar ese 1">Préstamos:</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="cell-slot flex justify-center"><input type="text" data-pos="${i}" class="carry-cell resta-prestamo" placeholder="0" readonly tabindex="-1"></div>`;
    }
    html += `</div>`;

    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-[10px] sm:text-xs text-gray-400 mr-1 sm:mr-2">(${ejercicioActualResta.numA})₂</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="binary-cell resta-minuendo flex items-center justify-center bg-gray-50 text-gray-800" data-pos="${i}">${binA[i]}</div>`;
    }
    html += `</div>`;

    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-amber-600 font-bold mr-1">-</span><span class="text-[10px] sm:text-xs text-gray-400 mr-1 sm:mr-2">(${ejercicioActualResta.numB})₂</span>`;
    for (let i = 0; i < len; i++) {
        html += `<div class="binary-cell resta-sustraendo flex items-center justify-center bg-gray-50 text-gray-800" data-pos="${i}">${binB[i]}</div>`;
    }
    html += `</div>`;

    html += `<div class="w-full border-t-2 border-gray-800 my-1"></div>`;

    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="text-xs sm:text-sm text-amber-700 font-bold mr-1 sm:mr-2">Rpta:</span>`;
    for (let i = 0; i < len; i++) {
        html += `<input type="text" inputmode="numeric" maxlength="1" data-pos="${i}" class="binary-cell resta-res focus:ring-2 focus:ring-amber-500" autocomplete="off" readonly>`;
    }
    html += `</div>`;

    container.innerHTML = html;
    container.style.setProperty('--cols', len);
    aplicarModoAcarreos();
    aplicarAvisosResta();
    alinearOperacionDerecha();
}

function comprobarResta() {
    // Si ya se ha escrito algo, la operación termina aquí (bien o mal): se ofrece generar una nueva
    if (Array.from(document.querySelectorAll('.resta-res')).some(i => i.value !== '')) mostrarBotonNuevo('resta', true);
    const inputsRes = document.querySelectorAll('.resta-res');
    let usuarioBin = '';
    inputsRes.forEach(inp => {
        usuarioBin += inp.value.trim() === '1' ? '1' : '0';
    });

    const userVal = parseInt(usuarioBin, 2);
    const feedbackEl = document.getElementById('feedback-resta');
    if (feedbackEl) feedbackEl.classList.add('hidden');

    const correctBin = ejercicioActualResta.binResultado.padStart(9, '0');
    if (userVal === ejercicioActualResta.restaReal) {
        inputsRes.forEach(inp => inp.classList.remove('error'));
        mostrarToast(true, '¡Impecable!', `${ejercicioActualResta.numA} − ${ejercicioActualResta.numB} = ${ejercicioActualResta.restaReal}`);
        setTimeout(reproducirSonidoAcierto, 60);
    } else {
        inputsRes.forEach((inp, idx) => {
            const userBit = inp.value.trim() === '1' ? '1' : '0';
            if (userBit !== correctBin[idx]) {
                inp.classList.add('error');
            } else {
                inp.classList.remove('error');
            }
        });
        registrarError('resta');
        mostrarToast(false, 'Cuidado con los préstamos', `Era ${ejercicioActualResta.restaReal} (${ejercicioActualResta.binResultado})`);
    }
}

function mostrarAyudaResta() {
    const correctBin = ejercicioActualResta.binResultado.padStart(9, '0');
    const inputsRes = document.querySelectorAll('.resta-res');
    inputsRes.forEach((inp, idx) => {
        inp.value = correctBin[idx];
        inp.classList.remove('error');
    });

    actualizarAcarreos('resta', true);
    mostrarBotonNuevo('resta', true);

    const feedbackEl = document.getElementById('feedback-resta');
    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = `<p class="handwriting text-amber-800 text-base sm:text-lg font-bold bg-amber-50 p-2 rounded border border-amber-200">💡 Solución revelada: El resultado es ${ejercicioActualResta.restaReal} (${ejercicioActualResta.binResultado})</p>`;
}


// --- 3. MULTIPLICACIÓN BINARIA ---
function reiniciarEjercicioMultiplicacion() {
    const bits = parseInt(document.getElementById('dificultad-multiplicacion').value);
    const maxVal = Math.pow(2, bits) - 1;
    const numA = randomInt(3, maxVal);
    const numB = randomInt(2, maxVal);
    const multReal = numA * numB;
    const binA = numA.toString(2);
    const binB = numB.toString(2);

    // Una fila de producto parcial por cada bit del multiplicador (de derecha a izquierda)
    const parciales = binB.split('').reverse().map((bit, i) => ({
        bit,
        shift: i,
        bin: bit === '1' ? binA : '0'.repeat(binA.length)
    }));

    ejercicioActualMultiplicacion = {
        numA,
        numB,
        binA,
        binB,
        multReal,
        binResultado: multReal.toString(2),
        parciales,
        ancho: binA.length + binB.length
    };

    reiniciarLogErrores('multiplicacion');
    mostrarBotonNuevo('multiplicacion', false);
    renderizarFormularioMultiplicacion();
    document.getElementById('feedback-multiplicacion').classList.add('hidden');
}

function renderizarFormularioMultiplicacion() {
    const container = document.getElementById('contenedor-multiplicacion');
    const ej = ejercicioActualMultiplicacion;
    const W = ej.ancho;
    const lenA = ej.binA.length;
    const lenB = ej.binB.length;

    const spacers = n => '<div class="binary-cell invisible"></div>'.repeat(Math.max(0, n));
    const fija = txt => `<div class="binary-cell flex items-center justify-center bg-gray-50 text-gray-800">${txt}</div>`;
    const fila = (label, inner, idx) => `
        <div ${idx !== undefined ? `data-fila="${idx}"` : ''} class="flex items-center gap-1 justify-end w-full rounded-lg px-1 transition-colors">
            <span class="lbl-mult shrink-0 text-right text-[10px] sm:text-xs leading-tight pr-1 sm:pr-2">${label}</span>
            ${inner}
        </div>`;

    let html = '';

    // Multiplicando
    html += fila(`<span class="text-gray-400">(${ej.numA})₁₀</span>`,
        spacers(W - lenA) + ej.binA.split('').map(fija).join(''));

    // Multiplicador
    html += fila(`<span class="text-emerald-600 font-bold text-sm mr-1">×</span><span class="text-gray-400">(${ej.numB})₁₀</span>`,
        spacers(W - lenB) + ej.binB.split('').map(fija).join(''));

    html += `<div class="w-full border-t-2 border-gray-800 my-1"></div>`;

    // Fila de acarreos de la suma final (opcional, no se corrige)
    let acarreos = '';
    for (let i = 0; i < W; i++) {
        acarreos += `<div class="cell-slot flex justify-center"><input type="text" data-pos="${i}" class="carry-cell mult-acarreo" placeholder="0" readonly tabindex="-1"></div>`;
    }
    html += fila(`<span class="text-red-500 handwriting">Acarreos:</span>`, acarreos);

    // Productos parciales: una fila por bit del multiplicador
    ej.parciales.forEach((p, i) => {
        let inner = spacers(W - lenA - p.shift);
        for (let c = 0; c < lenA; c++) {
            inner += `<input type="text" inputmode="numeric" maxlength="1" data-row="${i}" data-col="${c}" class="binary-cell mult-parcial mult-input focus:ring-2 focus:ring-emerald-500" autocomplete="off" readonly>`;
        }
        for (let s = 0; s < p.shift; s++) {
            inner += `<div class="binary-cell flex items-center justify-center bg-emerald-50 text-emerald-400 border-dashed" title="Desplazamiento">0</div>`;
        }
        const etiqueta = `<span class="handwriting text-emerald-800 text-xs sm:text-sm">Fila ${i + 1}: A × ${p.bit}${p.shift ? ` <span class="text-gray-400">(←${p.shift})</span>` : ''}</span>`;
        html += fila(etiqueta, inner, i);
    });

    html += `<div class="w-full border-t-2 border-gray-800 my-1"></div>`;

    // Resultado final (suma de las filas)
    let res = '';
    for (let i = 0; i < W; i++) {
        res += `<input type="text" inputmode="numeric" maxlength="1" data-row="${ej.parciales.length}" data-pos="${i}" class="binary-cell mult-res mult-input focus:ring-2 focus:ring-emerald-500" autocomplete="off" readonly>`;
    }
    html += fila(`<span class="text-amber-700 font-bold text-xs sm:text-sm">Suma:</span>`, res, ej.parciales.length);

    container.innerHTML = html;
    container.style.setProperty('--cols', W);
    aplicarModoAcarreos();
    resaltarFilaActivaMult();
    alinearOperacionDerecha();
}

// Agrupa las casillas por fila (parciales 0..n-1 y resultado n)
function filasMultiplicacion() {
    const n = ejercicioActualMultiplicacion.parciales.length + 1;
    const filas = [];
    for (let r = 0; r < n; r++) {
        filas.push(Array.from(document.querySelectorAll(`.mult-input[data-row="${r}"]`)));
    }
    return filas;
}

// Teclado: rellena la primera fila incompleta, de derecha a izquierda
function insertarDigitoMult(digito) {
    for (const fila of filasMultiplicacion()) {
        for (let i = fila.length - 1; i >= 0; i--) {
            if (fila[i].value === '') {
                fila[i].value = digito;
                fila[i].classList.remove('error');
                fila[i].style.borderColor = '';
                actualizarAcarreos('mult');
                resaltarFilaActivaMult();
                return;
            }
        }
    }
}

// Borrar: quita el último bit escrito (la fila más avanzada con contenido)
function borrarDigitoMult() {
    const filas = filasMultiplicacion();
    for (let r = filas.length - 1; r >= 0; r--) {
        const fila = filas[r];
        for (let i = 0; i < fila.length; i++) {
            if (fila[i].value !== '') {
                fila[i].value = '';
                fila[i].classList.remove('error');
                fila[i].style.borderColor = '';
                actualizarAcarreos('mult');
                resaltarFilaActivaMult();
                return;
            }
        }
    }
}

function resaltarFilaActivaMult() {
    const filas = filasMultiplicacion();
    const activa = filas.findIndex(f => f.some(inp => inp.value === ''));
    document.querySelectorAll('#contenedor-multiplicacion [data-fila]').forEach(el => {
        el.classList.toggle('bg-emerald-100/60', parseInt(el.dataset.fila) === activa);
    });
}

function leerFilaMultiplicacion(inputs) {
    let s = '';
    inputs.forEach(inp => { s += inp.value.trim() === '1' ? '1' : '0'; });
    return s;
}

function comprobarMultiplicacion() {
    // Si ya se ha escrito algo, la operación termina aquí (bien o mal): se ofrece generar una nueva
    if (Array.from(document.querySelectorAll('.mult-input')).some(i => i.value !== '')) mostrarBotonNuevo('multiplicacion', true);
    const ej = ejercicioActualMultiplicacion;
    const filasMal = [];

    ej.parciales.forEach((p, i) => {
        const inputs = document.querySelectorAll(`.mult-parcial[data-row="${i}"]`);
        const escrito = leerFilaMultiplicacion(inputs);
        const ok = escrito === p.bin;
        inputs.forEach((inp, c) => {
            const userBit = inp.value.trim() === '1' ? '1' : '0';
            if (userBit !== p.bin[c]) {
                inp.classList.add('error');
                inp.style.borderColor = '';
            } else {
                inp.classList.remove('error');
                inp.style.borderColor = ok ? '#10b981' : '';
            }
        });
        if (!ok) filasMal.push(i + 1);
    });

    const inputsRes = document.querySelectorAll('.mult-res');
    const correctRes = ej.binResultado.padStart(ej.ancho, '0');
    const resOk = leerFilaMultiplicacion(inputsRes) === correctRes;
    inputsRes.forEach((inp, idx) => {
        const userBit = inp.value.trim() === '1' ? '1' : '0';
        if (userBit !== correctRes[idx]) {
            inp.classList.add('error');
            inp.style.borderColor = '';
        } else {
            inp.classList.remove('error');
            inp.style.borderColor = resOk ? '#10b981' : '';
        }
    });

    const feedbackEl = document.getElementById('feedback-multiplicacion');
    if (feedbackEl) feedbackEl.classList.add('hidden');

    if (filasMal.length === 0 && resOk) {
        mostrarToast(true, '¡Sobresaliente!', `${ej.numA} × ${ej.numB} = ${ej.multReal}`);
        setTimeout(reproducirSonidoAcierto, 60);
    } else {
        registrarError('multiplicacion');
        let msg = '';
        if (filasMal.length) msg += `Revisa ${filasMal.length > 1 ? 'las filas' : 'la fila'} ${filasMal.join(', ')}. `;
        if (!resOk) msg += `Suma final: ${ej.multReal} (${ej.binResultado})`;
        mostrarToast(false, 'Error en el producto', msg.trim() || 'Revisa el cálculo');
    }
}

function mostrarAyudaMultiplicacion() {
    const ej = ejercicioActualMultiplicacion;
    ej.parciales.forEach((p, i) => {
        document.querySelectorAll(`.mult-parcial[data-row="${i}"]`).forEach((inp, c) => {
            inp.value = p.bin[c];
            inp.classList.remove('error');
            inp.style.borderColor = '';
        });
    });
    const correctBin = ej.binResultado.padStart(ej.ancho, '0');
    document.querySelectorAll('.mult-res').forEach((inp, idx) => {
        inp.value = correctBin[idx];
        inp.classList.remove('error');
        inp.style.borderColor = '';
    });
    actualizarAcarreos('mult', true);
    mostrarBotonNuevo('multiplicacion', true);
    resaltarFilaActivaMult();
    const feedbackEl = document.getElementById('feedback-multiplicacion');
    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = `<p class="handwriting text-amber-800 text-base sm:text-lg font-bold bg-amber-50 p-2 rounded border border-amber-200">💡 Solución revelada: El producto es ${ej.multReal} (${ej.binResultado})</p>`;
}

// --- 4. REPRESENTACIÓN DE NÚMEROS CON SIGNO ---
function nombreMetodoRepresentacion(metodo, bits) {
    if (metodo === 'signo-magnitud') return 'Signo-magnitud';
    if (metodo === 'complemento-1') return 'Complemento a 1';
    if (metodo === 'complemento-2') return 'Complemento a 2';
    if (metodo === 'exceso') {
        const sesgo = (typeof bits === 'number' ? bits : 8);
        const bias = Math.pow(2, sesgo - 1) - 1;
        return 'Exceso a ' + bias;
    }
    return metodo;
}

function calcularRepresentacion(valor, bits, metodo) {
    const abs = Math.abs(valor);
    const absBin = abs.toString(2).padStart(bits, '0');
    const signo = valor < 0 ? '1' : '0';
    if (metodo === 'signo-magnitud') {
        const magnitud = abs.toString(2).padStart(bits - 1, '0');
        return { filas: [signo, magnitud], resultado: signo + magnitud, etiquetas: ['Bit de signo', 'Valor absoluto'], incluyeAcarreos: false };
    }
    if (metodo === 'exceso') {
        const sesgo = Math.pow(2, bits - 1) - 1;
        const almacenado = valor + sesgo;
        const bin = almacenado.toString(2).padStart(bits, '0').slice(-bits);
        return {
            filas: [bin],
            resultado: bin,
            etiquetas: ['N + ' + sesgo],
            incluyeAcarreos: false,
            sesgo
        };
    }
    if (valor >= 0) {
        return { filas: [absBin, absBin], resultado: absBin, etiquetas: ['Valor absoluto', 'Representación'], incluyeAcarreos: false };
    }
    const invertido = absBin.split('').map(b => b === '0' ? '1' : '0').join('');
    if (metodo === 'complemento-1') {
        return { filas: [absBin, invertido], resultado: invertido, etiquetas: ['Valor absoluto', 'Invertir bits'], incluyeAcarreos: false };
    }
    // Complemento a 2 (negativo)
    const masUno = (parseInt(invertido, 2) + 1).toString(2).padStart(bits, '0').slice(-bits);
    const acarreos = [];
    let carry = 1;
    for (let i = bits - 1; i >= 0; i--) {
        acarreos[i] = carry;
        carry = (parseInt(invertido[i], 2) + carry >= 2) ? 1 : 0;
    }
    return { filas: [absBin, invertido, masUno], resultado: masUno, etiquetas: ['Valor absoluto', 'Invertir bits', 'Sumar 1'], incluyeAcarreos: true, acarreosEsperados: acarreos.join('') };
}

function reiniciarEjercicioRepresentacion() {
    if (modoRepresentacion === 'inverso') return reiniciarEjercicioRepresentacionInverso();
    const bits = parseInt(document.getElementById('dificultad-representacion').value);
    let metodo = document.getElementById('metodo-representacion').value;
    let valor;
    if (metodo === 'exceso') {
        const sesgo = Math.pow(2, bits - 1) - 1;
        const minV = -sesgo;
        const maxV = Math.pow(2, bits) - 1 - sesgo;
        // Evitar 0 para que el ejercicio no sea trivial
        do {
            valor = randomInt(minV, maxV);
        } while (valor === 0);
    } else {
        const limiteNeg = metodo === 'complemento-2' ? Math.pow(2, bits - 1) : Math.pow(2, bits - 1) - 1;
        const maxPos = Math.pow(2, bits - 1) - 1;
        const esNegativo = randomNext() < 0.82;
        if (esNegativo) valor = -randomInt(1, Math.max(1, limiteNeg));
        else valor = randomInt(1, Math.max(1, maxPos));
    }
    const calc = calcularRepresentacion(valor, bits, metodo);
    ejercicioActualRepresentacion = { bits, metodo, metodoNombre: nombreMetodoRepresentacion(metodo, bits), numDecimal: valor, resultado: calc.resultado, filasEsperadas: calc.filas, etiquetas: calc.etiquetas, incluyeAcarreos: calc.incluyeAcarreos, acarreosEsperados: calc.acarreosEsperados || '', sesgo: calc.sesgo };
    progresoCuadernoKey = null;
    sumaExceso = null;
    ejercicioDivision = null;
    divisionValores = [];
    // Reset modo click de restos
    restosClickMode = false;
    restosClickNext = 0;
    restosUsados = {};
    reiniciarLogErrores('representacion');
    mostrarBotonNuevo('representacion', false);
    renderizarFormularioRepresentacion();
    document.getElementById('feedback-representacion').classList.add('hidden');
    asegurarCuadernoAbierto();
}

function renderizarFormularioRepresentacion() {
    const ej = ejercicioActualRepresentacion;
    const cont = document.getElementById('contenedor-representacion');
    const enun = document.getElementById('enunciado-representacion');
    enun.innerHTML = `<p class="text-xs uppercase font-bold text-violet-600 mb-1">${ej.metodoNombre} · ${ej.bits} bits</p><p class="title-handwriting text-xl sm:text-2xl font-bold text-violet-900">Representa <span class="code-font">${ej.numDecimal}</span> en ${ej.bits} bits en ${ej.metodoNombre}.</p>`;
    let html = '';
    if (ej.metodo === 'signo-magnitud') {
        // Una sola fila: bit de signo a la izquierda + magnitud
        html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Representación:</span>`;
        html += `<input type="text" inputmode="numeric" maxlength="1" class="binary-cell rep-signo rep-input rep-bit-signo" data-pos="0" autocomplete="off" readonly title="Bit de signo (0=+, 1=−)">`;
        for (let i = 0; i < ej.bits - 1; i++) {
            html += `<input type="text" inputmode="numeric" maxlength="1" class="binary-cell rep-valor rep-input" data-pos="${i}" autocomplete="off" readonly>`;
        }
        html += `</div>`;
        html += `<p class="w-full text-right text-[11px] text-amber-700 handwriting">El bit de la izquierda (amarillo) es el signo; el resto es el valor absoluto.</p>`;
    } else if (ej.metodo === 'exceso') {
        const sesgo = ej.sesgo != null ? ej.sesgo : (Math.pow(2, ej.bits - 1) - 1);
        html += `<p class="w-full text-center text-xs text-violet-700 mb-1 handwriting">Sesgo = ${sesgo} → escribe el binario de <span class="code-font font-bold">${ej.numDecimal} + ${sesgo}</span></p>`;
        html += filaRepresentacion('N + ' + sesgo, 'rep-valor', ej.bits);
    } else if (ej.metodo === 'complemento-1') {
        html += filaRepresentacion('Valor absoluto', 'rep-valor', ej.bits);
        html += filaRepresentacion('Invertir bits', 'rep-invertido', ej.bits);
    } else {
        html += filaRepresentacion('Valor absoluto', 'rep-valor', ej.bits);
        if (ej.incluyeAcarreos) {
            html += filaRepresentacion('Invertir bits', 'rep-invertido', ej.bits);
            html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-red-500 text-xs sm:text-sm mr-1 sm:mr-2">Acarreos:</span>`;
        for (let i = 0; i < ej.bits; i++) html += `<div class="cell-slot flex justify-center"><input type="text" class="carry-cell rep-acarreo" data-pos="${i}" placeholder="0" readonly tabindex="-1"></div>`;
            html += `</div>`;
            html += filaRepresentacion('Sumar 1', 'rep-resultado', ej.bits);
        } else {
            html += filaRepresentacion('Representación', 'rep-invertido', ej.bits);
        }
    }
    cont.innerHTML = html;
    cont.style.setProperty('--cols', ej.bits);
    aplicarModoAcarreos();
    if (ej.incluyeAcarreos && acarreosAuto) actualizarAcarreosRepresentacion();
    alinearOperacionDerecha();
}

function filaRepresentacion(etiqueta, clase, bits) {
    let html = `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">${etiqueta}:</span>`;
    for (let i = 0; i < bits; i++) html += `<input type="text" inputmode="numeric" maxlength="1" class="binary-cell ${clase} rep-input" data-pos="${i}" autocomplete="off" readonly>`;
    return html + `</div>`;
}

function filasRepresentacionInternas() {
    const ej = ejercicioActualRepresentacion;
    if (!ej) return [];
    let clases;
    if (ej.metodo === 'signo-magnitud') clases = ['rep-signo', 'rep-valor'];
    else if (ej.metodo === 'exceso') clases = ['rep-valor'];
    else if (ej.metodo === 'complemento-2' && ej.incluyeAcarreos) clases = ['rep-valor', 'rep-invertido', 'rep-resultado'];
    else clases = ['rep-valor', 'rep-invertido'];
    return ej.filasEsperadas.map((esperado, i) => ({
        tipo: i === 0 ? 'valor' : (i === 1 ? 'invertido' : 'resultado'),
        nombre: ej.etiquetas[i],
        inputs: Array.from(document.querySelectorAll('.' + clases[i])),
        esperado
    }));
}

function obtenerFilasRepresentacion() { return filasRepresentacionInternas(); }
function leerFilaRepresentacion(inputs) {
    return inputs.map(i => {
        const v = i.value.trim();
        if (v === '1') return '1';
        if (v === '0') return '0';
        return ''; // vacía: no contar como 0
    }).join('');
}

function actualizarAcarreosRepresentacion() {
    const ej = ejercicioActualRepresentacion;
    if (!ej || !ej.incluyeAcarreos) return;
    // Solo en modo automático; en manual no sobrescribir lo que escribe el alumno
    if (!acarreosAuto) return;

    const inv = Math.abs(ej.numDecimal).toString(2).padStart(ej.bits, '0')
        .split('').map(b => b === '0' ? '1' : '0');
    const resultados = Array.from(document.querySelectorAll('.rep-resultado'));
    const celdas = Array.from(document.querySelectorAll('.rep-acarreo'));

    // Acarreo que ENTRA en cada columna (el de la derecha es siempre 1 = el +1)
    const carryIn = new Array(ej.bits).fill(0);
    let c = 1;
    for (let i = ej.bits - 1; i >= 0; i--) {
        carryIn[i] = c;
        c = (parseInt(inv[i], 10) + c >= 2) ? 1 : 0;
    }

    celdas.forEach((celda, idx) => {
        // Columna derecha (LSB): se puede mostrar desde el inicio el +1
        // Resto: solo cuando la casilla de «Sumar 1» de su derecha ya está rellena
        // (igual que los acarreos progresivos de la suma)
        let mostrar = false;
        if (idx === ej.bits - 1) {
            mostrar = carryIn[idx] === 1;
        } else {
            const derecha = resultados[idx + 1];
            const derechaLlena = derecha && derecha.value !== '';
            mostrar = derechaLlena && carryIn[idx] === 1;
        }
        const nuevo = mostrar ? '1' : '';
        if (celda.value !== nuevo) {
            celda.value = nuevo;
            celda.classList.remove('carry-pop');
            if (nuevo) { void celda.offsetWidth; celda.classList.add('carry-pop'); }
        }
    });
}

function insertarDigitoRepresentacion(digito) {
    // Relleno de derecha a izquierda (igual que suma/resta), fila a fila
    const filas = filasRepresentacionInternas();
    for (const f of filas) {
        for (let i = f.inputs.length - 1; i >= 0; i--) {
            if (f.inputs[i].value === '') {
                f.inputs[i].value = digito;
                f.inputs[i].classList.remove('error');
                if (ejercicioActualRepresentacion.incluyeAcarreos) actualizarAcarreosRepresentacion();
                return;
            }
        }
    }
    if (ejercicioActualRepresentacion.incluyeAcarreos) actualizarAcarreosRepresentacion();
}
function borrarDigitoRepresentacion() {
    // Borrar el último dígito escrito: en la fila más avanzada, la casilla llena más a la izquierda
    const filas = filasRepresentacionInternas().slice().reverse();
    for (const f of filas) {
        for (let i = 0; i < f.inputs.length; i++) {
            if (f.inputs[i].value !== '') {
                f.inputs[i].value = '';
                f.inputs[i].classList.remove('error');
                if (ejercicioActualRepresentacion.incluyeAcarreos) actualizarAcarreosRepresentacion();
                return;
            }
        }
    }
}

function comprobarRepresentacion() {
    if (modoRepresentacion === 'inverso') return comprobarRepresentacionInverso();
    const ej = ejercicioActualRepresentacion;
    const filas = obtenerFilasRepresentacion();
    let ok = true;
    filas.forEach(f => {
        const esperado = f.esperado;
        const escrito = leerFilaRepresentacion(f.inputs);
        if (escrito !== esperado) ok = false;
        f.inputs.forEach((inp, i) => {
            const v = inp.value.trim() === '1' ? '1' : (inp.value.trim() === '0' ? '0' : '');
            if (v !== esperado[i]) inp.classList.add('error');
            else inp.classList.remove('error');
        });
    });
    // Acarreos: ayuda visual; no bloquean si Valor absoluto / Invertir / Sumar 1 están bien
    if (ej.incluyeAcarreos && ej.acarreosEsperados) {
        const c = Array.from(document.querySelectorAll('.rep-acarreo'));
        const esperado = ej.acarreosEsperados;
        c.forEach((inp, i) => {
            const escrito = inp.value.trim();
            if (escrito === '') {
                // En automático las vacías son normales (progresivos o carry 0)
                inp.classList.remove('error');
                return;
            }
            const v = escrito === '1' ? '1' : '0';
            if (v !== esperado[i]) inp.classList.add('error');
            else inp.classList.remove('error');
        });
    }
    mostrarBotonNuevo('representacion', true);
    const feedback = document.getElementById('feedback-representacion');
    if (ok) {
        mostrarToast(true, '¡Muy bien!', `${ej.numDecimal} → ${ej.resultado}`);
        setTimeout(reproducirSonidoAcierto, 60);
        feedback.classList.add('hidden');
    } else {
        registrarError('representacion');
        mostrarToast(false, 'Hay pasos por revisar', `La representación correcta es ${ej.resultado}`);
        feedback.classList.add('hidden');
    }
}

function mostrarAyudaRepresentacion() {
    if (modoRepresentacion === 'inverso') return mostrarAyudaRepresentacionInverso();
    const ej = ejercicioActualRepresentacion;
    filasRepresentacionInternas().forEach(f => f.inputs.forEach((inp,i) => { inp.value = f.esperado[i]; inp.classList.remove('error'); }));
    if (ej.incluyeAcarreos) {
        document.querySelectorAll('.rep-acarreo').forEach((inp,i) => { inp.value = ej.acarreosEsperados[i] === '1' ? '1' : ''; inp.classList.remove('error'); });
    }
    mostrarBotonNuevo('representacion', true);
    const feedback = document.getElementById('feedback-representacion');
    feedback.classList.remove('hidden');
    feedback.innerHTML = `<p class="handwriting text-violet-800 text-base sm:text-lg font-bold bg-violet-50 p-2 rounded border border-violet-200">💡 Solución: ${ej.numDecimal} se representa como <span class="code-font">${ej.resultado}</span> en ${ej.metodoNombre}.</p>`;
}



// --- 4b. REPRESENTACIÓN: SENTIDO BINARIO → DECIMAL ---
// 'directo' = Decimal → Binario (original) · 'inverso' = Binario → Decimal
let modoRepresentacion = 'directo';
let ejercicioInverso = {};
let logInverso = [];

function formatoDecimalInverso(n) { return n < 0 ? '−' + Math.abs(n) : String(n); }

function valorDesdeRepresentacion(bin, metodo, bits) {
    const neg = bin[0] === '1';
    let v;
    if (metodo === 'exceso') v = parseInt(bin, 2) - (Math.pow(2, bits - 1) - 1);
    else if (metodo === 'signo-magnitud') { const m = parseInt(bin.slice(1), 2); v = neg ? -m : m; }
    else if (metodo === 'complemento-1') {
        if (!neg) v = parseInt(bin, 2);
        else v = -parseInt(bin.split('').map(b => b === '0' ? '1' : '0').join(''), 2);
    } else {
        v = neg ? parseInt(bin, 2) - Math.pow(2, bits) : parseInt(bin, 2);
    }
    return v === 0 ? 0 : v; // evita -0
}

function explicacionInverso(ej) {
    const b = ej.binario, bits = ej.bits, neg = b[0] === '1';
    const f = formatoDecimalInverso;
    const inv = b.split('').map(x => x === '0' ? '1' : '0').join('');
    const p = [];
    if (ej.metodo === 'exceso') {
        const n = parseInt(b, 2);
        p.push(`Pasa <span class="code-font">${b}</span> a decimal: <b>${n}</b>.`);
        p.push(`Resta el sesgo: ${n} − ${ej.sesgo} = <b>${f(ej.valor)}</b>.`);
    } else if (ej.metodo === 'signo-magnitud') {
        const mag = parseInt(b.slice(1), 2);
        p.push(`Bit de signo = ${b[0]} → ${neg ? 'negativo' : 'positivo'}.`);
        p.push(`Magnitud <span class="code-font">${b.slice(1)}</span> = ${mag}.`);
        p.push(`Resultado: <b>${f(ej.valor)}</b>.`);
    } else if (ej.metodo === 'complemento-1') {
        if (!neg) {
            p.push(`El primer bit es 0 → positivo: se lee tal cual, <b>${parseInt(b, 2)}</b>.`);
        } else {
            p.push('El primer bit es 1 → negativo.');
            p.push(`Invierte los bits: <span class="code-font">${inv}</span> = ${parseInt(inv, 2)}.`);
            p.push(`Resultado: <b>${f(ej.valor)}</b>.`);
        }
    } else {
        if (!neg) {
            p.push(`El primer bit es 0 → positivo: se lee tal cual, <b>${parseInt(b, 2)}</b>.`);
        } else {
            const mas1 = (parseInt(inv, 2) + 1).toString(2).padStart(bits, '0').slice(-bits);
            p.push('El primer bit es 1 → negativo.');
            p.push(`Invierte los bits: <span class="code-font">${inv}</span>.`);
            p.push(`Suma 1: <span class="code-font">${mas1}</span> = ${parseInt(mas1, 2)}.`);
            p.push(`Resultado: <b>${f(ej.valor)}</b>.`);
        }
    }
    return p.join('<br>');
}

function cambiarSentidoRepresentacion() {
    const sel = document.getElementById('sentido-representacion');
    modoRepresentacion = sel && sel.value === 'inverso' ? 'inverso' : 'directo';
    const sec = document.getElementById('seccion-representacion');
    sec.classList.toggle('modo-inverso', modoRepresentacion === 'inverso');
    const sub = document.getElementById('subtitulo-representacion');
    if (sub) sub.textContent = modoRepresentacion === 'inverso'
        ? 'Lee un número en binario y escribe qué número decimal representa.'
        : 'Representa números decimales negativos en binario siguiendo cada paso.';
    const desc = document.getElementById('desc-cuaderno');
    if (desc) {
        desc.textContent = modoRepresentacion === 'inverso'
            ? 'Suma los pesos de los bits que valen 1. En C1/C2 negativo, primero invierte (y +1 en C2); luego suma en el cuaderno.'
            : 'Apoyo para convertir a binario (y, en exceso, calcular antes N + sesgo). Los restos de cada ÷2 son los bits (de abajo hacia arriba).';
    }
    const btnCorr = document.getElementById('btn-corregir-cuaderno');
    if (btnCorr) {
        const t = modoRepresentacion === 'inverso' ? 'Corregir suma' : 'Corregir';
        btnCorr.title = t;
        btnCorr.setAttribute('aria-label', t);
    }
    reiniciarEjercicioRepresentacion();
}

function reiniciarEjercicioRepresentacionInverso() {
    const bits = parseInt(document.getElementById('dificultad-representacion').value);
    const metodo = document.getElementById('metodo-representacion').value;
    const sesgo = Math.pow(2, bits - 1) - 1;
    let bin, valor;
    do {
        let n;
        if (metodo === 'exceso') n = randomInt(0, Math.pow(2, bits) - 1);
        else n = (randomNext() < 0.6 ? Math.pow(2, bits - 1) : 0) + randomInt(0, Math.pow(2, bits - 1) - 1);
        bin = n.toString(2).padStart(bits, '0');
        valor = valorDesdeRepresentacion(bin, metodo, bits);
    } while (valor === 0); // sin ceros ni «−0»: ejercicio trivial o ambiguo
    const necesitaInvertir = (metodo === 'complemento-1' || metodo === 'complemento-2') && bin[0] === '1';
    const invertido = necesitaInvertir
        ? bin.split('').map(b => b === '0' ? '1' : '0').join('')
        : '';
    let masUno = '';
    let acarreosEsperados = '';
    if (necesitaInvertir && metodo === 'complemento-2') {
        masUno = (parseInt(invertido, 2) + 1).toString(2).padStart(bits, '0').slice(-bits);
        const arr = [];
        let c = 1;
        for (let i = bits - 1; i >= 0; i--) {
            arr[i] = c;
            c = (parseInt(invertido[i], 10) + c >= 2) ? 1 : 0;
        }
        acarreosEsperados = arr.join('');
    }
    ejercicioInverso = {
        bits, metodo, metodoNombre: nombreMetodoRepresentacion(metodo, bits),
        binario: bin, valor, sesgo, entrada: '',
        necesitaInvertir, invertido, masUno, acarreosEsperados,
        sumaCuadernoHecha: false
    };
    sumaInverso = null; // nuevo ejercicio → sin progreso previo
    progresoCuadernoKey = null;
    logInverso = [];
    mostrarBotonNuevo('representacion', false);
    mostrarBotonNuevo('representacion-inv', false);
    document.getElementById('feedback-representacion').classList.add('hidden');
    renderizarFormularioRepresentacionInverso();
    renderizarLogInverso();
    asegurarCuadernoAbierto();
}

function renderizarFormularioRepresentacionInverso() {
    const ej = ejercicioInverso;
    const enun = document.getElementById('enunciado-representacion');
    const cont = document.getElementById('contenedor-representacion');
    enun.innerHTML = `<p class="text-xs uppercase font-bold text-violet-600 mb-1">${ej.metodoNombre} · ${ej.bits} bits · Binario → Decimal</p><p class="title-handwriting text-xl sm:text-2xl font-bold text-violet-900">¿Qué número decimal representa <span class="code-font">${ej.binario}</span> en ${ej.metodoNombre}?</p>`;
    const conSigno = ej.metodo !== 'exceso';
    const bits = ej.bits;
    const necesitaInvertir = !!ej.necesitaInvertir;
    let html = `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-500 text-[10px] sm:text-xs mr-1 sm:mr-2 min-w-[5rem] text-right">Peso:</span>`;
    for (let i = 0; i < bits; i++) {
        if (ej.metodo === 'signo-magnitud' && i === 0) {
            html += `<div class="rep-peso-lbl s-5" title="Bit de signo (no se suma)">±</div>`;
        } else {
            const peso = Math.pow(2, bits - 1 - i);
            html += `<div class="rep-peso-lbl" title="2^${bits - 1 - i} = ${peso}">${peso}</div>`;
        }
    }
    html += `</div>`;
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Binario:</span>`;
    ej.binario.split('').forEach((b, i) => {
        html += `<div class="binary-cell rep-bit-dado${conSigno && i === 0 ? ' rep-bit-signo' : ''}">${b}</div>`;
    });
    html += `</div>`;
    if (necesitaInvertir) {
        html += `<p class="w-full text-right text-[11px] text-amber-700 handwriting">Bit de signo = 1 → número negativo: invierte todos los bits${ej.metodo === 'complemento-2' ? ' y luego suma 1' : ''}.</p>`;
        html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Invertir:</span>`;
        for (let i = 0; i < bits; i++) {
            html += `<input type="text" inputmode="numeric" maxlength="1" class="binary-cell rep-inv-bit" data-pos="${i}" autocomplete="off" readonly>`;
        }
        html += `</div>`;
        if (ej.metodo === 'complemento-2') {
            html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-red-500 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Acarreos:</span>`;
            for (let i = 0; i < bits; i++) {
                html += `<div class="cell-slot flex justify-center"><input type="text" class="carry-cell rep-acarreo-inv" data-pos="${i}" placeholder="0" readonly tabindex="-1"></div>`;
            }
            html += `</div>`;
            html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Sumar 1:</span>`;
            for (let i = 0; i < bits; i++) {
                html += `<input type="text" inputmode="numeric" maxlength="1" class="binary-cell rep-masuno-bit" data-pos="${i}" autocomplete="off" readonly>`;
            }
            html += `</div>`;
        }
    } else if (conSigno) {
        html += `<p class="w-full text-right text-[11px] text-amber-700 handwriting">El primer bit (en amarillo) es el bit de signo.</p>`;
    } else {
        html += `<p class="w-full text-right text-[11px] text-violet-700 handwriting">Sesgo = ${ej.sesgo}: pasa el binario a decimal y réstale el sesgo.</p>`;
    }
    html += `<div class="flex items-center gap-1 justify-end w-full"><span class="handwriting text-violet-800 text-xs sm:text-sm mr-1 sm:mr-2 min-w-[5rem] text-right">Decimal:</span><div id="rep-decimal" class="binary-cell celda-texto rep-decimal-resp vacia" aria-live="polite">?</div></div>`;
    cont.innerHTML = html;
    cont.style.setProperty('--cols', ej.bits);
    aplicarModoAcarreos();
    if (ej.metodo === 'complemento-2' && necesitaInvertir && acarreosAuto) actualizarAcarreosInverso();
    alinearOperacionDerecha();
    resaltarCeldaActivaInverso();
    if (cuadernoDivision) prepararSumaInverso();
}

function binarioTrabajoInverso() {
    const ej = ejercicioInverso;
    if (!ej) return null;
    if (!ej.necesitaInvertir) return ej.binario;
    const invInputs = Array.from(document.querySelectorAll('.rep-inv-bit'));
    if (invInputs.length !== ej.bits) return null;
    const escritoInv = invInputs.map(i => i.value.trim() === '1' ? '1' : (i.value.trim() === '0' ? '0' : '')).join('');
    if (escritoInv.length !== ej.bits || escritoInv !== ej.invertido) return null;
    if (ej.metodo === 'complemento-2') {
        const muInputs = Array.from(document.querySelectorAll('.rep-masuno-bit'));
        if (muInputs.length !== ej.bits) return null;
        const escritoMu = muInputs.map(i => i.value.trim() === '1' ? '1' : (i.value.trim() === '0' ? '0' : '')).join('');
        if (escritoMu.length !== ej.bits || escritoMu !== ej.masUno) return null;
        return ej.masUno;
    }
    return ej.invertido;
}

function filasBitsInverso() {
    const filas = [];
    const inv = Array.from(document.querySelectorAll('.rep-inv-bit'));
    if (inv.length) filas.push(inv);
    const mu = Array.from(document.querySelectorAll('.rep-masuno-bit'));
    if (mu.length) filas.push(mu);
    return filas;
}

function resaltarCeldaActivaInverso() {
    document.querySelectorAll('.rep-celda-activa').forEach(el => el.classList.remove('rep-celda-activa'));
    if (modoRepresentacion !== 'inverso' || !ejercicioInverso) return;
    const ej = ejercicioInverso;
    // 1) Invertir / Sumar 1 pendientes
    if (ej.necesitaInvertir) {
        const inv = Array.from(document.querySelectorAll('.rep-inv-bit'));
        for (let i = inv.length - 1; i >= 0; i--) {
            if (inv[i].value === '') { inv[i].classList.add('rep-celda-activa'); return; }
        }
        if (ej.metodo === 'complemento-2') {
            const mu = Array.from(document.querySelectorAll('.rep-masuno-bit'));
            for (let i = mu.length - 1; i >= 0; i--) {
                if (mu[i].value === '') { mu[i].classList.add('rep-celda-activa'); return; }
            }
        }
    }
    // 2) No ir a decimal hasta completar el cuaderno (pesos / resta sesgo / inversión)
    const necesitaCuaderno = ej.necesitaInvertir || ej.metodo === 'exceso' || ej.metodo === 'signo-magnitud';
    if (ej.sumaCuadernoHecha || (!necesitaCuaderno && !cuadernoDivision)) {
        const dec = document.getElementById('rep-decimal');
        if (dec) dec.classList.add('rep-celda-activa');
    }
}

function actualizarAcarreosInverso(forzar) {
    const ej = ejercicioInverso;
    if (!ej || !ej.necesitaInvertir || ej.metodo !== 'complemento-2' || !ej.acarreosEsperados) return;
    if (!acarreosAuto && !forzar) return;
    const inv = ej.invertido;
    const resultados = Array.from(document.querySelectorAll('.rep-masuno-bit'));
    const celdas = Array.from(document.querySelectorAll('.rep-acarreo-inv'));
    if (!celdas.length) return;
    const carryIn = new Array(ej.bits).fill(0);
    let c = 1;
    for (let i = ej.bits - 1; i >= 0; i--) {
        carryIn[i] = c;
        c = (parseInt(inv[i], 10) + c >= 2) ? 1 : 0;
    }
    celdas.forEach((celda, idx) => {
        let mostrar = false;
        if (idx === ej.bits - 1) mostrar = carryIn[idx] === 1;
        else {
            const derecha = resultados[idx + 1];
            mostrar = derecha && derecha.value !== '' && carryIn[idx] === 1;
        }
        const nuevo = mostrar ? '1' : '';
        if (celda.value !== nuevo) {
            celda.value = nuevo;
            celda.classList.remove('carry-pop');
            if (nuevo) { void celda.offsetWidth; celda.classList.add('carry-pop'); }
        }
    });
}

function insertarBitPasoInverso(digito) {
    if (digito !== '0' && digito !== '1') return false;
    for (const fila of filasBitsInverso()) {
        for (let i = fila.length - 1; i >= 0; i--) {
            if (fila[i].value === '') {
                fila[i].value = digito;
                fila[i].classList.remove('error');
                if (fila[i].classList.contains('rep-masuno-bit')) actualizarAcarreosInverso();
                resaltarCeldaActivaInverso();
                if (cuadernoDivision) prepararSumaInverso();
                return true;
            }
        }
    }
    return false;
}

function borrarBitPasoInverso() {
    const filas = filasBitsInverso().slice().reverse();
    for (const fila of filas) {
        for (let i = 0; i < fila.length; i++) {
            if (fila[i].value !== '') {
                fila[i].value = '';
                fila[i].classList.remove('error');
                actualizarAcarreosInverso();
                resaltarCeldaActivaInverso();
                if (cuadernoDivision) prepararSumaInverso();
                return true;
            }
        }
    }
    return false;
}

function actualizarRespuestaInverso() {
    const celda = document.getElementById('rep-decimal');
    if (!celda) return;
    const t = ejercicioInverso.entrada || '';
    celda.textContent = t === '' ? '?' : t.replace('-', '−');
    celda.classList.toggle('vacia', t === '');
    celda.classList.remove('error', 'rep-ok');
}

function insertarCaracterInverso(c) {
    if (modoRepresentacion !== 'inverso' || !ejercicioInverso.binario) return;
    // Si el cuaderno está en fase de suma/resta, los dígitos (y −) van ahí
    if (cuadernoDivision && cuadernoFase === 'suma-inverso' && sumaInverso && !ejercicioInverso.sumaCuadernoHecha) {
        if (c === '-' || c === '−' || (c >= '0' && c <= '9')) {
            insertarDigitoSumaInverso(c === '−' ? '-' : c);
            return;
        }
    }
    // 0/1: primero Invertir / Sumar 1
    if ((c === '0' || c === '1') && insertarBitPasoInverso(c)) return;
    // Decimal solo si ya no hay pasos binarios pendientes (o suma cuaderno hecha)
    const ej = ejercicioInverso;
    if (ej.necesitaInvertir && !binarioTrabajoInverso()) return; // aún falta invertir/+1
    // Si hay que usar cuaderno y aún no se ha completado la suma, no escribir decimal a mano
    if (cuadernoDivision && !ej.sumaCuadernoHecha && (ej.necesitaInvertir || ej.metodo === 'exceso' || ej.metodo === 'signo-magnitud')) return;
    let t = ej.entrada || '';
    if (c === '-') {
        t = t.startsWith('-') ? t.slice(1) : '-' + t;
    } else {
        const digitos = t.replace('-', '');
        if (digitos === '0') t = (t.startsWith('-') ? '-' : '') + c;
        else if (digitos.length < 3) t += c;
    }
    ej.entrada = t;
    actualizarRespuestaInverso();
    resaltarCeldaActivaInverso();
}

function borrarCaracterInverso() {
    if (modoRepresentacion !== 'inverso' || !ejercicioInverso.binario) return;
    // Preferir borrar en el cuaderno si hay casillas de suma rellenas
    if (cuadernoDivision && cuadernoFase === 'suma-inverso' && sumaInverso && !ejercicioInverso.sumaCuadernoHecha) {
        const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
        if (cells.some(c => c.value !== '')) {
            borrarDigitoSumaInverso();
            return;
        }
    }
    const t = ejercicioInverso.entrada || '';
    if (t !== '') {
        ejercicioInverso.entrada = t.slice(0, -1);
        actualizarRespuestaInverso();
        resaltarCeldaActivaInverso();
        return;
    }
    borrarBitPasoInverso();
}

function comprobarRepresentacionInverso() {
    const ej = ejercicioInverso;
    if (ej.necesitaInvertir) {
        const invInputs = Array.from(document.querySelectorAll('.rep-inv-bit'));
        let invOk = true;
        invInputs.forEach((inp, i) => {
            const v = inp.value.trim() === '1' ? '1' : (inp.value.trim() === '0' ? '0' : '');
            if (v !== ej.invertido[i]) { inp.classList.add('error'); invOk = false; }
            else inp.classList.remove('error');
        });
        if (ej.metodo === 'complemento-2' && ej.masUno) {
            document.querySelectorAll('.rep-masuno-bit').forEach((inp, i) => {
                const v = inp.value.trim() === '1' ? '1' : (inp.value.trim() === '0' ? '0' : '');
                if (v !== ej.masUno[i]) { inp.classList.add('error'); invOk = false; }
                else inp.classList.remove('error');
            });
            // Acarreos: solo marcar errores visuales; NO bloquean si Invertir y Sumar 1 están bien
            if (!acarreosAuto && ej.acarreosEsperados) {
                document.querySelectorAll('.rep-acarreo-inv').forEach((inp, i) => {
                    const escrito = inp.value.trim();
                    if (escrito === '') {
                        inp.classList.remove('error');
                        return;
                    }
                    const v = escrito === '1' ? '1' : '0';
                    if (v !== ej.acarreosEsperados[i]) inp.classList.add('error');
                    else inp.classList.remove('error');
                });
            }
        }
        if (!invOk) {
            mostrarToast(false, 'Revisa la inversión', ej.metodo === 'complemento-2' ? 'Invierte los bits y suma 1 correctamente.' : 'Invierte todos los bits correctamente.');
            return;
        }
        if (!ej.sumaCuadernoHecha) {
            if (!cuadernoDivision) alternarCuadernoDivision();
            mostrarToast(false, 'Falta el cuaderno', 'Suma los pesos en el Cuaderno; el decimal se rellena al completar esa suma.');
            return;
        }
    }
    // Exceso / signo-magnitud: también requieren cuaderno si está disponible
    if ((ej.metodo === 'exceso' || ej.metodo === 'signo-magnitud') && !ej.sumaCuadernoHecha) {
        if (!cuadernoDivision) alternarCuadernoDivision();
        mostrarToast(false, 'Falta el cuaderno', ej.metodo === 'exceso'
            ? 'Completa la suma de pesos y la resta del sesgo en el Cuaderno.'
            : 'Completa la suma de la magnitud en el Cuaderno.');
        return;
    }
    const t = ej.entrada || '';
    const celda = document.getElementById('rep-decimal');
    if (t === '' || t === '-') {
        mostrarToast(false, 'Falta la respuesta', cuadernoDivision && ej.necesitaInvertir
            ? 'Completa la suma del Cuaderno para obtener el decimal.'
            : 'Escribe el número decimal con el teclado.');
        return;
    }
    const n = parseInt(t, 10);
    mostrarBotonNuevo('representacion-inv', true);
    const feedback = document.getElementById('feedback-representacion');
    if (n === ej.valor) {
        celda.classList.remove('error');
        celda.classList.add('rep-ok');
        mostrarToast(true, '¡Muy bien!', `${ej.binario} → ${formatoDecimalInverso(ej.valor)}`);
        setTimeout(reproducirSonidoAcierto, 60);
        feedback.classList.remove('hidden');
        feedback.innerHTML = `<div class="handwriting text-violet-800 text-sm sm:text-base bg-violet-50 p-2 rounded border border-violet-200 text-left inline-block">${explicacionInverso(ej)}</div>`;
    } else {
        celda.classList.add('error');
        logInverso.push({ n: logInverso.length + 1, escrito: n, esperado: ej.valor });
        renderizarLogInverso();
        mostrarToast(false, 'Respuesta incorrecta', `El número correcto es ${formatoDecimalInverso(ej.valor)}`);
        feedback.classList.add('hidden');
    }
}

function mostrarAyudaRepresentacionInverso() {
    const ej = ejercicioInverso;
    if (ej.necesitaInvertir) {
        document.querySelectorAll('.rep-inv-bit').forEach((inp, i) => {
            inp.value = ej.invertido[i];
            inp.classList.remove('error');
        });
        if (ej.metodo === 'complemento-2' && ej.masUno) {
            document.querySelectorAll('.rep-masuno-bit').forEach((inp, i) => {
                inp.value = ej.masUno[i];
                inp.classList.remove('error');
            });
            if (ej.acarreosEsperados) {
                document.querySelectorAll('.rep-acarreo-inv').forEach((inp, i) => {
                    inp.value = ej.acarreosEsperados[i] === '1' ? '1' : '';
                    inp.classList.remove('error');
                });
            } else actualizarAcarreosInverso(true);
        }
        if (cuadernoDivision) prepararSumaInverso();
    }
    ej.entrada = String(ej.valor);
    ej.sumaCuadernoHecha = true;
    actualizarRespuestaInverso();
    resaltarCeldaActivaInverso();
    mostrarBotonNuevo('representacion-inv', true);
    const feedback = document.getElementById('feedback-representacion');
    feedback.classList.remove('hidden');
    feedback.innerHTML = `<div class="handwriting text-violet-800 text-sm sm:text-base bg-violet-50 p-2 rounded border border-violet-200 text-left inline-block"><b>💡 Solución:</b> <span class="code-font">${ej.binario}</span> en ${ej.metodoNombre} es <b>${formatoDecimalInverso(ej.valor)}</b>.<br>${explicacionInverso(ej)}</div>`;
}

function renderizarLogInverso() {
    const cont = document.getElementById('log-representacion');
    if (!cont) return;
    const log = logInverso;
    const ej = ejercicioInverso;
    const f = formatoDecimalInverso;
    const cuerpo = !log.length
        ? `<p class="text-xs sm:text-sm text-gray-500 italic">Todavía no hay errores en este ejercicio. Si te equivocas, aparecerán aquí al pulsar «Corregir Ejercicio».</p>`
        : log.slice().reverse().map(e => `
            <div class="bg-white/80 border border-red-200 rounded-lg p-2.5">
                <p class="text-xs sm:text-sm font-semibold text-gray-800">Intento ${e.n}: <span class="code-font">${ej.binario}</span> · ${ej.metodoNombre}</p>
                <div class="mt-2 flex flex-wrap gap-2 justify-start">
                    <div class="bg-white border border-red-200 rounded-lg px-2 py-2 font-mono min-w-[12rem]">
                        <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><div class="binary-cell celda-texto flex items-center justify-center bg-emerald-50 border-emerald-500 text-emerald-700">${f(e.esperado)}</div><span class="text-[10px] sm:text-xs text-emerald-700 font-sans font-semibold">debía ser</span></div>
                        <div class="flex items-center gap-2 mt-1"><span class="text-red-600 font-bold">✗</span><div class="binary-cell celda-texto flex items-center justify-center bg-red-50 border-red-500 text-red-700">${f(e.escrito)}</div><span class="text-[10px] sm:text-xs text-red-700 font-sans font-semibold">escribiste</span></div>
                    </div>
                </div>
            </div>`).join('');
    cont.innerHTML = `
        <div class="border-2 ${log.length ? 'border-red-300 bg-red-50/70' : 'border-gray-200 bg-gray-50/70'} rounded-xl p-3">
            <div class="flex items-center justify-between gap-2 mb-2">
                <h3 class="title-handwriting text-xl sm:text-2xl font-bold ${log.length ? 'text-red-800' : 'text-gray-600'}"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Registro de errores</h3>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full ${log.length ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}">${log.length ? log.length + (log.length === 1 ? ' intento fallido' : ' intentos fallidos') : 'Sin errores'}</span>
            </div>
            <div class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">${cuerpo}</div>
            <p class="text-[10px] sm:text-xs text-gray-400 mt-2">El registro se borra al pulsar «Nuevo».</p>
        </div>`;
}

function sincronizarSwitchDivision() {
    document.querySelectorAll('[data-switch-division]').forEach(btn => {
        btn.setAttribute('aria-checked', cuadernoDivision ? 'true' : 'false');
        const est = btn.querySelector('.switch-estado');
        if (est) est.textContent = cuadernoDivision ? 'ON' : 'OFF';
        // Parpadeo solo cuando está OFF (invitar a abrirlo)
        btn.classList.toggle('cuaderno-pulse', !cuadernoDivision);
    });
    const zona = document.getElementById('zona-division');
    if (zona) zona.classList.toggle('hidden', !cuadernoDivision);
}

function claveProgresoCuaderno() {
    if (modoRepresentacion === 'inverso' && ejercicioInverso && ejercicioInverso.binario) {
        return 'inv|' + ejercicioInverso.metodo + '|' + ejercicioInverso.binario + '|' + ejercicioInverso.bits;
    }
    if (modoRepresentacion === 'directo' && ejercicioActualRepresentacion) {
        const ej = ejercicioActualRepresentacion;
        return 'dir|' + ej.metodo + '|' + ej.numDecimal + '|' + ej.bits;
    }
    return null;
}

function guardarCeldasSumaInverso() {
    if (!sumaInverso) return;
    const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
    if (cells.length) {
        sumaInverso.celdasGuardadas = cells.map(c => ({
            value: c.value,
            autoSigno: c.dataset.autoSigno === '1'
        }));
    }
}

function guardarCeldasSumaExceso() {
    if (!sumaExceso) return;
    const cells = Array.from(document.querySelectorAll('#suma-exceso-result .div-suma-cell'));
    if (cells.length) {
        sumaExceso.celdasGuardadas = cells.map(c => c.value);
    }
}

function guardarProgresoCuaderno() {
    const key = claveProgresoCuaderno();
    if (!key) return;
    progresoCuadernoKey = key;
    if (cuadernoFase === 'suma-inverso') guardarCeldasSumaInverso();
    else if (cuadernoFase === 'suma') guardarCeldasSumaExceso();
    else if (cuadernoFase === 'division' && typeof guardarValoresPasoActual === 'function') {
        try { guardarValoresPasoActual(); } catch (e) {}
    }
}

function mostrarZonasCuaderno(fase) {
    const zonaSuma = document.getElementById('zona-suma-exceso');
    const zonaPasos = document.getElementById('zona-division-pasos');
    const zonaInv = document.getElementById('zona-suma-inverso');
    if (zonaSuma) zonaSuma.classList.toggle('hidden', fase !== 'suma');
    if (zonaPasos) zonaPasos.classList.toggle('hidden', fase !== 'division');
    if (zonaInv) zonaInv.classList.toggle('hidden', fase !== 'suma-inverso');
}

function restaurarSumaExcesoUI() {
    if (!sumaExceso) return;
    cuadernoFase = 'suma';
    mostrarZonasCuaderno('suma');
    const enun = document.getElementById('enunciado-division');
    if (enun) {
        enun.innerHTML = `Método <strong>exceso a ${sumaExceso.b}</strong>: calcula primero <span class="code-font">${sumaExceso.a} + ${sumaExceso.b}</span> y escribe el resultado. Después convertirás ese número a binario con ÷2.`;
    }
    renderOpsSumaExceso();
    const row = document.getElementById('suma-exceso-result');
    if (row) {
        const digs = sumaExceso.digitos;
        const guard = sumaExceso.celdasGuardadas || [];
        row.innerHTML = digs.split('').map((ch, i) => {
            const v = guard[i] != null ? guard[i] : '';
            const ok = v !== '' && v === ch;
            return `<input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" class="div-suma-cell${ok ? ' ok-bit' : ''}" data-suma-pos="${i}" value="${v}">`;
        }).join('');
        let act = Math.max(0, digs.length - 1);
        const cells = Array.from(row.querySelectorAll('.div-suma-cell'));
        for (let i = cells.length - 1; i >= 0; i--) {
            if (cells[i].value === '') { act = i; break; }
        }
        sumaExcesoInputActivo = act;
        marcarCeldaSumaActiva();
    }
    const rec = document.getElementById('div-suma-recordatorio');
    if (rec) { rec.classList.add('hidden'); rec.textContent = ''; }
}

function restaurarDivisionUI() {
    if (!ejercicioDivision) return;
    cuadernoFase = 'division';
    mostrarZonasCuaderno('division');
    const enun = document.getElementById('enunciado-division');
    if (enun) {
        enun.innerHTML = `Convierte <span class="code-font text-lg">${ejercicioDivision.valor}</span> a binario con divisiones sucesivas entre <span class="code-font">2</span>. Escribe el <em>cociente</em> dígito a dígito; el <em>residuo</em> se calcula solo. Los restos de abajo hacia arriba son los bits.`;
    }
    const rec = document.getElementById('div-suma-recordatorio');
    if (rec) {
        if (sumaExceso) {
            rec.classList.remove('hidden');
            rec.innerHTML = `Resultado de la suma: <span class="code-font font-bold">${sumaExceso.resultado}</span> ← primer dividendo`;
        } else {
            rec.classList.add('hidden');
            rec.textContent = '';
        }
    }
    renderizarDivision();
    actualizarBandejaRestos(true);
    setTimeout(() => {
        const i = divisionVistaActual;
        const coc = document.querySelector(`.div-cociente[data-paso="${i}"]`);
        if (coc) {
            document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
            coc.classList.add('div-activa');
            divisionInputActivo = coc;
        }
    }, 40);
}

function intentarRestaurarProgresoCuaderno() {
    const key = claveProgresoCuaderno();
    if (!key || progresoCuadernoKey !== key) return false;
    if (cuadernoFase === 'suma-inverso' && sumaInverso) {
        restaurarSumaInversoUI();
        return true;
    }
    if (cuadernoFase === 'suma' && sumaExceso) {
        restaurarSumaExcesoUI();
        return true;
    }
    if (cuadernoFase === 'division' && ejercicioDivision) {
        restaurarDivisionUI();
        return true;
    }
    return false;
}

function limpiarProgresoCuaderno() {
    progresoCuadernoKey = null;
    // no borramos globals aquí; se sobrescriben al iniciar fases nuevas
}

function alternarCuadernoDivision() {
    if (cuadernoDivision) {
        guardarProgresoCuaderno();
    }
    cuadernoDivision = !cuadernoDivision;
    try { localStorage.setItem('cuadernoDivision', cuadernoDivision ? '1' : '0'); } catch (e) {}
    sincronizarSwitchDivision();
    if (cuadernoDivision) {
        prepararDivisionDesdeRepresentacion();
    }
}

/** Abre el cuaderno sí o sí (nuevo ejercicio / al entrar en representación). */
function asegurarCuadernoAbierto() {
    if (!cuadernoDivision) {
        cuadernoDivision = true;
        try { localStorage.setItem('cuadernoDivision', '1'); } catch (e) {}
        sincronizarSwitchDivision();
    }
    prepararDivisionDesdeRepresentacion();
}

function calcularPasosDivision(valorAbs) {
    const pasos = [];
    let n = Math.abs(valorAbs) | 0;
    if (n === 0) {
        pasos.push({ dividendo: 0, divisor: 2, cociente: 0, resto: 0, producto: 0 });
    } else {
        while (n > 0) {
            const cociente = Math.floor(n / 2);
            const resto = n % 2;
            const producto = 2 * cociente; // = n - resto
            pasos.push({ dividendo: n, divisor: 2, cociente, resto, producto });
            n = cociente;
        }
    }
    // binario: restos de abajo hacia arriba (último resto = MSB)
    const binario = pasos.map(p => String(p.resto)).reverse().join('') || '0';
    return { valor: Math.abs(valorAbs) | 0, pasos, binario };
}

/**
 * Divisiones sucesivas del número completo entre 2 (decimal → binario).
 * Ejemplo 117÷2 → cociente 58, resto 1; luego 58÷2 → 29 resto 0; etc.
 * Los restos (LSB primero), leídos de abajo hacia arriba, forman el binario.
 */
function calcularCadenaBinaria(valorAbs) {
    let n = Math.abs(valorAbs) | 0;
    const pasos = [];
    const bits = [];

    if (n === 0) {
        pasos.push({ dividendo: 0, divisor: 2, cociente: 0, resto: 0, residuo: 0, producto: 0 });
        bits.push(0);
    } else {
        while (n > 0) {
            const cociente = Math.floor(n / 2);
            const resto = n % 2;
            pasos.push({
                dividendo: n,
                divisor: 2,
                cociente,
                resto,
                residuo: resto, // al cociente correcto, residuo = resto
                producto: 2 * cociente
            });
            bits.push(resto);
            n = cociente;
        }
    }

    const binario = bits.slice().reverse().join('') || '0';
    return {
        valor: Math.abs(valorAbs) | 0,
        pasos,
        bits,
        binario
    };
}

function prepararDivisionDesdeRepresentacion() {
    if (!cuadernoDivision) return;
    if (modoRepresentacion === 'inverso') {
        prepararSumaInverso();
        return;
    }
    const ej = ejercicioActualRepresentacion;
    if (!ej) {
        const cont = document.getElementById('contenedor-division');
        if (cont) cont.innerHTML = '<p class="text-sm text-gray-500 italic">Genera un ejercicio de representación primero.</p>';
        return;
    }
    // Restaurar progreso del mismo ejercicio si existe
    if (intentarRestaurarProgresoCuaderno()) return;

    const fb = document.getElementById('feedback-division');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const res = document.getElementById('resultado-bin-division');
    if (res) res.innerHTML = '';
    restosClickMode = false;
    restosClickNext = 0;
    restosUsados = {};

    progresoCuadernoKey = claveProgresoCuaderno();
    if (ej.metodo === 'exceso') {
        iniciarFaseSumaExceso(ej);
    } else {
        const valor = Math.abs(ej.numDecimal);
        iniciarFaseDivision(valor, false);
    }
}

function restaurarSumaInversoUI() {
    if (!sumaInverso) return;
    const zonaSuma = document.getElementById('zona-suma-exceso');
    const zonaPasos = document.getElementById('zona-division-pasos');
    const zonaInv = document.getElementById('zona-suma-inverso');
    const rec = document.getElementById('div-suma-recordatorio');
    if (zonaSuma) zonaSuma.classList.add('hidden');
    if (zonaPasos) zonaPasos.classList.add('hidden');
    if (rec) { rec.classList.add('hidden'); rec.textContent = ''; }
    if (zonaInv) zonaInv.classList.remove('hidden');
    cuadernoFase = 'suma-inverso';

    const titulo = document.getElementById('suma-inverso-titulo');
    const labelRes = document.getElementById('suma-inverso-label-result');
    const enun = document.getElementById('enunciado-division');
    const ops = document.getElementById('suma-inverso-ops');
    const row = document.getElementById('suma-inverso-result');
    const extraEl = document.getElementById('suma-inverso-extra');

    if (sumaInverso.fase === 'resta-sesgo') {
        if (titulo) titulo.textContent = 'Resta el sesgo al resultado de la suma:';
        if (labelRes) labelRes.textContent = 'Resultado:';
        if (enun) {
            enun.innerHTML = `Fase 2: resta el sesgo. <span class="code-font font-bold">${sumaInverso.total} − ${sumaInverso.sesgo}</span> = ¿?`;
        }
        renderOpsRestaSesgo();
    } else {
        if (titulo) titulo.textContent = 'Suma los pesos de los bits que valen 1:';
        if (labelRes) labelRes.textContent = 'Suma:';
        if (enun) {
            enun.innerHTML = `Suma los pesos de <span class="code-font">${sumaInverso.binario}</span>.`;
        }
        if (ops) {
            const sumandos = sumaInverso.sumandos || [];
            if (!sumandos.length) {
                ops.innerHTML = `<div class="suma-linea"><span class="suma-op"></span><span class="suma-num">0</span></div>`;
            } else {
                ops.innerHTML = sumandos.map((s, idx) => {
                    const op = idx === 0 ? '' : '+';
                    return `<div class="suma-linea"><span class="suma-op">${op}</span><span class="suma-num">${s.peso}</span></div>`;
                }).join('');
            }
        }
    }

    // Casillas: usar guardadas o, si está completado, los dígitos esperados
    const digitos = String(sumaInverso.digitos);
    const guardadas = sumaInverso.celdasGuardadas;
    if (row) {
        row.innerHTML = '';
        digitos.split('').forEach((ch, i) => {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.inputMode = 'none';
            inp.maxLength = 1;
            inp.readOnly = true;
            inp.tabIndex = -1;
            inp.className = 'div-suma-cell suma-inv-cell';
            inp.dataset.sumaPos = String(i);
            inp.dataset.char = ch;
            let val = '';
            if (guardadas && guardadas[i]) {
                val = guardadas[i].value || '';
                if (guardadas[i].autoSigno) inp.dataset.autoSigno = '1';
            } else if (sumaInverso.completado) {
                val = ch;
                if (ch === '-') inp.dataset.autoSigno = '1';
            } else if (ch === '-' && sumaInverso.fase === 'resta-sesgo') {
                val = '-';
                inp.dataset.autoSigno = '1';
            }
            inp.value = val;
            if (val !== '' && (sumaInverso.completado || val === digitos[i])) {
                inp.classList.add('ok-bit');
            }
            row.appendChild(inp);
        });
        let act = 0;
        const cells = Array.from(row.querySelectorAll('.suma-inv-cell'));
        for (let i = cells.length - 1; i >= 0; i--) {
            if (cells[i].value === '') { act = i; break; }
        }
        sumaExcesoInputActivo = act;
        marcarCeldaSumaInversoActiva();
    }

    if (extraEl) {
        if (sumaInverso.completado) {
            extraEl.classList.remove('hidden');
            extraEl.innerHTML = `<p class="handwriting text-sm text-emerald-800 mt-2">✓ Completado: <span class="code-font font-bold">${sumaInverso.valorFinal}</span></p>`;
        } else if (sumaInverso.fase === 'resta-sesgo') {
            // renderOpsRestaSesgo ya rellena extraEl
        } else {
            extraEl.classList.add('hidden');
            extraEl.innerHTML = '';
        }
    }
}

function prepararSumaInverso() {
    if (!cuadernoDivision || modoRepresentacion !== 'inverso') return;
    const ej = ejercicioInverso;
    if (!ej || !ej.binario) {
        const enun = document.getElementById('enunciado-division');
        if (enun) enun.textContent = 'Genera un ejercicio primero.';
        return;
    }
    const fb = document.getElementById('feedback-division');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const res = document.getElementById('resultado-bin-division');
    if (res) res.innerHTML = '';

    const bits = ej.bits;
    const zonaSuma = document.getElementById('zona-suma-exceso');
    const zonaPasos = document.getElementById('zona-division-pasos');
    const zonaInv = document.getElementById('zona-suma-inverso');
    const rec = document.getElementById('div-suma-recordatorio');
    if (zonaSuma) zonaSuma.classList.add('hidden');
    if (zonaPasos) zonaPasos.classList.add('hidden');
    if (rec) { rec.classList.add('hidden'); rec.textContent = ''; }
    if (zonaInv) zonaInv.classList.remove('hidden');

    const desc = document.getElementById('desc-cuaderno');
    if (desc) desc.textContent = 'Suma los pesos de los bits a 1. En C1/C2 negativo: primero invierte (y +1 en C2); luego suma aquí.';
    const btnCorr = document.getElementById('btn-corregir-cuaderno');
    if (btnCorr) {
        btnCorr.title = 'Corregir suma';
        btnCorr.setAttribute('aria-label', 'Corregir suma');
    }

    let bin = null;
    if (ej.necesitaInvertir) {
        bin = binarioTrabajoInverso();
        const enun = document.getElementById('enunciado-division');
        const ops = document.getElementById('suma-inverso-ops');
        const row = document.getElementById('suma-inverso-result');
        const extraEl = document.getElementById('suma-inverso-extra');
        if (!bin) {
            const faltaMasUno = ej.metodo === 'complemento-2';
            const invInputs = Array.from(document.querySelectorAll('.rep-inv-bit'));
            const escritoInv = invInputs.map(i => (i.value.trim() === '1' || i.value.trim() === '0') ? i.value.trim() : '').join('');
            const invOk = escritoInv === ej.invertido;
            if (enun) {
                if (!invOk) enun.innerHTML = `Primero <strong>invierte</strong> <span class="code-font">${ej.binario}</span> en la fila «Invertir». Después suma los pesos aquí.`;
                else if (faltaMasUno) enun.innerHTML = `Inversión correcta. Ahora escribe <strong>Sumar 1</strong>. Luego suma los pesos aquí.`;
                else enun.innerHTML = `Completa la inversión para activar la suma de pesos.`;
            }
            if (ops) ops.innerHTML = `<p class="handwriting text-sm text-violet-700">Esperando la inversión${faltaMasUno ? ' y el +1' : ''}…</p>`;
            if (row) row.innerHTML = '';
            if (extraEl) { extraEl.classList.add('hidden'); extraEl.innerHTML = ''; }
            sumaInverso = null;
            cuadernoFase = 'suma-inverso';
            return;
        }
    } else {
        bin = ej.binario;
    }

    // Restaurar progreso previo del mismo ejercicio (ocultar/mostrar sin perder datos)
    if (sumaInverso && sumaInverso.binario === bin && sumaInverso.metodo === ej.metodo &&
        (sumaInverso.completado || sumaInverso.celdasGuardadas || sumaInverso.fase === 'resta-sesgo')) {
        restaurarSumaInversoUI();
        return;
    }

    // Signo-magnitud: el bit de la izquierda es SOLO signo; no se suma su peso.
    const esSM = ej.metodo === 'signo-magnitud';
    const iInicio = esSM ? 1 : 0;
    const sumandos = [];
    for (let i = iInicio; i < bits; i++) {
        if (bin[i] === '1') sumandos.push({ peso: Math.pow(2, bits - 1 - i), pos: bits - 1 - i });
    }
    const total = sumandos.reduce((a, s) => a + s.peso, 0);
    sumaInverso = {
        sumandos, total, digitos: String(total),
        metodo: ej.metodo, sesgo: ej.sesgo, valorFinal: ej.valor,
        binario: bin, desdeInversion: !!ej.necesitaInvertir,
        esSignoMagnitud: esSM,
        fase: 'pesos' // 'pesos' | 'resta-sesgo'
    };
    cuadernoFase = 'suma-inverso';
    progresoCuadernoKey = claveProgresoCuaderno();
    sumaExcesoInputActivo = Math.max(0, String(total).length - 1);

    const titulo = document.getElementById('suma-inverso-titulo');
    if (titulo) titulo.textContent = 'Suma los pesos de los bits que valen 1:';
    const labelRes = document.getElementById('suma-inverso-label-result');
    if (labelRes) labelRes.textContent = 'Suma:';

    const enun = document.getElementById('enunciado-division');
    if (enun) {
        let extra = '';
        if (ej.metodo === 'exceso') extra = ` Después restarás el sesgo (${ej.sesgo}).`;
        else if (ej.necesitaInvertir) extra = ` El valor decimal es <strong>−</strong>(esta suma).`;
        else if (esSM) {
            const signo = bin[0] === '1' ? 'negativo (−)' : 'positivo (+)';
            extra = ` El bit de signo (izquierda) es <strong>${bin[0]}</strong> → ${signo}; solo sumas la magnitud.`;
        }
        const binMag = esSM ? bin.slice(1) : bin;
        enun.innerHTML = `Suma los pesos de <span class="code-font">${esSM ? binMag : bin}</span>${ej.necesitaInvertir ? ' (tras invertir' + (ej.metodo === 'complemento-2' ? ' y +1' : '') + ')' : ''}${esSM ? ' <span class="text-amber-700">(sin el bit de signo)</span>' : ''}.${extra}`;
    }

    const ops = document.getElementById('suma-inverso-ops');
    if (ops) {
        if (!sumandos.length) {
            ops.innerHTML = `<div class="suma-linea"><span class="suma-op"></span><span class="suma-num">0</span><span class="suma-bit-hint">(ningún bit a 1)</span></div>`;
        } else {
            ops.innerHTML = sumandos.map((s, idx) => {
                const op = idx === 0 ? '' : '+';
                return `<div class="suma-linea"><span class="suma-op">${op}</span><span class="suma-num">${s.peso}</span><span class="suma-bit-hint">2<sup>${s.pos}</sup></span></div>`;
            }).join('');
        }
    }

    const row = document.getElementById('suma-inverso-result');
    if (row) {
        const digs = sumaInverso.digitos;
        row.innerHTML = digs.split('').map((_, i) =>
            `<input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" class="div-suma-cell suma-inv-cell" data-suma-pos="${i}" value="">`
        ).join('');
        sumaExcesoInputActivo = Math.max(0, digs.length - 1);
        marcarCeldaSumaInversoActiva();
    }

    const extraEl = document.getElementById('suma-inverso-extra');
    if (extraEl) {
        if (ej.metodo === 'exceso') {
            extraEl.classList.remove('hidden');
            extraEl.innerHTML = `<p class="handwriting text-sm text-violet-800 mt-2">Fase 1: suma de pesos. Al terminar pasarás a restar el sesgo (${ej.sesgo}).</p>`;
        } else if (ej.necesitaInvertir) {
            extraEl.classList.remove('hidden');
            extraEl.innerHTML = `<p class="handwriting text-sm text-violet-800 mt-2">La suma es el valor absoluto. El número es <span class="code-font font-bold">−${total}</span>.</p>`;
        } else if (esSM) {
            const signoTxt = bin[0] === '1' ? '−' + total : String(total);
            extraEl.classList.remove('hidden');
            extraEl.innerHTML = `<p class="handwriting text-sm text-violet-800 mt-2">Magnitud = <span class="code-font font-bold">${total}</span>. Con el bit de signo <span class="code-font">${bin[0]}</span> → <span class="code-font font-bold">${signoTxt}</span>.</p>`;
        } else {
            extraEl.classList.add('hidden');
            extraEl.innerHTML = '';
        }
    }
}

function marcarCeldaSumaInversoActiva() {
    document.querySelectorAll('.suma-inv-cell').forEach((c, i) => {
        c.classList.toggle('div-activa', i === sumaExcesoInputActivo);
    });
}

function insertarDigitoSumaInverso(d) {
    if (cuadernoFase !== 'suma-inverso' || !sumaInverso) return;
    // Solo dígitos; el signo − (si aplica) ya viene rellenado
    if (d === '−' || d === '-') return;
    if (d < '0' || d > '9') return;
    const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
    if (!cells.length) return;
    let pos = -1;
    for (let i = cells.length - 1; i >= 0; i--) {
        if (cells[i].value === '' && cells[i].dataset.autoSigno !== '1') { pos = i; break; }
    }
    if (pos < 0) return;
    cells[pos].value = d;
    cells[pos].classList.remove('error');
    let next = 0;
    for (let i = pos - 1; i >= 0; i--) {
        if (cells[i].value === '' && cells[i].dataset.autoSigno !== '1') { next = i; break; }
    }
    sumaExcesoInputActivo = next;
    marcarCeldaSumaInversoActiva();
    if (cells.every(c => c.value !== '')) setTimeout(() => comprobarSumaInverso(true), 120);
}

function borrarDigitoSumaInverso() {
    if (cuadernoFase !== 'suma-inverso' || !sumaInverso) return;
    const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
    for (let i = 0; i < cells.length; i++) {
        // No borrar el signo automático
        if (cells[i].dataset.autoSigno === '1') continue;
        if (cells[i].value !== '') {
            cells[i].value = '';
            cells[i].classList.remove('error', 'ok-bit');
            sumaExcesoInputActivo = i;
            marcarCeldaSumaInversoActiva();
            return;
        }
    }
}

function comprobarSumaInverso(auto) {
    if (!sumaInverso) return false;
    const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
    const escrito = cells.map(c => c.value.trim()).join('');
    const ok = escrito === sumaInverso.digitos;
    cells.forEach((c, i) => {
        c.classList.remove('error', 'ok-bit');
        if (c.value === '') return;
        if (c.value === sumaInverso.digitos[i]) c.classList.add('ok-bit');
        else c.classList.add('error');
    });
    if (ok) {
        // Exceso: tras la suma de pesos → fase resta del sesgo
        if (sumaInverso.metodo === 'exceso' && sumaInverso.fase === 'pesos') {
            mostrarToast(true, '¡Suma correcta!', `${sumaInverso.total}. Ahora resta el sesgo (${sumaInverso.sesgo}).`);
            setTimeout(reproducirSonidoAcierto, 40);
            setTimeout(() => iniciarFaseRestaSesgo(), 350);
            return true;
        }
        // Resto de métodos, o fase resta-sesgo ya completada
        let msg = `Suma de pesos = ${sumaInverso.total}`;
        if (sumaInverso.fase === 'resta-sesgo') {
            msg = `${sumaInverso.total} − ${sumaInverso.sesgo} = ${sumaInverso.valorFinal}`;
        } else if (sumaInverso.desdeInversion) {
            msg += ` → valor = −${sumaInverso.total}`;
        }
        mostrarToast(true, '¡Correcto!', msg);
        setTimeout(reproducirSonidoAcierto, 40);
        if (ejercicioInverso) {
            ejercicioInverso.sumaCuadernoHecha = true;
            ejercicioInverso.entrada = String(sumaInverso.valorFinal);
            actualizarRespuestaInverso();
            resaltarCeldaActivaInverso();
        }
        if (sumaInverso) {
            sumaInverso.completado = true;
            guardarCeldasSumaInverso();
        }
        // Auto-ocultar el cuaderno al terminar (exceso fase 2 u otros métodos)
        setTimeout(() => {
            if (cuadernoDivision) ocultarCuadernoDivision();
        }, 900);
        return true;
    }
    if (!auto) {
        const esperado = sumaInverso.fase === 'resta-sesgo' ? sumaInverso.valorFinal : sumaInverso.total;
        mostrarToast(false, 'Revisa el cálculo', `Debía ser ${esperado}`);
    }
    return false;
}

/** Dibuja la resta de la fase 2 (con o sin flip). */
function renderOpsRestaSesgo() {
    if (!sumaInverso || sumaInverso.fase !== 'resta-sesgo') return;
    const total = sumaInverso.total;
    const sesgo = sumaInverso.sesgo;
    const flip = !!sumaInverso.restaFlip;
    const arriba = flip ? sesgo : total;
    const abajo = flip ? total : sesgo;
    const ops = document.getElementById('suma-inverso-ops');
    if (ops) {
        ops.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <button type="button" data-action="flipRestaSesgo"
                    class="w-5 h-5 shrink-0 rounded-full border border-violet-300 bg-white hover:bg-violet-50 text-violet-600 transition flex items-center justify-center text-[10px]"
                    title="${flip ? 'Poner la suma arriba' : 'Poner el sesgo arriba'}"
                    aria-label="${flip ? 'Poner la suma arriba' : 'Poner el sesgo arriba'}">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                </button>
                <div class="flex flex-col items-end">
                    <div class="suma-linea"><span class="suma-op"></span><span class="suma-num">${arriba}</span></div>
                    <div class="suma-linea"><span class="suma-op">−</span><span class="suma-num">${abajo}</span></div>
                </div>
            </div>`;
    }
    const extraEl = document.getElementById('suma-inverso-extra');
    if (extraEl) {
        const valorFinal = sumaInverso.valorFinal;
        let hint = '';
        if (flip) {
            hint = valorFinal < 0
                ? ` Estás restando al revés (${sesgo} − ${total} = ${sesgo - total}); el resultado de la operación original es <strong>−${sesgo - total}</strong> (el signo ya está puesto).`
                : ` Vista alternativa. El resultado sigue siendo <strong>${valorFinal}</strong>.`;
        } else if (valorFinal < 0) {
            hint = ' El signo «−» ya está puesto; solo escribe los dígitos.';
        }
        extraEl.classList.remove('hidden');
        extraEl.innerHTML = `<p class="handwriting text-sm text-violet-800 mt-2">Escribe el resultado de <span class="code-font font-bold">${total} − ${sesgo}</span>.${hint}</p>`;
    }
}

function flipRestaSesgo() {
    if (!sumaInverso || sumaInverso.fase !== 'resta-sesgo') return;
    sumaInverso.restaFlip = !sumaInverso.restaFlip;
    renderOpsRestaSesgo();
}

/** Fase 2 (exceso): restar el sesgo al resultado de la suma de pesos. */
function iniciarFaseRestaSesgo() {
    if (!sumaInverso || sumaInverso.metodo !== 'exceso') return;
    const sesgo = sumaInverso.sesgo;
    const total = sumaInverso.total;
    const valorFinal = sumaInverso.valorFinal;
    // digitos del resultado (puede incluir '-' si es negativo)
    const digitos = String(valorFinal);
    sumaInverso.fase = 'resta-sesgo';
    sumaInverso.digitos = digitos;
    sumaInverso.restaFlip = false; // false: total arriba; true: sesgo arriba
    sumaInverso.celdasGuardadas = null; // nueva fase: no reutilizar casillas de la suma
    sumaInverso.completado = false;
    cuadernoFase = 'suma-inverso';

    const enun = document.getElementById('enunciado-division');
    if (enun) {
        enun.innerHTML = `Fase 2: resta el sesgo. <span class="code-font font-bold">${total} − ${sesgo}</span> = ¿?`;
    }

    const titulo = document.getElementById('suma-inverso-titulo');
    if (titulo) titulo.textContent = 'Resta el sesgo al resultado de la suma:';

    renderOpsRestaSesgo();

    const labelRes = document.getElementById('suma-inverso-label-result');
    if (labelRes) labelRes.textContent = 'Resultado:';

    // Casillas vacías nuevas (no conservar las de la fase 1).
    // Si el resultado es negativo, el signo «−» se rellena solo; el alumno solo escribe dígitos.
    const row = document.getElementById('suma-inverso-result');
    if (row) {
        row.innerHTML = '';
        digitos.split('').forEach((ch, i) => {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.inputMode = 'none';
            inp.maxLength = 1;
            inp.readOnly = true;
            inp.tabIndex = -1;
            inp.className = 'div-suma-cell suma-inv-cell';
            inp.dataset.sumaPos = String(i);
            inp.dataset.char = ch;
            if (ch === '-') {
                inp.value = '-';
                inp.classList.add('ok-bit');
                inp.dataset.autoSigno = '1';
            } else {
                inp.value = '';
            }
            row.appendChild(inp);
        });
        // Primera casilla vacía desde la derecha (solo dígitos)
        let act = 0;
        const cells = Array.from(row.querySelectorAll('.suma-inv-cell'));
        for (let i = cells.length - 1; i >= 0; i--) {
            if (cells[i].value === '') { act = i; break; }
        }
        sumaExcesoInputActivo = act;
        marcarCeldaSumaInversoActiva();
    }

}

/** Dibuja la suma N + sesgo de la fase 1 (con o sin flip). */
function renderOpsSumaExceso() {
    if (!sumaExceso) return;
    const flip = !!sumaExceso.flip;
    const arriba = flip ? sumaExceso.b : sumaExceso.a;
    const abajo = flip ? sumaExceso.a : sumaExceso.b;
    const titulo = flip ? 'Poner el número arriba' : 'Poner el sesgo arriba';
    const ops = document.getElementById('suma-exceso-ops');
    if (!ops) return;
    ops.innerHTML = `
        <div class="flex items-center justify-center gap-2">
            <button type="button" data-action="flipSumaExceso"
                class="w-5 h-5 shrink-0 rounded-full border border-violet-300 bg-white hover:bg-violet-50 text-violet-600 transition flex items-center justify-center text-[10px]"
                title="${titulo}" aria-label="${titulo}">
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
            <div class="flex flex-col items-end">
                <div class="suma-linea"><span class="suma-op"></span><span class="suma-num">${arriba}</span></div>
                <div class="suma-linea"><span class="suma-op">+</span><span class="suma-num">${abajo}</span></div>
            </div>
        </div>`;
}

function flipSumaExceso() {
    if (!sumaExceso || cuadernoFase !== 'suma') return;
    sumaExceso.flip = !sumaExceso.flip;
    renderOpsSumaExceso();
}

function iniciarFaseSumaExceso(ej) {
    const sesgo = (ej.sesgo != null) ? ej.sesgo : (Math.pow(2, ej.bits - 1) - 1);
    const resultado = ej.numDecimal + sesgo;
    sumaExceso = {
        a: ej.numDecimal,
        b: sesgo,
        resultado,
        digitos: String(resultado),
        flip: false // false: número arriba; true: sesgo arriba
    };
    sumaExcesoInputActivo = 0;
    cuadernoFase = 'suma';
    ejercicioDivision = null;
    divisionValores = [];
    progresoCuadernoKey = claveProgresoCuaderno();

    const enun = document.getElementById('enunciado-division');
    if (enun) {
        enun.innerHTML = `Método <strong>exceso a ${sesgo}</strong>: calcula primero <span class="code-font">${ej.numDecimal} + ${sesgo}</span> y escribe el resultado. Después convertirás ese número a binario con ÷2.`;
    }
    renderOpsSumaExceso();
    const row = document.getElementById('suma-exceso-result');
    if (row) {
        const digs = sumaExceso.digitos;
        row.innerHTML = digs.split('').map((_, i) =>
            `<input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" class="div-suma-cell" data-suma-pos="${i}" value="">`
        ).join('');
        // Marcar primera casilla activa (relleno izq→der o der→izq? usar der→izq como el resto)
        // Para números decimales es más natural izquierda→derecha
        sumaExcesoInputActivo = Math.max(0, digs.length - 1);
        marcarCeldaSumaActiva();
    }
    const zonaSuma = document.getElementById('zona-suma-exceso');
    const zonaPasos = document.getElementById('zona-division-pasos');
    const zonaInv = document.getElementById('zona-suma-inverso');
    const rec = document.getElementById('div-suma-recordatorio');
    if (zonaSuma) zonaSuma.classList.remove('hidden');
    if (zonaPasos) zonaPasos.classList.add('hidden');
    if (zonaInv) zonaInv.classList.add('hidden');
    if (rec) { rec.classList.add('hidden'); rec.textContent = ''; }
}

function marcarCeldaSumaActiva() {
    document.querySelectorAll('.div-suma-cell').forEach((c, i) => {
        c.classList.toggle('div-activa', i === sumaExcesoInputActivo);
    });
}

function insertarDigitoSumaExceso(d) {
    if (cuadernoFase !== 'suma' || !sumaExceso) return;
    const cells = Array.from(document.querySelectorAll('.div-suma-cell'));
    if (!cells.length) return;
    // Relleno de derecha a izquierda
    let pos = -1;
    for (let i = cells.length - 1; i >= 0; i--) {
        if (cells[i].value === '') { pos = i; break; }
    }
    if (pos < 0) pos = 0;
    cells[pos].value = d;
    cells[pos].classList.remove('error');
    // Siguiente casilla vacía hacia la izquierda
    let next = 0;
    for (let i = pos - 1; i >= 0; i--) {
        if (cells[i].value === '') { next = i; break; }
    }
    sumaExcesoInputActivo = next;
    marcarCeldaSumaActiva();
    if (cells.every(c => c.value !== '')) {
        setTimeout(() => comprobarSumaExceso(true), 120);
    }
}

function borrarDigitoSumaExceso() {
    if (cuadernoFase !== 'suma' || !sumaExceso) return;
    const cells = Array.from(document.querySelectorAll('.div-suma-cell'));
    // Borrar el dígito más a la izquierda entre los llenos (último escrito en relleno dcha→izq)
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].value !== '') {
            cells[i].value = '';
            cells[i].classList.remove('error', 'ok-bit');
            sumaExcesoInputActivo = i;
            marcarCeldaSumaActiva();
            return;
        }
    }
}

function comprobarSumaExceso(auto) {
    if (!sumaExceso) return false;
    const cells = Array.from(document.querySelectorAll('#suma-exceso-result .div-suma-cell'));
    const escrito = cells.map(c => c.value.trim()).join('');
    const ok = escrito === sumaExceso.digitos;
    cells.forEach((c, i) => {
        c.classList.remove('error', 'ok-bit');
        if (c.value === '') return;
        if (c.value === sumaExceso.digitos[i]) c.classList.add('ok-bit');
        else c.classList.add('error');
    });
    if (ok) {
        mostrarToast(true, '¡Suma correcta!', `${sumaExceso.a} + ${sumaExceso.b} = ${sumaExceso.resultado}`);
        setTimeout(reproducirSonidoAcierto, 40);
        // Pasar automáticamente a la fase de división
        setTimeout(() => iniciarFaseDivision(sumaExceso.resultado, true), 350);
        return true;
    }
    if (!auto) {
        mostrarToast(false, 'Revisa la suma', `Debía ser ${sumaExceso.resultado}`);
    }
    return false;
}

function iniciarFaseDivision(valor, desdeExceso) {
    cuadernoFase = 'division';
    // Si ya había progreso de división para este ejercicio, no pisarlo
    const key = claveProgresoCuaderno();
    const conservar = (progresoCuadernoKey === key && ejercicioDivision && ejercicioDivision.valor === valor && divisionValores && divisionValores.length);
    if (!conservar) {
        ejercicioDivision = calcularCadenaBinaria(valor);
        divisionPasoVisible = 1;
        divisionVistaActual = 0;
        divisionValores = [];
    }
    divisionInputActivo = null;
    restosClickMode = false;
    restosClickNext = 0;
    restosUsados = {};
    progresoCuadernoKey = key;

    const enun = document.getElementById('enunciado-division');
    if (enun) {
        enun.innerHTML = `Convierte <span class="code-font text-lg">${valor}</span> a binario con divisiones sucesivas entre <span class="code-font">2</span>. Escribe el <em>cociente</em> dígito a dígito; el <em>residuo</em> se calcula solo. Los restos de abajo hacia arriba son los bits.`;
    }
    const zonaSuma = document.getElementById('zona-suma-exceso');
    const zonaPasos = document.getElementById('zona-division-pasos');
    const zonaInv = document.getElementById('zona-suma-inverso');
    const rec = document.getElementById('div-suma-recordatorio');
    if (zonaSuma) zonaSuma.classList.add('hidden');
    if (zonaPasos) zonaPasos.classList.remove('hidden');
    if (zonaInv) zonaInv.classList.add('hidden');
    if (rec) {
        if (desdeExceso && sumaExceso) {
            rec.classList.remove('hidden');
            rec.innerHTML = `Resultado de la suma: <span class="code-font font-bold">${sumaExceso.resultado}</span> ← primer dividendo`;
        } else {
            rec.classList.add('hidden');
            rec.textContent = '';
        }
    }
    renderizarDivision();
    // Asegurar casilla de cociente activa (sin teclado nativo)
    setTimeout(() => {
        const coc = document.querySelector(`.div-cociente[data-paso="0"]`);
        if (coc) {
            document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
            coc.classList.add('div-activa');
            divisionInputActivo = coc;
        }
    }, 40);
}


function ocultarCuadernoDivision() {
    if (cuadernoDivision) {
        alternarCuadernoDivision();
    }
}

/**
 * Actualiza el recuadro de restos acumulados.
 * Orden de chips: paso 1, paso 2, ... (el primero = LSB).
 * El binario parcial se muestra leyendo de derecha a izquierda.
 */
function obtenerRestosCompletados() {
    const restos = [];
    if (!ejercicioDivision || !divisionValores) return restos;
    for (let i = 0; i < divisionValores.length; i++) {
        const v = divisionValores[i];
        const p = ejercicioDivision.pasos[i];
        if (!v || !p) break;
        if (String(v.resto) === String(p.resto) && String(v.cociente) === String(p.cociente)) {
            restos.push(String(p.resto));
        } else break;
    }
    return restos;
}

/**
 * Actualiza el recuadro de restos acumulados.
 * Orden visual de arriba a abajo: LSB → … → MSB.
 * Tras completar la división, los chips se pulsan de abajo hacia arriba
 * para rellenar el valor absoluto del ejercicio principal.
 */
function actualizarBandejaRestos(animarUltimo) {
    const bitsEl = document.getElementById('bandeja-restos-bits');
    const binEl = document.getElementById('bandeja-restos-bin');
    const hintEl = document.getElementById('bandeja-restos-hint');
    if (!bitsEl) return;

    const restos = obtenerRestosCompletados();

    if (!restos.length) {
        bitsEl.innerHTML = '<span class="div-restos-empty">vacío</span>';
        if (binEl) binEl.textContent = '';
        if (hintEl) hintEl.classList.add('hidden');
        return;
    }

    const n = restos.length;
    // Índice que debe pulsarse ahora (desde abajo): 0 = MSB = último del array
    const esperadoDesdeAbajo = restosClickMode ? restosClickNext : -1;

    bitsEl.innerHTML = restos.map((r, idx) => {
        const desdeAbajo = n - 1 - idx;
        let cls = 'div-resto-chip';
        if (animarUltimo && idx === n - 1 && !restosClickMode) cls += ' nuevo';
        if (restosClickMode) {
            if (restosUsados[idx]) cls += ' usado';
            else {
                cls += ' clickable';
                if (desdeAbajo === esperadoDesdeAbajo) cls += ' siguiente';
            }
        }
        return `<span class="${cls}" data-resto-idx="${idx}" title="Resto del paso ${idx + 1}${restosClickMode ? ' · pulsa de abajo hacia arriba' : ''}">${r}</span>`;
    }).join('');

    if (restosClickMode) {
        bitsEl.querySelectorAll('.div-resto-chip.clickable').forEach(chip => {
            chip.addEventListener('click', () => {
                const idx = parseInt(chip.getAttribute('data-resto-idx'), 10);
                onClickRestoChip(idx);
            });
        });
        if (hintEl) hintEl.classList.remove('hidden');
    } else if (hintEl) {
        hintEl.classList.add('hidden');
    }

    const binParcial = restos.slice().reverse().join('');
    if (binEl) {
        binEl.innerHTML = `<strong>${binParcial}</strong><sub>2</sub>`;
    }
}

function onClickRestoChip(idxFromTop) {
    if (!restosClickMode || !ejercicioDivision) return;
    const restos = obtenerRestosCompletados();
    if (!restos.length) return;
    const n = restos.length;
    const esperado = n - 1 - restosClickNext; // desde arriba
    if (idxFromTop !== esperado) {
        // Orden incorrecto: feedback suave
        const chip = document.querySelector(`.div-resto-chip[data-resto-idx="${idxFromTop}"]`);
        if (chip) {
            chip.style.transition = 'transform 0.15s';
            chip.style.transform = 'translateX(-3px)';
            setTimeout(() => { chip.style.transform = 'translateX(3px)'; setTimeout(() => { chip.style.transform = ''; }, 80); }, 80);
        }
        return;
    }

    const bit = restos[idxFromTop];
    // Colocar en valor absoluto de izquierda a derecha (MSB primero = abajo de la bandeja)
    const colocado = colocarBitEnValorAbsoluto(bit);
    if (!colocado) return;

    restosUsados[idxFromTop] = true;
    restosClickNext++;
    actualizarBandejaRestos(false);

    if (restosClickNext >= n) {
        // Completado: signo en SM si aplica, cerrar cuaderno
        const ej = ejercicioActualRepresentacion;
        if (ej && ej.metodo === 'signo-magnitud') {
            const inputsSigno = Array.from(document.querySelectorAll('.rep-signo'));
            if (inputsSigno.length === 1) {
                inputsSigno[0].value = ej.numDecimal < 0 ? '1' : '0';
                inputsSigno[0].classList.remove('error');
            }
        }
        restosClickMode = false;
        const hintEl = document.getElementById('bandeja-restos-hint');
        if (hintEl) hintEl.classList.add('hidden');
        mostrarToast(true, 'Bits colocados', 'Cuaderno de división listo');
        setTimeout(() => ocultarCuadernoDivision(), 450);
    }
}

/** Inserta un bit en la primera casilla vacía de rep-valor (izq → der). */
function colocarBitEnValorAbsoluto(bit) {
    const inputs = Array.from(document.querySelectorAll('.rep-valor'));
    if (!inputs.length) return false;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            inputs[i].value = bit;
            inputs[i].classList.remove('error');
            return true;
        }
    }
    return false;
}

function actualizarNavDivision() {
    if (!ejercicioDivision) return;
    const total = Math.max(1, divisionPasoVisible);
    const actual = Math.min(divisionVistaActual + 1, total);
    const label = document.getElementById('div-nav-label');
    const prev = document.getElementById('div-nav-prev');
    const next = document.getElementById('div-nav-next');
    if (label) label.textContent = `Paso ${actual} / ${total}`;
    if (prev) prev.disabled = divisionVistaActual <= 0;
    if (next) next.disabled = divisionVistaActual >= divisionPasoVisible - 1;
}

function navegarDivision(delta) {
    if (!ejercicioDivision) return;
    // Guardar valores del paso actual antes de cambiar
    guardarValoresPasoActual();
    const maxIdx = divisionPasoVisible - 1;
    const nuevo = Math.max(0, Math.min(maxIdx, divisionVistaActual + delta));
    if (nuevo === divisionVistaActual) return;
    divisionVistaActual = nuevo;
    renderizarDivision();
}

function guardarValoresPasoActual() {
    if (!ejercicioDivision) return;
    const i = divisionVistaActual;
    if (i < 0) return;
    while (divisionValores.length <= i) divisionValores.push({ cociente: '', resto: '', producto: '' });
    const c = document.querySelector(`.div-cociente[data-paso="${i}"]`);
    const r = document.querySelector(`.div-resto[data-paso="${i}"]`);
    const pr = document.querySelector(`.div-cell[data-paso="${i}"][data-campo="producto"]`);
    divisionValores[i] = {
        cociente: c ? c.value : '',
        resto: r ? r.value : '',
        producto: pr ? pr.value : ''
    };
}

function htmlPasoDivision(i, p, modo) {
    // modo: 'vista-activa' | 'vista-ok' | 'fondo'
    const esFondo = modo === 'fondo';
    const esActiva = modo === 'vista-activa';
    const esOk = modo === 'vista-ok' || (esFondo && i < divisionPasoVisible - 1);
    let cls = 'div-step';
    if (esFondo) cls += ' div-step-fondo';
    else cls += ' div-step-vista';
    if (esActiva) cls += ' div-step-activa';
    else if (esOk) cls += ' div-step-ok';

    const roAttr = esFondo || !esActiva ? 'readonly tabindex="-1"' : '';
    const vals = divisionValores[i] || { cociente: '', resto: '', producto: '' };

    return `<div class="${cls}" data-paso="${i}">
        <span class="div-step-label">Paso ${i + 1}</span>
        <div class="div-layout">
            <div class="div-row-top">
                <div class="div-box5">
                    <input type="text" inputmode="numeric" class="div-cell div-producto div-readonly" data-paso="${i}" data-campo="producto" placeholder="·" title="Residuo de la división larga (prefijo − 2×cociente)" value="${vals.producto || ''}" readonly tabindex="-1">
                </div>
                <div class="div-top-gap" aria-hidden="true"></div>
            </div>
            <div class="div-row-mid">
                <div class="div-box1">
                    <input type="text" inputmode="numeric" class="div-cell div-dividendo div-readonly" data-paso="${i}" data-campo="dividendo" value="${p.dividendo}" readonly tabindex="-1" title="Dividendo">
                </div>
                <div class="div-bar" aria-hidden="true"></div>
                <div class="div-box2">
                    <input type="text" class="div-cell div-divisor div-readonly" data-paso="${i}" data-campo="divisor" value="2" readonly tabindex="-1" title="Divisor">
                </div>
            </div>
            <div class="div-row-line">
                <div class="div-line-left" aria-hidden="true"></div>
                <div class="div-bar-gap" aria-hidden="true"></div>
                <div class="div-hline" aria-hidden="true"></div>
            </div>
            <div class="div-row-bot">
                <div class="div-box4">
                    <input type="text" inputmode="none" class="div-cell div-resto" data-paso="${i}" data-campo="resto" placeholder="?" title="Resto (0 o 1)" autocomplete="off" maxlength="1" value="${vals.resto || ''}" readonly tabindex="-1">
                </div>
                <div class="div-bar-gap" aria-hidden="true"></div>
                <div class="div-box3">
                    <input type="text" inputmode="none" class="div-cell div-cociente" data-paso="${i}" data-campo="cociente" placeholder="?" title="Cociente" autocomplete="off" value="${vals.cociente || ''}" readonly tabindex="-1">
                </div>
            </div>
        </div>
    </div>`;
}

function renderizarDivision() {
    const cont = document.getElementById('contenedor-division');
    if (!cont || !ejercicioDivision) return;
    const pasos = ejercicioDivision.pasos;
    const maxIdx = Math.min(divisionPasoVisible, pasos.length) - 1;
    if (divisionVistaActual > maxIdx) divisionVistaActual = Math.max(0, maxIdx);
    if (divisionVistaActual < 0) divisionVistaActual = 0;

    const vista = divisionVistaActual;
    const pVista = pasos[vista];
    const esUltimoDesbloqueado = (vista === maxIdx);
    // Si aún no se ha completado este paso, es "activa"; si ya se pasó, es "ok"
    const pasoCompletado = !!(divisionValores[vista] &&
        divisionValores[vista].cociente === String(pVista.cociente) &&
        divisionValores[vista].resto === String(pVista.resto));
    const modoVista = (esUltimoDesbloqueado && !pasoCompletado) ? 'vista-activa' : 'vista-ok';

    let html = '<div class="div-stack">';
    // Fondo: paso anterior (si existe)
    if (vista > 0) {
        html += htmlPasoDivision(vista - 1, pasos[vista - 1], 'fondo');
    }
    // Primer plano
    html += htmlPasoDivision(vista, pVista, modoVista);
    html += '</div>';
    cont.innerHTML = html;

    // Casillas siempre readonly (sin teclado nativo del móvil).
    // La entrada se hace solo con el teclado en pantalla.
    // Click/tap selecciona la casilla activa visualmente.
    const marcarActiva = (el) => {
        cont.querySelectorAll('.div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
        if (el) {
            el.classList.add('div-activa');
            divisionInputActivo = el;
        }
    };

    cont.querySelectorAll('input.div-cell[data-campo="cociente"], input.div-cell[data-campo="resto"]').forEach(inp => {
        // Solo el paso en vista y desbloqueado es seleccionable
        const paso = parseInt(inp.dataset.paso, 10);
        const editable = (modoVista === 'vista-activa' && paso === vista);
        if (!editable) return;

        inp.addEventListener('pointerdown', (ev) => {
            ev.preventDefault(); // evita foco nativo / teclado
            marcarActiva(inp);
        });
        // Por si algún navegador enfoca igual
        inp.addEventListener('focus', (ev) => {
            ev.target.blur();
            marcarActiva(inp);
        });
    });

    // Marcar ok-bit en valores ya correctos del paso en vista
    if (modoVista === 'vista-ok' || pasoCompletado) {
        const p = pVista;
        const c = cont.querySelector(`.div-cociente[data-paso="${vista}"]`);
        const r = cont.querySelector(`.div-resto[data-paso="${vista}"]`);
        const pr = cont.querySelector(`.div-cell[data-paso="${vista}"][data-campo="producto"]`);
        if (c && c.value === String(p.cociente)) c.classList.add('ok-bit');
        if (r && r.value === String(p.resto)) r.classList.add('ok-bit');
        if (pr) {
            pr.value = String(p.resto);
            pr.classList.add('ok-bit');
        }
    }

    actualizarNavDivision();
    actualizarBandejaRestos(false);

    // Seleccionar casilla activa sin abrir teclado
    if (modoVista === 'vista-activa') {
        const coc = cont.querySelector(`.div-cociente[data-paso="${vista}"]`);
        const resto = cont.querySelector(`.div-resto[data-paso="${vista}"]`);
        const lenEsp = String(pVista.cociente).length;
        let target = coc;
        if (coc && (coc.value || '').length >= lenEsp && resto) {
            target = resto;
        }
        if (target) {
            // No usar focus(): en móvil abre el teclado aunque sea readonly en algunos SO
            cont.querySelectorAll('.div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
            target.classList.add('div-activa');
            divisionInputActivo = target;
        }
    }
}

function longitudCocienteEsperada(pasoIdx) {
    if (!ejercicioDivision || !ejercicioDivision.pasos[pasoIdx]) return 1;
    return String(ejercicioDivision.pasos[pasoIdx].cociente).length;
}

/**
 * El residuo SOLO se calcula cuando el cociente está completo
 * (todos los dígitos esperados, o Intro).
 * residuo = dividendo − 2×cociente  → debe ser 0 o 1 si el cociente es correcto.
 * Ejemplo: 83÷2, cociente 41 → residuo 1  (NO calcular con el 4 a medias).
 */
/**
 * Residuo estilo división larga (dígito a dígito).
 *
 * Ejemplo con 112 ÷ 2:
 *   - Escribes "5"  → se toma el prefijo 11 → residuo = 11 − 2×5 = 1
 *   - Escribes "56" → se toma el prefijo 112 → residuo = 112 − 2×56 = 0
 *
 * Regla del prefijo:
 *   Si el cociente completo tiene menos dígitos que el dividendo,
 *   el prefijo usa len(cociente) + 1 dígitos.
 *   Si tienen el mismo número de dígitos, usa len(cociente) dígitos.
 *
 * Cuando el cociente alcanza su longitud esperada, el foco pasa al resto.
 */
function onCocienteInput(pasoIdx, forzarSaltoResto) {
    if (!ejercicioDivision) return;
    const p = ejercicioDivision.pasos[pasoIdx];
    if (!p) return;
    const cocEl = document.querySelector(`.div-cociente[data-paso="${pasoIdx}"]`);
    const resEl = document.querySelector(`.div-cell[data-paso="${pasoIdx}"][data-campo="producto"]`);
    if (!cocEl || !resEl) return;

    const escrito = cocEl.value.trim();

    if (escrito === '') {
        resEl.value = '';
        resEl.classList.remove('ok-bit', 'error');
        return;
    }
    if (!/^\d+$/.test(escrito)) return;

    const coc = parseInt(escrito, 10);
    if (!Number.isFinite(coc)) return;

    // Cálculo del residuo estilo división larga
    const digD = String(p.dividendo).length;
    const digQfull = String(p.cociente).length;
    const lenQ = escrito.length;
    const extra = (digQfull < digD) ? 1 : 0;
    const prefixLen = Math.min(digD, lenQ + extra);
    const prefix = parseInt(String(p.dividendo).slice(0, prefixLen), 10);
    const residuo = prefix - (2 * coc);

    resEl.value = String(residuo);
    resEl.classList.remove('error', 'ok-bit');
    // Sincronizar en memoria
    while (divisionValores.length <= pasoIdx) divisionValores.push({ cociente: '', resto: '', producto: '' });
    divisionValores[pasoIdx].cociente = escrito;
    divisionValores[pasoIdx].producto = String(residuo);

    if (escrito.length >= digQfull && coc === p.cociente && residuo === p.resto) {
        resEl.classList.add('ok-bit');
    } else if (residuo < 0) {
        resEl.classList.add('error');
    } else if (escrito.length >= digQfull && residuo > 1) {
        resEl.classList.add('error');
    }

    // Auto-salto al resto cuando el cociente está completo
    const completo = forzarSaltoResto || escrito.length >= digQfull;
    if (completo) {
        saltarAResto(pasoIdx);
    }
}


function saltarAResto(pasoIdx) {
    const restoEl = document.querySelector(`.div-resto[data-paso="${pasoIdx}"]`);
    if (!restoEl) return;
    // No usar focus() (abre teclado en móvil). Solo marcar casilla activa.
    document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
    restoEl.classList.add('div-activa');
    divisionInputActivo = restoEl;
}

function confirmarCocienteYPasarAResto(pasoIdx) {
    onCocienteInput(pasoIdx, true);
}

function leerCampoDivision(paso, campo) {
    const el = document.querySelector(`.div-cell[data-paso="${paso}"][data-campo="${campo}"]`);
    if (!el) return null;
    const v = el.value.trim();
    if (v === '') return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
}

function marcarCampoDivision(paso, campo, ok) {
    const el = document.querySelector(`.div-cell[data-paso="${paso}"][data-campo="${campo}"]`);
    if (!el) return;
    el.classList.remove('error', 'ok-bit');
    if (ok === true) el.classList.add('ok-bit');
    else if (ok === false) el.classList.add('error');
}

function snapshotPasosDivision(hasta) {
    const arr = [];
    for (let k = 0; k < hasta; k++) {
        arr.push({
            cociente: (document.querySelector(`.div-cociente[data-paso="${k}"]`) || {}).value || '',
            resto: (document.querySelector(`.div-resto[data-paso="${k}"]`) || {}).value || '',
            producto: (document.querySelector(`.div-cell[data-paso="${k}"][data-campo="producto"]`) || {}).value || ''
        });
    }
    return arr;
}

function restaurarPasosDivision(valores, bloquear) {
    valores.forEach((v, k) => {
        const c = document.querySelector(`.div-cociente[data-paso="${k}"]`);
        const r = document.querySelector(`.div-resto[data-paso="${k}"]`);
        const pr = document.querySelector(`.div-cell[data-paso="${k}"][data-campo="producto"]`);
        if (c && v.cociente !== '') {
            c.value = v.cociente;
            if (bloquear) { c.classList.add('ok-bit'); c.readOnly = true; }
        }
        if (r && v.resto !== '') {
            r.value = v.resto;
            if (bloquear) { r.classList.add('ok-bit'); r.readOnly = true; }
        }
        if (pr && v.producto !== '') {
            pr.value = v.producto;
            if (bloquear) pr.classList.add('ok-bit');
        }
    });
}

function introDivision() {
    if (!ejercicioDivision) return;
    const i = divisionPasoVisible - 1;
    if (i < 0 || i >= ejercicioDivision.pasos.length) return;

    const activo = divisionInputActivo;
    const campo = (activo && activo.isConnected) ? activo.dataset.campo
        : (document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.campo : null);

    // Desde cociente (o sin foco claro): calcular residuo y saltar a resto
    if (campo === 'cociente' || !campo) {
        const cocEl = document.querySelector(`.div-cociente[data-paso="${i}"]`);
        if (cocEl && cocEl.value.trim() !== '') {
            onCocienteInput(i, true); // fuerza salto a resto
            return;
        }
    }
    // Desde resto: validar y avanzar paso
    tryAvanzarPasoDivision(true);
}

function tryAvanzarPasoDivision(desdeIntro) {
    if (!ejercicioDivision) return;
    const i = divisionPasoVisible - 1;
    if (i < 0 || i >= ejercicioDivision.pasos.length) return;
    const p = ejercicioDivision.pasos[i];
    const coc = leerCampoDivision(i, 'cociente');
    const resto = leerCampoDivision(i, 'resto');

    if (coc !== null && resto === null) {
        confirmarCocienteYPasarAResto(i);
        return;
    }
    if (coc === null || resto === null) return;

    // Recalcular residuo con la lógica de división larga
    const resEl = document.querySelector(`.div-cell[data-paso="${i}"][data-campo="producto"]`);
    if (resEl) {
        onCocienteInput(i, false);
    }

    if (coc === p.cociente && resto === p.resto) {
        marcarCampoDivision(i, 'cociente', true);
        marcarCampoDivision(i, 'resto', true);
        if (resEl) {
            resEl.value = String(p.resto);
            marcarCampoDivision(i, 'producto', true);
        }

        // Guardar valores correctos del paso
        while (divisionValores.length <= i) divisionValores.push({ cociente: '', resto: '', producto: '' });
        divisionValores[i] = { cociente: String(p.cociente), resto: String(p.resto), producto: String(p.resto) };

        if (divisionPasoVisible < ejercicioDivision.pasos.length) {
            divisionPasoVisible++;
            divisionVistaActual = divisionPasoVisible - 1; // ir al nuevo paso (encima)
            renderizarDivision();
            actualizarBandejaRestos(true);
        } else {
            const res = document.getElementById('resultado-bin-division');
            if (res) {
                res.innerHTML = `<p class="handwriting text-base text-emerald-800">✓ División completa. Binario (restos de abajo ↑ arriba): <span class="div-bin-result font-bold text-lg">${ejercicioDivision.binario}</span><sub>2</sub> = <span class="font-bold">${ejercicioDivision.valor}</span><sub>10</sub></p>`;
            }
            mostrarToast(true, '¡División completa!', `${ejercicioDivision.valor} → ${ejercicioDivision.binario}₂`);
            setTimeout(reproducirSonidoAcierto, 60);
            actualizarBandejaRestos(true);
            // Colocar los restos (bits) en el ejercicio principal de representación
            aplicarRestosARepresentacion();
        }
    } else if (desdeIntro) {
        if (coc !== p.cociente) marcarCampoDivision(i, 'cociente', false);
        else marcarCampoDivision(i, 'cociente', true);
        if (resto !== p.resto) marcarCampoDivision(i, 'resto', false);
        else marcarCampoDivision(i, 'resto', true);
    }
}

function comprobarDivision() {
    if (cuadernoFase === 'suma') {
        comprobarSumaExceso(false);
        return;
    }
    if (cuadernoFase === 'suma-inverso') {
        comprobarSumaInverso(false);
        return;
    }
    if (!ejercicioDivision) return;
    guardarValoresPasoActual();
    const pasos = ejercicioDivision.pasos;

    let todoOk = true;
    let msgPartes = [];

    // Comprobar todos los pasos desbloqueados usando divisionValores
    for (let i = 0; i < divisionPasoVisible; i++) {
        const p = pasos[i];
        const v = divisionValores[i] || {};
        // Preferir valor en DOM si el paso está visible
        const cocDom = leerCampoDivision(i, 'cociente');
        const restoDom = leerCampoDivision(i, 'resto');
        const coc = cocDom !== null ? cocDom : (v.cociente !== '' && v.cociente != null ? parseInt(v.cociente, 10) : null);
        const resto = restoDom !== null ? restoDom : (v.resto !== '' && v.resto != null ? parseInt(v.resto, 10) : null);
        const cocOk = coc === p.cociente;
        const restoOk = resto === p.resto;
        marcarCampoDivision(i, 'cociente', coc === null ? null : cocOk);
        marcarCampoDivision(i, 'resto', resto === null ? null : restoOk);
        if (!cocOk || !restoOk) {
            todoOk = false;
            msgPartes.push(`paso ${i + 1}`);
        }
    }

    // Si aún faltan pasos por desbloquear, no está completo
    if (divisionPasoVisible < pasos.length) {
        todoOk = false;
        if (!msgPartes.length) msgPartes.push('faltan pasos');
    }

    const fb = document.getElementById('feedback-division');
    const res = document.getElementById('resultado-bin-division');
    if (todoOk) {
        if (fb) fb.classList.add('hidden');
        if (res) {
            res.innerHTML = `<p class="handwriting text-base text-emerald-800">✓ ¡Correcto! <span class="div-bin-result font-bold text-lg">${ejercicioDivision.binario}</span><sub>2</sub> = <span class="font-bold">${ejercicioDivision.valor}</span><sub>10</sub></p>`;
        }
        mostrarToast(true, '¡División perfecta!', `${ejercicioDivision.valor} → ${ejercicioDivision.binario}₂`);
        setTimeout(reproducirSonidoAcierto, 60);
        aplicarRestosARepresentacion();
    } else {
        if (res) res.innerHTML = '';
        if (fb) {
            fb.classList.remove('hidden');
            fb.innerHTML = `<p class="handwriting text-red-800 text-base font-bold bg-red-50 p-2 rounded border border-red-200">Revisa: ${msgPartes.join(', ')}. El binario correcto es ${ejercicioDivision.binario}₂</p>`;
        }
        mostrarToast(false, 'Revisa la división', `Binario esperado: ${ejercicioDivision.binario}₂`);
    }
}


function mostrarAyudaDivision() {
    if (cuadernoFase === 'suma-inverso') {
        if (!sumaInverso && ejercicioInverso && ejercicioInverso.necesitaInvertir) {
            const ej = ejercicioInverso;
            document.querySelectorAll('.rep-inv-bit').forEach((inp, i) => { inp.value = ej.invertido[i]; inp.classList.remove('error'); });
            if (ej.metodo === 'complemento-2' && ej.masUno) {
                document.querySelectorAll('.rep-masuno-bit').forEach((inp, i) => { inp.value = ej.masUno[i]; inp.classList.remove('error'); });
                if (ej.acarreosEsperados) {
                    document.querySelectorAll('.rep-acarreo-inv').forEach((inp, i) => {
                        inp.value = ej.acarreosEsperados[i] === '1' ? '1' : '';
                    });
                }
            }
            prepararSumaInverso();
        }
        if (sumaInverso) {
            // Si está en fase pesos y es exceso, rellenar suma y pasar a resta
            if (sumaInverso.metodo === 'exceso' && sumaInverso.fase === 'pesos') {
                const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
                String(sumaInverso.total).split('').forEach((d, i) => {
                    if (cells[i]) { cells[i].value = d; cells[i].classList.remove('error'); cells[i].classList.add('ok-bit'); }
                });
                iniciarFaseRestaSesgo();
                // Rellenar también la resta
                const cells2 = Array.from(document.querySelectorAll('.suma-inv-cell'));
                sumaInverso.digitos.split('').forEach((d, i) => {
                    if (cells2[i]) { cells2[i].value = d; cells2[i].classList.remove('error'); cells2[i].classList.add('ok-bit'); }
                });
            } else {
                const cells = Array.from(document.querySelectorAll('.suma-inv-cell'));
                sumaInverso.digitos.split('').forEach((d, i) => {
                    if (cells[i]) { cells[i].value = d; cells[i].classList.remove('error'); cells[i].classList.add('ok-bit'); }
                });
            }
            if (ejercicioInverso) {
                ejercicioInverso.sumaCuadernoHecha = true;
                ejercicioInverso.entrada = String(sumaInverso.valorFinal);
                actualizarRespuestaInverso();
                resaltarCeldaActivaInverso();
            }
            if (sumaInverso) {
                sumaInverso.completado = true;
                guardarCeldasSumaInverso();
            }
            let msg = `Suma = ${sumaInverso.total}`;
            if (sumaInverso.desdeInversion) msg += ` → −${sumaInverso.total}`;
            if (sumaInverso.metodo === 'exceso') msg += ` → ${sumaInverso.total} − ${sumaInverso.sesgo} = ${sumaInverso.valorFinal}`;
            mostrarToast(true, 'Solución', msg);
            setTimeout(() => {
                if (cuadernoDivision) ocultarCuadernoDivision();
            }, 900);
        }
        return;
    }
    if (cuadernoFase === 'suma' && sumaExceso) {
        const cells = Array.from(document.querySelectorAll('.div-suma-cell'));
        sumaExceso.digitos.split('').forEach((d, i) => {
            if (cells[i]) { cells[i].value = d; cells[i].classList.remove('error'); cells[i].classList.add('ok-bit'); }
        });
        setTimeout(() => iniciarFaseDivision(sumaExceso.resultado, true), 300);
        return;
    }
    if (!ejercicioDivision) return;
    divisionPasoVisible = ejercicioDivision.pasos.length;
    divisionValores = ejercicioDivision.pasos.map(p => ({
        cociente: String(p.cociente),
        resto: String(p.resto),
        producto: String(p.resto)
    }));
    divisionVistaActual = divisionPasoVisible - 1;
    renderizarDivision();
    const res = document.getElementById('resultado-bin-division');
    if (res) {
        res.innerHTML = `<p class="handwriting text-violet-800 text-base">💡 Solución: <span class="div-bin-result font-bold text-lg">${ejercicioDivision.binario}</span><sub>2</sub> = ${ejercicioDivision.valor}<sub>10</sub></p>`;
    }
    const fb = document.getElementById('feedback-division');
    if (fb) fb.classList.add('hidden');
    aplicarRestosARepresentacion();
}

function reiniciarDivision() {
    const fb = document.getElementById('feedback-division');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const res = document.getElementById('resultado-bin-division');
    if (res) res.innerHTML = '';
    // Forzar reinicio limpio (no restaurar progreso)
    progresoCuadernoKey = null;
    sumaInverso = null;
    sumaExceso = null;
    ejercicioDivision = null;
    divisionValores = [];
    divisionPasoVisible = 1;
    divisionVistaActual = 0;
    if (ejercicioInverso) ejercicioInverso.sumaCuadernoHecha = false;
    prepararDivisionDesdeRepresentacion();
}

function insertarDigitoDivision(d) {
    if (cuadernoFase === 'suma') {
        insertarDigitoSumaExceso(d);
        return;
    }
    if (cuadernoFase === 'suma-inverso') {
        insertarDigitoSumaInverso(d);
        return;
    }
    let inp = divisionInputActivo;
    // Si no hay casilla activa o no está en el DOM, elegir cociente/resto del paso visible
    if (!inp || !inp.isConnected) {
        const i = divisionVistaActual;
        const coc = document.querySelector(`.div-cociente[data-paso="${i}"]`);
        const resto = document.querySelector(`.div-resto[data-paso="${i}"]`);
        const p = ejercicioDivision && ejercicioDivision.pasos[i];
        const lenEsp = p ? String(p.cociente).length : 1;
        if (coc && (coc.value || '').length >= lenEsp && resto) inp = resto;
        else inp = coc || resto;
    }
    if (!inp) return;

    // Solo permitir edición en el paso activo (última desbloqueada)
    const paso = parseInt(inp.dataset.paso, 10);
    if (paso !== divisionVistaActual || paso >= divisionPasoVisible) return;
    // Si el paso ya está completado y no es el que se edita, no escribir
    const p = ejercicioDivision && ejercicioDivision.pasos[paso];
    if (p && divisionValores[paso] &&
        String(divisionValores[paso].cociente) === String(p.cociente) &&
        String(divisionValores[paso].resto) === String(p.resto) &&
        paso < divisionPasoVisible - 1) {
        return;
    }

    if (inp.dataset.campo === 'resto') {
        if (d !== '0' && d !== '1') return;
        inp.value = d;
        inp.classList.remove('error', 'ok-bit');
        divisionInputActivo = inp;
        document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
        inp.classList.add('div-activa');
        if (p && leerCampoDivision(paso, 'cociente') === p.cociente && parseInt(d, 10) === p.resto) {
            setTimeout(() => tryAvanzarPasoDivision(false), 180);
        }
    } else {
        // cociente: añadir dígito
        inp.value = (inp.value || '') + d;
        inp.classList.remove('error', 'ok-bit');
        divisionInputActivo = inp;
        document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
        inp.classList.add('div-activa');
        if (Number.isFinite(paso)) onCocienteInput(paso);
    }
}


function borrarDigitoDivision() {
    if (cuadernoFase === 'suma') {
        borrarDigitoSumaExceso();
        return;
    }
    if (cuadernoFase === 'suma-inverso') {
        borrarDigitoSumaInverso();
        return;
    }
    let inp = divisionInputActivo;
    if (!inp || !inp.isConnected) {
        const i = divisionVistaActual;
        const resto = document.querySelector(`.div-resto[data-paso="${i}"]`);
        const coc = document.querySelector(`.div-cociente[data-paso="${i}"]`);
        if (resto && (resto.value || '') !== '') inp = resto;
        else if (coc && (coc.value || '') !== '') inp = coc;
        else inp = resto || coc;
    }
    if (!inp) return;

    const paso = parseInt(inp.dataset.paso, 10);

    // Si estamos en el resto:
    //  - si tiene valor, se borra
    //  - si ya está vacío, saltamos al cociente y borramos su último dígito
    if (inp.dataset.campo === 'resto') {
        if ((inp.value || '') !== '') {
            inp.value = '';
            inp.classList.remove('error', 'ok-bit');
            if (Number.isFinite(paso) && divisionValores[paso]) {
                divisionValores[paso].resto = '';
            }
            divisionInputActivo = inp;
            document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
            inp.classList.add('div-activa');
            return;
        }
        // Resto vacío → volver al cociente
        const cocEl = document.querySelector(`.div-cociente[data-paso="${paso}"]`);
        if (cocEl) {
            cocEl.value = (cocEl.value || '').slice(0, -1);
            cocEl.classList.remove('error', 'ok-bit');
            divisionInputActivo = cocEl;
            document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
            cocEl.classList.add('div-activa');
            if (Number.isFinite(paso)) onCocienteInput(paso, false);
        }
        return;
    }

    // Cociente: borrar último dígito
    inp.value = (inp.value || '').slice(0, -1);
    inp.classList.remove('error', 'ok-bit');
    divisionInputActivo = inp;
    document.querySelectorAll('#contenedor-division .div-cell.div-activa').forEach(c => c.classList.remove('div-activa'));
    inp.classList.add('div-activa');
    if (inp.dataset.campo === 'cociente' && Number.isFinite(paso)) {
        onCocienteInput(paso, false);
    }
}

/**
 * Cuando el cuaderno de división termina, coloca los restos (bits)
 * en la fila «Valor absoluto» del ejercicio principal de representación.
 * Los restos se leen de abajo hacia arriba (= binario del valor absoluto).
 * Si el método es signo-magnitud, también rellena el bit de signo.
 */
function activarModoClickRestos() {
    if (!ejercicioDivision || !ejercicioActualRepresentacion) return;
    // En exceso, la división se hace sobre N+sesgo: el binario resultante SÍ es la representación
    restosClickMode = true;
    restosClickNext = 0;
    restosUsados = {};
    const ej = ejercicioActualRepresentacion;
    const bin = (ejercicioDivision.binario || '0').replace(/^0+/, '') || '0';
    const esSM = ej.metodo === 'signo-magnitud';
    const ancho = esSM ? ej.bits - 1 : ej.bits;
    const padded = bin.padStart(ancho, '0').slice(-ancho);
    const inputs = Array.from(document.querySelectorAll('.rep-valor'));
    // Limpiar y prefijar ceros a la izquierda (no salen de la división)
    inputs.forEach((inp, i) => {
        inp.classList.remove('error', 'ok-bit');
        if (i < inputs.length && padded[i] === '0' && bin.length < ancho && i < (ancho - bin.length)) {
            inp.value = '0';
        } else {
            inp.value = '';
        }
    });
    // Rehacer: rellenar solo los ceros de padding a la izquierda
    const padCount = Math.max(0, ancho - bin.length);
    inputs.forEach((inp, i) => {
        inp.value = (i < padCount) ? '0' : '';
        inp.classList.remove('error', 'ok-bit');
    });
    if (esSM) {
        document.querySelectorAll('.rep-signo').forEach(inp => {
            inp.value = '';
            inp.classList.remove('error', 'ok-bit');
        });
    }
    actualizarBandejaRestos(false);
}

function aplicarRestosARepresentacion() {
    // Compatibilidad: activa el modo de clic en restos (ya no rellena solo)
    activarModoClickRestos();
}

function generarRandomLibre() {
    const bits = parseInt(document.getElementById('gen-bits').value);
    const maxVal = Math.pow(2, bits) - 1;
    const val = Math.floor(randomNext() * (maxVal + 1));
    document.getElementById('rand-bin').innerText = val.toString(2).padStart(bits, '0');
    document.getElementById('rand-dec').innerText = `Decimal: ${val}`;
}

function actualizarHexDesdeDecimal(dec) {
    const hexEl = document.getElementById('input-hexadecimal-libre');
    if (hexEl) hexEl.value = Number.isFinite(dec) && dec >= 0 ? dec.toString(16).toUpperCase() : '';
}

function convertirDesdeDecimal() {
    const raw = document.getElementById('input-decimal-libre').value.trim();
    const dec = raw === '' ? NaN : Number(raw);
    const errEl = document.getElementById('error-conversor');
    if (!Number.isInteger(dec) || dec < 0) {
        document.getElementById('input-binario-libre').value = '';
        document.getElementById('input-hexadecimal-libre').value = '';
        errEl.innerText = raw === '' ? '' : '⚠️ Introduce un número decimal entero positivo.';
        return;
    }
    errEl.innerText = '';
    document.getElementById('input-binario-libre').value = dec.toString(2);
    actualizarHexDesdeDecimal(dec);
}

function convertirDesdeBinario() {
    const bin = document.getElementById('input-binario-libre').value.trim();
    const errEl = document.getElementById('error-conversor');
    if (bin === '') {
        document.getElementById('input-decimal-libre').value = '';
        document.getElementById('input-hexadecimal-libre').value = '';
        errEl.innerText = '';
        return;
    }
    if (!/^[01]+$/.test(bin)) {
        errEl.innerText = '⚠️ Solo 0 y 1 permitidos.';
        return;
    }
    errEl.innerText = '';
    const dec = parseInt(bin, 2);
    document.getElementById('input-decimal-libre').value = dec;
    actualizarHexDesdeDecimal(dec);
}

function convertirDesdeHexadecimal() {
    const hex = document.getElementById('input-hexadecimal-libre').value.trim();
    const errEl = document.getElementById('error-conversor');
    if (hex === '') {
        document.getElementById('input-decimal-libre').value = '';
        document.getElementById('input-binario-libre').value = '';
        errEl.innerText = '';
        return;
    }
    if (!/^[0-9a-f]+$/i.test(hex)) {
        errEl.innerText = '⚠️ Solo dígitos 0-9 y letras A-F permitidos.';
        return;
    }
    errEl.innerText = '';
    const dec = parseInt(hex, 16);
    document.getElementById('input-decimal-libre').value = dec;
    document.getElementById('input-binario-libre').value = dec.toString(2);
    document.getElementById('input-hexadecimal-libre').value = hex.toUpperCase();
}

// ========== COMA FIJA ==========
let ejercicioComaFija = null;
let modoComaFija = 'directo'; // 'directo' | 'inverso'
let logComaFija = [];
let cfEntradaDecimal = '';

function parseFormatoCF(str) {
    const parts = str.split('-').map(Number);
    return { signo: parts[0] || 1, enteros: parts[1] || 4, frac: parts[2] || 3 };
}

function valorDesdeBitsCF(bits, fmt) {
    // bits: string de longitud 1+enteros+frac; bit[0]=signo (1=neg)
    const s = bits[0] === '1' ? -1 : 1;
    let mag = 0;
    for (let i = 0; i < fmt.enteros; i++) {
        if (bits[1 + i] === '1') mag += Math.pow(2, fmt.enteros - 1 - i);
    }
    for (let i = 0; i < fmt.frac; i++) {
        if (bits[1 + fmt.enteros + i] === '1') mag += Math.pow(2, -(i + 1));
    }
    return s * mag;
}

function bitsDesdeValorCF(valor, fmt) {
    const neg = valor < 0;
    let mag = Math.abs(valor);
    // Parte entera
    const maxEnt = Math.pow(2, fmt.enteros) - 1;
    let parteEnt = Math.min(Math.floor(mag + 1e-12), maxEnt);
    let resto = mag - parteEnt;
    // Parte fraccionaria (truncar a fmt.frac bits)
    let bitsFrac = '';
    for (let i = 0; i < fmt.frac; i++) {
        resto *= 2;
        if (resto >= 1 - 1e-12) {
            bitsFrac += '1';
            resto -= 1;
        } else {
            bitsFrac += '0';
        }
    }
    const bitsEnt = parteEnt.toString(2).padStart(fmt.enteros, '0');
    return (neg ? '1' : '0') + bitsEnt + bitsFrac;
}

function generarValorCF(fmt) {
    // Generar un valor representable exactamente con los bits de fracción
    const maxEnt = Math.pow(2, fmt.enteros) - 1;
    const parteEnt = randomInt(0, Math.min(maxEnt, 15));
    let parteFrac = 0;
    const bitsFrac = [];
    for (let i = 0; i < fmt.frac; i++) {
        const b = randomInt(0, 1);
        bitsFrac.push(b);
        if (b) parteFrac += Math.pow(2, -(i + 1));
    }
    // Evitar 0 a veces
    if (parteEnt === 0 && parteFrac === 0 && randomInt(0, 1)) {
        parteFrac = Math.pow(2, -fmt.frac);
    }
    const signo = randomInt(0, 1) === 1 ? -1 : 1;
    // No generar -0
    if (parteEnt === 0 && parteFrac === 0) return 0;
    return signo * (parteEnt + parteFrac);
}

function formatoDecimalCF(n) {
    // Mostrar con coma decimal española, sin ceros basura
    if (!Number.isFinite(n)) return String(n);
    const s = (Math.round(n * 1e10) / 1e10).toString();
    return s.replace('.', ',');
}

function reiniciarEjercicioComaFija() {
    const fmtStr = document.getElementById('formato-comafija').value;
    const fmt = parseFormatoCF(fmtStr);
    const totalBits = fmt.signo + fmt.enteros + fmt.frac;
    modoComaFija = document.getElementById('sentido-comafija').value || 'directo';
    logComaFija = [];
    cfEntradaDecimal = '';
    mostrarBotonNuevo('comafija', false);
    mostrarBotonNuevo('comafija-inv', false);
    const fb = document.getElementById('feedback-comafija');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const logEl = document.getElementById('log-comafija');
    if (logEl) logEl.innerHTML = '';

    const valor = generarValorCF(fmt);
    const bits = bitsDesdeValorCF(valor, fmt);
    // Recalcular valor exacto desde bits (por redondeo)
    const valorExacto = valorDesdeBitsCF(bits, fmt);

    ejercicioComaFija = {
        fmt, fmtStr, totalBits, valor: valorExacto, bits,
        pesos: []
    };
    // Pesos: signo, luego 2^{e-1}..2^0, luego 2^{-1}..2^{-f}
    ejercicioComaFija.pesos.push({ label: 'S', tipo: 'signo' });
    for (let i = fmt.enteros - 1; i >= 0; i--) {
        ejercicioComaFija.pesos.push({ label: '2' + (i === 0 ? '' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[i] || ('^' + i)), exp: i, tipo: 'entero' });
    }
    for (let i = 1; i <= fmt.frac; i++) {
        ejercicioComaFija.pesos.push({ label: '2⁻' + '¹²³⁴⁵⁶⁷⁸⁹'[i - 1], exp: -i, tipo: 'frac' });
    }

    // UI teclados
    const tkDir = document.getElementById('teclado-cf-directo');
    const tkInv = document.getElementById('teclado-cf-inverso');
    if (modoComaFija === 'directo') {
        if (tkDir) tkDir.classList.remove('hidden');
        if (tkDir) tkDir.classList.add('flex');
        if (tkInv) { tkInv.classList.add('hidden'); tkInv.classList.remove('flex'); }
    } else {
        if (tkInv) { tkInv.classList.remove('hidden'); tkInv.classList.add('flex'); }
        if (tkDir) { tkDir.classList.add('hidden'); tkDir.classList.remove('flex'); }
    }

    const sub = document.getElementById('subtitulo-comafija');
    if (sub) {
        sub.textContent = modoComaFija === 'directo'
            ? 'Escribe los bits en orden signo · parte entera · parte fraccionaria.'
            : 'Interpreta los bits y escribe el número decimal (usa coma o punto).';
    }

    const enun = document.getElementById('enunciado-comafija');
    if (enun) {
        if (modoComaFija === 'directo') {
            enun.innerHTML = `<p class="text-xs uppercase font-bold text-teal-600 mb-1">Coma fija · orden ${fmtStr} · ${fmt.signo}+${fmt.enteros}+${fmt.frac} bits</p><p class="title-handwriting text-xl sm:text-2xl font-bold text-teal-900">Representa <span class="code-font">${formatoDecimalCF(valorExacto)}</span> en coma fija orden ${fmtStr}.</p>`;
        } else {
            enun.innerHTML = `<p class="text-xs uppercase font-bold text-teal-600 mb-1">Coma fija · orden ${fmtStr} · ${fmt.signo}+${fmt.enteros}+${fmt.frac} bits</p><p class="title-handwriting text-xl sm:text-2xl font-bold text-teal-900">El patrón <span class="code-font">${bits}</span> en orden ${fmtStr} representa ¿qué número decimal?</p>`;
        }
    }

    renderizarComaFija();
}

function cambiarSentidoComaFija() {
    reiniciarEjercicioComaFija();
}

function renderizarComaFija() {
    const cont = document.getElementById('contenedor-comafija');
    if (!cont || !ejercicioComaFija) return;
    const ej = ejercicioComaFija;
    const fmt = ej.fmt;
    const total = ej.totalBits;

    // Fila de pesos
    let pesosHtml = '<div class="flex items-end gap-0.5 mb-1">';
    for (let i = 0; i < total; i++) {
        const p = ej.pesos[i];
        let lbl = '';
        if (p.tipo === 'signo') lbl = 'S';
        else if (p.tipo === 'entero') lbl = p.exp === 0 ? '2⁰' : ('2' + '⁰¹²³⁴⁵⁶⁷⁸⁹'[p.exp]);
        else lbl = '2⁻' + '¹²³⁴⁵⁶⁷⁸⁹'[Math.abs(p.exp) - 1];
        const color = p.tipo === 'signo' ? 'text-amber-700' : (p.tipo === 'entero' ? 'text-teal-700' : 'text-cyan-700');
        pesosHtml += `<span class="rep-peso-lbl ${color} s-6">${lbl}</span>`;
        if (i === 0 || i === fmt.enteros) {
            // separador visual después de signo y después de enteros
        }
    }
    pesosHtml += '</div>';

    // Fila de celdas
    let celdasHtml = '<div class="flex items-center gap-0.5">';
    for (let i = 0; i < total; i++) {
        const p = ej.pesos[i];
        let extraCls = 'cf-bit';
        if (p.tipo === 'signo') extraCls += ' rep-bit-signo';
        if (modoComaFija === 'inverso') {
            // bits dados
            celdasHtml += `<div class="binary-cell ${extraCls} rep-bit-dado" data-cf-idx="${i}">${ej.bits[i]}</div>`;
        } else {
            celdasHtml += `<input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" class="binary-cell ${extraCls}" data-cf-idx="${i}" value="">`;
        }
        // Punto binario visual después de la parte entera
        if (i === fmt.enteros) {
            celdasHtml += `<span class="text-2xl font-black text-teal-600 mx-0.5 select-none" title="Punto binario">·</span>`;
        }
    }
    celdasHtml += '</div>';

    // Leyenda de zonas
    let leyenda = '<div class="flex items-center justify-center gap-3 mt-2 text-[10px] sm:text-xs font-semibold">';
    leyenda += '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">Signo</span>';
    leyenda += '<span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">Parte entera</span>';
    leyenda += '<span class="text-teal-600 font-black">·</span>';
    leyenda += '<span class="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">Parte fraccionaria</span>';
    leyenda += '</div>';

    // Respuesta decimal (solo inverso)
    let respHtml = '';
    if (modoComaFija === 'inverso') {
        respHtml = `<div class="mt-4 flex items-center justify-center gap-2">
            <span class="handwriting text-base text-teal-800 font-bold">Decimal:</span>
            <div id="cf-decimal" class="binary-cell rep-decimal-resp vacia s-7">?</div>
        </div>`;
    }

    cont.innerHTML = pesosHtml + celdasHtml + leyenda + respHtml;
    cont.style.setProperty('--cols', String(total + 1));
}

function insertarDigitoCF(d) {
    if (modoComaFija !== 'directo' || !ejercicioComaFija) return;
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            inputs[i].value = d;
            inputs[i].classList.remove('error');
            break;
        }
    }
    if (inputs.some(inp => inp.value !== '')) mostrarBotonNuevo('comafija', true);
}

function borrarDigitoCF() {
    if (modoComaFija !== 'directo' || !ejercicioComaFija) return;
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    for (let i = inputs.length - 1; i >= 0; i--) {
        if (inputs[i].value !== '') {
            inputs[i].value = '';
            inputs[i].classList.remove('error');
            break;
        }
    }
}

function insertarCaracterCF(c) {
    if (modoComaFija !== 'inverso' || !ejercicioComaFija) return;
    if (c === '-') {
        cfEntradaDecimal = cfEntradaDecimal.startsWith('-') ? cfEntradaDecimal.slice(1) : '-' + cfEntradaDecimal;
    } else if (c === '.' || c === ',') {
        if (!cfEntradaDecimal.includes('.') && !cfEntradaDecimal.includes(',')) {
            cfEntradaDecimal += (cfEntradaDecimal === '' || cfEntradaDecimal === '-' ? '0.' : '.');
        }
    } else {
        const digitos = cfEntradaDecimal.replace('-', '').replace('.', '').replace(',', '');
        if (digitos.length < 8) cfEntradaDecimal += c;
    }
    actualizarRespuestaCF();
    mostrarBotonNuevo('comafija-inv', true);
}

function borrarCaracterCF() {
    if (modoComaFija !== 'inverso') return;
    cfEntradaDecimal = cfEntradaDecimal.slice(0, -1);
    actualizarRespuestaCF();
}

function actualizarRespuestaCF() {
    const celda = document.getElementById('cf-decimal');
    if (!celda) return;
    const t = cfEntradaDecimal || '';
    celda.textContent = t === '' ? '?' : t.replace('.', ',');
    celda.classList.toggle('vacia', t === '');
    celda.classList.remove('error', 'rep-ok');
}

function comprobarComaFija() {
    if (!ejercicioComaFija) return;
    const ej = ejercicioComaFija;
    const fb = document.getElementById('feedback-comafija');

    if (modoComaFija === 'directo') {
        const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
        const bitsArr = inputs.map(inp => {
            const t = (inp.value || '').trim();
            return (t === '1' || t === '0') ? t : '';
        });
        // Comprobar incompleto sobre el array (NO sobre el string unido:
        // en JS "101".includes('') es siempre true)
        if (bitsArr.length !== ej.totalBits || bitsArr.some(b => b === '')) {
            mostrarToast(false, 'Incompleto', 'Rellena todos los bits (signo + entera + fraccionaria).');
            return;
        }
        const escrito = bitsArr.join('');
        let ok = true;
        inputs.forEach((inp, i) => {
            if (escrito[i] !== ej.bits[i]) { inp.classList.add('error'); ok = false; }
            else inp.classList.remove('error');
        });
        mostrarBotonNuevo('comafija', true);
        if (ok) {
            mostrarToast(true, '¡Correcto!', `${formatoDecimalCF(ej.valor)} → ${ej.bits} (${ej.fmtStr})`);
            setTimeout(reproducirSonidoAcierto, 60);
            if (fb) {
                fb.classList.remove('hidden');
                fb.innerHTML = `<div class="handwriting text-teal-800 text-sm sm:text-base bg-teal-50 p-2 rounded border border-teal-200 text-left inline-block">${explicacionComaFija(ej)}</div>`;
            }
        } else {
            logComaFija.push({ n: logComaFija.length + 1, escrito, esperado: ej.bits });
            renderizarLogComaFija();
            mostrarToast(false, 'Revisa los bits', `Debía ser ${ej.bits}`);
            if (fb) fb.classList.add('hidden');
        }
    } else {
        // Inverso
        const t = cfEntradaDecimal.replace(',', '.');
        if (t === '' || t === '-' || t === '.' || t === '-.') {
            mostrarToast(false, 'Falta la respuesta', 'Escribe el número decimal.');
            return;
        }
        const n = parseFloat(t);
        const celda = document.getElementById('cf-decimal');
        mostrarBotonNuevo('comafija-inv', true);
        // Tolerancia por redondeo
        if (Number.isFinite(n) && Math.abs(n - ej.valor) < 1e-9) {
            if (celda) { celda.classList.remove('error'); celda.classList.add('rep-ok'); }
            mostrarToast(true, '¡Muy bien!', `${ej.bits} → ${formatoDecimalCF(ej.valor)}`);
            setTimeout(reproducirSonidoAcierto, 60);
            if (fb) {
                fb.classList.remove('hidden');
                fb.innerHTML = `<div class="handwriting text-teal-800 text-sm sm:text-base bg-teal-50 p-2 rounded border border-teal-200 text-left inline-block">${explicacionComaFija(ej)}</div>`;
            }
        } else {
            if (celda) celda.classList.add('error');
            logComaFija.push({ n: logComaFija.length + 1, escrito: n, esperado: ej.valor });
            renderizarLogComaFija();
            mostrarToast(false, 'Respuesta incorrecta', `El número correcto es ${formatoDecimalCF(ej.valor)}`);
            if (fb) fb.classList.add('hidden');
        }
    }
}

function explicacionComaFija(ej) {
    const fmt = ej.fmt;
    const bits = ej.bits;
    const signo = bits[0] === '1' ? 'negativo (−)' : 'positivo (+)';
    let entStr = '';
    let entVal = 0;
    for (let i = 0; i < fmt.enteros; i++) {
        const b = bits[1 + i];
        const p = Math.pow(2, fmt.enteros - 1 - i);
        if (b === '1') { entVal += p; entStr += (entStr ? ' + ' : '') + `1·2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[fmt.enteros - 1 - i]}`; }
    }
    if (!entStr) entStr = '0';
    let fracStr = '';
    let fracVal = 0;
    for (let i = 0; i < fmt.frac; i++) {
        const b = bits[1 + fmt.enteros + i];
        const p = Math.pow(2, -(i + 1));
        if (b === '1') { fracVal += p; fracStr += (fracStr ? ' + ' : '') + `1·2⁻${'¹²³⁴⁵⁶⁷⁸⁹'[i]}`; }
    }
    if (!fracStr) fracStr = '0';
    return `<b>Orden ${ej.fmtStr}:</b> <span class="code-font">${bits}</span><br>
        · Signo <span class="code-font">${bits[0]}</span> → ${signo}<br>
        · Entera <span class="code-font">${bits.slice(1, 1 + fmt.enteros)}</span> → ${entStr} = <b>${entVal}</b><br>
        · Fraccionaria <span class="code-font">${bits.slice(1 + fmt.enteros)}</span> → ${fracStr} = <b>${formatoDecimalCF(fracVal)}</b><br>
        · Resultado: <b>${formatoDecimalCF(ej.valor)}</b>`;
}

function mostrarAyudaComaFija() {
    if (!ejercicioComaFija) return;
    const ej = ejercicioComaFija;
    if (modoComaFija === 'directo') {
        const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
        inputs.forEach((inp, i) => {
            inp.value = ej.bits[i];
            inp.classList.remove('error');
        });
        mostrarBotonNuevo('comafija', true);
    } else {
        cfEntradaDecimal = String(ej.valor);
        actualizarRespuestaCF();
        const celda = document.getElementById('cf-decimal');
        if (celda) { celda.classList.remove('error'); celda.classList.add('rep-ok'); }
        mostrarBotonNuevo('comafija-inv', true);
    }
    const fb = document.getElementById('feedback-comafija');
    if (fb) {
        fb.classList.remove('hidden');
        fb.innerHTML = `<div class="handwriting text-teal-800 text-sm sm:text-base bg-teal-50 p-2 rounded border border-teal-200 text-left inline-block"><b>💡 Solución:</b><br>${explicacionComaFija(ej)}</div>`;
    }
}

function renderizarLogComaFija() {
    const cont = document.getElementById('log-comafija');
    if (!cont) return;
    const log = logComaFija;
    const ej = ejercicioComaFija;
    const cuerpo = !log.length
        ? `<p class="text-xs sm:text-sm text-gray-500 italic">Todavía no hay errores en este ejercicio.</p>`
        : log.slice().reverse().map(e => {
            if (modoComaFija === 'directo') {
                return `<div class="bg-white/80 border border-red-200 rounded-lg p-2.5">
                    <p class="text-xs sm:text-sm font-semibold text-gray-800">Intento ${e.n}: ${formatoDecimalCF(ej.valor)} · ${ej.fmtStr}</p>
                    <div class="mt-1 flex flex-wrap gap-2">
                        <div class="flex items-center gap-1"><span class="text-emerald-600 font-bold">✓</span><span class="code-font text-emerald-700">${e.esperado}</span></div>
                        <div class="flex items-center gap-1"><span class="text-red-600 font-bold">✗</span><span class="code-font text-red-700">${e.escrito}</span></div>
                    </div>
                </div>`;
            }
            return `<div class="bg-white/80 border border-red-200 rounded-lg p-2.5">
                <p class="text-xs sm:text-sm font-semibold text-gray-800">Intento ${e.n}: <span class="code-font">${ej.bits}</span> · ${ej.fmtStr}</p>
                <div class="mt-1 flex flex-wrap gap-2">
                    <div class="flex items-center gap-1"><span class="text-emerald-600 font-bold">✓</span><span class="code-font text-emerald-700">${formatoDecimalCF(e.esperado)}</span></div>
                    <div class="flex items-center gap-1"><span class="text-red-600 font-bold">✗</span><span class="code-font text-red-700">${formatoDecimalCF(e.escrito)}</span></div>
                </div>
            </div>`;
        }).join('');
    cont.innerHTML = `
        <div class="border-2 ${log.length ? 'border-red-300 bg-red-50/70' : 'border-gray-200 bg-gray-50/70'} rounded-xl p-3">
            <div class="flex items-center justify-between gap-2 mb-2">
                <h3 class="title-handwriting text-xl sm:text-2xl font-bold ${log.length ? 'text-red-800' : 'text-gray-600'}"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Registro de errores</h3>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full ${log.length ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}">${log.length ? log.length + (log.length === 1 ? ' intento fallido' : ' intentos fallidos') : 'Sin errores'}</span>
            </div>
            <div class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">${cuerpo}</div>
        </div>`;
}

// ========== CUADERNO COMA FIJA ==========
let cuadernoCF = false;
let cfCuaderno = null; // { tipo, pasos[], idx, valores[] }
let cfCuadernoInputActivo = null;

/** Restos completados de la parte entera (orden: primer resto = LSB). */
function obtenerRestosCF() {
    if (!cfCuaderno || cfCuaderno.tipo !== 'directo') return [];
    const restos = [];
    for (let i = 0; i < cfCuaderno.pasos.length; i++) {
        const p = cfCuaderno.pasos[i];
        if (p.tipo !== 'div' || p.campo === 'info') continue;
        const v = cfCuaderno.valores[i] || {};
        // Solo contar si el paso está resuelto correctamente
        if (String(v.cociente) === p.esperadoCoc && String(v.resto) === p.esperadoResto) {
            restos.push(String(p.resto));
        } else {
            break; // solo cadena continua desde el inicio de las divisiones
        }
    }
    return restos;
}

/** Bits fraccionarios ya acertados (×2). */
function obtenerBitsFracCF() {
    if (!cfCuaderno || cfCuaderno.tipo !== 'directo') return [];
    const bits = [];
    for (let i = 0; i < cfCuaderno.pasos.length; i++) {
        const p = cfCuaderno.pasos[i];
        if (p.tipo !== 'mul') continue;
        const v = cfCuaderno.valores[i] || {};
        if (String(v.bit) === p.esperadoBit) bits.push(String(p.bit));
        else break;
    }
    return bits;
}

// Modo clic en restos / bits fraccionarios (como Representación)
let restosClickModeCF = false;   // parte entera: click abajo → arriba
let restosClickNextCF = 0;
let restosUsadosCF = {};
let fracClickModeCF = false;    // parte fraccionaria: click arriba → abajo (orden de ×2)
let fracClickNextCF = 0;
let fracUsadosCF = {};

/**
 * Actualiza la bandeja vertical de restos (estilo Representación).
 * Arriba = primer resto = LSB; abajo = últimos = hacia MSB.
 * En modo clic, los chips se pulsan de abajo hacia arriba.
 */
function actualizarBandejaRestosCF(animarUltimo) {
    const bitsEl = document.getElementById('bandeja-restos-cf-bits');
    const binEl = document.getElementById('bandeja-restos-cf-bin');
    const hintEl = document.getElementById('bandeja-restos-cf-hint');
    const tray = document.getElementById('bandeja-restos-cf');
    if (!bitsEl) return;

    if (cfCuaderno && cfCuaderno.tipo === 'inverso') {
        if (tray) tray.style.display = 'none';
        return;
    }
    if (tray) tray.style.display = '';

    const restos = obtenerRestosCF();
    const bitsFrac = obtenerBitsFracCF();

    if (!restos.length && !bitsFrac.length) {
        bitsEl.innerHTML = '<span class="div-restos-empty">vacío</span>';
        if (binEl) binEl.textContent = '';
        if (hintEl) hintEl.classList.add('hidden');
        return;
    }

    let html = '';
    const n = restos.length;
    const esperadoDesdeAbajo = restosClickModeCF ? restosClickNextCF : -1;

    restos.forEach((r, idx) => {
        const desdeAbajo = n - 1 - idx;
        let cls = 'div-resto-chip';
        if (animarUltimo && idx === n - 1 && !bitsFrac.length && !restosClickModeCF) cls += ' nuevo';
        if (restosClickModeCF) {
            if (restosUsadosCF[idx]) cls += ' usado';
            else {
                cls += ' clickable';
                if (desdeAbajo === esperadoDesdeAbajo) cls += ' siguiente';
            }
        }
        html += `<span class="${cls}" data-cf-resto-idx="${idx}" title="Resto del paso ${idx + 1}${restosClickModeCF ? ' · pulsa de abajo hacia arriba' : ''}">${r}</span>`;
    });

    if (restos.length && bitsFrac.length) {
        html += `<span class="text-[9px] text-teal-600 font-bold mt-1 mb-0.5">· frac</span>`;
    }

    bitsFrac.forEach((b, idx) => {
        let cls = 'div-resto-chip';
        if (animarUltimo && idx === bitsFrac.length - 1 && !fracClickModeCF) cls += ' nuevo';
        if (fracClickModeCF) {
            if (fracUsadosCF[idx]) cls += ' usado';
            else {
                cls += ' clickable';
                if (idx === fracClickNextCF) cls += ' siguiente';
            }
        }
        html += `<span class="${cls} s-8" data-cf-frac-idx="${idx}" title="Bit fraccionario ${idx + 1}${fracClickModeCF ? ' · pulsa en orden' : ''}">${b}</span>`;
    });
    bitsEl.innerHTML = html;

    // Listeners de clic
    if (restosClickModeCF) {
        bitsEl.querySelectorAll('[data-cf-resto-idx].clickable').forEach(chip => {
            chip.addEventListener('click', () => {
                onClickRestoChipCF(parseInt(chip.getAttribute('data-cf-resto-idx'), 10));
            });
        });
    }
    if (fracClickModeCF) {
        bitsEl.querySelectorAll('[data-cf-frac-idx].clickable').forEach(chip => {
            chip.addEventListener('click', () => {
                onClickFracChipCF(parseInt(chip.getAttribute('data-cf-frac-idx'), 10));
            });
        });
    }

    const binEnt = restos.length ? restos.slice().reverse().join('') : '';
    const binFrac = bitsFrac.join('');
    if (binEl) {
        if (binEnt || binFrac) {
            let txt = '';
            if (binEnt) txt += `<strong>${binEnt}</strong>`;
            if (binEnt && binFrac) txt += '<span class="s-9">·</span>';
            if (binFrac) txt += `<strong class="s-10">${binFrac}</strong>`;
            txt += '<sub>2</sub>';
            binEl.innerHTML = txt;
        } else binEl.textContent = '';
    }
    if (hintEl) {
        if (restosClickModeCF) {
            hintEl.classList.remove('hidden');
            hintEl.textContent = 'Pulsa de abajo ↑ arriba';
        } else if (fracClickModeCF) {
            hintEl.classList.remove('hidden');
            hintEl.textContent = 'Pulsa bits frac →';
        } else {
            hintEl.classList.toggle('hidden', !restos.length);
            hintEl.textContent = 'LSB ↑ MSB';
        }
    }
}

/** Coloca el bit de signo en la casilla principal (índice 0). */
function colocarSignoEnPrincipalCF(bit) {
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    if (!inputs.length) return;
    inputs[0].value = bit;
    inputs[0].classList.remove('error');
}

/**
 * Tras completar todas las divisiones: modo clic en restos.
 * Orden: de abajo (MSB) hacia arriba (LSB) → casillas enteras izq→der.
 * Rellena ceros de padding a la izquierda si hay menos restos que bits enteros.
 */
function activarModoClickRestosCF() {
    if (!cfCuaderno || !ejercicioComaFija) return;
    const fmt = ejercicioComaFija.fmt;
    const restos = obtenerRestosCF();
    // bits enteros = restos de abajo hacia arriba (= invertidos)
    const binEnt = restos.slice().reverse().join('') || '0';
    const padCount = Math.max(0, fmt.enteros - binEnt.length);
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    // Limpiar casillas enteras; prefijar ceros de padding (MSB)
    for (let i = 0; i < fmt.enteros; i++) {
        const inp = inputs[1 + i];
        if (!inp) continue;
        inp.classList.remove('error', 'ok-bit');
        inp.value = (i < padCount) ? '0' : '';
    }
    restosClickModeCF = true;
    restosClickNextCF = 0;
    restosUsadosCF = {};
    fracClickModeCF = false;
    actualizarBandejaRestosCF(false);
    const enun = document.getElementById('enunciado-cuaderno-cf');
    if (enun) {
        enun.innerHTML = `<span class="text-teal-700 font-bold">Coloca los restos</span> — Pulsa los chips de la bandeja <strong>de abajo hacia arriba</strong> para rellenar la parte entera.`;
    }
}

function onClickRestoChipCF(idxFromTop) {
    if (!restosClickModeCF || !ejercicioComaFija) return;
    const restos = obtenerRestosCF();
    if (!restos.length) return;
    const n = restos.length;
    const esperado = n - 1 - restosClickNextCF;
    if (idxFromTop !== esperado) {
        const chip = document.querySelector(`[data-cf-resto-idx="${idxFromTop}"]`);
        if (chip) {
            chip.style.transition = 'transform 0.15s';
            chip.style.transform = 'translateX(-3px)';
            setTimeout(() => { chip.style.transform = 'translateX(3px)'; setTimeout(() => { chip.style.transform = ''; }, 80); }, 80);
        }
        return;
    }
    const bit = restos[idxFromTop];
    if (!colocarBitEnteroCF(bit)) return;
    restosUsadosCF[idxFromTop] = true;
    restosClickNextCF++;
    actualizarBandejaRestosCF(false);

    if (restosClickNextCF >= n) {
        restosClickModeCF = false;
        // Continuar a fase ×2 si queda, o activar clic fraccionario / terminar
        const hayMul = cfCuaderno.pasos.some((p, i) => p.tipo === 'mul' && i > cfCuaderno.idx);
        // Avanzar índice al primer mul pendiente
        let nextMul = -1;
        for (let i = 0; i < cfCuaderno.pasos.length; i++) {
            if (cfCuaderno.pasos[i].tipo === 'mul') {
                const v = cfCuaderno.valores[i] || {};
                if (String(v.bit) !== cfCuaderno.pasos[i].esperadoBit) { nextMul = i; break; }
            }
        }
        if (nextMul >= 0) {
            cfCuaderno.idx = nextMul;
            renderizarPasoCuadernoCF();
            actualizarBandejaRestosCF(false);
        } else {
            // Todas las mul ya hechas (o no hay): modo clic frac o fin
            const bitsFrac = obtenerBitsFracCF();
            if (bitsFrac.length) activarModoClickFracCF();
            else aplicarCuadernoCFaEjercicio();
        }
    }
}

/** Coloca un bit en la primera casilla entera vacía (índices 1..enteros). */
function colocarBitEnteroCF(bit) {
    if (!ejercicioComaFija) return false;
    const fmt = ejercicioComaFija.fmt;
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    for (let i = 1; i <= fmt.enteros; i++) {
        if (inputs[i] && inputs[i].value === '') {
            inputs[i].value = bit;
            inputs[i].classList.remove('error');
            return true;
        }
    }
    return false;
}

function activarModoClickFracCF() {
    if (!cfCuaderno || !ejercicioComaFija) return;
    const fmt = ejercicioComaFija.fmt;
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    // Limpiar casillas fraccionarias
    for (let i = 0; i < fmt.frac; i++) {
        const inp = inputs[1 + fmt.enteros + i];
        if (inp) { inp.value = ''; inp.classList.remove('error', 'ok-bit'); }
    }
    fracClickModeCF = true;
    fracClickNextCF = 0;
    fracUsadosCF = {};
    restosClickModeCF = false;
    actualizarBandejaRestosCF(false);
    const enun = document.getElementById('enunciado-cuaderno-cf');
    if (enun) {
        enun.innerHTML = `<span class="text-teal-700 font-bold">Coloca los bits fraccionarios</span> — Pulsa los chips <strong>en orden</strong> (de arriba a abajo en la sección frac).`;
    }
}

function onClickFracChipCF(idx) {
    if (!fracClickModeCF || !ejercicioComaFija) return;
    const bitsFrac = obtenerBitsFracCF();
    if (idx !== fracClickNextCF) {
        const chip = document.querySelector(`[data-cf-frac-idx="${idx}"]`);
        if (chip) {
            chip.style.transition = 'transform 0.15s';
            chip.style.transform = 'translateX(-3px)';
            setTimeout(() => { chip.style.transform = 'translateX(3px)'; setTimeout(() => { chip.style.transform = ''; }, 80); }, 80);
        }
        return;
    }
    const bit = bitsFrac[idx];
    if (!colocarBitFracCF(bit)) return;
    fracUsadosCF[idx] = true;
    fracClickNextCF++;
    actualizarBandejaRestosCF(false);
    if (fracClickNextCF >= bitsFrac.length) {
        fracClickModeCF = false;
        aplicarCuadernoCFaEjercicio();
    }
}

function colocarBitFracCF(bit) {
    if (!ejercicioComaFija) return false;
    const fmt = ejercicioComaFija.fmt;
    const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
    const start = 1 + fmt.enteros;
    for (let i = 0; i < fmt.frac; i++) {
        if (inputs[start + i] && inputs[start + i].value === '') {
            inputs[start + i].value = bit;
            inputs[start + i].classList.remove('error');
            return true;
        }
    }
    return false;
}

/** ¿Quedan pasos de división por completar? */
function quedanDivisionesCF() {
    if (!cfCuaderno) return false;
    for (let i = 0; i < cfCuaderno.pasos.length; i++) {
        const p = cfCuaderno.pasos[i];
        if (p.tipo !== 'div' || p.campo === 'info') continue;
        const v = cfCuaderno.valores[i] || {};
        if (String(v.cociente) !== p.esperadoCoc || String(v.resto) !== p.esperadoResto) return true;
    }
    return false;
}

/** ¿Quedan pasos ×2 por completar? */
function quedanMulCF() {
    if (!cfCuaderno) return false;
    for (let i = 0; i < cfCuaderno.pasos.length; i++) {
        const p = cfCuaderno.pasos[i];
        if (p.tipo !== 'mul') continue;
        const v = cfCuaderno.valores[i] || {};
        if (String(v.bit) !== p.esperadoBit) return true;
    }
    return false;
}

function sincronizarSwitchCF() {
    document.querySelectorAll('[data-switch-cf]').forEach(btn => {
        btn.setAttribute('aria-checked', cuadernoCF ? 'true' : 'false');
        const est = btn.querySelector('.switch-estado');
        if (est) est.textContent = cuadernoCF ? 'ON' : 'OFF';
        btn.classList.toggle('cuaderno-pulse', !cuadernoCF);
    });
    const zona = document.getElementById('zona-cuaderno-cf');
    if (zona) zona.classList.toggle('hidden', !cuadernoCF);
}

function alternarCuadernoCF() {
    cuadernoCF = !cuadernoCF;
    try { localStorage.setItem('cuadernoCF', cuadernoCF ? '1' : '0'); } catch (e) {}
    sincronizarSwitchCF();
    if (cuadernoCF) prepararCuadernoCF();
}

function ocultarCuadernoCF() {
    if (cuadernoCF) alternarCuadernoCF();
}

function reiniciarCuadernoCF() {
    const fb = document.getElementById('feedback-cuaderno-cf');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const res = document.getElementById('resultado-cuaderno-cf');
    if (res) res.innerHTML = '';
    prepararCuadernoCF();
}

/** Construye los pasos del cuaderno según sentido y ejercicio actual. */
function prepararCuadernoCF() {
    if (!cuadernoCF || !ejercicioComaFija) {
        const cont = document.getElementById('contenedor-cuaderno-cf');
        if (cont) cont.innerHTML = '<p class="text-sm text-gray-500 italic text-center">Genera un ejercicio primero.</p>';
        return;
    }
    const ej = ejercicioComaFija;
    const fmt = ej.fmt;
    const abs = Math.abs(ej.valor);
    const parteEnt = Math.floor(abs + 1e-12);
    let parteFrac = abs - parteEnt;
    // Corregir ruido flotante
    parteFrac = Math.round(parteFrac * 1e10) / 1e10;

    const fb = document.getElementById('feedback-cuaderno-cf');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    const res = document.getElementById('resultado-cuaderno-cf');
    if (res) res.innerHTML = '';

    // Reset modo clic
    restosClickModeCF = false;
    restosClickNextCF = 0;
    restosUsadosCF = {};
    fracClickModeCF = false;
    fracClickNextCF = 0;
    fracUsadosCF = {};

    if (modoComaFija === 'directo') {
        // Pasos: signo → divisiones parte entera → (clic restos) → ×2 → (clic frac)
        const pasos = [];
        // Paso 0: signo
        pasos.push({
            tipo: 'signo',
            titulo: 'Bit de signo',
            enunciado: `El número es <strong>${ej.valor < 0 ? 'negativo' : 'positivo'}</strong> → bit de signo = <span class="code-font font-bold">${ej.bits[0]}</span>`,
            esperado: ej.bits[0],
            campo: 'bit'
        });
        // Divisiones sucesivas de la parte entera
        let n = parteEnt;
        const restos = [];
        if (n === 0) {
            pasos.push({
                tipo: 'div',
                titulo: 'Parte entera = 0',
                enunciado: `Parte entera <strong>0</strong> → todos los bits enteros a 0 (${fmt.enteros} bits).`,
                dividendo: 0, cociente: 0, resto: 0,
                esperadoCoc: '0', esperadoResto: '0',
                campo: 'info'
            });
            for (let i = 0; i < fmt.enteros; i++) restos.push(0);
        } else {
            while (n > 0) {
                const coc = Math.floor(n / 2);
                const resto = n % 2;
                restos.push(resto);
                pasos.push({
                    tipo: 'div',
                    titulo: `División: ${n} ÷ 2`,
                    enunciado: `Divide <strong>${n}</strong> entre 2. Escribe el <em>cociente</em> y el <em>resto</em> (0 o 1).`,
                    dividendo: n, cociente: coc, resto: resto,
                    esperadoCoc: String(coc), esperadoResto: String(resto),
                    campo: 'div'
                });
                n = coc;
            }
            // Rellenar ceros a la izquierda hasta fmt.enteros
            while (restos.length < fmt.enteros) restos.push(0);
        }
        // bits enteros = restos de abajo hacia arriba, truncados/padded a fmt.enteros
        const bitsEnt = restos.slice(0, fmt.enteros).reverse().map(String).join('');

        // Multiplicaciones de la parte fraccionaria
        let f = parteFrac;
        const bitsFracArr = [];
        for (let i = 0; i < fmt.frac; i++) {
            const antes = f;
            const prod = f * 2;
            const bit = prod >= 1 - 1e-12 ? 1 : 0;
            const despues = prod - bit;
            bitsFracArr.push(bit);
            pasos.push({
                tipo: 'mul',
                titulo: `Fracción × 2 (paso ${i + 1})`,
                enunciado: `Multiplica <strong>${formatoDecimalCF(antes)}</strong> × 2. El dígito entero es el bit; lo que sobra sigue.`,
                valorAntes: antes,
                producto: prod,
                bit: bit,
                valorDespues: Math.round(despues * 1e10) / 1e10,
                esperadoBit: String(bit),
                esperadoProd: formatoDecimalCF(Math.round(prod * 1e10) / 1e10),
                campo: 'mul'
            });
            f = Math.round(despues * 1e10) / 1e10;
        }

        cfCuaderno = {
            tipo: 'directo',
            pasos,
            idx: 0,
            valores: pasos.map(() => ({})),
            bitsEnt, bitsFrac: bitsFracArr.map(String).join(''),
            bitsFinal: ej.bits
        };
    } else {
        // Inverso: suma de pesos
        const sumandos = [];
        for (let i = 0; i < fmt.enteros; i++) {
            if (ej.bits[1 + i] === '1') {
                const exp = fmt.enteros - 1 - i;
                sumandos.push({ peso: Math.pow(2, exp), label: '2' + (exp === 0 ? '⁰' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[exp]), tipo: 'entero' });
            }
        }
        for (let i = 0; i < fmt.frac; i++) {
            if (ej.bits[1 + fmt.enteros + i] === '1') {
                const exp = -(i + 1);
                sumandos.push({ peso: Math.pow(2, exp), label: '2⁻' + '¹²³⁴⁵⁶⁷⁸⁹'[i], tipo: 'frac' });
            }
        }
        const totalMag = sumandos.reduce((a, s) => a + s.peso, 0);
        const valorFinal = ej.bits[0] === '1' ? -totalMag : totalMag;
        cfCuaderno = {
            tipo: 'inverso',
            pasos: [{
                tipo: 'suma',
                titulo: 'Suma de pesos',
                enunciado: `Suma los pesos de los bits a 1 en <span class="code-font">${ej.bits}</span>. Luego aplica el signo.`,
                sumandos,
                totalMag,
                valorFinal,
                digitos: formatoDecimalCF(valorFinal).replace(',', '.'),
                campo: 'suma'
            }],
            idx: 0,
            valores: [{}]
        };
    }

    const desc = document.getElementById('desc-cuaderno-cf');
    if (desc) {
        desc.textContent = modoComaFija === 'directo'
            ? 'Parte entera: divisiones ÷2 (restos = bits, de abajo ↑ arriba). Parte fraccionaria: ×2 sucesivo (parte entera de cada producto = bit).'
            : 'Suma los pesos de los bits a 1 (enteros y fraccionarios) y aplica el signo.';
    }
    renderizarPasoCuadernoCF();
    actualizarBandejaRestosCF(false);
}

function actualizarNavCF() {
    if (!cfCuaderno) return;
    const total = cfCuaderno.pasos.length;
    const actual = cfCuaderno.idx + 1;
    const label = document.getElementById('cf-nav-label');
    const prev = document.getElementById('cf-nav-prev');
    const next = document.getElementById('cf-nav-next');
    if (label) label.textContent = `Paso ${actual} / ${total}`;
    if (prev) prev.disabled = cfCuaderno.idx <= 0;
    if (next) next.disabled = cfCuaderno.idx >= total - 1;
}

function navegarCuadernoCF(delta) {
    if (!cfCuaderno) return;
    guardarValoresPasoCF();
    const nuevo = Math.max(0, Math.min(cfCuaderno.pasos.length - 1, cfCuaderno.idx + delta));
    if (nuevo === cfCuaderno.idx) return;
    cfCuaderno.idx = nuevo;
    renderizarPasoCuadernoCF();
}

function guardarValoresPasoCF() {
    if (!cfCuaderno) return;
    const i = cfCuaderno.idx;
    const p = cfCuaderno.pasos[i];
    if (!p) return;
    const v = cfCuaderno.valores[i] || {};
    if (p.tipo === 'div') {
        const c = document.getElementById('cf-cociente');
        const r = document.getElementById('cf-resto');
        const pr = document.getElementById('cf-residuo');
        if (c) v.cociente = c.value;
        if (r) v.resto = r.value;
        if (pr) v.producto = pr.value;
    } else if (p.tipo === 'mul') {
        const b = document.getElementById('cf-mul-bit');
        if (b) v.bit = b.value;
    } else if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        v.digitos = cells.map(c => c.value);
    } else if (p.tipo === 'signo') {
        const s = document.getElementById('cf-signo-bit');
        if (s) v.bit = s.value;
    }
    cfCuaderno.valores[i] = v;
}

function pasoCFCompleto() {
    if (!cfCuaderno) return false;
    const p = cfCuaderno.pasos[cfCuaderno.idx];
    if (!p) return false;
    if (p.tipo === 'signo') {
        const el = document.getElementById('cf-signo-bit');
        return el && (el.value === '0' || el.value === '1');
    }
    if (p.tipo === 'mul') {
        const el = document.getElementById('cf-mul-bit');
        return el && (el.value === '0' || el.value === '1');
    }
    if (p.tipo === 'div') {
        if (p.campo === 'info') return true;
        const coc = document.getElementById('cf-cociente');
        const resto = document.getElementById('cf-resto');
        if (!coc || !resto) return false;
        return (coc.value || '').length >= p.esperadoCoc.length && (resto.value === '0' || resto.value === '1');
    }
    if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        return cells.length > 0 && cells.every(c => c.value !== '');
    }
    return false;
}

function renderizarPasoCuadernoCF() {
    const cont = document.getElementById('contenedor-cuaderno-cf');
    const enun = document.getElementById('enunciado-cuaderno-cf');
    if (!cont || !cfCuaderno) return;
    const i = cfCuaderno.idx;
    const p = cfCuaderno.pasos[i];
    const v = cfCuaderno.valores[i] || {};
    if (enun) enun.innerHTML = `<span class="text-teal-700 font-bold">${p.titulo}</span> — ${p.enunciado}`;
    actualizarNavCF();

    // Tarjeta estilo div-step (como Representación)
    const cardOpen = `<div class="div-step div-step-vista div-step-activa mx-auto s-11">
        <span class="div-step-label s-12">Paso ${i + 1}</span>`;
    const cardClose = `</div>`;

    if (p.tipo === 'signo') {
        cont.innerHTML = cardOpen + `
            <div class="flex flex-col items-center gap-3 py-2">
                <p class="handwriting text-sm text-teal-800 text-center">Escribe el bit de signo<br>(0 = positivo, 1 = negativo)</p>
                <input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" id="cf-signo-bit" class="binary-cell div-suma-cell div-activa s-13" value="${v.bit || ''}">
            </div>` + cardClose;
        cfCuadernoInputActivo = document.getElementById('cf-signo-bit');
    } else if (p.tipo === 'div') {
        if (p.campo === 'info') {
            cont.innerHTML = cardOpen + `<p class="handwriting text-base text-teal-800 text-center py-2">${p.enunciado}</p>
                <button type="button" data-action="comprobarCuadernoCF" data-args='[false]' class="mt-2 mx-auto block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Continuar →</button>` + cardClose;
            cfCuadernoInputActivo = null;
        } else {
            const residuoGuard = (v.producto != null && v.producto !== '') ? v.producto : '';
            cont.innerHTML = cardOpen + `
                <div class="flex flex-col items-center gap-1 py-1">
                    <div class="div-layout s-14">
                        <div class="div-row-top s-15">
                            <div class="div-box5">
                                <input type="text" class="div-cell div-producto div-readonly" id="cf-residuo" value="${residuoGuard}" readonly tabindex="-1" placeholder="·" title="Residuo (se calcula solo: prefijo − 2×cociente)">
                            </div>
                            <div class="div-top-gap" aria-hidden="true"></div>
                        </div>
                        <div class="div-row-mid s-15">
                            <div class="div-cell div-readonly s-16">${p.dividendo}</div>
                            <div class="div-bar s-17"></div>
                            <div class="div-cell div-readonly">2</div>
                        </div>
                        <div class="div-row-line s-18">
                            <div></div><div class="div-bar-gap"></div><div class="div-hline s-17"></div>
                        </div>
                        <div class="div-row-bot s-15">
                            <input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" id="cf-resto" class="div-cell" placeholder="?" value="${v.resto || ''}" title="Resto (0 o 1)">
                            <div class="div-bar-gap"></div>
                            <input type="text" inputmode="none" readonly tabindex="-1" id="cf-cociente" class="div-cell div-activa" placeholder="?" value="${v.cociente || ''}" title="Cociente">
                        </div>
                    </div>
                    <p class="text-[11px] text-teal-700 handwriting">Residuo (arriba, auto) · Resto (izq.) · Cociente (der.)</p>
                </div>` + cardClose;
            cfCuadernoInputActivo = document.getElementById('cf-cociente');
            // Si ya hay cociente guardado, recalcular residuo
            if (v.cociente) onCocienteInputCF(false);
        }
    } else if (p.tipo === 'mul') {
        cont.innerHTML = cardOpen + `
            <div class="flex flex-col items-center gap-2 py-2">
                <div class="code-font text-lg font-bold text-teal-900 text-center">
                    ${formatoDecimalCF(p.valorAntes)} × 2 = ?
                </div>
                <p class="handwriting text-sm text-teal-800 text-center">Bit = parte entera del producto (0 o 1)</p>
                <input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" id="cf-mul-bit" class="binary-cell div-suma-cell div-activa s-13" value="${v.bit || ''}">
                <p class="text-[11px] text-teal-600 handwriting text-center">≥ 1 → bit 1 (y resta 1); si no → bit 0</p>
            </div>` + cardClose;
        cfCuadernoInputActivo = document.getElementById('cf-mul-bit');
    } else if (p.tipo === 'suma') {
        const ops = (p.sumandos.length
            ? p.sumandos.map((s, idx) => `<div class="suma-linea"><span class="suma-op">${idx === 0 ? '' : '+'}</span><span class="suma-num">${formatoDecimalCF(s.peso)}</span><span class="text-[10px] text-teal-600 ml-1">${s.label}</span></div>`).join('')
            : `<div class="suma-linea"><span class="suma-op"></span><span class="suma-num">0</span></div>`);
        const digs = String(p.digitos);
        const guard = v.digitos || [];
        const cells = digs.split('').map((ch, idx) => {
            const val = guard[idx] != null ? guard[idx] : (ch === '-' ? '-' : '');
            const auto = ch === '-' ? ' data-auto-signo="1"' : '';
            return `<input type="text" inputmode="none" maxlength="1" readonly tabindex="-1" class="div-suma-cell cf-suma-cell s-13" data-pos="${idx}" value="${val}"${auto}>`;
        }).join('');
        cont.innerHTML = `
            <div class="div-suma-exceso max-w-sm mx-auto s-19">
                <p class="handwriting text-sm text-teal-800 mb-1">Suma los pesos:</p>
                <div class="div-suma-exceso-ops s-4">${ops}</div>
                <div class="border-t border-teal-300 w-24 mx-auto my-1"></div>
                <p class="text-[11px] font-semibold text-teal-700">Resultado (con signo):</p>
                <div class="div-suma-result-row">${cells}</div>
                <p class="handwriting text-xs text-teal-700 mt-2">Signo del patrón: <span class="code-font font-bold">${ejercicioComaFija.bits[0]}</span> → ${ejercicioComaFija.bits[0] === '1' ? 'negativo' : 'positivo'}</p>
            </div>`;
        cfCuadernoInputActivo = null;
    }
}

/** Residuo automático estilo división larga (igual que Representación). */
function onCocienteInputCF(forzarSaltoResto) {
    if (!cfCuaderno) return;
    const p = cfCuaderno.pasos[cfCuaderno.idx];
    if (!p || p.tipo !== 'div' || p.campo === 'info') return;
    const cocEl = document.getElementById('cf-cociente');
    const resEl = document.getElementById('cf-residuo');
    const restoEl = document.getElementById('cf-resto');
    if (!cocEl || !resEl) return;

    const escrito = cocEl.value.trim();
    if (escrito === '') {
        resEl.value = '';
        resEl.classList.remove('ok-bit', 'error');
        return;
    }
    if (!/^\d+$/.test(escrito)) return;
    const coc = parseInt(escrito, 10);
    if (!Number.isFinite(coc)) return;

    const digD = String(p.dividendo).length;
    const digQfull = String(p.cociente).length;
    const lenQ = escrito.length;
    const extra = (digQfull < digD) ? 1 : 0;
    const prefixLen = Math.min(digD, lenQ + extra);
    const prefix = parseInt(String(p.dividendo).slice(0, prefixLen), 10);
    const residuo = prefix - (2 * coc);

    resEl.value = String(residuo);
    resEl.classList.remove('error', 'ok-bit');

    const i = cfCuaderno.idx;
    while (cfCuaderno.valores.length <= i) cfCuaderno.valores.push({});
    cfCuaderno.valores[i].cociente = escrito;
    cfCuaderno.valores[i].producto = String(residuo);

    if (escrito.length >= digQfull && coc === p.cociente && residuo === p.resto) {
        resEl.classList.add('ok-bit');
    } else if (residuo < 0) {
        resEl.classList.add('error');
    } else if (escrito.length >= digQfull && residuo > 1) {
        resEl.classList.add('error');
    }

    const completo = forzarSaltoResto || escrito.length >= digQfull;
    if (completo && restoEl) {
        cocEl.classList.remove('div-activa');
        restoEl.classList.add('div-activa');
        cfCuadernoInputActivo = restoEl;
    }
}

function insertarDigitoCuadernoCF(d) {
    if (!cfCuaderno || !cuadernoCF) return;
    const p = cfCuaderno.pasos[cfCuaderno.idx];
    if (!p) return;

    if (p.tipo === 'signo' || p.tipo === 'mul') {
        if (d !== '0' && d !== '1') return;
        const el = document.getElementById(p.tipo === 'signo' ? 'cf-signo-bit' : 'cf-mul-bit');
        if (el) { el.value = d; el.classList.remove('error', 'ok-bit'); }
        // Un solo dígito → comprobar al instante (sin toast intermedio)
        setTimeout(() => comprobarCuadernoCF(true), 120);
    } else if (p.tipo === 'div' && p.campo !== 'info') {
        const coc = document.getElementById('cf-cociente');
        const resto = document.getElementById('cf-resto');
        const lenEsp = p.esperadoCoc.length;
        if (coc && (coc.value || '').length < lenEsp) {
            if (d === '.') return;
            coc.value = (coc.value || '') + d;
            coc.classList.remove('error', 'ok-bit');
            onCocienteInputCF(false);
        } else if (resto && (d === '0' || d === '1')) {
            resto.value = d;
            resto.classList.remove('error', 'ok-bit');
        }
        if (pasoCFCompleto()) setTimeout(() => comprobarCuadernoCF(true), 140);
    } else if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        let pos = -1;
        for (let i = cells.length - 1; i >= 0; i--) {
            if (cells[i].value === '' && cells[i].dataset.autoSigno !== '1') { pos = i; break; }
        }
        if (pos < 0) return;
        if (d === '.' || d === ',') {
            if (p.digitos[pos] === '.' || p.digitos[pos] === ',') cells[pos].value = '.';
            else return;
        } else if (d >= '0' && d <= '9') {
            cells[pos].value = d;
        } else return;
        cells[pos].classList.remove('error', 'ok-bit');
        if (pasoCFCompleto()) setTimeout(() => comprobarCuadernoCF(true), 140);
    }
}

function borrarDigitoCuadernoCF() {
    if (!cfCuaderno || !cuadernoCF) return;
    const p = cfCuaderno.pasos[cfCuaderno.idx];
    if (!p) return;
    if (p.tipo === 'signo') {
        const el = document.getElementById('cf-signo-bit');
        if (el) { el.value = ''; el.classList.remove('error', 'ok-bit'); }
    } else if (p.tipo === 'mul') {
        const el = document.getElementById('cf-mul-bit');
        if (el) { el.value = ''; el.classList.remove('error', 'ok-bit'); }
    } else if (p.tipo === 'div') {
        const resto = document.getElementById('cf-resto');
        const coc = document.getElementById('cf-cociente');
        if (resto && resto.value !== '') {
            resto.value = '';
            resto.classList.remove('error', 'ok-bit', 'div-activa');
            if (coc) { coc.classList.add('div-activa'); cfCuadernoInputActivo = coc; }
        } else if (coc && coc.value !== '') {
            coc.value = coc.value.slice(0, -1);
            coc.classList.remove('error', 'ok-bit');
            coc.classList.add('div-activa');
            cfCuadernoInputActivo = coc;
            onCocienteInputCF(false);
        }
    } else if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].dataset.autoSigno === '1') continue;
            if (cells[i].value !== '') {
                cells[i].value = '';
                cells[i].classList.remove('error', 'ok-bit');
                return;
            }
        }
    }
}

/**
 * Comprueba el paso actual.
 * @param {boolean} auto - true si se llama al completar la entrada (no mostrar error toast si incompleto)
 */
function comprobarCuadernoCF(auto) {
    if (!cfCuaderno) return false;
    guardarValoresPasoCF();
    const i = cfCuaderno.idx;
    const p = cfCuaderno.pasos[i];
    const v = cfCuaderno.valores[i] || {};
    let ok = false;
    let incompleto = false;

    if (p.tipo === 'signo') {
        if (!v.bit) incompleto = true;
        else {
            ok = (v.bit === p.esperado);
            const el = document.getElementById('cf-signo-bit');
            if (el) { el.classList.toggle('ok-bit', ok); el.classList.toggle('error', !ok); }
        }
    } else if (p.tipo === 'div') {
        if (p.campo === 'info') { ok = true; }
        else {
            if (!v.cociente || v.resto === undefined || v.resto === '') incompleto = true;
            else {
                const cocOk = String(v.cociente) === p.esperadoCoc;
                const restoOk = String(v.resto) === p.esperadoResto;
                ok = cocOk && restoOk;
                const c = document.getElementById('cf-cociente');
                const r = document.getElementById('cf-resto');
                if (c) { c.classList.toggle('ok-bit', cocOk); c.classList.toggle('error', !cocOk); }
                if (r) { r.classList.toggle('ok-bit', restoOk); r.classList.toggle('error', !restoOk); }
            }
        }
    } else if (p.tipo === 'mul') {
        if (!v.bit) incompleto = true;
        else {
            ok = String(v.bit) === p.esperadoBit;
            const el = document.getElementById('cf-mul-bit');
            if (el) { el.classList.toggle('ok-bit', ok); el.classList.toggle('error', !ok); }
        }
    } else if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        const escrito = cells.map(c => c.value).join('');
        if (cells.some(c => c.value === '')) incompleto = true;
        else {
            const esperado = p.digitos;
            ok = escrito === esperado || escrito.replace(',', '.') === esperado;
            cells.forEach((c, idx) => {
                const ch = esperado[idx];
                const match = c.value === ch || (ch === '.' && (c.value === ',' || c.value === '.'));
                c.classList.toggle('ok-bit', match);
                c.classList.toggle('error', !match);
            });
        }
    }

    if (incompleto) {
        if (!auto) mostrarToast(false, 'Incompleto', 'Rellena todos los campos de este paso.');
        return false;
    }

    if (ok) {
        // Asegurar valores correctos guardados para la bandeja
        if (p.tipo === 'div' && p.campo !== 'info') {
            cfCuaderno.valores[i] = {
                cociente: p.esperadoCoc,
                resto: p.esperadoResto,
                producto: String(p.resto)
            };
            const resEl = document.getElementById('cf-residuo');
            if (resEl) { resEl.value = String(p.resto); resEl.classList.add('ok-bit'); }
            actualizarBandejaRestosCF(true);
        } else if (p.tipo === 'mul') {
            cfCuaderno.valores[i] = { bit: p.esperadoBit };
            actualizarBandejaRestosCF(true);
        } else if (p.tipo === 'signo') {
            cfCuaderno.valores[i] = { bit: p.esperado };
            // Colocar bit de signo en la operación principal al acertar
            colocarSignoEnPrincipalCF(p.esperado);
        }

        // Tras la última división correcta → modo clic en restos (no avanzar aún)
        if (p.tipo === 'div' && p.campo !== 'info' && !quedanDivisionesCF()) {
            setTimeout(() => activarModoClickRestosCF(), 300);
            return true;
        }
        // Parte entera = 0 (paso info): rellenar enteros con 0 y seguir
        if (p.tipo === 'div' && p.campo === 'info') {
            const fmt = ejercicioComaFija.fmt;
            const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
            for (let k = 0; k < fmt.enteros; k++) {
                if (inputs[1 + k]) { inputs[1 + k].value = '0'; inputs[1 + k].classList.remove('error'); }
            }
        }

        // Tras la última ×2 correcta → modo clic en bits fraccionarios
        if (p.tipo === 'mul' && !quedanMulCF()) {
            setTimeout(() => activarModoClickFracCF(), 300);
            return true;
        }

        const esUltimo = i >= cfCuaderno.pasos.length - 1;
        if (esUltimo) {
            // Solo llega aquí si no hay fase de clic pendiente (p.ej. info)
            setTimeout(() => aplicarCuadernoCFaEjercicio(), 350);
        } else {
            setTimeout(() => {
                if (!cfCuaderno) return;
                // No saltar si estamos en modo clic
                if (restosClickModeCF || fracClickModeCF) return;
                cfCuaderno.idx = i + 1;
                renderizarPasoCuadernoCF();
                actualizarBandejaRestosCF(false);
            }, 280);
        }
        return true;
    }

    // Incorrecto: solo toast si el usuario pulsó «Corregir» (no en auto)
    if (!auto) {
        mostrarToast(false, 'Revisa este paso', 'El valor no es correcto. Inténtalo de nuevo.');
    }
    return false;
}

function aplicarCuadernoCFaEjercicio() {
    if (!cfCuaderno || !ejercicioComaFija) return;
    const ej = ejercicioComaFija;
    restosClickModeCF = false;
    fracClickModeCF = false;
    if (cfCuaderno.tipo === 'directo') {
        // Completar solo casillas que sigan vacías (por si el usuario no usó clic)
        const inputs = Array.from(document.querySelectorAll('#contenedor-comafija input.cf-bit'));
        inputs.forEach((inp, idx) => {
            if (inp.value === '') inp.value = ej.bits[idx];
            inp.classList.remove('error');
        });
        mostrarBotonNuevo('comafija', true);
        const res = document.getElementById('resultado-cuaderno-cf');
        if (res) res.innerHTML = `<p class="handwriting text-base text-emerald-800">✓ Bits colocados: <span class="code-font font-bold">${ej.bits}</span></p>`;
        mostrarToast(true, '¡Cuaderno completo!', `${formatoDecimalCF(ej.valor)} → ${ej.bits}`);
        setTimeout(reproducirSonidoAcierto, 60);
        setTimeout(() => ocultarCuadernoCF(), 1000);
    } else {
        cfEntradaDecimal = String(ej.valor);
        actualizarRespuestaCF();
        const celda = document.getElementById('cf-decimal');
        if (celda) { celda.classList.remove('error'); celda.classList.add('rep-ok'); }
        mostrarBotonNuevo('comafija-inv', true);
        const res = document.getElementById('resultado-cuaderno-cf');
        if (res) res.innerHTML = `<p class="handwriting text-base text-emerald-800">✓ Decimal: <span class="code-font font-bold">${formatoDecimalCF(ej.valor)}</span></p>`;
        mostrarToast(true, '¡Cuaderno completo!', `${ej.bits} → ${formatoDecimalCF(ej.valor)}`);
        setTimeout(reproducirSonidoAcierto, 60);
        setTimeout(() => ocultarCuadernoCF(), 1000);
    }
}

function mostrarAyudaCuadernoCF() {
    if (!cfCuaderno) return;
    const i = cfCuaderno.idx;
    const p = cfCuaderno.pasos[i];
    if (p.tipo === 'signo') {
        const el = document.getElementById('cf-signo-bit');
        if (el) { el.value = p.esperado; el.classList.remove('error'); el.classList.add('ok-bit'); }
        cfCuaderno.valores[i] = { bit: p.esperado };
    } else if (p.tipo === 'div' && p.campo !== 'info') {
        const c = document.getElementById('cf-cociente');
        const r = document.getElementById('cf-resto');
        if (c) { c.value = p.esperadoCoc; c.classList.remove('error'); c.classList.add('ok-bit'); }
        if (r) { r.value = p.esperadoResto; r.classList.remove('error'); r.classList.add('ok-bit'); }
        cfCuaderno.valores[i] = { cociente: p.esperadoCoc, resto: p.esperadoResto };
    } else if (p.tipo === 'mul') {
        const el = document.getElementById('cf-mul-bit');
        if (el) { el.value = p.esperadoBit; el.classList.remove('error'); el.classList.add('ok-bit'); }
        cfCuaderno.valores[i] = { bit: p.esperadoBit };
    } else if (p.tipo === 'suma') {
        const cells = Array.from(document.querySelectorAll('.cf-suma-cell'));
        p.digitos.split('').forEach((ch, idx) => {
            if (cells[idx]) { cells[idx].value = ch === '.' ? '.' : ch; cells[idx].classList.remove('error'); cells[idx].classList.add('ok-bit'); }
        });
        cfCuaderno.valores[i] = { digitos: p.digitos.split('') };
    }
    actualizarBandejaRestosCF(true);
    // Avanzar o completar
    if (i < cfCuaderno.pasos.length - 1) {
        setTimeout(() => {
            cfCuaderno.idx = i + 1;
            renderizarPasoCuadernoCF();
            actualizarBandejaRestosCF(false);
        }, 300);
    } else {
        aplicarCuadernoCFaEjercicio();
    }
}

// Al reiniciar ejercicio, reabrir cuaderno si estaba ON
const _reiniciarCFOrig = reiniciarEjercicioComaFija;
reiniciarEjercicioComaFija = function() {
    _reiniciarCFOrig();
    if (cuadernoCF) prepararCuadernoCF();
    sincronizarSwitchCF();
};

// --- Enlace de eventos (sustituye a los onclick/onchange/oninput en línea) ---
// Solo se pueden invocar las funciones de esta lista blanca. El HTML las referencia con
// data-action="nombre" (clic), data-on-change="nombre" y data-on-input="nombre".
const ACCIONES = {
    alternarAcarreosAuto,
    alternarCuadernoCF,
    alternarCuadernoDivision,
    alternarModoAviso,
    borrarCaracterCF,
    borrarCaracterInverso,
    borrarDigito,
    borrarDigitoCF,
    borrarDigitoCuadernoCF,
    borrarDigitoDivision,
    borrarDigitoMult,
    borrarDigitoRepresentacion,
    cambiarPestana,
    cambiarSentidoComaFija,
    cambiarSentidoRepresentacion,
    cambiarZoomCeldas,
    comprobarComaFija,
    comprobarCuadernoCF,
    comprobarDivision,
    comprobarMultiplicacion,
    comprobarRepresentacion,
    comprobarResta,
    comprobarSuma,
    convertirDesdeBinario,
    convertirDesdeDecimal,
    convertirDesdeHexadecimal,
    flipRestaSesgo,
    flipSumaExceso,
    generarNuevaSemilla,
    generarRandomLibre,
    insertarCaracterCF,
    insertarCaracterInverso,
    insertarDigito,
    insertarDigitoCF,
    insertarDigitoCuadernoCF,
    insertarDigitoDivision,
    insertarDigitoMult,
    insertarDigitoRepresentacion,
    mostrarAyudaComaFija,
    mostrarAyudaCuadernoCF,
    mostrarAyudaDivision,
    mostrarAyudaMultiplicacion,
    mostrarAyudaRepresentacion,
    mostrarAyudaResta,
    mostrarAyudaSuma,
    navegarCuadernoCF,
    navegarDivision,
    ocultarCuadernoCF,
    ocultarCuadernoDivision,
    reiniciarCuadernoCF,
    reiniciarDivision,
    reiniciarEjercicioComaFija,
    reiniciarEjercicioMultiplicacion,
    reiniciarEjercicioRepresentacion,
    reiniciarEjercicioResta,
    reiniciarEjercicioSuma,
    restablecerZoomCeldas
};

function ejecutarAccion(nombre, args) {
    const fn = Object.prototype.hasOwnProperty.call(ACCIONES, nombre) ? ACCIONES[nombre] : null;
    if (typeof fn === 'function') fn(...(args || []));
}

function enlazarEventos() {
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-action]');
        if (!el || el.disabled) return;
        let args = [];
        if (el.dataset.args) {
            try { args = JSON.parse(el.dataset.args); } catch (err) { args = []; }
        }
        ejecutarAccion(el.dataset.action, args);
    });
    document.addEventListener('change', (e) => {
        const el = e.target.closest('[data-on-change]');
        if (el) ejecutarAccion(el.dataset.onChange);
    });
    document.addEventListener('input', (e) => {
        const el = e.target.closest('[data-on-input]');
        if (el) ejecutarAccion(el.dataset.onInput);
    });
}

window.addEventListener('load', function() {
    enlazarEventos();
    aplicarZoomCeldas();
    aplicarModoAcarreos();
    sincronizarSwitchAviso();
    sincronizarSwitchDivision();
    try { cuadernoCF = localStorage.getItem('cuadernoCF') === '1'; } catch (e) {}
    sincronizarSwitchCF();
    generarNuevaSemilla();
    // Re-alinear si el usuario gira el móvil o cambia el zoom del navegador
    window.addEventListener('resize', () => {
        clearTimeout(window.__alignOpT);
        window.__alignOpT = setTimeout(alinearOperacionDerecha, 120);
    });
});