"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, useProgress } from "@react-three/drei";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import stageRolesConfig from "@/app/data/stage-roles.json";
import SceneLoader from "./SceneLoader";
import {
  loadRoleOverrides,
  StageInspectorPanel,
  StageInspectorPicker,
  type SelectedMesh,
} from "./StageInspector";
import {
  applyRoleToMaterial,
  applyStageFloor,
  applyTopCenterLogo,
  buildLogoMaterialSet,
  inferPaletteRole,
  resolveRole,
} from "@/lib/stage/applyStageRoles";
import { loadLogoMaterials } from "@/lib/stage/stageStorage";
import { SKY_COLOR, FLOOR_COLOR } from "@/lib/stage/palette";
import type { StageRole, StageRolesConfig } from "@/lib/stage/types";

const MODEL_URL = "/escenario.glb";
const TARGET_SIZE = 16;

/** Vista front-right elevada, como el render de referencia del diseñador. */
const CAMERA_OFFSET = new THREE.Vector3(14, 5.5, 11);

useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

function fitModel(
  scene: THREE.Group,
  roleOverrides: Record<string, StageRole>,
  savedLogoMaterials: string[],
) {
  const config: StageRolesConfig = {
    ...(stageRolesConfig as StageRolesConfig),
    meshOverrides: roleOverrides,
  };
  const logoMaterials = buildLogoMaterialSet(config, savedLogoMaterials);

  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const center = box.getCenter(new THREE.Vector3());
  const scale = TARGET_SIZE / Math.max(...box.getSize(new THREE.Vector3()).toArray());
  let meshIndex = 0;

  clone.position.set(
    -center.x * scale,
    -box.min.y * scale,
    -center.z * scale,
  );
  clone.scale.setScalar(scale);

  clone.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const stageId = `mesh-${meshIndex++}`;
    const meshBox = new THREE.Box3().setFromObject(mesh);
    const meshSize = meshBox.getSize(new THREE.Vector3());
    const meshCenter = meshBox.getCenter(new THREE.Vector3());
    const dims = [meshSize.x, meshSize.y, meshSize.z].sort((a, b) => a - b);

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const clonedMaterials = materials.map((material) => {
      const mat = material.clone();
      if (mat instanceof THREE.MeshStandardMaterial) {
        let role = resolveRole(config, mat.name, stageId, logoMaterials);
        if (role === "structure" && !config.materials[mat.name] && !logoMaterials.has(mat.name)) {
          role = inferPaletteRole(mat.name, dims[2], dims[0], meshCenter.y) ?? role;
        }
        applyRoleToMaterial(mat, role);
        mesh.userData.stageId = stageId;
        mesh.userData.materialName = mat.name;
        mesh.userData.role = role;
      }
      return mat;
    });

    mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
  });

  const fitted = new THREE.Box3().setFromObject(clone);
  const lockedIds = new Set(Object.keys(roleOverrides));
  applyTopCenterLogo(clone, fitted, lockedIds);
  applyStageFloor(clone, fitted, lockedIds);
  return { model: clone, target: fitted.getCenter(new THREE.Vector3()) };
}

function CameraRig({ target }: { target: THREE.Vector3 }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    camera.position.set(
      target.x + CAMERA_OFFSET.x,
      target.y + CAMERA_OFFSET.y,
      target.z + CAMERA_OFFSET.z,
    );
    camera.lookAt(target.x, target.y + 1, target.z);
    camera.updateProjectionMatrix();
  }, [camera, target]);

  return null;
}

function StageScene({
  roleOverrides,
  logoMaterials,
}: {
  roleOverrides: Record<string, StageRole>;
  logoMaterials: string[];
}) {
  const { scene } = useGLTF(MODEL_URL);
  const { model, target } = useMemo(
    () => fitModel(scene, roleOverrides, logoMaterials),
    [scene, roleOverrides, logoMaterials],
  );
  const targetPoint = useMemo(
    () => [target.x, target.y + 1, target.z] as [number, number, number],
    [target],
  );

  return (
    <>
      <CameraRig target={target} />
      <primitive object={model} dispose={null} />
      <OrbitControls
        target={targetPoint}
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={45}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

function StageGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color={FLOOR_COLOR} roughness={0.88} metalness={0} />
    </mesh>
  );
}

function SceneContent({
  roleOverrides,
  logoMaterials,
  inspect,
  onPick,
}: {
  roleOverrides: Record<string, StageRole>;
  logoMaterials: string[];
  inspect: boolean;
  onPick: (mesh: SelectedMesh) => void;
}) {
  return (
    <>
      <color attach="background" args={[SKY_COLOR]} />

      <StageGround />

      {/* Iluminación neutra: cielo celeste, suelo gris */}
      <hemisphereLight args={[SKY_COLOR, FLOOR_COLOR, 0.5]} />
      <ambientLight intensity={0.45} color="#ffffff" />
      <directionalLight
        position={[18, 28, 14]}
        intensity={0.9}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[-12, 8, -6]} intensity={0.15} color="#e8f0ff" />

      <Suspense fallback={null}>
        <StageScene roleOverrides={roleOverrides} logoMaterials={logoMaterials} />
      </Suspense>

      {inspect && <StageInspectorPicker onPick={onPick} />}
    </>
  );
}

export default function Scene3D() {
  const searchParams = useSearchParams();
  const inspect = searchParams.get("inspect") === "stage";
  const { progress, active } = useProgress();
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const [roleOverrides, setRoleOverrides] = useState<Record<string, StageRole>>({});
  const [logoMaterials, setLogoMaterials] = useState<string[]>([]);
  const [selectedMesh, setSelectedMesh] = useState<SelectedMesh | null>(null);

  useEffect(() => {
    setRoleOverrides(loadRoleOverrides());
    setLogoMaterials(loadLogoMaterials());
  }, []);

  const handlePick = useCallback((mesh: SelectedMesh) => {
    setSelectedMesh(mesh);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !active) {
      setFadeLoader(true);
      const fadeTimer = setTimeout(() => setShowLoader(false), 700);
      return () => clearTimeout(fadeTimer);
    }
  }, [progress, active]);

  return (
    <>
      {showLoader && <SceneLoader progress={progress} visible={!fadeLoader} />}

      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 42, near: 0.1, far: 500 }}
        style={{ width: "100%", height: "100%" }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <SceneContent
          roleOverrides={roleOverrides}
          logoMaterials={logoMaterials}
          inspect={inspect}
          onPick={handlePick}
        />
      </Canvas>

      {inspect && (
        <StageInspectorPanel
          selected={selectedMesh}
          onOverridesChange={setRoleOverrides}
          onLogoMaterialsChange={setLogoMaterials}
          onSelectedChange={setSelectedMesh}
        />
      )}
    </>
  );
}

useGLTF.preload(MODEL_URL);
