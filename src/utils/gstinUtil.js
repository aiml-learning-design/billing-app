// utils/gstinUtil.js

export const GST_STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra & Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
};

const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Validate GSTIN format + state code match
 * @param {string} gstin - GSTIN number
 * @param {string} selectedState - State name user selected (ex: "Maharashtra")
 * @returns {{ valid: boolean, error?: string, state?: string }}
 */
export function validateGSTIN(gstin, selectedState) {
  if (!GSTIN_REGEX.test(gstin)) {
    return { valid: false, error: "Invalid GSTIN format" };
  }

  const stateCode = gstin.substring(0, 2);
  const stateName = GST_STATE_CODES[stateCode];

  if (!stateName) {
    return { valid: false, error: "Invalid state code in GSTIN" };
  }

  if (selectedState && stateName.toLowerCase() !== selectedState.toLowerCase()) {
    return {
      valid: false,
      error: `GSTIN belongs to ${stateName}, but you selected ${selectedState}`,
    };
  }

  return { valid: true, state: stateName };
}