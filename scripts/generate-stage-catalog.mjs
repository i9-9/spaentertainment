#!/usr/bin/env node
/**
 * Genera app/data/stage-catalog.json a partir del GLB.
 * Ejecutar: npm run catalog:stage
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const modelPath = path.join(root, "public/escenario.glb");
const outPath = path.join(root, "app/data/stage-catalog.json");

const buf = fs.readFileSync(modelPath);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString());

function meshBounds(meshIndex) {
  const mesh = json.meshes[meshIndex];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (const prim of mesh.primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    if (!acc?.min || !acc?.max) continue;
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], acc.min[i]);
      max[i] = Math.max(max[i], acc.max[i]);
    }
  }

  return {
    min: min.map((v) => +v.toFixed(2)),
    max: max.map((v) => +v.toFixed(2)),
    size: max.map((v, i) => +(v - min[i]).toFixed(2)),
    center: max.map((v, i) => +((v + min[i]) / 2).toFixed(2)),
  };
}

const entries = [];
(json.nodes || []).forEach((node, nodeIndex) => {
  if (node.mesh === undefined) return;
  const matIndex = json.meshes[node.mesh].primitives[0].material;
  const material = json.materials[matIndex]?.name || "unknown";
  const bounds = meshBounds(node.mesh);

  entries.push({
    id: `node-${nodeIndex}`,
    nodeIndex,
    meshIndex: node.mesh,
    nodeName: node.name || null,
    material,
    ...bounds,
  });
});

const byMaterial = {};
entries.forEach((entry) => {
  if (!byMaterial[entry.material]) {
    byMaterial[entry.material] = { count: 0, samples: [] };
  }
  byMaterial[entry.material].count += 1;
  if (byMaterial[entry.material].samples.length < 3) {
    byMaterial[entry.material].samples.push({
      id: entry.id,
      center: entry.center,
      size: entry.size,
    });
  }
});

const catalog = {
  generatedAt: new Date().toISOString(),
  model: "/escenario.glb",
  meshCount: entries.length,
  materialCount: Object.keys(byMaterial).length,
  materials: Object.entries(byMaterial)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count),
  meshes: entries,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));
console.log(`Catalogo: ${entries.length} meshes, ${Object.keys(byMaterial).length} materiales → ${outPath}`);
