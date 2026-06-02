import * as THREE from "three";
import { FLOOR_COLOR } from "./palette";
import type { StageRole, StageRolesConfig } from "./types";

/** Paleta según el render de referencia del diseñador (SketchUp / CAD). */
const COLORS = {
  structure: new THREE.Color("#383838"),
  truss: new THREE.Color("#222222"),
  screen: new THREE.Color("#2a2a2a"),
  fixture: new THREE.Color("#c4c4c4"),
  logo: new THREE.Color("#ffffff"),
  barrier: new THREE.Color("#9a9a9a"),
  audio: new THREE.Color("#1a1a1a"),
  floor: new THREE.Color(FLOOR_COLOR),
};

const METAL_PATTERN = /metal|alumin|truss|black|seam|corrog|zinc/i;

export function buildLogoMaterialSet(
  config: StageRolesConfig,
  extraMaterials: string[] = [],
): Set<string> {
  const set = new Set<string>([...(config.logoMaterials ?? []), ...extraMaterials]);
  Object.entries(config.materials).forEach(([name, role]) => {
    if (role === "logo") set.add(name);
  });
  return set;
}

export function resolveRole(
  config: StageRolesConfig,
  materialName: string,
  stageId: string,
  logoMaterials: Set<string>,
): StageRole {
  if (config.meshOverrides?.[stageId]) return config.meshOverrides[stageId];
  if (logoMaterials.has(materialName)) return "logo";
  if (config.materials[materialName]) return config.materials[materialName];
  return config.defaultRole;
}

/** Inferencia solo para PaletteMaterial sin mapear (colores SketchUp sin nombre). */
export function inferPaletteRole(
  materialName: string,
  maxDim: number,
  minDim: number,
  centerY: number,
): StageRole | null {
  if (!/^palettematerial/i.test(materialName)) return null;

  const flatness = minDim / Math.max(maxDim, 0.001);
  if (maxDim >= 1.4 && flatness <= 0.22 && centerY < 2) return "floor";
  if (maxDim >= 1.4 && flatness <= 0.22) return "screen";
  if (maxDim < 0.85 && maxDim > 0.01 && centerY > 1.5) return "fixture";

  return "structure";
}

export function applyRoleToMaterial(mat: THREE.MeshStandardMaterial, role: StageRole) {
  mat.envMapIntensity = 0;
  mat.emissive.set("#000000");
  mat.emissiveIntensity = 0;
  mat.toneMapped = true;
  mat.metalness = 0.05;
  mat.roughness = 0.75;

  switch (role) {
    case "logo":
      // Mantener texturas del GLB (relieve y detalle), tinte blanco con luz suave.
      mat.color.copy(COLORS.logo);
      mat.emissive.copy(COLORS.logo);
      mat.emissiveIntensity = mat.map ? 0.35 : 0.6;
      if (mat.map) mat.emissiveMap = mat.map;
      mat.toneMapped = true;
      mat.roughness = 0.42;
      mat.metalness = 0.05;
      if (mat.normalMap) mat.normalScale.set(1.2, 1.2);
      break;
    case "screen":
      mat.color.copy(COLORS.screen);
      mat.roughness = 0.85;
      mat.metalness = 0;
      break;
    case "fixture":
      mat.color.copy(COLORS.fixture);
      mat.roughness = 0.45;
      mat.metalness = 0.1;
      break;
    case "barrier":
      mat.color.copy(COLORS.barrier);
      mat.roughness = 0.55;
      mat.metalness = 0.35;
      break;
    case "audio":
      mat.color.copy(COLORS.audio);
      mat.roughness = 0.8;
      mat.metalness = 0;
      break;
    case "floor":
      mat.map = null;
      mat.normalMap = null;
      mat.roughnessMap = null;
      mat.metalnessMap = null;
      mat.aoMap = null;
      mat.color.copy(COLORS.floor);
      mat.roughness = 0.88;
      mat.metalness = 0;
      break;
    default:
      mat.color.copy(METAL_PATTERN.test(mat.name) ? COLORS.truss : COLORS.structure);
      break;
  }

  mat.needsUpdate = true;
}

/** Fallback: zona superior central del escenario (arriba al medio). */
export function applyTopCenterLogo(
  root: THREE.Object3D,
  fitted: THREE.Box3,
  lockedIds: Set<string>,
) {
  const stageCenter = fitted.getCenter(new THREE.Vector3());
  const stageHeight = fitted.max.y - fitted.min.y;
  const stageWidthX = fitted.max.x - fitted.min.x;
  const stageWidthZ = fitted.max.z - fitted.min.z;
  const minLogoY = fitted.min.y + stageHeight * 0.7;
  const halfX = stageWidthX * 0.2;
  const halfZ = stageWidthZ * 0.2;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const stageId = mesh.userData.stageId as string | undefined;
    if (!stageId || lockedIds.has(stageId)) return;

    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const inLogoZone =
      center.y >= minLogoY &&
      center.x >= stageCenter.x - halfX &&
      center.x <= stageCenter.x + halfX &&
      center.z >= stageCenter.z - halfZ &&
      center.z <= stageCenter.z + halfZ;

    if (!inLogoZone) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        applyRoleToMaterial(material, "logo");
      }
    });
    mesh.userData.role = "logo";
  });
}

const FLOOR_SKIP_ROLES = new Set<StageRole>(["logo", "screen", "barrier", "audio", "floor"]);

function isFloorMesh(center: THREE.Vector3, size: THREE.Vector3, fitted: THREE.Box3): boolean {
  const stageHeight = fitted.max.y - fitted.min.y;
  const maxFloorY = fitted.min.y + stageHeight * 0.22;
  const dims = [size.x, size.y, size.z].sort((a, b) => a - b);

  return center.y <= maxFloorY && dims[0] < 0.55 && dims[2] > 0.5;
}

/** Piso del escenario: superficies planas en la base. */
export function applyStageFloor(
  root: THREE.Object3D,
  fitted: THREE.Box3,
  lockedIds: Set<string>,
) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const stageId = mesh.userData.stageId as string | undefined;
    const role = mesh.userData.role as StageRole | undefined;
    if (!stageId || lockedIds.has(stageId) || (role && FLOOR_SKIP_ROLES.has(role))) return;

    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    if (!isFloorMesh(center, size, fitted)) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        applyRoleToMaterial(material, "floor");
      }
    });
    mesh.userData.role = "floor";
  });
}
