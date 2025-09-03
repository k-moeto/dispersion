// ライブラリをインポート
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

// --- 初期設定 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ライト ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

camera.position.set(0, 5, 10);
controls.update();

// --- レイヤー作成 ---
const layerHeight = 0.5;
const layerWidth = 5;
const layerDepth = 5;
const spacing = 0.1;

const materials = {
    dwr: new THREE.MeshStandardMaterial({ color: 0xADD8E6, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.8 }),
    nylon: new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.7, metalness: 0.0 }),
    nanoporous: new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8, metalness: 0.0 }),
    lining: new THREE.MeshStandardMaterial({ color: 0x6A5ACD, roughness: 0.6, metalness: 0.0 })
};

const layers = [];
const layerGeom = new THREE.BoxGeometry(layerWidth, layerHeight, layerDepth);

const dwrLayer = new THREE.Mesh(layerGeom, materials.dwr);
dwrLayer.position.y = layerHeight * 1.5 + spacing * 1.5;
scene.add(dwrLayer);
layers.push(dwrLayer);

const nylonLayer = new THREE.Mesh(layerGeom, materials.nylon);
nylonLayer.position.y = layerHeight * 0.5 + spacing * 0.5;
scene.add(nylonLayer);
layers.push(nylonLayer);

const nanoporousLayer = new THREE.Mesh(layerGeom, materials.nanoporous);
nanoporousLayer.position.y = -layerHeight * 0.5 - spacing * 0.5;
scene.add(nanoporousLayer);
layers.push(nanoporousLayer);

const liningLayer = new THREE.Mesh(layerGeom, materials.lining);
liningLayer.position.y = -layerHeight * 1.5 - spacing * 1.5;
scene.add(liningLayer);
layers.push(liningLayer);

// --- 水滴と水蒸気 ---
const waterDropGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const waterDropMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.9 });
const waterDrop1 = new THREE.Mesh(waterDropGeometry, waterDropMaterial);
waterDrop1.position.set(-1, dwrLayer.position.y + layerHeight / 2 + 0.2, 0);
scene.add(waterDrop1);
const waterDrop2 = waterDrop1.clone();
waterDrop2.position.set(1, dwrLayer.position.y + layerHeight / 2 + 0.2, 0);
waterDrop2.scale.set(0.7, 0.7, 0.7);
scene.add(waterDrop2);

const steamParticles = [];
for (let i = 0; i < 50; i++) {
    const steamMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), steamMaterial);
    particle.position.set((Math.random() - 0.5) * layerWidth, -5, (Math.random() - 0.5) * layerDepth);
    particle._velocity = new THREE.Vector3(0, 0.01 + Math.random() * 0.02, 0);
    scene.add(particle);
    steamParticles.push(particle);
}

// --- イベントリスナー ---
const slider = document.getElementById('touch-slider');
slider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value) / 100;
    layers.forEach(layer => {
        layer.material.roughness = THREE.MathUtils.lerp(0.8, 0.1, value);
        layer.material.metalness = THREE.MathUtils.lerp(0.0, 0.6, value);
    });
    waterDrop1.material.opacity = waterDrop2.material.opacity = THREE.MathUtils.lerp(0.7, 1.0, value);
    waterDrop1.material.roughness = waterDrop2.material.roughness = THREE.MathUtils.lerp(0.2, 0.05, value);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    steamParticles.forEach(p => {
        p.position.add(p._velocity);
        if (p.position.y > 5) {
            p.position.y = -5;
        }
    });
    renderer.render(scene, camera);
}
animate();
