const GestorResumen = {

    renderizarResumenDefinitivo(contenedorElemento, combinacionDefinitiva) {
        contenedorElemento.innerHTML = '';

        if (!combinacionDefinitiva || combinacionDefinitiva.length === 0) {
            contenedorElemento.innerHTML = '<p class="aviso-resumen">No se ha seleccionado ningún horario definitivo todavía.</p>';
            return;
        }

        // Calcular unidades de crédito totales del horario definitivo
        const totalUC = combinacionDefinitiva.reduce((acc, item) => acc + item.materia.uc, 0);

        const wrapper = document.createElement('div');
        wrapper.className = 'resumen-definitivo-container';

        let filasTablaHTML = '';
        combinacionDefinitiva.forEach(item => {
            const { materia, seccion } = item;
            
            // Formatear los horarios de la sección en texto legible
            const horariosTexto = seccion.horario.map(ses => {
                const rango = obtenerRangoHorarioSesion(ses);
                return `${ses.dia}: ${rango ? `${rango.inicio} -${rango.fin}` : 'N/A'} (Aula: ${ses.aula || 'N/A'})`;
            }).join('<br>');

            filasTablaHTML += `
                <tr>
                    <td>${materia.codigo}</td>
                    <td>${materia.nombre}</td>
                    <td>${seccion.id}</td>
                    <td>${seccion.profesor}</td>
                    <td>${horariosTexto}</td>
                    <td>${materia.uc} UC</td>
                </tr>
            `;
        });

        wrapper.innerHTML = `
            <h3>Resumen de Horario Definitivo</h3>
            <p class="total-uc-resumen"><strong>Total de Unidades de Crédito Inscritas:</strong> ${totalUC} UC</p>
            <div class="tabla-resumen-wrapper">
                <table class="tabla-resumen-materias">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Materia</th>
                            <th>Sección</th>
                            <th>Profesor</th>
                            <th>Horario</th>
                            <th>Créditos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTablaHTML}
                    </tbody>
                </table>
            </div>
            <div class="acciones-resumen">
                <button id="btn-imprimir-resumen" class="btn-primary">🖨️ Imprimir Horario Definitivo</button>
            </div>
        `;

        contenedorElemento.appendChild(wrapper);

        // Evento para activar la impresión limpia
        const btnImprimir = document.getElementById('btn-imprimir-resumen');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => {
                window.print();
            });
        }
    }
};