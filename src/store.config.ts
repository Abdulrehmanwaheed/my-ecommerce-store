import type { StoreConfig } from './types/config';
import { site } from './config/site';

export const STORE_CONFIG: StoreConfig = {
  brand: {
    name: site.name,
    tagline: site.tagline,
    logoUrl: '/logo.png',
    supportEmail: 'support@awancollection.pk',
    supportPhone: site.whatsapp.phoneDisplay,
  },
  region: {
    currencySymbol: 'Rs.',
    currencyCode: 'PKR',
    countryCode: 'PK',
  },
  paymentMethods: {
    cod: true,
    cardPayment: true,
  },
  shipping: {
    flatRateFee: 200,
    freeShippingThreshold: 5000,
    cities: [
      'Karachi',
      'Lahore',
      'Islamabad',
      'Rawalpindi',
      'Faisalabad',
      'Multan',
      'Peshawar',
      'Quetta',
      'Sialkot',
      'Gujranwala',
      'Hyderabad',
      'Bahawalpur',
    ],
  },
  whatsapp: {
    phoneNumber: site.whatsapp.phoneNumber,
    defaultMessage: site.whatsapp.defaultMessage,
  },
  gateways: {
    payfast: {
      merchantId: '',
      securedKey: '',
    },
    safepay: {
      apiKey: '',
    },
  },
};