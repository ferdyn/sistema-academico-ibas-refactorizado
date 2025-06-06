import React, { useState } from 'react';
import { useAuth, useUserRole } from '@/context/AuthContext';
import { useStudentPayments, useTeacherPayroll, useData } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign, CreditCard, TrendingUp, TrendingDown, Clock,
  Plus, Upload, Download, Receipt, AlertCircle, CheckCircle,
  Eye, FileText, Calendar, Users, Search, Filter
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const pagoSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido'),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  alumnoId: z.string().optional()
});

const procesarPagoSchema = z.object({
  metodoPago: z.enum(['efectivo', 'transferencia', 'deposito', 'tarjeta']),
  referencia: z.string().optional(),
  comprobante: z.any().optional()
});

type PagoForm = z.infer<typeof pagoSchema>;
type ProcesarPagoForm = z.infer<typeof procesarPagoSchema>;

const Finanzas: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isAlumno, isMaestro } = useUserRole();
  const { payments, summary } = useStudentPayments();
  const { payroll } = useTeacherPayroll();
  const { data } = useData();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isProcessPaymentOpen, setIsProcessPaymentOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PagoForm>({
    resolver: zodResolver(pagoSchema)
  });

  const {
    register: registerPago,
    handleSubmit: handleSubmitPago,
    formState: { errors: errorsPago },
    reset: resetPago
  } = useForm<ProcesarPagoForm>({
    resolver: zodResolver(procesarPagoSchema)
  });

  const onSubmitPayment = async (formData: PagoForm) => {
    console.log('Nuevo pago:', formData);
    reset();
    setIsCreatePaymentOpen(false);
  };

  const onProcessPayment = async (formData: ProcesarPagoForm) => {
    console.log('Procesar pago:', formData);
    resetPago();
    setIsProcessPaymentOpen(false);
    setSelectedPayment(null);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Datos para admin - todos los pagos
  const allPayments = data?.pagos || [];
  const allNominas = data?.nominas || [];
  
  // Estadísticas generales para admin
  const totalIngresos = allPayments.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0);
  const pagosPendientes = allPayments.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0);
  const pagosVencidos = allPayments.filter(p => p.estado === 'vencido').reduce((sum, p) => sum + p.monto, 0);
  const nominasPendientes = allNominas.filter(n => n.estado === 'pendiente').reduce((sum, n) => sum + n.salarioNeto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Gestión Financiera' : 
             isMaestro ? 'Mi Nómina' : 
             'Mis Finanzas'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Control financiero integral del instituto' :
             isMaestro ? 'Historial de pagos y nóminas' :
             'Estado de cuenta y pagos'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <Dialog open={isCreatePaymentOpen} onOpenChange={setIsCreatePaymentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                  <DialogDescription>
                    Crear un nuevo registro de pago para un estudiante
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alumnoId">Estudiante</Label>
                    <Select onValueChange={(value) => register('alumnoId').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.users.filter(u => u.rol === 'alumno' && u.activo).map(alumno => (
                          <SelectItem key={alumno.id} value={alumno.id}>
                            {alumno.nombre} {alumno.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto">Concepto</Label>
                    <Input
                      id="concepto"
                      placeholder="Matrícula Semestre 2024-2"
                      {...register('concepto')}
                    />
                    {errors.concepto && (
                      <p className="text-sm text-destructive">{errors.concepto.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monto">Monto ($)</Label>
                      <Input
                        id="monto"
                        type="number"
                        step="0.01"
                        {...register('monto', { valueAsNumber: true })}
                      />
                      {errors.monto && (
                        <p className="text-sm text-destructive">{errors.monto.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaVencimiento">Fecha Vencimiento</Label>
                      <Input
                        id="fechaVencimiento"
                        type="date"
                        {...register('fechaVencimiento')}
                      />
                      {errors.fechaVencimiento && (
                        <p className="text-sm text-destructive">{errors.fechaVencimiento.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreatePaymentOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar Pago</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalIngresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pagosPendientes.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {allPayments.filter(p => p.estado === 'pendiente').length} pagos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${pagosVencidos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {allPayments.filter(p => p.estado === 'vencido').length} pagos vencidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nóminas Pendientes</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${nominasPendientes.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Por pagar este mes
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isAlumno && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.pagados.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Este período académico
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.pendientes.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Por pagar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${summary.vencidos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total General</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Carga académica total
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isMaestro && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salario Actual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payroll.length > 0 ? payroll[payroll.length - 1]?.salarioNeto.toFixed(2) || '0.00' : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mes actual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Año</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payroll.reduce((sum, p) => sum + p.salarioNeto, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Acumulado 2024
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payroll.filter(p => p.estado === 'pendiente').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por procesar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payroll.filter(p => p.fechaPago).length > 0 ? 
                    new Date(payroll.filter(p => p.fechaPago)[payroll.filter(p => p.fechaPago).length - 1].fechaPago!).toLocaleDateString() :
                    'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Fecha último pago
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="payments">
            {isAdmin ? 'Todos los Pagos' : isAlumno ? 'Mis Pagos' : 'Mi Nómina'}
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="payroll">Nóminas</TabsTrigger>}
          {isAdmin && <TabsTrigger value="reports">Reportes</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                Últimas actividades financieras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isAlumno ? payments : isAdmin ? allPayments.slice(0, 5) : payroll).slice(0, 5).map((item: any, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        item.estado === 'pagado' ? 'bg-green-100 text-green-600' :
                        item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {item.estado === 'pagado' ? <CheckCircle className="h-4 w-4" /> :
                         item.estado === 'pendiente' ? <Clock className="h-4 w-4" /> :
                         <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.concepto || `Nómina ${item.periodo}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.fechaPago || item.fechaVencimiento ?
                            new Date(item.fechaPago || item.fechaVencimiento).toLocaleDateString() :
                            'Sin fecha'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.monto || item.salarioNeto || 0).toFixed(2)}
                      </p>
                      <Badge variant="outline" className={getPaymentStatusColor(item.estado)}>
                        {item.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {isAlumno && summary.vencidos > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tienes pagos vencidos por un total de ${summary.vencidos.toFixed(2)}. 
                Te recomendamos regularizar tu situación lo antes posible.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {isAdmin ? 'Gestión de Pagos' : 
                 isAlumno ? 'Mis Pagos' : 'Mi Historial de Nóminas'}
              </CardTitle>
              <CardDescription>
                {isAdmin ? 'Administra todos los pagos del instituto' :
                 isAlumno ? 'Estado de cuenta detallado' :
                 'Historial completo de pagos recibidos'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isAlumno ? payments : isMaestro ? payroll : allPayments).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {item.concepto || `Nómina ${item.periodo}`}
                          </p>
                          {isAdmin && item.alumnoId && (
                            <p className="text-sm text-muted-foreground">
                              {data?.users.find(u => u.id === item.alumnoId)?.nombre} {' '}
                              {data?.users.find(u => u.id === item.alumnoId)?.apellido}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(item.monto || item.salarioNeto || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.fechaPago || item.fechaVencimiento ?
                          new Date(item.fechaPago || item.fechaVencimiento).toLocaleDateString() :
                          'Sin fecha'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPaymentStatusColor(item.estado)}>
                          {item.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {isAlumno && item.estado === 'pendiente' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(item);
                                setIsProcessPaymentOpen(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          {item.comprobante && (
                            <Button variant="outline" size="sm">
                              <Receipt className="h-4 w-4 mr-1" />
                              Comprobante
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Nóminas</CardTitle>
                <CardDescription>
                  Control de pagos a maestros y personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Maestro</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Salario Base</TableHead>
                      <TableHead>Salario Neto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allNominas.map((nomina) => {
                      const maestro = data?.users.find(u => u.id === nomina.maestroId);
                      return (
                        <TableRow key={nomina.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {maestro?.nombre} {maestro?.apellido}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {maestro?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{nomina.periodo}</TableCell>
                          <TableCell>${nomina.salarioBase.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">
                            ${nomina.salarioNeto.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPaymentStatusColor(nomina.estado)}>
                              {nomina.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              {nomina.estado === 'pendiente' && (
                                <Button size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes Financieros</CardTitle>
                  <CardDescription>
                    Genera reportes personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Reporte de Ingresos Mensual
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Estado de Cuentas por Cobrar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Reporte de Nóminas
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Flujo de Caja
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis Financiero</CardTitle>
                  <CardDescription>
                    Métricas clave del período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasa de cobro:</span>
                    <span className="font-medium">
                      {allPayments.length > 0 ? 
                        Math.round((allPayments.filter(p => p.estado === 'pagado').length / allPayments.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagos vencidos:</span>
                    <span className="font-medium text-red-600">
                      {allPayments.filter(p => p.estado === 'vencido').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promedio de pago:</span>
                    <span className="font-medium">
                      ${allPayments.length > 0 ? 
                        (allPayments.reduce((sum, p) => sum + p.monto, 0) / allPayments.length).toFixed(2) : 
                        '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Process Payment Dialog */}
      {selectedPayment && (
        <Dialog open={isProcessPaymentOpen} onOpenChange={setIsProcessPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Procesar Pago</DialogTitle>
              <DialogDescription>
                Completa la información para procesar tu pago de: {selectedPayment.concepto}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPago(onProcessPayment)} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Monto a pagar: ${selectedPayment.monto.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Vence: {new Date(selectedPayment.fechaVencimiento).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <Select onValueChange={(value) => registerPago('metodoPago').onChange({ target: { value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
                {errorsPago.metodoPago && (
                  <p className="text-sm text-destructive">{errorsPago.metodoPago.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia (opcional)</Label>
                <Input
                  id="referencia"
                  placeholder="Número de referencia o transacción"
                  {...registerPago('referencia')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprobante">Comprobante (opcional)</Label>
                <Input
                  id="comprobante"
                  type="file"
                  accept="image/*,application/pdf"
                  {...registerPago('comprobante')}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsProcessPaymentOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Procesar Pago</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Finanzas;
