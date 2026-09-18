import type { ElementoMadera } from '../types';

export interface PlantillaTarima {
  id: string;
  nombre: string;
  categoria: 'Nueva' | 'Reciclada' | 'Híbrida' | 'Caja / Huacal';
  empresaCliente?: string;
  precioSugeridoBase: number;
  costoEstufaHt: number;
  costoSaque: number;
  costoCepillado: number;
  costoTransporte: number;
  elementos: ElementoMadera[];
}

export const PLANTILLAS_TARIMAS: PlantillaTarima[] = [
  {
    id: 'tarima-barrote-estandar-4048',
    nombre: 'Tarima Barrote con Saque 40" x 48" (Estándar 1era)',
    categoria: 'Nueva',
    empresaCliente: 'General / Estándar',
    precioSugeridoBase: 380,
    costoEstufaHt: 20,
    costoSaque: 5,
    costoCepillado: 5,
    costoTransporte: 15,
    elementos: [
      { nombre_elemento: 'Tabla superior', ancho_in: 3.5, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 5, precio_pie_tabla: 14 },
      { nombre_elemento: 'Tabla Inferior', ancho_in: 4.0, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 4, precio_pie_tabla: 14 },
      { nombre_elemento: 'Barrote c/saque', ancho_in: 3.5, grueso_in: 1.5, largo_in: 48, piezas_por_tarima: 3, precio_pie_tabla: 14 },
    ]
  },
  {
    id: 'tarima-humagsa-915-555',
    nombre: 'Tarima de Barrote 91.5" x 55.5" (Especial)',
    categoria: 'Nueva',
    empresaCliente: 'Humagsa',
    precioSugeridoBase: 470,
    costoEstufaHt: 20,
    costoSaque: 0,
    costoCepillado: 0,
    costoTransporte: 30,
    elementos: [
      { nombre_elemento: 'Tabla superior', ancho_in: 3.5, grueso_in: 0.625, largo_in: 91.5, piezas_por_tarima: 8, precio_pie_tabla: 16 },
      { nombre_elemento: 'Tabla inferior', ancho_in: 3.5, grueso_in: 0.625, largo_in: 91.5, piezas_por_tarima: 3, precio_pie_tabla: 16 },
      { nombre_elemento: 'Barrote', ancho_in: 3.5, grueso_in: 1.25, largo_in: 55.5, piezas_por_tarima: 3, precio_pie_tabla: 16 },
    ]
  },
  {
    id: 'tarima-tacon-texen-120x100',
    nombre: 'Tarima de Tacón Perimetral 1.20m x 1.00m',
    categoria: 'Híbrida',
    empresaCliente: 'Texen',
    precioSugeridoBase: 240,
    costoEstufaHt: 15,
    costoSaque: 0,
    costoCepillado: 0,
    costoTransporte: 10,
    elementos: [
      { nombre_elemento: 'Tabla superior (Reciclada)', ancho_in: 3.5, grueso_in: 0.625, largo_in: 40, piezas_por_tarima: 8, precio_pie_tabla: 3 },
      { nombre_elemento: 'Tabla inferior', ancho_in: 3.5, grueso_in: 0.625, largo_in: 40, piezas_por_tarima: 5, precio_pie_tabla: 3 },
      { nombre_elemento: 'Tabla puente', ancho_in: 3.5, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 3, precio_pie_tabla: 14.5 },
      { nombre_elemento: 'Tacón chico', ancho_in: 3.5, grueso_in: 3.5, largo_in: 3.5, piezas_por_tarima: 3, precio_pie_tabla: 14.5 },
      { nombre_elemento: 'Tacón grande', ancho_in: 3.5, grueso_in: 3.5, largo_in: 5.5, piezas_por_tarima: 6, precio_pie_tabla: 14.5 },
    ]
  },
  {
    id: 'tarima-tacon-reciclada-4048',
    nombre: 'Tarima de Tacón Reciclada 40" x 48" (1era)',
    categoria: 'Reciclada',
    empresaCliente: 'General Reciclado',
    precioSugeridoBase: 230,
    costoEstufaHt: 15,
    costoSaque: 0,
    costoCepillado: 0,
    costoTransporte: 50,
    elementos: [
      { nombre_elemento: 'Tacón grande', ancho_in: 3.5, grueso_in: 5.0, largo_in: 3.5, piezas_por_tarima: 6, precio_pie_tabla: 10 },
      { nombre_elemento: 'Tacón chico', ancho_in: 3.5, grueso_in: 3.5, largo_in: 3.5, piezas_por_tarima: 3, precio_pie_tabla: 10 },
      { nombre_elemento: 'Tabla puente', ancho_in: 3.5, grueso_in: 0.75, largo_in: 48, piezas_por_tarima: 3, precio_pie_tabla: 10 },
      { nombre_elemento: 'Tabla superior (Reciclada)', ancho_in: 3.5, grueso_in: 0.75, largo_in: 40, piezas_por_tarima: 8, precio_pie_tabla: 6 },
      { nombre_elemento: 'Tabla arrastre (Reciclada)', ancho_in: 3.5, grueso_in: 0.75, largo_in: 40, piezas_por_tarima: 5, precio_pie_tabla: 6 },
    ]
  },
  {
    id: 'caja-madera-sypris-5559',
    nombre: 'Caja Industrial de Madera 55" x 59"',
    categoria: 'Caja / Huacal',
    empresaCliente: 'Sypris',
    precioSugeridoBase: 5390,
    costoEstufaHt: 0,
    costoSaque: 0,
    costoCepillado: 0,
    costoTransporte: 250,
    elementos: [
      { nombre_elemento: 'Polines', ancho_in: 5.0, grueso_in: 3.5, largo_in: 5, piezas_por_tarima: 16, precio_pie_tabla: 16 },
      { nombre_elemento: 'Tiras laterales', ancho_in: 2.0, grueso_in: 2.0, largo_in: 55, piezas_por_tarima: 8, precio_pie_tabla: 16 },
      { nombre_elemento: 'Tiras laterales corta', ancho_in: 2.0, grueso_in: 2.0, largo_in: 29, piezas_por_tarima: 12, precio_pie_tabla: 14.5 },
      { nombre_elemento: 'Tiras cubierta', ancho_in: 5.0, grueso_in: 0.75, largo_in: 55, piezas_por_tarima: 12, precio_pie_tabla: 16 },
    ]
  },
  {
    id: 'huacal-madera-humagsa-10080',
    nombre: 'Huacal de Madera 100 x 80 x 75 cm',
    categoria: 'Caja / Huacal',
    empresaCliente: 'Humagsa',
    precioSugeridoBase: 1050,
    costoEstufaHt: 0,
    costoSaque: 0,
    costoCepillado: 0,
    costoTransporte: 20,
    elementos: [
      { nombre_elemento: 'Tiras de madera', ancho_in: 3.5, grueso_in: 0.75, largo_in: 96, piezas_por_tarima: 12, precio_pie_tabla: 16 },
    ]
  }
];