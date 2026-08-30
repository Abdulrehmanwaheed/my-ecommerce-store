export interface BrandDetails {
  name: string;
  tagline: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
}

export interface RegionalSettings {
  currencySymbol: string;
  currencyCode: string;
  countryCode: string;
}

export interface PaymentMethods {
  cod: boolean;
  cardPayment: boolean;
}

export interface ShippingRules {
  flatRateFee: number;
  cities: string[];
}

export interface WhatsAppIntegration {
  phoneNumber: string;
  defaultMessage: string;
}

export interface PayfastGateway {
  merchantId: string;
  securedKey: string;
}

export interface SafepayGateway {
  apiKey: string;
}

export interface Gateways {
  payfast: PayfastGateway;
  safepay: SafepayGateway;
}

export interface StoreConfig {
  brand: BrandDetails;
  region: RegionalSettings;
  paymentMethods: PaymentMethods;
  shipping: ShippingRules;
  whatsapp: WhatsAppIntegration;
  gateways: Gateways;
}
