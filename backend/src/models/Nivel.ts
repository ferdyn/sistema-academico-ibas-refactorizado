import mongoose, { Schema, Model } from 'mongoose';
import { INivel } from '@/types';

const nivelSchema = new Schema<INivel>({
  nombre: {
    type: String,
    required: [true, 'El nombre del nivel es requerido'],
    trim: true,
    unique: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  orden: {
    type: Number,
    required: [true, 'El orden es requerido'],
    min: [1, 'El orden debe ser mayor a 0'],
    unique: true
  },
  activo: {
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
nivelSchema.index({ orden: 1 });
nivelSchema.index({ activo: 1 });
nivelSchema.index({ nombre: 'text', descripcion: 'text' });

// Métodos estáticos
nivelSchema.statics.findActive = function() {
  return this.find({ activo: true }).sort({ orden: 1 });
};

nivelSchema.statics.getNextOrder = async function() {
  const lastNivel = await this.findOne().sort({ orden: -1 });
  return lastNivel ? lastNivel.orden + 1 : 1;
};

const Nivel: Model<INivel> = mongoose.model<INivel>('Nivel', nivelSchema);

export default Nivel;
