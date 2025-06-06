import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: 'alumno' | 'profesor' | 'administrador';
  telefono?: string;
  dni?: string;
  fechaNacimiento?: Date;
  direccion?: string;
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  // Campos específicos para alumnos
  tutorLegal?: string;
  telefonoTutor?: string;
  // Campos específicos para profesores
  especialidad?: string;
  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const userSchema = new Schema<IUser>({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true,
    maxlength: [100, 'Los apellidos no pueden exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  rol: {
    type: String,
    enum: ['alumno', 'profesor', 'administrador'],
    required: [true, 'El rol es obligatorio']
  },
  telefono: {
    type: String,
    match: [/^[6789][0-9]{8}$/, 'Teléfono español inválido']
  },
  dni: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i, 'DNI español inválido']
  },
  fechaNacimiento: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return value < new Date();
      },
      message: 'La fecha de nacimiento debe ser anterior a hoy'
    }
  },
  direccion: {
    type: String,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date
  },
  // Campos específicos para alumnos
  tutorLegal: {
    type: String,
    required: function(this: IUser) {
      return this.rol === 'alumno' && this.fechaNacimiento && 
             new Date().getFullYear() - this.fechaNacimiento.getFullYear() < 18;
    }
  },
  telefonoTutor: {
    type: String,
    match: [/^[6789][0-9]{8}$/, 'Teléfono del tutor inválido']
  },
  // Campos específicos para profesores
  especialidad: {
    type: String,
    required: function(this: IUser) {
      return this.rol === 'profesor';
    }
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ rol: 1 });
userSchema.index({ activo: 1 });
userSchema.index({ dni: 1 }, { sparse: true });

// Middleware pre-save para hashear contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Método virtual para nombre completo (formato europeo)
userSchema.virtual('nombreCompleto').get(function(this: IUser) {
  return `${this.apellidos}, ${this.nombre}`;
});

// Método virtual para edad
userSchema.virtual('edad').get(function(this: IUser) {
  if (!this.fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
});

// Configurar virtuals en JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IUser>('User', userSchema);
