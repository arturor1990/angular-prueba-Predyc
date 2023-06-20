import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/excel.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private excelService: ExcelService){}
  title = 'angular-prueba-Predyc';


  productos_categoria;
  categorias;
  elemento_drageado= null;
  cantidad_cambios = 0;
  productos;
  
  

onDrag(data) {
  this.elemento_drageado = data; // gaurdo elemento que se drageo
}

onDrop(data) { // al soltar el drop

  if(data !=this.elemento_drageado.Categoría  && this.elemento_drageado ){
    let productos_categoria_filter = this.productos_categoria.filter(seriesElement => seriesElement.categoria == data); // filtro del arreglo de productos lo de la categoria destino
    let origen_producto = this.elemento_drageado.Categoría;
    this.elemento_drageado.Categoría = data;
    productos_categoria_filter[0].data.push(this.elemento_drageado); // inserto el producto drageado
    let productos_categoria_filter_origen = this.productos_categoria.filter(seriesElement => seriesElement.categoria == origen_producto); // filtro del arreglo de productos lo de la categoria origen
    console.log(productos_categoria_filter_origen[0].data);
    productos_categoria_filter_origen[0].data = productos_categoria_filter_origen[0].data.filter(seriesElement => seriesElement.ID != this.elemento_drageado.ID); // retiro el elemento del arreglo origen
    this.elemento_drageado = null
    this.cantidad_cambios++;
  }

}

onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
}
onDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
}

  onFileChange(ev: any) { // evento que se distapar al seleccionar un archivo
    let workBook : any= null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => { // se lee el archivo excel
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial : any, name : any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});      
      jsonData = jsonData[Object.keys(jsonData)[0]]; // se filtra el json de solo la pagina 1 cuyo nombre viene como el key del objeto
      this.productos = jsonData;
      let categorias: any[]=[]
      let productos_categoria: any[]=[];
      jsonData.forEach((producto: any) => {
        categorias.push(producto.Categoría) // se obtienen las categroais en un arreglo
      })
      categorias = categorias.filter((item, i, ar) => ar.indexOf(item) === i); // se eliminan duplicados
      this.categorias=categorias;
      categorias.forEach((categoria: any) => { // recorro las categorioas 
        let productos_categoria_filter = jsonData.filter(seriesElement => seriesElement.Categoría == categoria);
        let producto = {
          categoria:categoria,
          data:productos_categoria_filter
        }
        productos_categoria.push(producto); // se gemera un arreglo de arreglos de categorias y sus productos
      });
      this.productos_categoria = productos_categoria;
    }
    reader.readAsBinaryString(file);
  }

  exportexcel(){
    this.excelService.exportToExcel(this.productos,'BDD prueba de capacidades_editado');

  }


}


