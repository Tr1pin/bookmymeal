import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaUtcIso'
})
export class FechaUtcIsoPipe implements PipeTransform {
  transform(value: string | Date): string {
    // Si ya es un string en formato YYYY-MM-DD, devolverlo directamente
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    
    // Si es un string de fecha, crear Date object
    const fecha = new Date(value);
    
    // Extraer directamente los componentes UTC
    const year = fecha.getUTCFullYear();
    const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const day = String(fecha.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}
