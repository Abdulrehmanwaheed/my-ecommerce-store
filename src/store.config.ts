import type { StoreConfig } from './types/config';

export const STORE_CONFIG: StoreConfig = {
  brand: {
    name: 'My Store',
    tagline: 'Your trusted Pakistani online store',
    logoUrl: '/logo.png',
    supportEmail: 'support@mystore.pk',
    supportPhone: '+92 300 1234567',
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
    phoneNumber: '923001234567',
    defaultMessage: 'Hello, I would like to know more about your products.',
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