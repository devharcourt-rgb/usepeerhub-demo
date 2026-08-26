import { AdminRole } from "../types/role.types";

export const ROOT_USER = {
  firstName: "Hamsa",
  lastName: "Harcourt",
  emailAddress: "hamsaharcourt@gmail.com",
  password: "@usepeerhub2026",
  username: "superadmin",
  dateOfBirth: new Date("2000-04-08"),
  phoneNumber: "+2349070073451",
  phoneBP: "09070073451",
  middleName: "Ohabiko",
};

export const ROOT_USER_BVN = "22530138077";

export const DEFAULT_ROLES = [
  {
    name: AdminRole.ADMIN,
  },
  {
    name: AdminRole.SUPERADMIN,
  },
  {
    name: AdminRole.OPERATOR,
  },
];

export const DEFAULT_TEAM = {
  name: "Default Team",
  members: [],
  createdBy: "649750024d3481024d348102",
};

export const DEFAULT_CURRENCIES = [
  // nigerian naira
  {
    name: "Naira",
    code: "NGN",
    symbol: "₦",
    country: "Nigeria",
    isDefault: true,
  },
  // us dollars
  {
    name: "Dollar",
    code: "USD",
    symbol: "$",
    country: "United States",
    isDefault: false,
  },
];
