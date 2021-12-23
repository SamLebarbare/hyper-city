import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as AmmoInit from "three/examples/js/libs/ammo.wasm.js";
import { VOXLoader } from "three/examples/jsm/loaders/VOXLoader.js";
import { moveTo, tileOverlaps, tileLoader, getStackId } from "./utils.js";
import { build, buildCursor, buildWorld } from "./world.js";

let canvas,
  camera,
  raycaster,
  mouse,
  clock,
  pointedSelectedTile,
  selectedStack,
  cardStacks = {},
  doAction = false,
  doMove = false,
  updating = false,
  controls,
  scene,
  tiles = {},
  renderer;

async function main() {
  //Ammo = await AmmoInit();
  await init();
  update();
}
main();

async function init() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(1, 1, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(129, 199, 212)");
  scene.add(camera);

  // light

  const hemiLight = new THREE.HemisphereLight(
    "rgb(129, 199, 212)",
    0x444444,
    1
  );
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(1.5, 3, 2.5);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
  dirLight2.position.set(-1.5, -3, -2.5);
  scene.add(dirLight2);

  const loader = new VOXLoader();
  const cardsName = ["forest", "winter", "rock", "volcano", "swamp", "island"];
  const markersName = ["select", "selected"];
  const all = [...cardsName, ...markersName];
  for (const tileName of all) {
    console.log("loading ", tileName);
    await tileLoader(loader, tileName, tiles);
    console.log("[DONE]");
  }
  console.log("loading voxels collection done");

  const world = buildWorld(6, 6, cardsName);
  build(scene, world, tiles, cardStacks);

  cursor = buildCursor(scene, tiles["select"], 0, 0);
  pointedSelectedTile = buildCursor(scene, tiles["selected"], 0, 0);
  pointedSelectedTile.visible = false;
  // renderer

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.1;
  controls.maxDistance = 0.5;

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  canvas = renderer.domElement;
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("click", onMouseClick);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
  doAction = true;
}

function update() {
  if (updating) {
    requestAnimationFrame(update);
    return;
  }
  controls.update();
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  let pointedTile;
  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const intersected = intersects[intersects.length - 1].object;
    const stack = cardStacks[getStackId(intersected)];
    pointedTile = stack[stack.length - 1];
    if (pointedTile) {
      const { x, y, z } = pointedTile.position;
      cursor.position.x = x;
      cursor.position.y = y;
      cursor.position.z = z;
    }
  }

  if (doAction && pointedTile) {
    updating = true;
    if (tileOverlaps(pointedSelectedTile, pointedTile)) {
      moveTo(pointedSelectedTile, pointedTile, pointedTile.position.y);
      pointedSelectedTile.visible = !pointedSelectedTile.visible;
      doMove = pointedSelectedTile.visible;
      selectedStack = null;
    } else {
      if (doMove && selectedStack) {
        const fromStack = cardStacks[selectedStack];
        const card = fromStack.splice(fromStack.length - 1, 1)[0];
        const stack = cardStacks[getStackId(pointedTile)];
        stack.push(card);
        moveTo(card, pointedTile, 1);
        moveTo(card, card, stack.length / 50);
        pointedSelectedTile.visible = false;
        selectedStack = null;
        doMove = false;
      } else {
        moveTo(
          pointedSelectedTile,
          pointedTile,
          pointedTile.position.y - 0.001
        );
        pointedSelectedTile.visible = true;
        selectedStack = getStackId(pointedTile);
        doMove = true;
      }
    }
    doAction = false;
    updating = false;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

function onKeyDown(event) {
  switch (event.code) {
  }
}

function onKeyUp(event) {
  switch (event.code) {
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
