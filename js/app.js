document.addEventListener('DOMContentLoaded', () => {

    let resultadosGenerados   = [];
    let resultadosFiltrados   = [];
    let indiceResultadoActual = 0;
    let horarioDefinitivo     = null;
    let filtrosActivos        = { diasLibres: [], horaMinima: '', horaMaxima: '' };
    let ordenActual           = '';

    const $ = (id) => document.getElementById(id);

    // Referencias DOM
    const inputTopeUC              = $('input-tope-uc');
    const ucActualDisplay          = $('uc-actual-display');
    const btnGenerar               = $('btn-generar');
    const listaCatalogo            = $('lista-catalogo');
    const buscadorMaterias         = $('buscador-materias');
    const filtroTrimestre          = $('filtro-trimestre');
    const contenedorRejilla        = $('contenedor-rejilla');
    const contenedorResumen        = $('contenedor-resumen');
    const contenedorRejillaResumen = $('contenedor-rejilla-resumen');
    const controlesNavegacion      = $('controles-navegacion-opciones');
    const btnAnterior              = $('btn-opcion-anterior');
    const btnSiguiente             = $('btn-opcion-siguiente');
    const indicadorOpcion          = $('indicador-opcion');
    const btnDefinitivo            = $('btn-elegir-definitivo');
    const metricasResultado        = $('metricas-resultado');
    const contadorResultados       = $('contador-resultados');
    const listaSeleccion           = $('lista-seleccion');
    const minimapaChoques          = $('minimapa-choques');

    // MENSAJES GLOBALES
    window.mostrarMensajeGlobal = function (texto, tipo = 'error', persistente = false) {
        let cont = $('mensaje-sistema');
        if (!cont) {
            cont = document.createElement('div');
            cont.id = 'mensaje-sistema';
            cont.setAttribute('role', 'status');
            cont.setAttribute('aria-live', 'polite');
            document.body.prepend(cont);
        }
        cont.textContent = texto;
        cont.className = `mensaje-sistema ${tipo}`;

        clearTimeout(cont._timer);
        if (!persistente) {
            cont._timer = setTimeout(() => {
                cont.className = 'mensaje-sistema oculto';
            }, 6000);
        }
    };

    const mostrarMensaje = window.mostrarMensajeGlobal;

    // MARCADO DE INCOMPATIBILIDADES
    window.MateriasIncompatibles = new Set();

    function actualizarMarcadoIncompatibles() {
        window.MateriasIncompatibles.clear();

        if (EstadoSeleccion.materiasSeleccionadas.length < 2) return;

        const mats = EstadoSeleccion.materiasSeleccionadas
            .map(c => GestorDatos.obtenerMaterias().find(m => m.codigo === c))
            .filter(Boolean);

        const pares = detectarIncompatibilidades(mats, EstadoSeleccion.restricciones);
        pares.forEach(p => {
            window.MateriasIncompatibles.add(p.materia1.codigo);
            window.MateriasIncompatibles.add(p.materia2.codigo);
        });
    }

    // MINI-MAPA DE CHOQUES
    function renderizarMiniMapaChoques() {
        if (!minimapaChoques) return;
        minimapaChoques.innerHTML = '';

        if (EstadoSeleccion.materiasSeleccionadas.length < 2) {
            minimapaChoques.innerHTML =
                '<p class="sin-resultados">Selecciona 2 o más materias para detectar choques potenciales.</p>';
            return;
        }

        const sesionesPorDia = { LUN: [], MAR: [], MIE: [], JUE: [], VIE: [], SAB: [] };

        EstadoSeleccion.materiasSeleccionadas.forEach(codigo => {
            const mat = GestorDatos.obtenerMaterias().find(m => m.codigo === codigo);
            if (!mat) return;
            const restr = EstadoSeleccion.restricciones[codigo] || { fijada: null, excluidas: [] };

            mat.secciones.forEach(sec => {
                if (restr.fijada && restr.fijada !== sec.id) return;
                if (restr.excluidas.includes(sec.id)) return;

                sec.horario.forEach(ses => {
                    const r = obtenerRangoHorarioSesion(ses);
                    if (r && sesionesPorDia[ses.dia]) {
                        sesionesPorDia[ses.dia].push({
                            codigo,
                            sec: sec.id,
                            ini: horaAMinutos(r.inicio),
                            fin: horaAMinutos(r.fin),
                            inicio: r.inicio,
                            finStr: r.fin
                        });
                    }
                });
            });
        });

        const choques = [];
        Object.entries(sesionesPorDia).forEach(([dia, sesiones]) => {
            sesiones.sort((a, b) => a.ini - b.ini);
            for (let i = 0; i < sesiones.length - 1; i++) {
                for (let j = i + 1; j < sesiones.length; j++) {
                    if (sesiones[i].codigo === sesiones[j].codigo) continue;
                    if (Math.max(sesiones[i].ini, sesiones[j].ini) < Math.min(sesiones[i].fin, sesiones[j].fin)) {
                        choques.push({
                            dia,
                            a: sesiones[i],
                            b: sesiones[j]
                        });
                    }
                }
            }
        });

        if (choques.length === 0) {
            minimapaChoques.innerHTML =
                '<p class="sin-resultados" style="color:var(--accent);border-color:var(--accent-soft);background:var(--accent-soft)">Sin choques entre las secciones disponibles.</p>';
            return;
        }

        const titulo = document.createElement('p');
        titulo.className = 'minimapa-titulo';
        titulo.textContent = `${choques.length} choque${choques.length === 1 ? '' : 's'} potencial${choques.length === 1 ? '' : 'es'} detectado${choques.length === 1 ? '' : 's'}:`;
        minimapaChoques.appendChild(titulo);

        const lista = document.createElement('ul');
        lista.className = 'minimapa-lista';

        choques.slice(0, 8).forEach(c => {
            const li = document.createElement('li');
            li.className = 'choque-item';
            li.textContent = `${c.dia} ${c.a.inicio}–${c.a.finStr}: ${c.a.codigo} (${c.a.sec}) ↔ ${c.b.codigo} (${c.b.sec})`;
            lista.appendChild(li);
        });

        if (choques.length > 8) {
            const li = document.createElement('li');
            li.className = 'choque-item choque-mas';
            li.textContent = `… y ${choques.length - 8} choque${choques.length - 8 === 1 ? '' : 's'} más`;
            lista.appendChild(li);
        }

        minimapaChoques.appendChild(lista);
    }

    // CATÁLOGO / SELECCIÓN
    function actualizarInterfazSeleccion() {
        const ucTotal = EstadoSeleccion.obtenerTotalUC();
        ucActualDisplay.textContent =
            `Materias: ${EstadoSeleccion.materiasSeleccionadas.length} · UC: ${ucTotal} / ${EstadoSeleccion.topeUC}`;

        const texto        = buscadorMaterias.value.toLowerCase();
        const trimestreVal = filtroTrimestre.value;

        const filtradas = GestorDatos.obtenerMaterias().filter(mat => {
            const okTexto = mat.nombre.toLowerCase().includes(texto) ||
                            mat.codigo.toLowerCase().includes(texto);
            const okTrim  = trimestreVal === '' || mat.trimestre.toString() === trimestreVal;
            return okTexto && okTrim;
        });

        actualizarMarcadoIncompatibles();

        RenderizadorCatalogo.renderizar(listaCatalogo, filtradas, (codigo, estaSeleccionada) => {
            if (estaSeleccionada) {
                EstadoSeleccion.quitarMateria(codigo);
                mostrarMensaje(`Materia ${codigo} removida.`, 'exito');
            } else {
                const r = EstadoSeleccion.agregarMateria(codigo);
                mostrarMensaje(
                    r.exito ? `Materia ${codigo} agregada.` : r.mensaje,
                    r.exito ? 'exito' : 'error'
                );
            }
            invalidarResultados();
            actualizarInterfazSeleccion();
            renderizarListaSeleccion();
            renderizarMiniMapaChoques();
        });

        renderizarListaSeleccion();
        renderizarMiniMapaChoques();
    }

    // LISTA DE SELECCIÓN
    function renderizarListaSeleccion() {
        listaSeleccion.innerHTML = '';

        if (EstadoSeleccion.materiasSeleccionadas.length === 0) {
            listaSeleccion.innerHTML =
                '<p class="sin-resultados">Aún no has agregado materias.</p>';
            return;
        }

        EstadoSeleccion.materiasSeleccionadas.forEach(codigo => {
            const mat = GestorDatos.obtenerMaterias().find(m => m.codigo === codigo);
            if (!mat) return;

            const restr = EstadoSeleccion.restricciones[codigo] || { fijada: null, excluidas: [] };
            const esIncompatible = window.MateriasIncompatibles.has(codigo);

            const div = document.createElement('div');
            div.className = 'materia-seleccionada' + (esIncompatible ? ' incompatible' : '');

            const seccionesHTML = mat.secciones.map(sec => {
                const fijada   = restr.fijada === sec.id;
                const excluida = restr.excluidas.includes(sec.id);
                return `
                    <div class="seccion-restr ${fijada ? 'fijada' : ''} ${excluida ? 'excluida' : ''}">
                        <span>Sección ${sec.id} — ${sec.profesor}</span>
                        <button type="button" data-accion="fijar"   data-codigo="${codigo}" data-sec="${sec.id}">
                            ${fijada ? 'Desfijar' : 'Fijar'}
                        </button>
                        <button type="button" data-accion="excluir" data-codigo="${codigo}" data-sec="${sec.id}">
                            ${excluida ? 'Incluir' : 'Excluir'}
                        </button>
                    </div>
                `;
            }).join('');

            const badge = esIncompatible
                ? '<span class="badge-incompatible">Incompatible</span>'
                : '';

            div.innerHTML = `
                <strong>${mat.codigo} — ${mat.nombre} ${badge}</strong>
                <button type="button" data-accion="quitar" data-codigo="${codigo}" class="btn-secondary">
                    Quitar materia
                </button>
                <div class="secciones-restr">${seccionesHTML}</div>
            `;
            listaSeleccion.appendChild(div);
        });

        listaSeleccion.querySelectorAll('button[data-accion]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accion = e.currentTarget.dataset.accion;
                const codigo = e.currentTarget.dataset.codigo;
                const sec    = e.currentTarget.dataset.sec;

                if (accion === 'quitar') {
                    EstadoSeleccion.quitarMateria(codigo);
                    mostrarMensaje(`Materia ${codigo} removida.`, 'exito');
                } else if (accion === 'fijar') {
                    EstadoSeleccion.fijarSeccion(codigo, sec);
                    // pulse visual
                    const card = e.currentTarget.closest('.seccion-restr');
                    if (card) {
                        card.classList.add('pulse');
                        setTimeout(() => card.classList.remove('pulse'), 450);
                    }
                } else if (accion === 'excluir') {
                    const r = EstadoSeleccion.excluirSeccion(codigo, sec);
                    if (!r.exito) mostrarMensaje(r.mensaje, 'error');
                }
                invalidarResultados();
                actualizarInterfazSeleccion();
            });
        });
    }

    // TOPE UC
    inputTopeUC.addEventListener('change', (e) => {
        const v = Number(e.target.value);

        if (!Number.isInteger(v) || v <= 0) {
            mostrarMensaje('El tope debe ser un entero positivo.', 'error');
            e.target.value = EstadoSeleccion.topeUC;
            return;
        }
        if (v > 28) {
            mostrarMensaje('El tope máximo permitido es 28 UC.', 'error');
            e.target.value = 28;
        }
        const r = EstadoSeleccion.cambiarTopeUC(Math.min(v, 28));
        if (!r.exito) {
            mostrarMensaje(r.mensaje, 'error');
            e.target.value = EstadoSeleccion.topeUC;
        } else {
            mostrarMensaje(`Tope actualizado a ${EstadoSeleccion.topeUC} UC.`, 'exito');
        }
        actualizarInterfazSeleccion();
    });

    buscadorMaterias.addEventListener('input', actualizarInterfazSeleccion);
    filtroTrimestre.addEventListener('change', actualizarInterfazSeleccion);

    // ATAJO TRIMESTRE
    const btnAgregarTrimestre = $('btn-agregar-trimestre');
    if (btnAgregarTrimestre) {
        btnAgregarTrimestre.addEventListener('click', () => {
            const t = $('select-trimestre-atajo').value;
            if (!t) { mostrarMensaje('Elige un trimestre.', 'error'); return; }
            const r = EstadoSeleccion.agregarTrimestreCompleto(Number(t));
            mostrarMensaje(r.exito ? `Trimestre ${t} agregado.` : r.mensaje, r.exito ? 'exito' : 'error');
            invalidarResultados();
            actualizarInterfazSeleccion();
        });
    }

    // GENERACIÓN

    btnGenerar.addEventListener('click', () => {
        if (EstadoSeleccion.materiasSeleccionadas.length === 0) {
            mostrarMensaje('Selecciona al menos una materia.', 'error');
            return;
        }

        // Spinner de "generando"
        btnGenerar.disabled = true;
        btnGenerar.textContent = 'Generando…';
        contenedorRejilla.innerHTML = `
            <div class="generando">
                <div class="spinner"></div>
                <p>Calculando combinaciones válidas…</p>
            </div>
        `;
        controlesNavegacion.style.display = 'none';
        metricasResultado.innerHTML = '';
        contadorResultados.textContent = '';

        // Dejar que el navegador pinte antes del cálculo
        setTimeout(() => {
            resultadosGenerados = GeneradorHorarios.generar(
                EstadoSeleccion.materiasSeleccionadas,
                EstadoSeleccion.restricciones
            );

            btnGenerar.disabled = false;
            btnGenerar.textContent = 'Generar Horarios Válidos';

            if (resultadosGenerados.length === 0) {
                actualizarMarcadoIncompatibles();
                renderizarListaSeleccion();
                renderizarMiniMapaChoques();

                const inc = window.MateriasIncompatibles;
                let msg = 'No hay combinaciones válidas.';
                if (inc.size > 0) {
                    msg += ' Materias incompatibles: ' + Array.from(inc).join(', ') + '.';
                }
                mostrarMensaje(msg, 'error', true);
                contenedorRejilla.innerHTML =
                    '<p class="sin-resultados">No se encontraron combinaciones válidas sin choques con la selección actual.</p>';
                return;
            }

            aplicarFiltrosYOrden();
            controlesNavegacion.style.display = 'flex';
            mostrarMensaje(`¡${resultadosFiltrados.length} combinaciones tras filtros!`, 'exito');
        }, 50);
    });

    function aplicarFiltrosYOrden() {
        filtrosActivos.diasLibres = Array.from(
            document.querySelectorAll('.filtro-dia-libre:checked')
        ).map(c => c.value);

        filtrosActivos.horaMinima = $('filtro-hora-min') ? $('filtro-hora-min').value : '';
        filtrosActivos.horaMaxima = $('filtro-hora-max') ? $('filtro-hora-max').value : '';

        resultadosFiltrados = GestorPreferencias.filtrar(resultadosGenerados, filtrosActivos);
        if (ordenActual) {
            resultadosFiltrados = GestorPreferencias.ordenar(resultadosFiltrados, ordenActual);
        }

        indiceResultadoActual = 0;
        contadorResultados.textContent = `${resultadosFiltrados.length} de ${resultadosGenerados.length} resultados`;

        if (resultadosFiltrados.length === 0) {
            // botón "Limpiar filtros"
            contenedorRejilla.innerHTML = `
                <div class="sin-resultados">
                    <p>Ningún horario cumple las preferencias.</p>
                    <button type="button" id="btn-limpiar-filtros" class="btn-secondary" style="margin-top:12px;">
                        Limpiar filtros y ver todos
                    </button>
                </div>
            `;
            document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
                document.querySelectorAll('.filtro-dia-libre').forEach(c => c.checked = false);
                if ($('filtro-hora-min')) $('filtro-hora-min').value = '';
                if ($('filtro-hora-max')) $('filtro-hora-max').value = '';
                aplicarFiltrosYOrden();
            });
            metricasResultado.innerHTML = '';
            controlesNavegacion.style.display = 'none';
            return;
        }

        controlesNavegacion.style.display = 'flex';
        mostrarResultadoActual();
    }

    const btnAplicarPref = $('btn-aplicar-preferencias');
    if (btnAplicarPref) {
        btnAplicarPref.addEventListener('click', () => {
            if (resultadosGenerados.length === 0) {
                mostrarMensaje('Genera horarios primero.', 'error');
                return;
            }
            aplicarFiltrosYOrden();
        });
    }

    const selectOrden = $('select-orden');
    if (selectOrden) {
        selectOrden.addEventListener('change', (e) => {
            ordenActual = e.target.value;
            if (resultadosGenerados.length) aplicarFiltrosYOrden();
        });
    }

    function mostrarResultadoActual() {
        if (!resultadosFiltrados.length) return;
        const comb = resultadosFiltrados[indiceResultadoActual];
        indicadorOpcion.textContent =
            `Opción ${indiceResultadoActual + 1} de ${resultadosFiltrados.length}`;

        RenderizadorRejilla.renderizar(contenedorRejilla, comb);

        const dias    = calcularDiasAsistencia(comb);
        const muertas = calcularHorasMuertas(comb);
        const rango   = obtenerRangoGlobal(comb);

        metricasResultado.innerHTML = `
            <span>${dias} día${dias === 1 ? '' : 's'} de asistencia</span>
            <span>${Math.round(muertas)} min de horas muertas</span>
            <span>Entrada ${rango.minInicio}</span>
            <span>Salida ${rango.maxFin}</span>
        `;
    }

    function obtenerRangoGlobal(comb) {
        let minInicio = '23:59';
        let maxFin    = '00:00';
        comb.forEach(it => it.seccion.horario.forEach(s => {
            const r = obtenerRangoHorarioSesion(s);
            if (r) {
                if (r.inicio < minInicio) minInicio = r.inicio;
                if (r.fin > maxFin) maxFin = r.fin;
            }
        }));
        return { minInicio, maxFin };
    }

    btnAnterior.addEventListener('click', () => {
        if (indiceResultadoActual > 0) {
            indiceResultadoActual--;
            mostrarResultadoActual();
        }
    });
    btnSiguiente.addEventListener('click', () => {
        if (indiceResultadoActual < resultadosFiltrados.length - 1) {
            indiceResultadoActual++;
            mostrarResultadoActual();
        }
    });

    // HORARIO DEFINITIVO
    btnDefinitivo.addEventListener('click', () => {
        if (!resultadosFiltrados.length) return;
        horarioDefinitivo = resultadosFiltrados[indiceResultadoActual];

        GestorResumen.renderizarResumenDefinitivo(contenedorResumen, horarioDefinitivo);
        RenderizadorRejilla.renderizar(contenedorRejillaResumen, horarioDefinitivo);

        mostrarMensaje('Horario definitivo elegido.', 'exito');
        contenedorResumen.scrollIntoView({ behavior: 'smooth' });
    });

    function invalidarResultados() {
        resultadosGenerados = [];
        resultadosFiltrados = [];
        contenedorRejilla.innerHTML = '';
        metricasResultado.innerHTML = '';
        controlesNavegacion.style.display = 'none';
        contadorResultados.textContent = '';
    }

    // FORMULARIO MANUAL
    FormularioManual.inicializar();
    FormularioManual.onCambio = () => {
        invalidarResultados();
        actualizarInterfazSeleccion();
        renderizarListaSeleccion();
        renderizarMiniMapaChoques();
    };

    actualizarInterfazSeleccion();
});