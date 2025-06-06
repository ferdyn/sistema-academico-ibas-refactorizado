import mongoose, { Schema, Model } from 'mongoose';
import { ICurso } from '@/types';

const cursoSchema = new Schema<ICurso>({
  materiaId: {
    type: Schema.Types.ObjectId,
    ref: 'Materia',
    required: [true, 'La materia es requerida']
  },
  maestroId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El maestro es requerido']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del curso es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es requerida']
  },
  modalidad: {
    type: String,
    enum: {
      values: ['presencial', 'virtual', 'hibrida'],
      message: 'La modalidad debe ser: presencial, virtual o hibrida'
    },
    required: [true, 'La modalidad es requerida']
  },
  aula: {
    type: String,
    trim: true,
    maxlength: [50, 'El aula no puede exceder 50 caracteres']
  },
  horario: {
    type: String,
    required: [true, 'El horario es requerido'],
    trim: true,
    maxlength: [200, 'El horario no puede exceder 200 caracteres']
  },
  cupoMaximo: {
    type: Number,
    required: [true, 'El cupo máximo es requerido'],
    min: [1, 'El cupo máximo debe ser mayor a 0'],
    max: [100, 'El cupo máximo no puede exceder 100']
  },
  activo: {
    type: Boolean,
    default: true
  },
  estudiantesInscritos: {
    type: Number,
    default: 0,
    min: [0, 'El número de estudiantes inscritos no puede ser negativo']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices
cursoSchema.index({ materiaId: 1 });
cursoSchema.index({ maestroId: 1 });
cursoSchema.index({ fechaInicio: 1 });
cursoSchema.index({ fechaFin: 1 });
cursoSchema.index({ activo: 1 });
cursoSchema.index({ modalidad: 1 });

// Validaciones
cursoSchema.pre('save', function(next) {
  // Validar que la fecha de fin sea posterior a la fecha de inicio
  if (this.fechaFin <= this.fechaInicio) {
    return next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }

  // Validar que el aula sea requerida para modalidad presencial e híbrida
  if ((this.modalidad === 'presencial' || this.modalidad === 'hibrida') && !this.aula) {
    return next(new Error('El aula es requerida para modalidad presencial e híbrida'));
  }

  // Validar que el número de estudiantes inscritos no exceda el cupo máximo
  if (this.estudiantesInscritos > this.cupoMaximo) {
    return next(new Error('El número de estudiantes inscritos no puede exceder el cupo máximo'));
  }

  next();
});

// Métodos de instancia
cursoSchema.methods.hasAvailableSpots = function(): boolean {
  return this.estudiantesInscritos < this.cupoMaximo;
};

cursoSchema.methods.getAvailableSpots = function(): number {
  return this.cupoMaximo - this.estudiantesInscritos;
};

cursoSchema.methods.isActive = function(): boolean {
  const now = new Date();
  return this.activo && now >= this.fechaInicio && now <= this.fechaFin;
};

cursoSchema.methods.isUpcoming = function(): boolean {
  const now = new Date();
  return this.activo && now < this.fechaInicio;
};

cursoSchema.methods.isFinished = function(): boolean {
  const now = new Date();
  return now > this.fechaFin;
};

cursoSchema.methods.incrementEnrollment = async function(): Promise<void> {
  if (!this.hasAvailableSpots()) {
    throw new Error('No hay cupos disponibles en este curso');
  }
  
  this.estudiantesInscritos += 1;
  await this.save();
};

cursoSchema.methods.decrementEnrollment = async function(): Promise<void> {
  if (this.estudiantesInscritos > 0) {
    this.estudiantesInscritos -= 1;
    await this.save();
  }
};

// Métodos estáticos
cursoSchema.statics.findActive = function() {
  return this.find({ activo: true })
    .populate('materiaId maestroId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.findByMaestro = function(maestroId: string) {
  return this.find({ maestroId, activo: true })
    .populate('materiaId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.findByMateria = function(materiaId: string) {
  return this.find({ materiaId, activo: true })
    .populate('maestroId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({ 
    activo: true, 
    fechaInicio: { $gt: now } 
  })
    .populate('materiaId maestroId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.findCurrent = function() {
  const now = new Date();
  return this.find({ 
    activo: true, 
    fechaInicio: { $lte: now },
    fechaFin: { $gte: now }
  })
    .populate('materiaId maestroId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.findWithAvailableSpots = function() {
  return this.find({ 
    activo: true,
    $expr: { $lt: ['$estudiantesInscritos', '$cupoMaximo'] }
  })
    .populate('materiaId maestroId')
    .sort({ fechaInicio: 1 });
};

cursoSchema.statics.getCursoStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCursos: { $sum: 1 },
        cursosActivos: {
          $sum: { $cond: [{ $eq: ['$activo', true] }, 1, 0] }
        },
        totalEstudiantes: { $sum: '$estudiantesInscritos' },
        promedioEstudiantesPorCurso: { $avg: '$estudiantesInscritos' },
        totalCupos: { $sum: '$cupoMaximo' }
      }
    }
  ]);

  return stats[0] || {
    totalCursos: 0,
    cursosActivos: 0,
    totalEstudiantes: 0,
    promedioEstudiantesPorCurso: 0,
    totalCupos: 0
  };
};

cursoSchema.statics.getStatsByModalidad = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$modalidad',
        count: { $sum: 1 },
        estudiantesTotal: { $sum: '$estudiantesInscritos' }
      }
    }
  ]);
};

// Virtuals
cursoSchema.virtual('ocupacion').get(function() {
  if (this.cupoMaximo === 0) return 0;
  return Math.round((this.estudiantesInscritos / this.cupoMaximo) * 100);
});

cursoSchema.virtual('estado').get(function() {
  const now = new Date();
  
  if (!this.activo) return 'inactivo';
  if (now < this.fechaInicio) return 'proximo';
  if (now > this.fechaFin) return 'finalizado';
  return 'activo';
});

// Configurar virtuals en JSON
cursoSchema.set('toJSON', { virtuals: true });
cursoSchema.set('toObject', { virtuals: true });

const Curso: Model<ICurso> = mongoose.model<ICurso>('Curso', cursoSchema);

export default Curso;
