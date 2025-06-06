import mongoose, { Schema, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { IUser, UserRole } from '@/types';
import config from '@/config';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir en consultas por defecto
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  telefono: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Por favor ingresa un número de teléfono válido'
    ]
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  fechaNacimiento: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        if (!value) return true; // Campo opcional
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age >= 10 && age <= 100;
      },
      message: 'La fecha de nacimiento debe indicar una edad entre 10 y 100 años'
    }
  },
  foto: {
    type: String,
    default: null
  },
  rol: {
    type: String,
    enum: {
      values: ['alumno', 'maestro', 'administrador'] as UserRole[],
      message: 'El rol debe ser: alumno, maestro o administrador'
    },
    required: [true, 'El rol es requerido'],
    default: 'alumno'
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimoAcceso: {
    type: Date,
    default: null
  },
  refreshTokens: [{
    type: String
  }],
  emailVerificado: {
    type: Boolean,
    default: false
  },
  codigoVerificacion: {
    type: String,
    select: false
  },
  codigoVerificacionExpira: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpira: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.codigoVerificacion;
      delete ret.codigoVerificacionExpira;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpira;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ rol: 1 });
userSchema.index({ activo: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 
  nombre: 'text', 
  apellido: 'text', 
  email: 'text' 
}, {
  weights: {
    nombre: 10,
    apellido: 10,
    email: 5
  }
});

// Middleware pre-save para hashear la contraseña
userSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();

  try {
    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(config.BCRYPT_ROUNDS);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Middleware pre-save para limpiar tokens de refresh al desactivar usuario
userSchema.pre('save', function(next) {
  if (this.isModified('activo') && !this.activo) {
    this.refreshTokens = [];
  }
  next();
});

// Métodos de instancia
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
};

userSchema.methods.addRefreshToken = function(token: string): void {
  // Limitar a máximo 5 tokens de refresh por usuario
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Remover el más antiguo
  }
  this.refreshTokens.push(token);
};

userSchema.methods.removeRefreshToken = function(token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
};

userSchema.methods.clearRefreshTokens = function(): void {
  this.refreshTokens = [];
};

userSchema.methods.updateLastAccess = function(): void {
  this.ultimoAcceso = new Date();
};

userSchema.methods.getFullName = function(): string {
  return `${this.nombre} ${this.apellido}`;
};

userSchema.methods.isAdmin = function(): boolean {
  return this.rol === 'administrador';
};

userSchema.methods.isMaestro = function(): boolean {
  return this.rol === 'maestro';
};

userSchema.methods.isAlumno = function(): boolean {
  return this.rol === 'alumno';
};

// Métodos estáticos
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ activo: true });
};

userSchema.statics.findByRole = function(rol: UserRole) {
  return this.find({ rol, activo: true });
};

userSchema.statics.searchUsers = function(searchTerm: string, options: any = {}) {
  const query: any = {
    $or: [
      { nombre: { $regex: searchTerm, $options: 'i' } },
      { apellido: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (options.rol) {
    query.rol = options.rol;
  }

  if (options.activo !== undefined) {
    query.activo = options.activo;
  }

  return this.find(query);
};

userSchema.statics.getUsersStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$rol',
        count: { $sum: 1 },
        active: { 
          $sum: { 
            $cond: [{ $eq: ['$activo', true] }, 1, 0] 
          } 
        }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      total: stat.count,
      active: stat.active
    };
    return acc;
  }, {} as Record<string, { total: number; active: number }>);
};

// Virtual para el nombre completo
userSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Virtual para la edad
userSchema.virtual('edad').get(function() {
  if (!this.fechaNacimiento) return null;
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Configurar virtuals en JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;

// Exportar tipos adicionales para TypeScript
export interface UserDocument extends IUser {}
export interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
  findByRole(rol: UserRole): Promise<IUser[]>;
  searchUsers(searchTerm: string, options?: any): Promise<IUser[]>;
  getUsersStats(): Promise<Record<string, { total: number; active: number }>>;
}
