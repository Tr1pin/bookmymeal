import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaUtcIso'
})
export class FechaUtcIsoPipe implements PipeTransform {
  transform(value: Date): string {
    const fecha = new Date(value);
    // Extraer directamente los componentes UTC
    const year = fecha.getUTCFullYear();
    let month = ""
    if(fecha.getMonth() == 12){
      month = "1";
    }else{
       month = String(fecha.getMonth()+1);
    }
    const day = String(fecha.getDay());
    
    return `${year}-${month}-${day}`;
  }
}
