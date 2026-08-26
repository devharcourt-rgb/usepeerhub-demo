export const toLocalPhoneNo = (phoneNo: string | number): string => {
  const _phoneNo = String(phoneNo);

  return _phoneNo
    .replace(/\D/g, "")
    .replace(/^234/, "0")
    .slice(-10)
    .padStart(11, "0");
};
