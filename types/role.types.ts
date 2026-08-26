export enum AdminRole {
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
  OPERATOR = "operator",
}

export enum AccountRole {
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
  OPERATOR = "operator",
  MERCHANT = "merchant",
  AGENT = "agent",
  CUSTOMER = "customer",
}

export interface IRole {
  name: AdminRole;
}
