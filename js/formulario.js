const FormularioManual = {

    editandoCodigo: null,
    onCambio: null,

    // INICIALIZACIÓN
    inicializar() {
        const form      = document.getElementById('form-materia-manual');
        const fieldset  = document.getElementById('manual-secciones');
        const btnAgrSec = document.getElementById('btn-agregar-seccion');
        const btnCancel = document.getElementById('btn-cancelar-edicion');

        if (!form || !fieldset) return;

        btnAgrSec.addEventListener('click', () => this.agregarSeccionAlDOM(fieldset));
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.procesarEnvio();
        });
        btnCancel.addEventListener('click', () => this.cancelarEdicion());

        this.agregarSeccionAlDOM(fieldset);
        this.renderListaManuales();
    },

    // CONSTRUCCIÓN DINÁMICA
    agregarSeccionAlDOM(fieldset) {
        const wrapper = document.createElement('div');
        wrapper.className = 'seccion-form';

        const opcionesBloques = BLOQUES.map(b =>
            `<option value="${b.id}">${b.id} (${b.inicio}–${b.fin}, ${b.tipo})</option>`
        ).join('');

        const opcionesDias = ['LUN','MAR','MIE','JUE','VIE','SAB']
            .map(d => `<option value="${d}">${d}</option>`).join('');

        wrapper.innerHTML = `
            <div class="config-group">
                <label>ID sección:</label>
                <input type="text" class="sec-id" required>
                <label>Profesor:</label>
                <input type="text" class="sec-profesor" required>
            </div>
            <div class="sesiones-form"></div>
            <div class="acciones-formulario">
                <button type="button" class="btn-secondary btn-add-sesion">+ Sesión</button>
                <button type="button" class="btn-secondary btn-quitar-seccion">Eliminar sección</button>
            </div>
        `;
        fieldset.appendChild(wrapper);

        wrapper.querySelector('.btn-add-sesion').addEventListener('click', () => {
            this.agregarSesionAlDOM(wrapper.querySelector('.sesiones-form'), opcionesBloques, opcionesDias);
        });
        wrapper.querySelector('.btn-quitar-seccion').addEventListener('click', () => wrapper.remove());

        this.agregarSesionAlDOM(wrapper.querySelector('.sesiones-form'), opcionesBloques, opcionesDias);
    },

    agregarSesionAlDOM(contenedor, opcionesBloques, opcionesDias) {
        const s = document.createElement('div');
        s.className = 'sesion-form';
        s.innerHTML = `
            <select class="ses-dia">${opcionesDias}</select>
            <select class="ses-bloques" multiple size="5">${opcionesBloques}</select>
            <input type="text" class="ses-aula" placeholder="Aula">
            <button type="button" class="btn-quitar-sesion" aria-label="Quitar sesión">✕</button>
        `;
        s.querySelector('.btn-quitar-sesion').addEventListener('click', () => s.remove());
        contenedor.appendChild(s);
    },

    // LECTURA
    leerDatosFormulario() {
        const secciones = Array.from(
            document.querySelectorAll('#manual-secciones .seccion-form')
        ).map(sw => ({
            id:       sw.querySelector('.sec-id').value.trim(),
            profesor: sw.querySelector('.sec-profesor').value.trim(),
            horario:  Array.from(sw.querySelectorAll('.sesion-form')).map(sf => ({
                dia:     sf.querySelector('.ses-dia').value,
                bloques: Array.from(sf.querySelector('.ses-bloques').selectedOptions).map(o => o.value),
                aula:    sf.querySelector('.ses-aula').value.trim()
            }))
        }));

        return {
            codigo:    document.getElementById('manual-codigo').value.trim(),
            nombre:    document.getElementById('manual-nombre').value.trim(),
            trimestre: Number(document.getElementById('manual-trimestre').value),
            uc:        Number(document.getElementById('manual-uc').value),
            secciones
        };
    },

    // ENVÍO
    procesarEnvio() {
        document.querySelectorAll('.error-campo').forEach(e => e.textContent = '');

        const datos = this.leerDatosFormulario();

        let respaldo = null;
        if (this.editandoCodigo) {
            const manuales = GestorDatos.obtenerMateriasManuales();
            respaldo = manuales.find(m => m.codigo === this.editandoCodigo);
            GestorDatos.eliminarMateriaManual(this.editandoCodigo);
        }

        const r = this.validarYRegistrar(datos);

        if (!r.exito) {
            if (respaldo) GestorDatos.agregarMateriaManual(respaldo);

            let erroresMostrados = false;
            Object.entries(r.errores).forEach(([campo, msg]) => {
                const el = document.querySelector(`.error-campo[data-para="manual-${campo}"]`);
                if (el) { el.textContent = msg; erroresMostrados = true; }
            });
            if (!erroresMostrados) {
                const msg = Object.values(r.errores)[0];
                if (typeof mostrarMensajeGlobal === 'function') mostrarMensajeGlobal(msg, 'error');
            }
            return;
        }

        this.cancelarEdicion();
        this.renderListaManuales();
        if (typeof mostrarMensajeGlobal === 'function') {
            mostrarMensajeGlobal(`Materia manual "${datos.codigo}" guardada.`, 'exito');
        }
        if (this.onCambio) this.onCambio();
    },

    validarYRegistrar(datos) {
        const errores = {};

        if (!datos.codigo) errores.codigo = 'El código es obligatorio.';
        if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
        if (!Number.isInteger(datos.trimestre) || datos.trimestre < 1) {
            errores.trimestre = 'El trimestre debe ser un entero positivo.';
        }
        if (isNaN(datos.uc) || datos.uc < 1 || datos.uc > 5) {
            errores.uc = 'Las UC deben estar entre 1 y 5.';
        }

        const todas = GestorDatos.obtenerMaterias();
        if (todas.some(m => m.codigo.toLowerCase() === datos.codigo.toLowerCase())) {
            errores.codigo = 'Ya existe una materia con este código.';
        }

        if (!datos.secciones || datos.secciones.length === 0) {
            errores.secciones = 'Debe registrar al menos una sección.';
            return { exito: false, errores };
        }

        const idsSeccion = new Set();

        for (const sec of datos.secciones) {
            if (!sec.id) {
                errores.secciones = 'Cada sección necesita un identificador.';
                break;
            }
            if (idsSeccion.has(sec.id)) {
                errores.secciones = `El identificador de sección "${sec.id}" está duplicado.`;
                break;
            }
            idsSeccion.add(sec.id);

            if (!sec.profesor) {
                errores.secciones = `La sección ${sec.id} requiere un profesor.`;
                break;
            }
            if (!sec.horario || sec.horario.length === 0) {
                errores.secciones = `La sección ${sec.id} requiere al menos una sesión.`;
                break;
            }

            for (let i = 0; i < sec.horario.length; i++) {
                const ses = sec.horario[i];

                if (!ses.bloques || ses.bloques.length === 0) {
                    errores.secciones = `Cada sesión de la sección ${sec.id} debe tener bloques.`;
                    break;
                }

                const bloquesObj = ses.bloques
                    .map(id => GestorDatos.obtenerBloquePorId(id))
                    .filter(Boolean);

                if (bloquesObj.length !== ses.bloques.length) {
                    errores.secciones = `Hay bloques inexistentes en la sección ${sec.id}.`;
                    break;
                }

                const tipos = new Set(bloquesObj.map(b => b.tipo));
                if (tipos.size > 1) {
                    errores.secciones = `Los bloques deben ser del mismo tipo (sección ${sec.id}).`;
                    break;
                }

                const ordenados = [...bloquesObj].sort(
                    (a, b) => horaAMinutos(a.inicio) - horaAMinutos(b.inicio)
                );
                let consecutivos = true;
                for (let k = 0; k < ordenados.length - 1; k++) {
                    if (ordenados[k].fin !== ordenados[k + 1].inicio) {
                        consecutivos = false;
                        break;
                    }
                }
                if (!consecutivos) {
                    errores.secciones = `Los bloques deben ser consecutivos (sección ${sec.id}).`;
                    break;
                }

                for (let j = i + 1; j < sec.horario.length; j++) {
                    if (sesionesChocan(ses, sec.horario[j])) {
                        errores.secciones = `La sección ${sec.id} tiene sesiones solapadas.`;
                        break;
                    }
                }
                if (errores.secciones) break;
            }
            if (errores.secciones) break;
        }

        if (Object.keys(errores).length > 0) return { exito: false, errores };

        GestorDatos.agregarMateriaManual(datos);
        return { exito: true };
    },

    // EDICIÓN
    cargarParaEditar(codigo) {
        const m = GestorDatos.obtenerMateriasManuales().find(x => x.codigo === codigo);
        if (!m) return;

        this.editandoCodigo = codigo;

        document.getElementById('manual-codigo').value    = m.codigo;
        document.getElementById('manual-nombre').value    = m.nombre;
        document.getElementById('manual-trimestre').value = m.trimestre;
        document.getElementById('manual-uc').value        = m.uc;

        const fieldset = document.getElementById('manual-secciones');
        fieldset.innerHTML = '';

        const opcionesBloques = BLOQUES.map(b =>
            `<option value="${b.id}">${b.id} (${b.inicio}–${b.fin}, ${b.tipo})</option>`
        ).join('');
        const opcionesDias = ['LUN','MAR','MIE','JUE','VIE','SAB']
            .map(d => `<option value="${d}">${d}</option>`).join('');

        m.secciones.forEach(sec => {
            this.agregarSeccionAlDOM(fieldset);
            const sw = fieldset.lastElementChild;
            sw.querySelector('.sec-id').value       = sec.id;
            sw.querySelector('.sec-profesor').value = sec.profesor;

            const sesCont = sw.querySelector('.sesiones-form');
            sesCont.innerHTML = '';

            sec.horario.forEach(ses => {
                this.agregarSesionAlDOM(sesCont, opcionesBloques, opcionesDias);
                const sf = sesCont.lastElementChild;
                sf.querySelector('.ses-dia').value  = ses.dia;
                sf.querySelector('.ses-aula').value = ses.aula || '';
                const sel = sf.querySelector('.ses-bloques');
                Array.from(sel.options).forEach(o => {
                    o.selected = ses.bloques.includes(o.value);
                });
            });
        });

        document.getElementById('btn-cancelar-edicion').style.display = 'inline-flex';
        document.getElementById('form-materia-manual').scrollIntoView({ behavior: 'smooth' });
    },

    cancelarEdicion() {
        this.editandoCodigo = null;
        document.getElementById('form-materia-manual').reset();
        document.getElementById('manual-secciones').innerHTML = '';
        document.getElementById('btn-cancelar-edicion').style.display = 'none';
        this.agregarSeccionAlDOM(document.getElementById('manual-secciones'));
        document.querySelectorAll('.error-campo').forEach(e => e.textContent = '');
    },

    // LISTA DE MANUALES
    renderListaManuales() {
        let cont = document.getElementById('lista-manuales');
        if (!cont) {
            cont = document.createElement('div');
            cont.id = 'lista-manuales';
            document.getElementById('seccion-formulario-manual').appendChild(cont);
        }

        const manuales = GestorDatos.obtenerMateriasManuales();

        if (!manuales.length) {
            cont.innerHTML = '<p class="sin-resultados">Aún no hay materias manuales registradas.</p>';
            return;
        }

        cont.innerHTML = manuales.map(m => `
            <div class="materia-manual-item">
                <span>
                    <strong>${m.codigo}</strong> — ${m.nombre}
                    (T${m.trimestre}, ${m.uc} UC, ${m.secciones.length} sección/es)
                </span>
                <div class="acciones-formulario">
                    <button type="button" data-edit="${m.codigo}" class="btn-secondary">Editar</button>
                    <button type="button" data-del="${m.codigo}"  class="btn-secondary">Eliminar</button>
                </div>
            </div>
        `).join('');

        cont.querySelectorAll('[data-edit]').forEach(b =>
            b.addEventListener('click', () => this.cargarParaEditar(b.dataset.edit))
        );
        cont.querySelectorAll('[data-del]').forEach(b =>
            b.addEventListener('click', () => this.confirmarEliminar(b.dataset.del))
        );
    },

    // CONFIRMACIÓN DE ELIMINACIÓN
    confirmarEliminar(codigo) {
        let modal = document.getElementById('modal-confirmar-eliminar');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmar-eliminar';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <h3>Eliminar materia manual</h3>
                <p>¿Seguro que quieres eliminar <strong>${codigo}</strong>? Esta acción no se puede deshacer.</p>
                <div class="acciones-formulario">
                    <button type="button" id="btn-cancelar-eliminar" class="btn-secondary">Cancelar</button>
                    <button type="button" id="btn-confirmar-eliminar" class="btn-primary">Sí, eliminar</button>
                </div>
            </div>
        `;

        modal.classList.remove('cerrando');
        modal.classList.add('abierto');

        const cerrar = () => {
            modal.classList.add('cerrando');
            setTimeout(() => modal.classList.remove('abierto', 'cerrando'), 200);
        };

        document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrar);

        document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
            GestorDatos.eliminarMateriaManual(codigo);

            if (typeof EstadoSeleccion !== 'undefined' &&
                EstadoSeleccion.materiasSeleccionadas.includes(codigo)) {
                EstadoSeleccion.quitarMateria(codigo);
            }
            if (this.editandoCodigo === codigo) this.cancelarEdicion();

            cerrar();
            this.renderListaManuales();

            if (typeof mostrarMensajeGlobal === 'function') {
                mostrarMensajeGlobal(`Materia manual "${codigo}" eliminada.`, 'exito');
            }
            if (this.onCambio) this.onCambio();
        });
    }
};
