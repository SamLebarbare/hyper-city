import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as AmmoInit from "three/examples/js/libs/ammo.wasm.js";
import { VOXLoader } from "three/examples/jsm/loaders/VOXLoader.js";
import { tileLoader } from "./utils.js";
import { build, buildWorld } from "./world.js";

let Ammo,
  camera,
  clock,
  controls,
  scene,
  renderer,
  player,
  playerC = { a: false, s: false, w: false, d: false };

async function main() {
  Ammo = await AmmoInit();

  /*const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  transform.setRotation(
    new Ammo.btQuaternion(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    )
  );
  let defaultMotionState = new Ammo.btDefaultMotionState(transform);

  let structColShape = new Ammo.btBoxShape(
    new Ammo.btVector3(scale * 0.5, scale * 0.5, scale * 0.5)
  );
  structColShape.setMargin(0.05);*/
  await init();
  animate();
}
main();

async function init() {
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
  const voxels = {};
  const tilesName = ["grass", "grass2", "road", "goblin", "farm", "mount"];
  for (const tileName of tilesName) {
    console.log("loading ", tileName);
    await tileLoader(loader, tileName, voxels);
    console.log("[DONE]");
  }
  console.log("loading voxels collection done");

  const world = buildWorld(10, 10, ["grass", "grass2", "farm", "mount"]);
  player = build(scene, world, voxels);
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
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  if (playerC.a) {
    player[0].rotation.y += 0.1;
  }
  if (playerC.d) {
    player[0].rotation.y -= 0.1;
  }

  if (playerC.w) {
    player[0].translateZ(-0.001);
  }
  if (playerC.s) {
    player[0].translateZ(0.001);
  }

  renderer.render(scene, camera);
}

function onKeyDown(event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      playerC.w = true;
      break;

    case "ArrowDown":
    case "KeyS":
      playerC.s = true;
      break;

    case "ArrowLeft":
    case "KeyA":
      playerC.a = true;
      break;

    case "ArrowRight":
    case "KeyD":
      playerC.d = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      playerC.w = false;
      break;

    case "ArrowDown":
    case "KeyS":
      playerC.s = false;
      break;

    case "ArrowLeft":
    case "KeyA":
      playerC.a = false;
      break;

    case "ArrowRight":
    case "KeyD":
      playerC.d = false;
      break;
  }
}
