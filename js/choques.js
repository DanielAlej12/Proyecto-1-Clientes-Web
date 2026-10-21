// Verifica si dos sesiones individuales chocan entre sí.
function sesionesChocan(sesionA, sesionB) {
    // Si no coinciden en el día, no hay choque
    if (sesionA.dia !== sesionB.dia) return false;

    const rangoA = obtenerRangoHorarioSesion(sesionA);
    const rangoB = obtenerRangoHorarioSesion(sesionB);

    if (!rangoA || !rangoB) return false;

    return seSuperponen(rangoA.inicio, rangoA.fin, rangoB.inicio, rangoB.fin);
}

// Calcula la hora de inicio más temprana y de fin más tardía de una sesión basándose en los bloques que ocupa.
function obtenerRangoHorarioSesion(sesion) {
    if (!sesion.bloques || sesion.bloques.length === 0) return null;

    let horaInicioMinima = null;
    let horaFinMaxima = null;

    for (const idBloque of sesion.bloques) {
        const bloque = GestorDatos.obtenerBloquePorId(idBloque);
        if (!bloque) continue;

        if (!horaInicioMinima || bloque.inicio < horaInicioMinima) {
            horaInicioMinima = bloque.inicio;
        }
        if (!horaFinMaxima || bloque.fin > horaFinMaxima) {
            horaFinMaxima = bloque.fin;
        }
    }

    if (!horaInicioMinima || !horaFinMaxima) return null;

    return { inicio: horaInicioMinima, fin: horaFinMaxima };
}

// Verifica si una sección completa choca con otra sección completa. (Basta con que al menos una sesión de la sección A choque con alguna de la sección B).
function seccionesChocan(seccionA, seccionB) {
    for (const sA of seccionA.horario) {
        for (const sB of seccionB.horario) {
            if (sesionesChocan(sA, sB)) {
                return true;
            }
        }
    }
    return false;
}

// Analiza la selección del usuario y detecta qué pares de materias son incompatibles (es decir, TODAS las secciones de la materia 1 chocan con TODAS las secciones de la materia 2).
function detectarIncompatibilidades(materiasSeleccionadas, restriccionesSecciones) {
    const incompatibilidades = [];

    for (let i = 0; i < materiasSeleccionadas.length; i++) {
        for (let j = i + 1; j < materiasSeleccionadas.length; j++) {
            const matA = materiasSeleccionadas[i];
            const matB = materiasSeleccionadas[j];

            // Filtrar secciones según restricciones de usuario (fijas o excluidas)
            const seccionesA = obtenerSeccionesValidasParaAnalisis(matA, restriccionesSecciones);
            const seccionesB = obtenerSeccionesValidasParaAnalisis(matB, restriccionesSecciones);

            if (seccionesA.length === 0 || seccionesB.length === 0) continue;

            let todasChocan = true;

            for (const secA of seccionesA) {
                for (const secB of seccionesB) {
                    if (!seccionesChocan(secA, secB)) {
                        todasChocan = false;
                        break;
                    }
                }
                if (!todasChocan) break;
            }

            if (todasChocan) {
                incompatibilidades.push({ materia1: matA, materia2: matB });
            }
        }
    }

    return incompatibilidades;
}

function obtenerSeccionesValidasParaAnalisis(materia, restricciones) {
    const restrMateria = restricciones[materia.codigo] || { fijada: null, excluidas: [] };
    
    // Si hay una sección fijada, solo esa cuenta
    if (restrMateria.fijada) {
        return materia.secciones.filter(s => s.id === restrMateria.fijada);
    }

    // Si no, devolvemos las que no estén excluidas
    return materia.secciones.filter(s => !restrMateria.excluidas.includes(s.id));
}
