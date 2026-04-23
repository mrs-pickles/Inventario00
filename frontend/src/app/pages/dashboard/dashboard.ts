import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { Chart, registerables, type Chart as ChartT } from 'chart.js';

import {
  EstadisticasService,
  type EntradasSalidasResp,
  type GananciasMesResp,
  type TopProducto,
} from '../../services/estadisticas.service';
import { ProductoService } from '../../services/producto.service';

Chart.register(...registerables);

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const MESES_LARGO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export type ResumenKpi = {
  totalProductos: number;
  productosAgotados: number;
  devoluciones: number;
  pedidosEnCamino: number;
  valorInventarioBs: number;
};

const vacioResumen: ResumenKpi = {
  totalProductos: 0,
  productosAgotados: 0,
  devoluciones: 0,
  pedidosEnCamino: 0,
  valorInventarioBs: 0,
};

/** Conjunto de cifras demo alineadas entre KPI, dona, series y top (catálogo 5 familias = 44 ítems). */
const USAR_DEMO_DASHBOARD = true;

const DEMO_CATEGORIAS: { categoria: string; total: number }[] = [
  { categoria: 'DULCES & FRUTALES', total: 12 },
  { categoria: 'FLORALES & SUAVES', total: 5 },
  { categoria: 'FRESCOS & NATURALES', total: 9 },
  { categoria: 'INTENSOS & ESPECIALES', total: 13 },
  { categoria: 'DISEÑOS & EDICIONES ESPECIALES', total: 5 },
];

function demoResumenKpi(anio: number): ResumenKpi {
  const total = DEMO_CATEGORIAS.reduce((s, c) => s + c.total, 0);
  const m = 1 + (anio - 2025) * 0.02;
  return {
    totalProductos: total,
    productosAgotados: Math.max(0, Math.round(4 * m)),
    devoluciones: 2,
    pedidosEnCamino: 3,
    valorInventarioBs: Math.round(98_750 * m),
  };
}

function demoEntradasSalidas(y: number): EntradasSalidasResp {
  const m = 1 + (y - 2025) * 0.03;
  const r = (v: number) => Math.max(1, Math.round(v * m));
  const ent = [110, 95, 128, 102, 88, 140, 125, 98, 115, 132, 108, 121].map(
    r,
  );
  const sal = [98, 118, 105, 125, 92, 135, 112, 108, 128, 105, 98, 142].map(
    r,
  );
  return { year: y, entradas: ent, salidas: sal };
}

function demoGanancias(y: number): GananciasMesResp {
  const m = 1 + (y - 2025) * 0.03;
  const base = [18.2, 19.1, 17.5, 20.3, 19.8, 21.2, 18.9, 20.1, 19.4, 18.6, 19.0, 20.5];
  const k = 1000;
  return {
    year: y,
    porMes: base.map((b, i) => ({
      mes: i + 1,
      monto: Math.round(b * m * k),
    })),
  };
}

function demoTopVendidos(): TopProducto[] {
  return [
    { nombre: 'Cereza / Wild Cherry', cantidad: 128 },
    { nombre: 'Royal Pine', cantidad: 115 },
    { nombre: 'New Car', cantidad: 98 },
    { nombre: 'Ice Black', cantidad: 92 },
    { nombre: 'Peachy Peach / Peach Ginger Spritz', cantidad: 86 },
    { nombre: 'Cherry Blossom Honey', cantidad: 78 },
    { nombre: 'True North', cantidad: 72 },
    { nombre: 'Fresa', cantidad: 68 },
    { nombre: 'Bayside Breeze', cantidad: 61 },
    { nombre: 'Lavanda', cantidad: 55 },
    { nombre: 'Gold', cantidad: 48 },
    { nombre: 'Barco Turquesa', cantidad: 42 },
  ];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private estadisticas = inject(EstadisticasService);
  private producto = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('lineCanvas') private lineCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('catCanvas') private catCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ganaCanvas') private ganaCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('carouselTrack') private carouselTrack?: ElementRef<HTMLDivElement>;

  anio = new Date().getFullYear();
  anios: number[] = [];
  cargando = true;
  errorMsg: string | null = null;

  resumen: ResumenKpi = { ...vacioResumen };
  topVendidos: TopProducto[] = [];

  private chartLine: ChartT | null = null;
  private chartCategoria: ChartT | null = null;
  private chartGan: ChartT | null = null;

  private coloresCategoria = [
    'rgba(109, 133, 112, 0.75)',
    'rgba(162, 138, 105, 0.7)',
    'rgba(90, 111, 93, 0.65)',
    'rgba(180, 150, 120, 0.6)',
    'rgba(120, 140, 115, 0.7)',
    'rgba(200, 175, 140, 0.55)',
    'rgba(75, 95, 80, 0.65)',
    'rgba(140, 125, 100, 0.6)',
  ];

  constructor() {
    const a = new Date().getFullYear();
    this.anios = Array.from({ length: 6 }, (_, i) => a - i);
  }

  ngOnInit() {
    this.refrescar();
  }

  ngOnDestroy() {
    this.destruirGraficos();
  }

  onAnioChange() {
    this.refrescar();
  }

  scrollCarousel(dir: number) {
    this.carouselTrack?.nativeElement.scrollBy({
      left: dir * 200,
      behavior: 'smooth',
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(n);
  }

  iniciales(nombre: string): string {
    const s = (nombre || '?').trim();
    return s ? s[0]!.toUpperCase() : '?';
  }

  private destruirGraficos() {
    this.chartLine?.destroy();
    this.chartLine = null;
    this.chartCategoria?.destroy();
    this.chartCategoria = null;
    this.chartGan?.destroy();
    this.chartGan = null;
  }

  refrescar() {
    this.destruirGraficos();
    this.cargando = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    const y = this.anio;
    const vacioE: EntradasSalidasResp = {
      year: y,
      entradas: Array(12).fill(0),
      salidas: Array(12).fill(0),
    };
    const vacioG: GananciasMesResp = {
      year: y,
      porMes: Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, monto: 0 })),
    };

    forkJoin({
      resumen: this.producto
        .getResumenInventario()
        .pipe(catchError(() => of(vacioResumen))),
      entradasSalidas: this.estadisticas
        .getEntradasSalidasMes(this.anio)
        .pipe(catchError(() => of(vacioE))),
      ganancias: this.estadisticas
        .getGananciasMes(this.anio)
        .pipe(catchError(() => of(vacioG))),
      categoria: this.producto
        .getConteoPorCategoria()
        .pipe(catchError(() => of([] as { categoria: string; total: number }[]))),
      top: this.estadisticas
        .getTopProductosVendidos(this.anio, 12)
        .pipe(catchError(() => of<TopProducto[]>([]))),
    }).subscribe({
      next: ({ resumen, entradasSalidas, ganancias, categoria, top }) => {
        if (USAR_DEMO_DASHBOARD) {
          this.resumen = demoResumenKpi(this.anio);
          this.topVendidos = demoTopVendidos();
          this.cargando = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.destruirGraficos();
            this.crearGraficoEntradasSalidas(demoEntradasSalidas(this.anio));
            this.crearGraficoCategoria(DEMO_CATEGORIAS);
            this.crearGraficoGanancias(demoGanancias(this.anio));
          }, 0);
          return;
        }
        this.resumen = { ...vacioResumen, ...resumen };
        this.topVendidos = top;
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.destruirGraficos();
          this.crearGraficoEntradasSalidas(entradasSalidas);
          this.crearGraficoCategoria(categoria);
          this.crearGraficoGanancias(ganancias);
        }, 0);
      },
      error: (e) => {
        this.cargando = false;
        this.errorMsg =
          e?.error?.message ||
          (typeof e?.error === 'string' ? e.error : null) ||
          (e?.status
            ? `Error ${e.status} al conectar con el servidor`
            : 'No se pudieron cargar las estadísticas.');
        this.destruirGraficos();
        this.cdr.markForCheck();
      },
    });
  }

  private crearGraficoCategoria(
    rows: { categoria: string; total: number }[],
  ) {
    const el = this.catCanvas?.nativeElement;
    if (!el) return;
    const labels = rows.length
      ? rows.map((r) => r.categoria)
      : ['(sin productos)'];
    const data = rows.length
      ? rows.map((r) => r.total)
      : [0];
    const bg = rows.length
      ? data.map(
          (_, i) => this.coloresCategoria[i % this.coloresCategoria.length],
        )
      : ['rgba(0,0,0,0.1)'];
    this.chartCategoria = new Chart(el, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bg,
            borderColor: 'rgba(255, 255, 255, 0.85)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          title: {
            display: true,
            text: 'Categorías',
            font: { size: 15, weight: 'bold' },
            color: '#2c2b28',
          },
        },
      },
    });
  }

  private crearGraficoEntradasSalidas(resp: EntradasSalidasResp) {
    const el = this.lineCanvas?.nativeElement;
    if (!el) return;
    const ent = resp.entradas?.length === 12 ? resp.entradas : Array(12).fill(0);
    const sal = resp.salidas?.length === 12 ? resp.salidas : Array(12).fill(0);
    this.chartLine = new Chart(el, {
      type: 'line',
      data: {
        labels: MESES,
        datasets: [
          {
            label: 'Entradas',
            data: ent,
            borderColor: 'rgb(46, 125, 50)',
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: 'Salidas',
            data: sal,
            borderColor: 'rgb(198, 40, 40)',
            backgroundColor: 'rgba(198, 40, 40, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          title: {
            display: true,
            text: 'Entradas y salidas (unidades por mes)',
            font: { size: 15, weight: 'bold' },
            color: '#2c2b28',
          },
          legend: { display: true, position: 'top' },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: true } },
        },
      },
    });
  }

  private crearGraficoGanancias(resp: GananciasMesResp) {
    const el = this.ganaCanvas?.nativeElement;
    if (!el) return;
    const datos = resp.porMes?.length
      ? MESES_LARGO.map(
          (_, i) => resp.porMes.find((p) => p.mes === i + 1)?.monto ?? 0,
        )
      : Array(12).fill(0);
    this.chartGan = new Chart(el, {
      type: 'bar',
      data: {
        labels: MESES_LARGO,
        datasets: [
          {
            label: 'Bs (ventas aprox. por salidas)',
            data: datos,
            backgroundColor: 'rgba(200, 175, 130, 0.55)',
            borderColor: 'rgba(140, 120, 85, 0.9)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Ganancias (montos aprox. por mes)',
            font: { size: 15, weight: 'bold' },
            color: '#2c2b28',
          },
          legend: { display: false },
        },
        scales: {
          x: { beginAtZero: true, ticks: { maxTicksLimit: 8 } },
          y: { ticks: { autoSkip: true, maxRotation: 0 } },
        },
      },
    });
  }
}
