// Convierte una hora "HH:MM" a minutos totales desde las 00:00
function horaAMinutos(horaStr) {
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas * 60 + minutos;
}

// Convierte minutos totales de vuelta a formato "HH:MM"
function minutosAHora(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60).toString().padStart(2, '0');
    const mins = (minutosTotales % 60).toString().padStart(2, '0');
    return `${horas}:${mins}`;
}

// Verifica si dos intervalos de tiempo chocan.
function seSuperponen(inicioA, finA, inicioB, finB) {
    const minInicioA = horaAMinutos(inicioA);
    const minFinA = horaAMinutos(finA);
    const minInicioB = horaAMinutos(inicioB);
    const minFinB = horaAMinutos(finB);

    return Math.max(minInicioA, minInicioB) < Math.min(minFinA, minFinB);
}
