import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  // Información de contacto
  contacto = {
    email: 'info@autozone.com.bo',
    telefono: '+591 4 1234567',
    whatsapp: '+591 71234567'
  };

  // Redes sociales
  redesSociales = [
    { nombre: 'Facebook', icono: 'pi pi-facebook', url: '#' },
    { nombre: 'Instagram', icono: 'pi pi-instagram', url: '#' },
    { nombre: 'WhatsApp', icono: 'pi pi-whatsapp', url: '#' }
  ];

  // Sucursales
  sucursales = [
    {
      nombre: 'Vinto - Sucursal 1',
      direccion: 'Av. Principal N° 123, Vinto',
      ciudad: 'Vinto',
      horario: 'Lun-Vie: 8:00 - 18:00 | Sáb: 8:00 - 13:00'
    },
    {
      nombre: 'Vinto - Sucursal 2',
      direccion: 'Calle Bolívar N° 456, Vinto',
      ciudad: 'Vinto',
      horario: 'Lun-Vie: 8:00 - 18:00 | Sáb: 8:00 - 13:00'
    },
    {
      nombre: 'Colcapirhua - Sucursal 1',
      direccion: 'Av. Blanco Galindo Km 7, Colcapirhua',
      ciudad: 'Colcapirhua',
      horario: 'Lun-Vie: 8:00 - 18:00 | Sáb: 8:00 - 13:00'
    },
    {
      nombre: 'Colcapirhua - Sucursal 2',
      direccion: 'Calle Sucre N° 789, Colcapirhua',
      ciudad: 'Colcapirhua',
      horario: 'Lun-Vie: 8:00 - 18:00 | Sáb: 8:00 - 13:00'
    }
  ];

  // Beneficios
  beneficios = [
    
    
    {
      titulo: 'Atención Técnica Rápida',
      descripcion: 'Personal capacitado para asesorarte en la elección del repuesto correcto.',
      icono: 'pi pi-headphones'
    },
    
  ];

  // Categorías de productos
  categorias = [
    { nombre: 'Retenes', icono: 'pi pi-circle-on', descripcion: 'Retenes de sellado y estanqueidad' },
    { nombre: 'Rodamientos', icono: 'pi pi-cog', descripcion: 'Rodamientos para todo tipo de vehículo' },
    { nombre: 'Carboncitos', icono: 'pi pi-bolt', descripcion: 'Carbones para motor de arranque' },
    { nombre: 'Filtros', icono: 'pi pi-filter', descripcion: 'Filtros de aceite, aire y combustible' },
    { nombre: 'Parte Eléctrica', icono: 'pi pi-flash', descripcion: 'Alternadores, encendido y más' },
    { nombre: 'Accesorios', icono: 'pi pi-car', descripcion: 'Alfombrillas, antenas, fundas y más' },
    { nombre: 'Lubricantes', icono: 'pi pi-oil', descripcion: 'Aceites y grasas especializadas' },
    { nombre: 'Neumáticos', icono: 'pi pi-circle', descripcion: 'Llantas para todas las medidas' }
  ];

  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}