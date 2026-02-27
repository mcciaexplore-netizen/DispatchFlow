const config = {
  company: {
    name: import.meta.env.VITE_COMPANY_NAME || "Your Company Name",
    address: import.meta.env.VITE_COMPANY_ADDRESS || "123 Industrial Area, City - 000000",
    gstin: import.meta.env.VITE_COMPANY_GSTIN || "00XXXXX0000X0X0",
    phone: import.meta.env.VITE_COMPANY_PHONE || "+91 00000 00000",
    email: import.meta.env.VITE_COMPANY_EMAIL || "dispatch@company.com",
    logo: import.meta.env.VITE_COMPANY_LOGO_URL || null,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
    model: "gemini-2.5-flash",
  },
  sheets: {
    enabled: !!import.meta.env.VITE_GOOGLE_SHEETS_ID,
    sheetsId: import.meta.env.VITE_GOOGLE_SHEETS_ID || "",
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || "",
  },
  slip: {
    prefix: import.meta.env.VITE_SLIP_PREFIX || "DS",
  },
};

export default config;
