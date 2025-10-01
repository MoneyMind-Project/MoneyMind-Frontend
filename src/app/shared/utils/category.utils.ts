import { Category} from '../enums/category.enum';

export class CategoryUtils {

  static getCategoryColor(category?: Category): string {
    if (!category) {
      return '#4caf50'; // verde para ingresos
    }

    switch (category) {
      // GASTOS_ESENCIALES
      case Category.VIVIENDA:
        return '#FF6B35'; // naranja fuerte
      case Category.SERVICIOS_BASICOS:
        return '#FF8C42'; // naranja claro
      case Category.ALIMENTACION:
        return '#FFA500'; // naranja medio
      case Category.TRANSPORTE:
        return '#FFB84D'; // amarillo naranja
      case Category.SALUD:
        return '#FF4757'; // rojo coral

      // GASTOS_PERSONALES
      case Category.ENTRETENIMIENTO:
        return '#4ECDC4'; // turquesa
      case Category.STREAMING_SUSCRIPCIONES:
        return '#45B7D1'; // azul cielo
      case Category.MASCOTAS:
        return '#3EBAAC'; // verde agua
      case Category.CUIDADO_PERSONAL:
        return '#95E1D3'; // turquesa claro

      // FINANCIEROS
      case Category.DEUDAS_PRESTAMOS:
        return '#5F27CD'; // púrpura oscuro
      case Category.AHORRO_INVERSION:
        return '#00D2D3'; // cian
      case Category.SEGUROS:
        return '#341F97'; // azul índigo

      // EDUCACION
      case Category.EDUCACION_DESARROLLO:
        return '#FFEAA7'; // amarillo suave

      // OTROS
      case Category.REGALOS_CELEBRACIONES:
        return '#FD79A8'; // rosa
      case Category.VIAJES_VACACIONES:
        return '#A29BFE'; // lavanda
      case Category.IMPREVISTOS:
        return '#DDA0DD'; // púrpura claro

      default:
        return '#DDA0DD';
    }
  }

  static getCategoryIcon(category?: Category): string {
    if (!category) {
      return 'attach_money'; // ícono para ingresos
    }

    switch (category) {
      // GASTOS_ESENCIALES
      case Category.VIVIENDA:
        return 'home';
      case Category.SERVICIOS_BASICOS:
        return 'bolt';
      case Category.ALIMENTACION:
        return 'restaurant';
      case Category.TRANSPORTE:
        return 'directions_car';
      case Category.SALUD:
        return 'local_hospital';

      // GASTOS_PERSONALES
      case Category.ENTRETENIMIENTO:
        return 'movie';
      case Category.STREAMING_SUSCRIPCIONES:
        return 'subscriptions';
      case Category.MASCOTAS:
        return 'pets';
      case Category.CUIDADO_PERSONAL:
        return 'spa';

      // FINANCIEROS
      case Category.DEUDAS_PRESTAMOS:
        return 'credit_card';
      case Category.AHORRO_INVERSION:
        return 'savings';
      case Category.SEGUROS:
        return 'security';

      // EDUCACION
      case Category.EDUCACION_DESARROLLO:
        return 'school';

      // OTROS
      case Category.REGALOS_CELEBRACIONES:
        return 'card_giftcard';
      case Category.VIAJES_VACACIONES:
        return 'flight';
      case Category.IMPREVISTOS:
        return 'warning';

      default:
        return 'category';
    }
  }
}
