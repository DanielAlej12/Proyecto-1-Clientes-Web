const RenderizadorRejilla = {

    diasMapeo: { LUN: 2, MAR: 3, MIE: 4, JUE: 5, VIE: 6, SAB: 7 },

    PALETA: [
        '#2c5f8a', '#4a7ba7', '#1e3a5f', '#5b8c7e', '#e8a87c',
        '#6a8db5', '#8e7cae', '#3a7a8c', '#c47d5a', '#7a9e8c',
        '#a6784a', '#4f6d8a', '#6b5b95', '#8c7a6b', '#3d5a80'
    ],

    _rango: null,

    // Cálculo dinámico del rango temporal desde BLOQUES
    calcularRangoDataset() {
        if (this._rango) return this._rango;

        let minInicio = Infinity;
        let maxFin = -Infinity;
        let resolucion = Infinity;

        BLOQUES.forEach(b => {
            const ini = horaAMinutos(b.inicio);
            const fin = horaAMinutos(b.fin);
            if (ini < minInicio) minInicio = ini;
            if (fin > maxFin) maxFin = fin;
            const dur = fin - ini;
            if (dur > 0 && dur < resolucion) resolucion = dur;
        });

        if (!isFinite(minInicio)) minInicio = 7 * 60;
        if (!isFinite(maxFin)) maxFin = 21 * 60;
        if (!isFinite(resolucion)) resolucion = 45;

        this._rango = { minInicio, maxFin, resolucion };
        return this._rango;
    },

    // Color estable por materia
    colorMateria(codigo) {
        let hash = 0;
        for (let i = 0; i < codigo.length; i++) {
            hash = (hash * 31 + codigo.charCodeAt(i)) >>> 0;
        }
        return this.PALETA[hash % this.PALETA.length];
    },

    // RENDER PRINCIPAL
    renderizar(contenedorElemento, combinacionSeleccion) {
        contenedorElemento.innerHTML = '';

        const gridDiv = document.createElement('div');
        gridDiv.className = 'horario-grid-container';
        gridDiv.setAttribute('role', 'grid');
        gridDiv.setAttribute('aria-label', 'Rejilla semanal de horario');

        // Cabeceras de días
        const diasNombres = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        diasNombres.forEach((dia) => {
            const header = document.createElement('div');
            header.className = 'grid-header';
            header.textContent = dia;
            header.setAttribute('role', 'columnheader');
            gridDiv.appendChild(header);
        });

        const { minInicio, resolucion } = this.calcularRangoDataset();

        const totalFilas = Math.ceil(
            (this.calcularRangoDataset().maxFin - minInicio) / resolucion
        );

        for (let i = 0; i < totalFilas; i++) {
            const minutosFila = minInicio + i * resolucion;
            const label = document.createElement('div');
            label.className = 'grid-time-label';
            label.textContent = minutosAHora(minutosFila);
            label.style.gridRow = (i + 2).toString();
            label.style.gridColumn = '1';
            gridDiv.appendChild(label);
        }

        gridDiv.style.setProperty('--total-filas', totalFilas.toString());

        // Huecos muertos
        if (combinacionSeleccion && combinacionSeleccion.length > 0) {
            const porDia = {};
            combinacionSeleccion.forEach(item => {
                item.seccion.horario.forEach(ses => {
                    if (!porDia[ses.dia]) porDia[ses.dia] = [];
                    const r = obtenerRangoHorarioSesion(ses);
                    if (r) {
                        porDia[ses.dia].push({
                            ini: horaAMinutos(r.inicio),
                            fin: horaAMinutos(r.fin)
                        });
                    }
                });
            });

            Object.entries(porDia).forEach(([dia, sesionesDia]) => {
                sesionesDia.sort((a, b) => a.ini - b.ini);
                for (let i = 0; i < sesionesDia.length - 1; i++) {
                    const finActual = sesionesDia[i].fin;
                    const iniSig = sesionesDia[i + 1].ini;
                    if (iniSig > finActual) {
                        const dur = iniSig - finActual;
                        const filaInicio = Math.floor((finActual - minInicio) / resolucion) + 2;
                        const filas = Math.ceil(dur / resolucion);

                        const hueco = document.createElement('div');
                        hueco.className = 'hueco-muerto';
                        hueco.style.gridColumn = this.diasMapeo[dia].toString();
                        hueco.style.gridRow = `${filaInicio} / span ${filas}`;
                        hueco.title = `${dur} min de hora muerta`;
                        gridDiv.appendChild(hueco);
                    }
                }
            });
        }

        // Sesiones
        if (combinacionSeleccion && combinacionSeleccion.length > 0) {
            combinacionSeleccion.forEach(item => {
                const { materia, seccion } = item;
                const color = this.colorMateria(materia.codigo);

                seccion.horario.forEach(sesion => {
                    const columnaDia = this.diasMapeo[sesion.dia];
                    if (!columnaDia) return;

                    const rango = obtenerRangoHorarioSesion(sesion);
                    if (!rango) return;

                    const minIni = horaAMinutos(rango.inicio);
                    const minFin = horaAMinutos(rango.fin);
                    const dur = minFin - minIni;
                    if (dur <= 0) return;

                    const filaInicio = Math.floor((minIni - minInicio) / resolucion) + 2;
                    const cantidadFilas = Math.max(1, Math.ceil(dur / resolucion));

                    const card = document.createElement('div');
                    card.className = 'sesion-card';
                    card.style.gridColumn = columnaDia.toString();
                    card.style.gridRow = `${filaInicio} / span ${cantidadFilas}`;
                    card.style.backgroundColor = color;
                    card.style.borderLeftColor = this.sombrear(color, -25);

                    card.title =
                        `${materia.nombre} (${materia.codigo})\n` +
                        `Sección ${seccion.id} — ${seccion.profesor}\n` +
                        `${sesion.dia} ${rango.inicio}–${rango.fin} · Aula ${sesion.aula || 'N/A'}`;

                    card.setAttribute('tabindex', '0');
                    card.setAttribute('role', 'gridcell');
                    card.setAttribute('aria-label',
                        `${materia.codigo} sección ${seccion.id}, ${sesion.dia} ${rango.inicio} a ${rango.fin}, aula ${sesion.aula || 'N/A'}`
                    );

                    card.innerHTML = `
                        <div class="sesion-linea-1">
                            <span class="sesion-codigo">${materia.codigo}</span>
                            <span class="sesion-seccion">(${seccion.id})</span>
                        </div>
                        <div class="sesion-detalles">
                            ${sesion.aula || 'N/A'} · ${rango.inicio}–${rango.fin}
                        </div>
                    `;

                    card.addEventListener('click', () => {
                        this.mostrarDetalleSesion(materia, seccion, sesion, rango);
                    });
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.mostrarDetalleSesion(materia, seccion, sesion, rango);
                        }
                    });

                    gridDiv.appendChild(card);
                });
            });
        }

        contenedorElemento.appendChild(gridDiv);
    },

    // Modal de detalle de sesión
    mostrarDetalleSesion(materia, seccion, sesion, rango) {
        let modal = document.getElementById('modal-detalle-sesion');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalle-sesion';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <h3>
                    ${materia.nombre}
                    <span class="modal-codigo">${materia.codigo}</span>
                </h3>
                <p><strong>Sección:</strong> ${seccion.id}</p>
                <p><strong>Profesor:</strong> ${seccion.profesor}</p>
                <p><strong>Día:</strong> ${sesion.dia}</p>
                <p><strong>Horario:</strong> ${rango.inicio} – ${rango.fin}</p>
                <p><strong>Aula:</strong> ${sesion.aula || 'N/A'}</p>
                <button type="button" id="cerrar-detalle-sesion" class="btn-secondary">Cerrar</button>
            </div>
        `;

        modal.classList.remove('cerrando');
        modal.classList.add('abierto');

        const cerrar = () => {
            modal.classList.add('cerrando');
            setTimeout(() => modal.classList.remove('abierto', 'cerrando'), 200);
        };

        document.getElementById('cerrar-detalle-sesion').addEventListener('click', cerrar);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrar();
        });

        const onKey = (e) => {
            if (e.key === 'Escape') {
                cerrar();
                document.removeEventListener('keydown', onKey);
            }
        };
        document.addEventListener('keydown', onKey);
    },

    // Sombrear un color hexadecimal en porcentaje
    sombrear(hex, porcentaje) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + porcentaje));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + porcentaje));
        const b = Math.max(0, Math.min(255, (num & 0xff) + porcentaje));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
};
