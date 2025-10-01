// Categorías padre para análisis y gráficos
export enum CategoryParent {
  GASTOS_ESENCIALES = "GASTOS_ESENCIALES",
  GASTOS_PERSONALES = "GASTOS_PERSONALES",
  FINANCIEROS = "FINANCIEROS",
  EDUCACION = "EDUCACION",
  OTROS = "OTROS"
}

// 16 categorías específicas
export enum Category {
  // GASTOS_ESENCIALES
  VIVIENDA = "vivienda",
  SERVICIOS_BASICOS = "servicios_basicos",
  ALIMENTACION = "alimentacion",
  TRANSPORTE = "transporte",
  SALUD = "salud",

  // GASTOS_PERSONALES
  ENTRETENIMIENTO = "entretenimiento",
  STREAMING_SUSCRIPCIONES = "streaming_suscripciones",
  MASCOTAS = "mascotas",
  CUIDADO_PERSONAL = "cuidado_personal",

  // FINANCIEROS
  DEUDAS_PRESTAMOS = "deudas_prestamos",
  AHORRO_INVERSION = "ahorro_inversion",
  SEGUROS = "seguros",

  // EDUCACION
  EDUCACION_DESARROLLO = "educacion_desarrollo",

  // OTROS
  REGALOS_CELEBRACIONES = "regalos_celebraciones",
  VIAJES_VACACIONES = "viajes_vacaciones",
  IMPREVISTOS = "imprevistos"
}

// Mapeo de categorías a sus padres
export const CATEGORY_PARENT_MAP: Record<Category, CategoryParent> = {
  [Category.VIVIENDA]: CategoryParent.GASTOS_ESENCIALES,
  [Category.SERVICIOS_BASICOS]: CategoryParent.GASTOS_ESENCIALES,
  [Category.ALIMENTACION]: CategoryParent.GASTOS_ESENCIALES,
  [Category.TRANSPORTE]: CategoryParent.GASTOS_ESENCIALES,
  [Category.SALUD]: CategoryParent.GASTOS_ESENCIALES,

  [Category.ENTRETENIMIENTO]: CategoryParent.GASTOS_PERSONALES,
  [Category.STREAMING_SUSCRIPCIONES]: CategoryParent.GASTOS_PERSONALES,
  [Category.MASCOTAS]: CategoryParent.GASTOS_PERSONALES,
  [Category.CUIDADO_PERSONAL]: CategoryParent.GASTOS_PERSONALES,

  [Category.DEUDAS_PRESTAMOS]: CategoryParent.FINANCIEROS,
  [Category.AHORRO_INVERSION]: CategoryParent.FINANCIEROS,
  [Category.SEGUROS]: CategoryParent.FINANCIEROS,

  [Category.EDUCACION_DESARROLLO]: CategoryParent.EDUCACION,

  [Category.REGALOS_CELEBRACIONES]: CategoryParent.OTROS,
  [Category.VIAJES_VACACIONES]: CategoryParent.OTROS,
  [Category.IMPREVISTOS]: CategoryParent.OTROS,
};

// Descripciones amigables para cada categoría
export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.VIVIENDA]: "Vivienda",
  [Category.SERVICIOS_BASICOS]: "Servicios Básicos",
  [Category.ALIMENTACION]: "Alimentación",
  [Category.TRANSPORTE]: "Transporte",
  [Category.SALUD]: "Salud",

  [Category.ENTRETENIMIENTO]: "Entretenimiento",
  [Category.STREAMING_SUSCRIPCIONES]: "Streaming y Suscripciones",
  [Category.MASCOTAS]: "Mascotas",
  [Category.CUIDADO_PERSONAL]: "Cuidado Personal",

  [Category.DEUDAS_PRESTAMOS]: "Deudas y Préstamos",
  [Category.AHORRO_INVERSION]: "Ahorro e Inversión",
  [Category.SEGUROS]: "Seguros",

  [Category.EDUCACION_DESARROLLO]: "Educación y Desarrollo",

  [Category.REGALOS_CELEBRACIONES]: "Regalos y Celebraciones",
  [Category.VIAJES_VACACIONES]: "Viajes y Vacaciones",
  [Category.IMPREVISTOS]: "Imprevistos",
};

export const CATEGORY_PARENT_LABELS: Record<CategoryParent, string> = {
  [CategoryParent.GASTOS_ESENCIALES]: "Gastos Esenciales",
  [CategoryParent.GASTOS_PERSONALES]: "Gastos Personales",
  [CategoryParent.FINANCIEROS]: "Financieros",
  [CategoryParent.EDUCACION]: "Educación",
  [CategoryParent.OTROS]: "Otros",
};

// Función auxiliar para obtener la categoría padre
export function getParentCategory(category: Category): CategoryParent {
  return CATEGORY_PARENT_MAP[category];
}

// Función para obtener el label formateado
export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

// Función para obtener el label de categoría padre
export function getParentCategoryLabel(parent: CategoryParent): string {
  return CATEGORY_PARENT_LABELS[parent];
}

// Función para agrupar categorías por padre (útil para select agrupado)
export function getCategoriesGroupedByParent(): Array<{parent: CategoryParent, label: string, categories: Array<{value: Category, label: string}>}> {
  const groups = new Map<CategoryParent, Array<{value: Category, label: string}>>();

  Object.entries(CATEGORY_PARENT_MAP).forEach(([category, parent]) => {
    if (!groups.has(parent)) {
      groups.set(parent, []);
    }
    groups.get(parent)!.push({
      value: category as Category,
      label: CATEGORY_LABELS[category as Category]
    });
  });

  return Array.from(groups.entries()).map(([parent, categories]) => ({
    parent,
    label: CATEGORY_PARENT_LABELS[parent],
    categories
  }));
}
