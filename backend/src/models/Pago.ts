import mongoose, { Schema, Document } from 'mongoose';

export interface IPago extends Document {
  estudianteId: mongoose.Types.ObjectId;
  concepto: string;
  descripcion?: string;
  importe: number; // En euros
  fechaVencimiento: Date;
  fechaPago?: Date;
  metodoPago?: 'transferencia' | 'tarjeta' | 'efectivo' | 'domiciliacion';
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  numeroRecibo?: string;
  observaciones?: string;
  fechaCreacion: Date;
}

const pagoSchema = new Schema<IPago>({
  estudianteId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del estudiante es obligatorio']
  },
  concepto: {
    type: String,
    required: [true, 'El concepto es obligatorio'],
    trim: true,
    maxlength: [100, 'El concepto no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  importe: {
    type: Number,
    required: [true, 'El importe es obligatorio'],
    min: [0, 'El importe debe ser positivo'],
    validate: {
      validator: function(value: number) {
        // Validar que tiene máximo 2 decimales (céntimos de euro)
        return Number.isInteger(value * 100);
      },
      message: 'El importe debe tener máximo 2 decimales'
    }
  },
  fechaVencimiento: {
    type: Date,
    required: [true, 'La fecha de vencimiento es obligatoria']
  },
  fechaPago: {
    type: Date,
    validate: {
      validator: function(this: IPago, value: Date) {
        if (!value) return true;
        return value <= new Date();
      },
      message: 'La fecha de pago no puede ser futura'
    }
  },
  metodoPago: {
    type: String,
    enum: ['transferencia', 'tarjeta', 'efectivo', 'domiciliacion'],
    required: function(this: IPago) {
      return this.estado === 'pagado';
    }
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'vencido', 'cancelado'],
    default: 'pendiente'
  },
  numeroRecibo: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  observaciones: {
    type: String,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'pagos'
});

// Índices
pagoSchema.index({ estudianteId: 1 });
pagoSchema.index({ estado: 1 });
pagoSchema.index({ fechaVencimiento: 1 });
pagoSchema.index({ numeroRecibo: 1 }, { sparse: true });

// Middleware para actualizar estado automáticamente
pagoSchema.pre('save', function(next) {
  if (this.fechaPago && this.estado === 'pendiente') {
    this.estado = 'pagado';
  } else if (!this.fechaPago && this.fechaVencimiento < new Date() && this.estado === 'pendiente') {
    this.estado = 'vencido';
  }
  next();
});

// Método virtual para formatear importe en euros
pagoSchema.virtual('importeFormateado').get(function(this: IPago) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.importe);
});

// Método estático para obtener resumen financiero
pagoSchema.statics.getResumenFinanciero = async function(estudianteId: mongoose.Types.ObjectId) {
  const resumen = await this.aggregate([
    { $match: { estudianteId } },
    {
      $group: {
        _id: '$estado',
        total: { $sum: '$importe' },
        cantidad: { $sum: 1 }
      }
    }
  ]);
  
  return resumen;
};

// Configurar virtuals en JSON
pagoSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IPago>('Pago', pagoSchema);
