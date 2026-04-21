import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  /** UI theme classes live in productos.css */
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  productos: any[] = [];
  categorias: any[] = [];

  nuevoProducto = {
    id: 0,
    nombre: '',
    precio: 0,
    stock: 0,
    categoriaId: null as number | null,
  };

  editando = false;

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.getAll().subscribe((data: any) => {
      this.productos = data;
    });
  }

  cargarCategorias() {
    this.categoriaService.getAll().subscribe((data: any) => {
      this.categorias = data;
    });
  }

  private buildPayload() {
    return {
      nombre: this.nuevoProducto.nombre.trim(),
      precio: Number(this.nuevoProducto.precio),
      stock: Number(this.nuevoProducto.stock),
      categoriaId: Number(this.nuevoProducto.categoriaId),
    };
  }

  guardarProducto() {
    if (!this.nuevoProducto.nombre.trim()) {
      return;
    }
    if (this.nuevoProducto.categoriaId == null || this.nuevoProducto.categoriaId === 0) {
      return;
    }

    const data = this.buildPayload();

    if (this.editando) {
      this.productoService.update(this.nuevoProducto.id, data).subscribe({
        next: () => {
          this.cargarProductos();
          this.resetFormulario();
        },
        error: (err) => console.error('ERROR UPDATE', err),
      });
    } else {
      this.productoService.create(data).subscribe({
        next: () => {
          this.cargarProductos();
          this.resetFormulario();
        },
        error: (err) => console.error('ERROR CREATE', err),
      });
    }
  }

  editarProducto(p: any) {
    this.nuevoProducto = {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoria?.id ?? null,
    };
    this.editando = true;
  }

  eliminarProducto(id: number) {
    this.productoService.delete(id).subscribe(() => {
      this.productos = this.productos.filter((p) => p.id !== id);
    });
  }

  resetFormulario() {
    this.nuevoProducto = {
      id: 0,
      nombre: '',
      precio: 0,
      stock: 0,
      categoriaId: null,
    };
    this.editando = false;
  }
}
