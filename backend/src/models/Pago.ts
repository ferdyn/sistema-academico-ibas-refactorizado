import mongoose, { Schema, Model } from 'mongoose';
import { IPago } from '@/types';

const pagoSchema = new Schema<IPago>({
  alumnoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El alumno es requerido']
  },
  concepto: {
    type: String,
    required: [true, 'El concepto es requerido'],
    trim: true,
    maxlength: [200, 'El concepto no puede exceder 200 caracteres']
  },
  monto: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor a 0']
  },
  fechaVencimiento: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  fechaPago: {
    type: Date
  },
  metodoPago: {
    type: String,
    enum: {
      values: ['efectivo', 'transferencia', 'deposito', 'tarjeta'],
      message: 'El método de pago debe ser: efectivo, transferencia, deposito o tarjeta'
    }
  },
  referencia: {
    type: String,
    trim: true,
    maxlength: [100, 'La referencia no puede exceder 100 caracteres']
  },
  comprobante: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'pagado', 'vencido', 'cancelado'],
      message: 'El estado debe ser: pendiente, pagado, vencido o cancelado'
    },
    default: 'pendiente',
    required: [true, 'El estado es requerido']
  },
  procesadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notas: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
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
pagoSchema.index({ alumnoId: 1 });
pagoSchema.index({ estado: 1 });
pagoSchema.index({ fechaVencimiento: 1 });
pagoSchema.index({ fechaPago: 1 });
pagoSchema.index({ metodoPago: 1 });
pagoSchema.index({ createdAt: -1 });

// Validaciones
pagoSchema.pre('save', function(next) {
  // Si se está marcando como pagado, validar que tenga método de pago y fecha de pago
  if (this.estado === 'pagado') {
    if (!this.metodoPago) {
      return next(new Error('El método de pago es requerido para marcar como pagado'));
    }
    
    if (!this.fechaPago) {
      this.fechaPago = new Date();
    }
  }

  // Si se está cancelando, limpiar campos de pago
  if (this.estado === 'cancelado') {
    this.fechaPago = undefined;
    this.metodoPago = undefined;
    this.referencia = undefined;
    this.comprobante = undefined;
  }

  // Actualizar estado a vencido si está pendiente y ya pasó la fecha
  if (this.estado === 'pendiente' && this.fechaVencimiento < new Date()) {
    this.estado = 'vencido';
  }

  next();
});

// Middleware para validar que el alumno exista
pagoSchema.pre('save', async function(next) {
  if (this.isModified('alumnoId')) {
    const User = mongoose.model('User');
    const alumno = await User.findById(this.alumnoId);
    
    if (!alumno) {
      return next(new Error('El alumno especificado no existe'));
    }
    
    if (alumno.rol !== 'alumno') {
      return next(new Error('El usuario especificado no es un alumno'));
    }
  }
  
  next();
});

// Métodos de instancia
pagoSchema.methods.isOverdue = function(): boolean {
  return this.estado === 'pendiente' && new Date() > this.fechaVencimiento;
};

pagoSchema.methods.getDaysOverdue = function(): number {
  if (!this.isOverdue()) return 0;
  
  const now = new Date();
  const due = new Date(this.fechaVencimiento);
  const diffTime = now.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

pagoSchema.methods.getDaysUntilDue = function(): number {
  if (this.estado !== 'pendiente') return 0;
  
  const now = new Date();
  const due = new Date(this.fechaVencimiento);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

pagoSchema.methods.markAsPaid = function(metodoPago: string, referencia?: string, procesadoPor?: string): void {
  if (this.estado === 'pagado') {
    throw new Error('Este pago ya está marcado como pagado');
  }
  
  if (this.estado === 'cancelado') {
    throw new Error('No se puede marcar como pagado un pago cancelado');
  }

  this.estado = 'pagado';
  this.fechaPago = new Date();
  this.metodoPago = metodoPago as any;
  this.referencia = referencia;
  
  if (procesadoPor) {
    this.procesadoPor = new mongoose.Types.ObjectId(procesadoPor);
  }
};

pagoSchema.methods.cancel = function(razon?: string): void {
  if (this.estado === 'pagado') {
    throw new Error('No se puede cancelar un pago ya realizado');
  }

  this.estado = 'cancelado';
  if (razon) {
    this.notas = this.notas ? `${this.notas}\nCancelado: ${razon}` : `Cancelado: ${razon}`;
  }
};

pagoSchema.methods.getStatus = function(): string {
  switch (this.estado) {
    case 'pagado':
      return 'Pagado';
    case 'cancelado':
      return 'Cancelado';
    case 'vencido':
      return 'Vencido';
    case 'pendiente':
      const daysUntilDue = this.getDaysUntilDue();
      if (daysUntilDue < 0) return 'Vencido';
      if (daysUntilDue <= 3) return 'Por vencer';
      return 'Pendiente';
    default:
      return 'Desconocido';
  }
};

// Métodos estáticos
pagoSchema.statics.findByAlumno = function(alumnoId: string) {
  return this.find({ alumnoId })
    .populate('procesadoPor', 'nombre apellido')
    .sort({ fechaVencimiento: -1 });
};

pagoSchema.statics.findPending = function(alumnoId?: string) {
  const query: any = { estado: 'pendiente' };
  if (alumnoId) query.alumnoId = alumnoId;
  
  return this.find(query)
    .populate('alumnoId', 'nombre apellido email')
    .sort({ fechaVencimiento: 1 });
};

pagoSchema.statics.findOverdue = function(alumnoId?: string) {
  const query: any = { 
    estado: { $in: ['pendiente', 'vencido'] },
    fechaVencimiento: { $lt: new Date() }
  };
  if (alumnoId) query.alumnoId = alumnoId;
  
  return this.find(query)
    .populate('alumnoId', 'nombre apellido email')
    .sort({ fechaVencimiento: 1 });
};

pagoSchema.statics.findPaid = function(alumnoId?: string, fromDate?: Date, toDate?: Date) {
  const query: any = { estado: 'pagado' };
  
  if (alumnoId) query.alumnoId = alumnoId;
  
  if (fromDate || toDate) {
    query.fechaPago = {};
    if (fromDate) query.fechaPago.$gte = fromDate;
    if (toDate) query.fechaPago.$lte = toDate;
  }
  
  return this.find(query)
    .populate('alumnoId procesadoPor', 'nombre apellido email')
    .sort({ fechaPago: -1 });
};

pagoSchema.statics.getPagoStats = async function(alumnoId?: string) {
  const matchStage: any = {};
  if (alumnoId) matchStage.alumnoId = new mongoose.Types.ObjectId(alumnoId);

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        totalMonto: { $sum: '$monto' }
      }
    }
  ]);

  const totalStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPagos: { $sum: 1 },
        montoTotal: { $sum: '$monto' },
        promedioMonto: { $avg: '$monto' }
      }
    }
  ]);

  return {
    total: totalStats[0] || { totalPagos: 0, montoTotal: 0, promedioMonto: 0 },
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalMonto: stat.totalMonto
      };
      return acc;
    }, {} as Record<string, any>)
  };
};

pagoSchema.statics.getMonthlyIncome = async function(year: number, month?: number) {
  const matchStage: any = {
    estado: 'pagado',
    fechaPago: { $exists: true }
  };

  if (month) {
    // Mes específico
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    matchStage.fechaPago = { $gte: startDate, $lt: endDate };
  } else {
    // Todo el año
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    matchStage.fechaPago = { $gte: startDate, $lt: endDate };
  }

  const income = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$fechaPago' },
          month: { $month: '$fechaPago' }
        },
        totalIngresos: { $sum: '$monto' },
        totalPagos: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return income;
};

// Virtuals
pagoSchema.virtual('statusDescription').get(function() {
  return this.getStatus();
});

pagoSchema.virtual('diasVencimiento').get(function() {
  return this.getDaysUntilDue();
});

pagoSchema.virtual('diasVencido').get(function() {
  return this.getDaysOverdue();
});

// Configurar virtuals en JSON
pagoSchema.set('toJSON', { virtuals: true });
pagoSchema.set('toObject', { virtuals: true });

const Pago: Model<IPago> = mongoose.model<IPago>('Pago', pagoSchema);

export default Pago;
