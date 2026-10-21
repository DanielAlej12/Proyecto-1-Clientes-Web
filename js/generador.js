const GeneradorHorarios = {
    generar(materiasSeleccionadas, restricciones) {
        // 1. Preparar las materias y filtrar según las restricciones (fijadas o excluidas)
        const materiasConSecciones = materiasSeleccionadas.map(codigo => {
            const mat = GestorDatos.obtenerMaterias().find(m => m.codigo === codigo);
            const restr = restricciones[codigo] || { fijada: null, excluidas: [] };
            
            let secciones = mat.secciones;
            if (restr.fijada) {
                secciones = secciones.filter(s => s.id === restr.fijada);
            } else {
                secciones = secciones.filter(s => !restr.excluidas.includes(s.id));
            }
            return { materia: mat, secciones };
        });

        // Si alguna materia seleccionada se quedó sin secciones válidas, no hay combinaciones
        if (materiasConSecciones.some(item => item.secciones.length === 0)) {
            return [];
        }

        const resultadosValidos = [];

        // Función recursiva de backtracking con descarte temprano
        function backtrack(indiceMateria, combinacionActual) {
            // Caso base: si ya asignamos una sección a cada materia seleccionada
            if (indiceMateria === materiasConSecciones.length) {
                resultadosValidos.push([...combinacionActual]);
                return;
            }

            const actual = materiasConSecciones[indiceMateria];

            for (const seccion of actual.secciones) {
                // Descarte temprano: verificar si esta sección choca con alguna ya elegida
                let hayChoque = false;
                for (const itemElegido of combinacionActual) {
                    if (seccionesChocan(seccion, itemElegido.seccion)) {
                        hayChoque = true;
                        break;
                    }
                }

                // Si NO hay choque, avanzamos a la siguiente materia (rama válida)
                if (!hayChoque) {
                    combinacionActual.push({ materia: actual.materia, seccion });
                    backtrack(indiceMateria + 1, combinacionActual);
                    combinacionActual.pop(); // Deshacer para explorar otras opciones
                }
            }
        }

        backtrack(0, []);
        return resultadosValidos;
    }
};