import mongoose, { Schema, Model } from 'mongoose';
import { IMateria } from '@/types';

const materiaSchema = new Schema<IMateria>({
  codigo: {
    type: String,
    required: [true, 'El código de la materia es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'El código no puede exceder 10 caracteres'],
    match: [/^[A-Z0-9]+$/, 'El código solo puede contener letras mayúsculas y números']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la materia es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  creditos: {
    type: Number,
    required: [true, 'Los créditos son requeridos'],
    min: [1, 'Los créditos deben ser mayor a 0'],
    max: [10, 'Los créditos no pueden exceder 10']
  },
  nivelId: {
    type: Schema.Types.ObjectId,
    ref: 'Nivel',
    required: [true, 'El nivel es requerido']
  },
  prerequisitos: [{
    type: Schema.Types.ObjectId,
    ref: 'Materia'
  }],
  activa: {
    type: Boolean,
    default: true
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
materiaSchema.index({ codigo: 1 });
materiaSchema.index({ nivelId: 1 });
materiaSchema.index({ activa: 1 });
materiaSchema.index({ nombre: 'text', descripcion: 'text' });

// Validación para evitar prerequisitos circulares
materiaSchema.pre('save', async function(next) {
  if (this.isModified('prerequisitos') && this.prerequisitos.length > 0) {
    // Verificar que no se incluya a sí misma como prerequisito
    const selfReference = this.prerequisitos.some(prereq => 
      prereq.toString() === this._id.toString()
    );
    
    if (selfReference) {
      return next(new Error('Una materia no puede ser prerequisito de sí misma'));
    }
  }
  
  next();
});

// Métodos estáticos
materiaSchema.statics.findActive = function() {
  return this.find({ activa: true }).populate('nivelId prerequisitos');
};

materiaSchema.statics.findByNivel = function(nivelId: string) {
  return this.find({ nivelId, activa: true }).populate('nivelId prerequisitos');
};

materiaSchema.statics.findByCodeOrName = function(search: string) {
  return this.find({
    $or: [
      { codigo: { $regex: search, $options: 'i' } },
      { nombre: { $regex: search, $options: 'i' } }
    ],
    activa: true
  }).populate('nivelId prerequisitos');
};

materiaSchema.statics.getMateriaStats = async function() {
  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'niveles',
        localField: 'nivelId',
        foreignField: '_id',
        as: 'nivel'
      }
    },
    {
      $unwind: '$nivel'
    },
    {
      $group: {
        _id: '$nivel.nombre',
        totalMaterias: { $sum: 1 },
        materiasActivas: {
          $sum: { $cond: [{ $eq: ['$activa', true] }, 1, 0] }
        },
        totalCreditos: { $sum: '$creditos' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  return stats;
};

// Método para verificar prerequisitos
materiaSchema.methods.canEnroll = async function(alumnoId: string) {
  if (this.prerequisitos.length === 0) {
    return { canEnroll: true, missingPrerequisites: [] };
  }

  // Aquí se verificarían las materias aprobadas del alumno
  // Por ahora retornamos true para simplificar
  return { canEnroll: true, missingPrerequisites: [] };
};

const Materia: Model<IMateria> = mongoose.model<IMateria>('Materia', materiaSchema);

export default Materia;
