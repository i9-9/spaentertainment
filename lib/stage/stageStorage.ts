import type { StageRole } from "./types";

const OVERRIDES_KEY = "stage-role-overrides";
const LOGO_MATERIALS_KEY = "stage-logo-materials";

export function loadRoleOverrides(): Record<string, StageRole> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveRoleOverride(stageId: string, role: StageRole) {
  const overrides = loadRoleOverrides();
  overrides[stageId] = role;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  return overrides;
}

export function loadLogoMaterials(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOGO_MATERIALS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLogoMaterial(materialName: string) {
  const materials = new Set(loadLogoMaterials());
  materials.add(materialName);
  const list = [...materials];
  localStorage.setItem(LOGO_MATERIALS_KEY, JSON.stringify(list));
  return list;
}

export function clearStageStorage() {
  localStorage.removeItem(OVERRIDES_KEY);
  localStorage.removeItem(LOGO_MATERIALS_KEY);
}
