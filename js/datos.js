const GestorDatos = {
    // Obtiene todas las materias (catálogo oficial + manuales)
    obtenerMaterias() {
        const manuales = this.obtenerMateriasManuales();
        return [...MATERIAS, ...manuales];
    },

    // Almacenamiento local en memoria para materias manuales
    materiasManuales: [],

    obtenerMateriasManuales() {
        return this.materiasManuales;
    },

    agregarMateriaManual(nuevaMateria) {
        this.materiasManuales.push(nuevaMateria);
    },

    eliminarMateriaManual(codigo) {
        this.materiasManuales = this.materiasManuales.filter(m => m.codigo !== codigo);
    },

    // Busca un bloque por su ID dentro del catálogo BLOQUES
    obtenerBloquePorId(idBloque) {
        return BLOQUES.find(b => b.id === idBloque);
    }
};
