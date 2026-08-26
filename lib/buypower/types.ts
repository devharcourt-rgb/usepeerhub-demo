export interface CheckMeterDto {
  meter: string;
  disco: string;
  vendType: string;
  vertical: string;
  orderId: boolean;
}

export interface VendElectricityDto {
  orderId: string;
  meter: string;
  disco: string;
  paymentType: string;
  vendType: string;
  amount: number;
  email?: string;
  phone: string;
  vertical?: string;
}

export interface VendAirtimeDto {
  orderId: string;
  meter: string;
  disco: string;
  paymentType: string;
  vendType: string;
  amount: number;
  email?: string;
  phone: string;
  vertical?: string;
}

export interface VendDataDto {
  orderId: string;
  meter: string;
  disco: string;
  paymentType: string;
  vendType: string;
  amount: number;
  email?: string;
  phone: string;
  vertical?: string;
  tariffClass: string;
}

export interface VendTVDto {
  orderId: string;
  meter: string;
  disco: string;
  paymentType: string;
  vendType: string;
  amount: number;
  email?: string;
  phone: string;
  vertical?: string;
  tariffClass: string;
}

export interface PriceListDto {
  provider: string;
  vertical: string;
}
