const tileLoader = (loader, tileName, collection) => {
  return new Promise((resolve) =>
    loader.load(`models/${tileName}.vox`, function (chunks) {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!collection[tileName]) {
          collection[tileName] = [];
        }
        collection[tileName].push(chunk);
      }
      resolve();
    })
  );
};

const tileOverlaps = (a, b) => {
  return a.position.x === b.position.x && a.position.z === b.position.z;
};

const moveTo = (a, b, layer = 0) => {
  a.position.x = b.position.x;
  a.position.z = b.position.z;
  a.position.y = layer;
};

const getStackId = (tile) => {
  return `${tile.position.x}-${tile.position.z}`;
};

export { tileLoader, tile, tileOverlaps, moveTo, getStackId };
