const GestorPreferencias = {
    filtrar(combinaciones, filtros) {
        // filtros = { diasLibres: ['SAB'], horaMinima: '07:00', horaMaxima: '18:00' }
        return combinaciones.filter(comb => {
            const todasLasSesiones = [];
            comb.forEach(item => {
                item.seccion.horario.forEach(sesion => todasLasSesiones.push(sesion));
            });

            // 1. Filtrar por días libres
            if (filtros.diasLibres && filtros.diasLibres.length > 0) {
                const diasOcupados = new Set(todasLasSesiones.map(s => s.dia));
                for (const diaLibre of filtros.diasLibres) {
                    if (diasOcupados.has(diaLibre)) return false;
                }
            }

            // 2. Filtrar por hora mínima de entrada y máxima de salida
            if (filtros.horaMinima || filtros.horaMaxima) {
                const minMinima = filtros.horaMinima ? horaAMinutos(filtros.horaMinima) : 0;
                const minMaxima = filtros.horaMaxima ? horaAMinutos(filtros.horaMaxima) : 24 * 60;

                for (const sesion of todasLasSesiones) {
                    const rango = obtenerRangoHorarioSesion(sesion);
                    if (!rango) continue;
                    const inicioMin = horaAMinutos(rango.inicio);
                    const finMin = horaAMinutos(rango.fin);

                    if (filtros.horaMinima && inicioMin < minMinima) return false;
                    if (filtros.horaMaxima && finMin > minMaxima) return false;
                }
            }

            return true;
        });
    },

    ordenar(combinaciones, criterio) {
        const copia = [...combinaciones];

        copia.sort((a, b) => {
            if (criterio === 'dias') {
                return calcularDiasAsistencia(a) - calcularDiasAsistencia(b);
            } else if (criterio === 'muertas') {
                return calcularHorasMuertas(a) - calcularHorasMuertas(b);
            } else if (criterio === 'salida') {
                return calcularPromedioSalida(a) - calcularPromedioSalida(b);
            }
            return 0;
        });

        return copia;
    }
};

// --- Funciones auxiliares de cálculo métrico ---

function calcularDiasAsistencia(comb) {
    const dias = new Set();
    comb.forEach(item => {
        item.seccion.horario.forEach(s => dias.add(s.dia));
    });
    return dias.size;
}

function calcularHorasMuertas(comb) {
    const porDia = {};
    comb.forEach(item => {
        item.seccion.horario.forEach(s => {
            if (!porDia[s.dia]) porDia[s.dia] = [];
            const r = obtenerRangoHorarioSesion(s);
            if (r) porDia[s.dia].push({ inicio: horaAMinutos(r.inicio), fin: horaAMinutos(r.fin) });
        });
    });

    let totalMinutosMuertos = 0;
    Object.values(porDia).forEach(sesionesDia => {
        sesionesDia.sort((x, y) => x.inicio - y.inicio);
        for (let i = 0; i < sesionesDia.length - 1; i++) {
            const finActual = sesionesDia[i].fin;
            const inicioSiguiente = sesionesDia[i+1].inicio;
            if (inicioSiguiente > finActual) {
                totalMinutosMuertos += (inicioSiguiente - finActual);
            }
        }
    });

    return totalMinutosMuertos;
}

function calcularPromedioSalida(comb) {
    const porDia = {};
    comb.forEach(item => {
        item.seccion.horario.forEach(s => {
            const r = obtenerRangoHorarioSesion(s);
            if (r) {
                const finMin = horaAMinutos(r.fin);
                if (!porDia[s.dia] || finMin > porDia[s.dia]) {
                    porDia[s.dia] = finMin;
                }
            }
        });
    });

    const salidas = Object.values(porDia);
    if (salidas.length === 0) return 0;
    const suma = salidas.reduce((acc, val) => acc + val, 0);
    return suma / salidas.length;
}