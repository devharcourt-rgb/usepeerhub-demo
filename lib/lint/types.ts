export interface LintRegisterDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirm_password: string;
  type: "individual" | "business";
}

export interface LintLoginDto {
  email: string;
  password: string;
}

export interface LintVerifyBvnDto {
  bvn: string;
  dob: string;
  token: string;
}

export interface RefreshTokenDto {
  message: string;
  token: string;
}

export interface GetBillersDto {
  token: string;
}

export interface GetSingleBillerDto {
  token: string;
  id: string;
}

export interface GetBillersCategoriesDto {
  token: string;
}

export interface GetBillerByCategoryDto {
  token: string;
  categoryId: string;
}

export interface GetBillerProductsDto {
  token: string;
  billerId: string;
}

interface ProductFieldEntry {
  field_id: string;
  value: string;
}

export interface BillOrderDto {
  token: string;
  customer_id?: string;
  amount_entered: string;
  biller_product_id: string;
  product_field_entries: Array<ProductFieldEntry>;
}

export enum LintApiStatus {
  success = "success",
  error = "error",
}

export enum LintAccountType {
  individual = "individual",
  business = "business",
}
