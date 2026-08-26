import { generateRadomDigits } from "./core.utils";

export async function generateRandomPassword() {
  return "@Bpay" + generateRadomDigits(6);
}
