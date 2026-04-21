import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  private categoriaService = inject(CategoriaService);

  categorias: any[] = [];

  nuevaCategoria = {
    id: 0,
    nombre: ''
  };

  editando = false;

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.getAll().subscribe((data: any) => {
      this.categorias = data;
    });
  }

  guardarCategoria() {

    if (!this.nuevaCategoria.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    const data = {
      nombre: this.nuevaCategoria.nombre
    };

    if (this.editando) {

      this.categoriaService.update(this.nuevaCategoria.id, data)
        .subscribe({
          next: () => {
            this.resetFormulario();
            this.cargarCategorias(); // 👈 refresca lista
          },
          error: (err) => {
            alert(err.error?.message || 'Error al actualizar');
          }
        });

    } else {

      this.categoriaService.create(data)
        .subscribe({
          next: () => {
            this.resetFormulario();
            this.cargarCategorias(); // 👈 refresca lista
          },
          error: (err) => {
            alert(err.error?.message || 'Error al guardar');
          }
        });
    }
  }

  editarCategoria(categoria: any) {
    this.nuevaCategoria = {
      id: categoria.id,
      nombre: categoria.nombre
    };
    this.editando = true;
  }

  eliminarCategoria(id: number) {
    this.categoriaService.delete(id).subscribe(() => {
      this.cargarCategorias();
    });
  }

  resetFormulario() {
    this.nuevaCategoria = {
      id: 0,
      nombre: ''
    };
    this.editando = false;
  }
}