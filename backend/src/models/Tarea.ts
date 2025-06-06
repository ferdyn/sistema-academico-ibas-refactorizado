import mongoose, { Schema, Model } from 'mongoose';
import { ITarea } from '@/types';

const tareaSchema = new Schema<ITarea>({
  cursoId: {
    type: Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'El curso es requerido']
  },
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha de creación es requerida']
  },
  fechaVencimiento: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  puntaje: {
    type: Number,
    required: [true, 'El puntaje es requerido'],
    min: [1, 'El puntaje debe ser mayor a 0'],
    max: [100, 'El puntaje no puede exceder 100']
  },
  activa: {
    type: Boolean,
    default: true
  },
  archivos: [{
    type: String,
    trim: true
  }],
  instrucciones: {
    type: String,
    trim: true,
    maxlength: [3000, 'Las instrucciones no pueden exceder 3000 caracteres']
  },
  criteriosEvaluacion: {
    type: String,
    trim: true,
    maxlength: [2000, 'Los criterios de evaluación no pueden exceder 2000 caracteres']
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
tareaSchema.index({ cursoId: 1 });
tareaSchema.index({ fechaVencimiento: 1 });
tareaSchema.index({ activa: 1 });
tareaSchema.index({ fechaCreacion: -1 });

// Validaciones
tareaSchema.pre('save', function(next) {
  // Validar que la fecha de vencimiento sea posterior a la fecha de creación
  if (this.fechaVencimiento <= this.fechaCreacion) {
    return next(new Error('La fecha de vencimiento debe ser posterior a la fecha de creación'));
  }

  // Validar que la fecha de vencimiento no sea en el pasado (solo para nuevas tareas)
  if (this.isNew && this.fechaVencimiento <= new Date()) {
    return next(new Error('La fecha de vencimiento no puede ser en el pasado'));
  }

  next();
});

// Métodos de instancia
tareaSchema.methods.isOverdue = function(): boolean {
  return new Date() > this.fechaVencimiento;
};

tareaSchema.methods.getDaysUntilDue = function(): number {
  const now = new Date();
  const due = new Date(this.fechaVencimiento);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

tareaSchema.methods.getStatus = function(): string {
  if (!this.activa) return 'inactiva';
  
  const daysUntilDue = this.getDaysUntilDue();
  
  if (daysUntilDue < 0) return 'vencida';
  if (daysUntilDue === 0) return 'vence_hoy';
  if (daysUntilDue <= 3) return 'proxima_vencer';
  return 'activa';
};

tareaSchema.methods.canSubmit = function(): boolean {
  return this.activa && !this.isOverdue();
};

// Métodos estáticos
tareaSchema.statics.findByCurso = function(cursoId: string) {
  return this.find({ cursoId, activa: true })
    .sort({ fechaVencimiento: 1 });
};

tareaSchema.statics.findActive = function() {
  return this.find({ activa: true })
    .populate('cursoId')
    .sort({ fechaVencimiento: 1 });
};

tareaSchema.statics.findOverdue = function() {
  return this.find({ 
    activa: true,
    fechaVencimiento: { $lt: new Date() }
  })
    .populate('cursoId')
    .sort({ fechaVencimiento: -1 });
};

tareaSchema.statics.findUpcoming = function(days: number = 7) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return this.find({ 
    activa: true,
    fechaVencimiento: { 
      $gte: now,
      $lte: futureDate
    }
  })
    .populate('cursoId')
    .sort({ fechaVencimiento: 1 });
};

tareaSchema.statics.findByMaestro = async function(maestroId: string) {
  // Primero obtener los cursos del maestro
  const Curso = mongoose.model('Curso');
  const cursos = await Curso.find({ maestroId }).select('_id');
  const cursoIds = cursos.map(curso => curso._id);

  return this.find({ 
    cursoId: { $in: cursoIds },
    activa: true
  })
    .populate('cursoId')
    .sort({ fechaVencimiento: 1 });
};

tareaSchema.statics.getTareaStats = async function(cursoId?: string) {
  const matchStage: any = { activa: true };
  if (cursoId) matchStage.cursoId = new mongoose.Types.ObjectId(cursoId);

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTareas: { $sum: 1 },
        tareasVencidas: {
          $sum: {
            $cond: [
              { $lt: ['$fechaVencimiento', new Date()] },
              1,
              0
            ]
          }
        },
        tareasActivas: {
          $sum: {
            $cond: [
              { $gte: ['$fechaVencimiento', new Date()] },
              1,
              0
            ]
          }
        },
        promedioPuntaje: { $avg: '$puntaje' },
        puntajeTotal: { $sum: '$puntaje' }
      }
    }
  ]);

  return stats[0] || {
    totalTareas: 0,
    tareasVencidas: 0,
    tareasActivas: 0,
    promedioPuntaje: 0,
    puntajeTotal: 0
  };
};

// Virtuals
tareaSchema.virtual('estado').get(function() {
  return this.getStatus();
});

tareaSchema.virtual('diasRestantes').get(function() {
  return this.getDaysUntilDue();
});

tareaSchema.virtual('tiempoRestante').get(function() {
  const days = this.getDaysUntilDue();
  
  if (days < 0) return 'Vencida';
  if (days === 0) return 'Vence hoy';
  if (days === 1) return '1 día restante';
  return `${days} días restantes`;
});

// Configurar virtuals en JSON
tareaSchema.set('toJSON', { virtuals: true });
tareaSchema.set('toObject', { virtuals: true });

const Tarea: Model<ITarea> = mongoose.model<ITarea>('Tarea', tareaSchema);

export default Tarea;
