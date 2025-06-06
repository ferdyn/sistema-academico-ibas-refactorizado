import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  MoreHorizontal 
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  title?: string;
  searchable?: boolean;
  selectable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pageSize?: number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onRowClick?: (record: T) => void;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  title,
  searchable = true,
  selectable = false,
  filterable = false,
  exportable = false,
  pageSize = 10,
  emptyStateTitle = "No hay datos",
  emptyStateDescription = "No se encontraron registros para mostrar",
  onRowClick,
  onSelectedRowsChange,
  actions,
  className
}: DataTableProps<T>) {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Lógica de filtrado y búsqueda
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar búsqueda
    if (searchTerm && searchable) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplicar filtros
    if (filterable) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          result = result.filter(item => 
            item[key]?.toString().toLowerCase().includes(value.toLowerCase())
          );
        }
      });
    }

    // Aplicar ordenamiento
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortField, sortDirection, columns, searchable, filterable]);

  // Lógica de paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Funciones
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRow = (row: T, selected: boolean) => {
    const newSelectedRows = selected 
      ? [...selectedRows, row]
      : selectedRows.filter(selectedRow => selectedRow !== row);
    
    setSelectedRows(newSelectedRows);
    onSelectedRowsChange?.(newSelectedRows);
  };

  const handleSelectAll = (selected: boolean) => {
    const newSelectedRows = selected ? [...paginatedData] : [];
    setSelectedRows(newSelectedRows);
    onSelectedRowsChange?.(newSelectedRows);
  };

  const isRowSelected = (row: T) => selectedRows.includes(row);
  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(row => isRowSelected(row));

  const handleExport = () => {
    // Implementar lógica de exportación (CSV, Excel, etc.)
    console.log('Exportando datos...', filteredData);
  };

  if (loading) {
    return <LoadingSpinner text="Cargando datos..." />;
  }

  return (
    <Card className={cn('w-full', className)}>
      {/* Header */}
      {(title || searchable || filterable || exportable || actions) && (
        <CardHeader>
          <div className="flex flex-col space-y-4">
            {title && (
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Búsqueda y filtros */}
              <div className="flex flex-1 gap-2">
                {searchable && (
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                )}
                
                {filterable && (
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                {exportable && (
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                )}
                {actions}
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {filteredData.length === 0 ? (
          <EmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
            variant="card"
          />
        ) : (
          <>
            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectable && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className={cn(
                          column.sortable && "cursor-pointer hover:bg-muted/50",
                          column.width && `w-${column.width}`
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{column.title}</span>
                          {column.sortable && sortField === column.key && (
                            <span className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        onRowClick && "cursor-pointer hover:bg-muted/50",
                        isRowSelected(row) && "bg-muted/25"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={isRowSelected(row)}
                            onCheckedChange={(checked) => 
                              handleSelectRow(row, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render 
                            ? column.render(row[column.key], row)
                            : row[column.key]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                  {Math.min(currentPage * pageSize, filteredData.length)} de{' '}
                  {filteredData.length} registros
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
