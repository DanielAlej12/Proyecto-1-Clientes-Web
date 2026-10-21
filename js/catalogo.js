const RenderizadorCatalogo = {

    renderizar(contenedorElemento, materiasAMostrar, onToggleSeleccion) {
        contenedorElemento.innerHTML = '';

        if (materiasAMostrar.length === 0) {
            contenedorElemento.innerHTML =
                '<p class="sin-resultados">No se encontraron materias que coincidan con la búsqueda.</p>';
            return;
        }

        // Códigos incompatibles marcados por app.js (Set global en app.js)
        const incompatibles = (typeof MateriasIncompatibles !== 'undefined' && MateriasIncompatibles)
            ? MateriasIncompatibles
            : new Set();

        materiasAMostrar.forEach(mat => {
            const estaSeleccionada = EstadoSeleccion.materiasSeleccionadas.includes(mat.codigo);
            const esManual = !MATERIAS.some(m => m.codigo === mat.codigo);
            const esIncompatible = incompatibles.has(mat.codigo);

            const card = document.createElement('div');
            card.className =
                'materia-card' +
                (estaSeleccionada ? ' seleccionada' : '') +
                (esManual ? ' materia-manual' : '') +
                (esIncompatible ? ' incompatible' : '');

            const badgeIncompat = esIncompatible
                ? '<span class="badge-incompatible">Incompatible</span>'
                : '';

            card.innerHTML = `
                <div class="materia-info-principal">
                    <div class="materia-header-line">
                        <strong>${mat.codigo}</strong> — ${mat.nombre}
                        ${esManual ? '<span class="badge-manual">Manual</span>' : ''}
                        ${badgeIncompat}
                    </div>
                    <div class="materia-detalles-secundarios">
                        Trimestre ${mat.trimestre} · ${mat.uc} UC · ${mat.secciones.length} sección/es
                    </div>
                </div>
                <div class="materia-botones">
                    <button class="btn-secondary btn-detalle">Ver detalle</button>
                    <button class="btn-primary btn-toggle-materia">${estaSeleccionada ? 'Quitar' : 'Agregar'}</button>
                </div>
            `;

            card.querySelector('.btn-toggle-materia').addEventListener('click', () => {
                onToggleSeleccion(mat.codigo, estaSeleccionada);
            });

            card.querySelector('.btn-detalle').addEventListener('click', () => {
                this.mostrarModalDetalle(mat);
            });

            contenedorElemento.appendChild(card);
        });
    },

    // ------------------------------------------------------------------
    // Modal de detalle con animación de apertura y cierre
    // ------------------------------------------------------------------
    mostrarModalDetalle(materia) {
        let modal = document.getElementById('modal-detalle-materia');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalle-materia';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const seccionesHTML = materia.secciones.map(sec => {
            const sesionesHTML = sec.horario.map(ses => {
                const rango = obtenerRangoHorarioSesion(ses);
                const horario = rango ? `${rango.inicio} – ${rango.fin}` : 'Horario no definido';
                return `<li><strong>${ses.dia}</strong>: ${horario} · Aula ${ses.aula || 'N/A'}</li>`;
            }).join('');

            return `
                <div class="seccion-item">
                    <strong>Sección ${sec.id}</strong> — ${sec.profesor}
                    <ul>${sesionesHTML}</ul>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <h3>
                    ${materia.nombre}
                    <span class="modal-codigo">${materia.codigo}</span>
                </h3>
                <p><strong>Trimestre:</strong> ${materia.trimestre}</p>
                <p><strong>Unidades de crédito:</strong> ${materia.uc} UC</p>
                <div class="secciones-lista">
                    <h4>Secciones disponibles</h4>
                    ${seccionesHTML}
                </div>
                <button type="button" id="cerrar-modal" class="btn-secondary">Cerrar</button>
            </div>
        `;

        // Abrir con animación
        modal.classList.remove('cerrando');
        modal.classList.add('abierto');

        // Cerrar con animación
        const cerrar = () => this.cerrarModal(modal);
        document.getElementById('cerrar-modal').addEventListener('click', cerrar);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrar();
        });

        // Esc también cierra
        const onKey = (e) => {
            if (e.key === 'Escape') {
                cerrar();
                document.removeEventListener('keydown', onKey);
            }
        };
        document.addEventListener('keydown', onKey);
    },

    cerrarModal(modal) {
        if (!modal) return;
        modal.classList.add('cerrando');
        setTimeout(() => {
            modal.classList.remove('abierto', 'cerrando');
        }, 200);
    }
};