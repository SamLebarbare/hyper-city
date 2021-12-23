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

export { tileLoader, tile };
