const EstadoSeleccion = {

    materiasSeleccionadas: [],   // códigos
    topeUC: 28,
    restricciones: {},           // { "MAT101": { fijada: "S1", excluidas: ["S2"] } }

    // TOTAL UC
    obtenerTotalUC() {
        const todas = GestorDatos.obtenerMaterias();
        return this.materiasSeleccionadas.reduce((total, codigo) => {
            const mat = todas.find(m => m.codigo === codigo);
            return total + (mat ? mat.uc : 0);
        }, 0);
    },

    // TOPE UC
    cambiarTopeUC(nuevoTope) {
        if (!Number.isInteger(nuevoTope) || nuevoTope <= 0) {
            return { exito: false, mensaje: 'El tope debe ser un entero positivo.' };
        }
        if (nuevoTope > 28) {
            return { exito: false, mensaje: 'El tope máximo permitido es 28 UC.' };
        }
        const actualUC = this.obtenerTotalUC();
        if (nuevoTope < actualUC) {
            return {
                exito: false,
                mensaje: `El nuevo tope no puede ser menor a las UC actuales (${actualUC} UC).`
            };
        }
        this.topeUC = nuevoTope;
        return { exito: true };
    },

    // AGREGAR / QUITAR MATERIA
    agregarMateria(codigoMateria) {
        if (this.materiasSeleccionadas.includes(codigoMateria)) {
            return { exito: false, mensaje: 'La materia ya está seleccionada.' };
        }

        const todas = GestorDatos.obtenerMaterias();
        const mat = todas.find(m => m.codigo === codigoMateria);
        if (!mat) return { exito: false, mensaje: 'Materia no encontrada.' };

        const nuevoTotal = this.obtenerTotalUC() + mat.uc;
        if (nuevoTotal > this.topeUC) {
            const exceso = nuevoTotal - this.topeUC;
            return {
                exito: false,
                mensaje: `Superaría el tope de UC por ${exceso} unidad${exceso === 1 ? '' : 'es'} (máx. ${this.topeUC} UC).`
            };
        }

        this.materiasSeleccionadas.push(codigoMateria);
        this.inicializarRestriccionesMateria(codigoMateria);
        return { exito: true };
    },

    quitarMateria(codigoMateria) {
        this.materiasSeleccionadas = this.materiasSeleccionadas.filter(c => c !== codigoMateria);
        delete this.restricciones[codigoMateria];
    },

    // ATAJO TRIMESTRE COMPLETO
    agregarTrimestreCompleto(numeroTrimestre) {
        const todas = GestorDatos.obtenerMaterias();
        const delTrimestre = todas.filter(m =>
            m.trimestre === numeroTrimestre &&
            !this.materiasSeleccionadas.includes(m.codigo)
        );

        if (delTrimestre.length === 0) {
            return { exito: false, mensaje: `No hay materias nuevas del trimestre ${numeroTrimestre}.` };
        }

        const ucAdicionales = delTrimestre.reduce((acc, m) => acc + m.uc, 0);
        const nuevoTotal = this.obtenerTotalUC() + ucAdicionales;

        if (nuevoTotal > this.topeUC) {
            const exceso = nuevoTotal - this.topeUC;
            return {
                exito: false,
                mensaje: `No se puede agregar el trimestre ${numeroTrimestre}. ` +
                         `Excedería el tope de UC por ${exceso} unidad${exceso === 1 ? '' : 'es'} ` +
                         `(tope actual: ${this.topeUC} UC).`
            };
        }

        delTrimestre.forEach(mat => {
            this.materiasSeleccionadas.push(mat.codigo);
            this.inicializarRestriccionesMateria(mat.codigo);
        });

        return { exito: true, agregadas: delTrimestre.length };
    },

    // RESTRICCIONES POR MATERIA
    inicializarRestriccionesMateria(codigo) {
        if (!this.restricciones[codigo]) {
            this.restricciones[codigo] = { fijada: null, excluidas: [] };
        }
    },

    fijarSeccion(codigoMateria, idSeccion) {
        this.inicializarRestriccionesMateria(codigoMateria);
        const restr = this.restricciones[codigoMateria];

        // Si esa sección estaba excluida, la incluimos antes de fijar
        restr.excluidas = restr.excluidas.filter(id => id !== idSeccion);

        // Toggle: si ya estaba fijada, desfijar
        if (restr.fijada === idSeccion) {
            restr.fijada = null;
        } else {
            restr.fijada = idSeccion;
        }
    },

    excluirSeccion(codigoMateria, idSeccion) {
        this.inicializarRestriccionesMateria(codigoMateria);
        const restr = this.restricciones[codigoMateria];

        const materia = GestorDatos.obtenerMaterias().find(m => m.codigo === codigoMateria);
        if (!materia) return { exito: false, mensaje: 'Materia no encontrada.' };

        // --- Caso 1: la sección YA está excluida → incluirla (toggle) ---
        if (restr.excluidas.includes(idSeccion)) {
            restr.excluidas = restr.excluidas.filter(id => id !== idSeccion);
            return { exito: true };
        }

        // --- Caso 2: la sección está fijada → no se puede excluir directamente ---
        if (restr.fijada === idSeccion) {
            return {
                exito: false,
                mensaje: `La sección ${idSeccion} está fijada. Desfíjala primero para poder excluirla.`
            };
        }

        // --- Caso 3: verificar que NO sea la última sección disponible ---
        const totalSecciones = materia.secciones.length;
        const restantesDisponibles = totalSecciones - restr.excluidas.length - 1;
        if (restantesDisponibles < 1) {
            return {
                exito: false,
                mensaje: `No puedes excluir la última sección disponible de ${materia.codigo}.`
            };
        }

        // --- Excluir ---
        restr.excluidas.push(idSeccion);
        return { exito: true };
    }
};