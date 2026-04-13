import { Category } from "@/types";

export const PLANT_CATEGORIES = [
  { label: "Tất cả Cây Cảnh", value: "" },
  { label: "Văn phòng", value: "VAN_PHONG" },
  { label: "Trong nhà", value: "TRONG_NHA" },
  { label: "Ngoài trời", value: "NGOAI_TROI" },
  { label: "Sen đá", value: "SEN_DA_XUONG_RONG" },
  { label: "Nhiệt đới", value: "NHIET_DOI" }
];

export const SUPPLY_CATEGORIES = [
  { label: "Dụng cụ làm vườn", value: "DUNG_CU" },
  { label: "Phân bón & Đất trồng", value: "PHAN_BON_DAT" }
];

export const CATEGORIES = [...PLANT_CATEGORIES, ...SUPPLY_CATEGORIES];


export const getCategoryLabel = (category: string | Category | undefined | null) => {
  if (!category) return "";
  if (typeof category === "object" && category.name) return category.name;
  return CATEGORIES.find(c => c.value === category)?.label || (typeof category === "string" ? category : "");
};
