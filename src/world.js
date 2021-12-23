import { VOXMesh } from "three/examples/jsm/loaders/VOXLoader.js";
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
  //TODO group mesh
  return object[0];
};

const build = (scene, tiles, collection) => {
  for (const tile of tiles) {
    buildTileMeshes(scene, collection[tile.name], tile.x, 0, tile.y, tile.rot);
  }
};

const tile = (name = "base", x = 0, y = 0, rot = 0) => {
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
  const cardsCount = width * depth;
  const setCount = cardsCount / tilesName.length;
  const stack = [];
  for (const tile of tilesName) {
    for (let i = 0; i < setCount; i++) {
      stack.push(tile);
    }
  }

  for (let x = 0; x < depth; x++) {
    for (let y = 0; y < width; y++) {
      const card = stack.splice(
        getRandomIntInclusive(0, stack.length - 1),
        1
      )[0];
      data.push(tile(card, x, y, 0));
    }
  }
  return data;
};

const buildCursor = (scene, tile, x, y) => {
  return buildTileMeshes(scene, tile, x, 0, y, 0);
};
export { build, buildWorld, buildCursor };
