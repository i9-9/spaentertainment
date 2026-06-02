"use client";

import { useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { StageRole } from "@/lib/stage/types";
import {
  loadLogoMaterials,
  loadRoleOverrides,
  saveLogoMaterial,
  saveRoleOverride,
} from "@/lib/stage/stageStorage";

const ROLES: StageRole[] = [
  "structure",
  "screen",
  "logo",
  "fixture",
  "barrier",
  "floor",
  "audio",
  "unknown",
];

export type SelectedMesh = {
  stageId: string;
  nodeName: string | null;
  materialName: string;
  role: StageRole;
  center: [number, number, number];
  size: [number, number, number];
};

/** Dentro del Canvas: solo raycast, sin HTML. */
export function StageInspectorPicker({
  onPick,
}: {
  onPick: (mesh: SelectedMesh) => void;
}) {
  const { camera, gl, scene } = useThree();

  const pick = useCallback(
    (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(scene.children, true);
      const hit = hits.find((h) => h.object.userData.stageId);
      if (!hit) return;

      const mesh = hit.object as THREE.Mesh;
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      onPick({
        stageId: mesh.userData.stageId as string,
        nodeName: mesh.name || null,
        materialName: mesh.userData.materialName as string,
        role: (mesh.userData.role as StageRole) || "unknown",
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z],
      });
    },
    [camera, gl.domElement, onPick, scene.children],
  );

  useEffect(() => {
    gl.domElement.addEventListener("click", pick);
    return () => gl.domElement.removeEventListener("click", pick);
  }, [gl.domElement, pick]);

  return null;
}

/** Fuera del Canvas: panel HTML. */
export function StageInspectorPanel({
  selected,
  onOverridesChange,
  onLogoMaterialsChange,
  onSelectedChange,
}: {
  selected: SelectedMesh | null;
  onOverridesChange: (overrides: Record<string, StageRole>) => void;
  onLogoMaterialsChange: (materials: string[]) => void;
  onSelectedChange: (mesh: SelectedMesh | null) => void;
}) {
  const [overrides, setOverrides] = useState(loadRoleOverrides);
  const [logoMaterials, setLogoMaterials] = useState(loadLogoMaterials);

  const assignRole = (role: StageRole) => {
    if (!selected) return;
    const next = saveRoleOverride(selected.stageId, role);
    setOverrides(next);
    onOverridesChange(next);
    onSelectedChange({ ...selected, role });
  };

  const assignLogoMaterial = () => {
    if (!selected) return;
    const list = saveLogoMaterial(selected.materialName);
    setLogoMaterials(list);
    onLogoMaterialsChange(list);
  };

  const exportConfig = () => {
    const blob = new Blob(
      [JSON.stringify({ meshOverrides: overrides, logoMaterials }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stage-config-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-88 rounded-lg border border-black/15 bg-white/95 p-4 text-black text-xs shadow-lg backdrop-blur-sm">
      <p className="text-black/45 uppercase tracking-widest mb-2" style={{ fontFamily: "gotham, sans-serif" }}>
        Inspector de escenario
      </p>
      <ol className="text-black/70 mb-3 leading-relaxed list-decimal list-inside space-y-1">
        <li>Hacé click en el logo grande (arriba al centro)</li>
        <li>Pulsá «Logo: todo el material»</li>
        <li>Exportá y pasame el JSON, o copiá el nombre del material</li>
      </ol>

      {selected ? (
        <div className="space-y-1 mb-3 font-mono text-[11px] bg-black/5 rounded p-2">
          <div><span className="text-black/40">material </span>{selected.materialName}</div>
          <div><span className="text-black/40">id </span>{selected.stageId}</div>
          <div><span className="text-black/40">rol actual </span>{selected.role}</div>
          <div><span className="text-black/40">centro </span>{selected.center.map((v) => v.toFixed(2)).join(", ")}</div>
        </div>
      ) : (
        <div className="text-black/40 mb-3">Ninguna pieza seleccionada — click en el escenario</div>
      )}

      <button
        type="button"
        onClick={assignLogoMaterial}
        disabled={!selected}
        className="w-full mb-2 py-2 rounded bg-black text-white text-[11px] uppercase tracking-wide disabled:opacity-30"
      >
        Logo: todo el material
      </button>

      <div className="flex flex-wrap gap-1 mb-3">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => assignRole(role)}
            disabled={!selected}
            className={`px-2 py-1 rounded border text-[10px] uppercase tracking-wide transition-colors ${
              selected?.role === role
                ? "border-black bg-black text-white"
                : "border-black/20 text-black/70 hover:border-black/50 disabled:opacity-30"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {logoMaterials.length > 0 && (
        <div className="text-black/50 mb-2 font-mono text-[10px]">
          Logo materials: {logoMaterials.join(", ")}
        </div>
      )}

      <button
        type="button"
        onClick={exportConfig}
        className="w-full py-2 border border-black/20 rounded text-black/70 hover:border-black/50 transition-colors"
      >
        Exportar config
      </button>
    </div>
  );
}

export { loadRoleOverrides } from "@/lib/stage/stageStorage";
