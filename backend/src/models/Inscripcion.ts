import mongoose, { Schema, Model } from 'mongoose';
import { IInscripcion } from '@/types';

const inscripcionSchema = new Schema<IInscripcion>({
  cursoId: {
    type: Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'El curso es requerido']
  },
  alumnoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El alumno es requerido']
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha de inscripción es requerida']
  },
  calificacionFinal: {
    type: Number,
    min: [0, 'La calificación final no puede ser negativa'],
    max: [100, 'La calificación final no puede exceder 100']
  },
  estado: {
    type: String,
    enum: {
      values: ['inscrito', 'cursando', 'aprobado', 'reprobado', 'retirado'],
      message: 'El estado debe ser: inscrito, cursando, aprobado, reprobado o retirado'
    },
    default: 'inscrito',
    required: [true, 'El estado es requerido']
  },
  notas: {
    parcial1: {
      type: Number,
      min: [0, 'La nota del parcial 1 no puede ser negativa'],
      max: [100, 'La nota del parcial 1 no puede exceder 100']
    },
    parcial2: {
      type: Number,
      min: [0, 'La nota del parcial 2 no puede ser negativa'],
      max: [100, 'La nota del parcial 2 no puede exceder 100']
    },
    final: {
      type: Number,
      min: [0, 'La nota final no puede ser negativa'],
      max: [100, 'La nota final no puede exceder 100']
    },
    trabajos: {
      type: Number,
      min: [0, 'La nota de trabajos no puede ser negativa'],
      max: [100, 'La nota de trabajos no puede exceder 100']
    },
    participacion: {
      type: Number,
      min: [0, 'La nota de participación no puede ser negativa'],
      max: [100, 'La nota de participación no puede exceder 100']
    }
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
inscripcionSchema.index({ cursoId: 1 });
inscripcionSchema.index({ alumnoId: 1 });
inscripcionSchema.index({ estado: 1 });
inscripcionSchema.index({ fechaInscripcion: -1 });
inscripcionSchema.index({ calificacionFinal: 1 });

// Índice compuesto para evitar inscripciones duplicadas
inscripcionSchema.index({ cursoId: 1, alumnoId: 1 }, { unique: true });

// Middleware pre-save para validaciones
inscripcionSchema.pre('save', function(next) {
  // Auto-calcular calificación final basada en las notas
  if (this.isModified('notas') || this.isModified('estado')) {
    this.calculateFinalGrade();
  }

  // Actualizar estado basado en la calificación final
  if (this.calificacionFinal !== undefined) {
    if (this.calificacionFinal >= 70) {
      this.estado = 'aprobado';
    } else if (this.calificacionFinal < 70 && this.estado === 'cursando') {
      this.estado = 'reprobado';
    }
  }

  next();
});

// Métodos de instancia
inscripcionSchema.methods.calculateFinalGrade = function(): number {
  const { notas } = this;
  
  // Configuración de pesos para cada componente
  const weights = {
    parcial1: 0.25,   // 25%
    parcial2: 0.25,   // 25%
    final: 0.30,      // 30%
    trabajos: 0.15,   // 15%
    participacion: 0.05 // 5%
  };

  let totalGrade = 0;
  let totalWeight = 0;

  // Calcular solo con las notas disponibles
  Object.keys(weights).forEach(key => {
    if (notas[key] !== undefined && notas[key] !== null) {
      totalGrade += notas[key] * weights[key];
      totalWeight += weights[key];
    }
  });

  // Si hay notas disponibles, calcular el promedio ponderado
  if (totalWeight > 0) {
    this.calificacionFinal = Math.round((totalGrade / totalWeight) * 100) / 100;
  }

  return this.calificacionFinal || 0;
};

inscripcionSchema.methods.isApproved = function(): boolean {
  return this.estado === 'aprobado' || (this.calificacionFinal && this.calificacionFinal >= 70);
};

inscripcionSchema.methods.isActive = function(): boolean {
  return ['inscrito', 'cursando'].includes(this.estado);
};

inscripcionSchema.methods.canWithdraw = function(): boolean {
  return ['inscrito', 'cursando'].includes(this.estado);
};

inscripcionSchema.methods.withdraw = function(): void {
  if (!this.canWithdraw()) {
    throw new Error('No se puede retirar de este curso en el estado actual');
  }
  this.estado = 'retirado';
};

inscripcionSchema.methods.getGradeStatus = function(): string {
  if (!this.calificacionFinal) return 'Sin calificar';
  
  if (this.calificacionFinal >= 90) return 'Excelente';
  if (this.calificacionFinal >= 80) return 'Muy Bueno';
  if (this.calificacionFinal >= 70) return 'Bueno';
  if (this.calificacionFinal >= 60) return 'Regular';
  return 'Insuficiente';
};

// Métodos estáticos
inscripcionSchema.statics.findByAlumno = function(alumnoId: string) {
  return this.find({ alumnoId })
    .populate('cursoId')
    .sort({ fechaInscripcion: -1 });
};

inscripcionSchema.statics.findByCurso = function(cursoId: string) {
  return this.find({ cursoId })
    .populate('alumnoId')
    .sort({ fechaInscripcion: 1 });
};

inscripcionSchema.statics.findActiveInscripciones = function(alumnoId?: string) {
  const query: any = { estado: { $in: ['inscrito', 'cursando'] } };
  if (alumnoId) query.alumnoId = alumnoId;
  
  return this.find(query)
    .populate('cursoId alumnoId')
    .sort({ fechaInscripcion: -1 });
};

inscripcionSchema.statics.findApproved = function(alumnoId?: string) {
  const query: any = { estado: 'aprobado' };
  if (alumnoId) query.alumnoId = alumnoId;
  
  return this.find(query)
    .populate('cursoId')
    .sort({ fechaInscripcion: -1 });
};

inscripcionSchema.statics.getInscripcionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        promedioCalificacion: { $avg: '$calificacionFinal' }
      }
    }
  ]);

  const total = await this.countDocuments();
  
  return {
    total,
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        percentage: Math.round((stat.count / total) * 100),
        averageGrade: stat.promedioCalificacion ? Math.round(stat.promedioCalificacion * 100) / 100 : null
      };
      return acc;
    }, {} as Record<string, any>)
  };
};

inscripcionSchema.statics.getStudentGradeStats = async function(alumnoId: string) {
  const stats = await this.aggregate([
    { $match: { alumnoId: new mongoose.Types.ObjectId(alumnoId) } },
    {
      $group: {
        _id: null,
        totalCursos: { $sum: 1 },
        cursosAprobados: {
          $sum: { $cond: [{ $eq: ['$estado', 'aprobado'] }, 1, 0] }
        },
        cursosReprobados: {
          $sum: { $cond: [{ $eq: ['$estado', 'reprobado'] }, 1, 0] }
        },
        promedioGeneral: { $avg: '$calificacionFinal' },
        calificacionMasAlta: { $max: '$calificacionFinal' },
        calificacionMasBaja: { $min: '$calificacionFinal' }
      }
    }
  ]);

  return stats[0] || {
    totalCursos: 0,
    cursosAprobados: 0,
    cursosReprobados: 0,
    promedioGeneral: 0,
    calificacionMasAlta: 0,
    calificacionMasBaja: 0
  };
};

// Virtuals
inscripcionSchema.virtual('progressPercentage').get(function() {
  const { notas } = this;
  const totalPossible = 5; // parcial1, parcial2, final, trabajos, participacion
  let completed = 0;

  Object.values(notas).forEach(nota => {
    if (nota !== undefined && nota !== null) completed++;
  });

  return Math.round((completed / totalPossible) * 100);
});

// Configurar virtuals en JSON
inscripcionSchema.set('toJSON', { virtuals: true });
inscripcionSchema.set('toObject', { virtuals: true });

const Inscripcion: Model<IInscripcion> = mongoose.model<IInscripcion>('Inscripcion', inscripcionSchema);

export default Inscripcion;
