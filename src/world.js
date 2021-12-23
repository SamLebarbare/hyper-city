import { VOXMesh } from "three/examples/jsm/loaders/VOXLoader.js";
import { MathUtils } from "three";
import noise from "asm-noise";
const TILE_SCALE = 0.0025;

const buildTileMeshes = (scene, chunks, x, y, z, rot) => {
  const object = [];
  for (const chunk of chunks) {
    const mesh = new VOXMesh(chunk);
    //mesh.rotation.y = rot;
    mesh.scale.setScalar(TILE_SCALE);
    mesh.position.x = x * TILE_SCALE * chunk.size.x;
    mesh.position.y = y * TILE_SCALE * chunk.size.y;
    mesh.position.z = z * TILE_SCALE * chunk.size.z;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    object.push(mesh);
  }
  return object;
};

const build = (scene, tiles, collection) => {
  for (const tile of tiles) {
    buildTileMeshes(scene, collection[tile.name], tile.x, 0, tile.y, tile.rot);
  }
  return buildTileMeshes(scene, collection["goblin"], 3, 0, 2, 0);
};

const tile = (name = "grass", x = 0, y = 0, rot = 0) => {
  return {
    name,
    x,
    y,
    rot,
  };
};

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const buildWorld = (width, depth, tilesName) => {
  const data = [];
  const angles = [
    MathUtils.degToRad(0),
    MathUtils.degToRad(90),
    MathUtils.degToRad(180),
    MathUtils.degToRad(270),
  ];
  let c = 0;

  for (let x = 0; x < depth; x++) {
    for (let y = 0; y < width; y++) {
      const v = noise(x, y);
      const i = getRandomIntInclusive(0, Math.round(v * 10));
      console.log(i, v);
      data.push(tile(tilesName[i], x, y, angles[getRandomIntInclusive(0, 3)]));
      c++;
    }
  }
  return data;
};

export { build, buildWorld };
