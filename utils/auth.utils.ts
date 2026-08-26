import bcrypt from "bcrypt";

// Match user entered password to hashed password in database
export const matchPassword = async function (password: string, hash: string) {
  return await bcrypt.compare(password, hash);
};

export function formatPhoneNumber(phone: string, country: any): string {
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, "");

  // Define country codes
  const countryCodes: Record<string, string> = {
    Nigeria: "+234",
    "Sierra Leone": "+232",
  };

  const code = countryCodes[country];

  if (!code) {
    throw new Error(`Unsupported country: ${country}`);
  }

  // Remove leading zero if present
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Avoid double-prefixing if number already has the code
  if (cleaned.startsWith(code.replace("+", ""))) {
    return `+${cleaned}`;
  }

  return `${code}${cleaned}`;
}
