export type StageRole =
  | "structure"
  | "screen"
  | "logo"
  | "fixture"
  | "barrier"
  | "audio"
  | "floor"
  | "unknown";

export type StageRolesConfig = {
  defaultRole: StageRole;
  materials: Record<string, StageRole>;
  logoMaterials?: string[];
  meshOverrides?: Record<string, StageRole>;
};

export type StageMeshInfo = {
  stageId: string;
  nodeName: string | null;
  materialName: string;
  role: StageRole;
  center: [number, number, number];
  size: [number, number, number];
};
