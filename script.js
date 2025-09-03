import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- 初期設定 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1A1A2E); // 背景色をレンダラーにも設定
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- ポストプロセッシング ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7, // strength
    0.2, // radius
    0.8  // threshold
);
composer.addPass(bloomPass);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 20); // カメラを少し後ろに引く
controls.enableDamping = true; // 滑らかなカメラ操作

// --- ライト ---
// 全体的に柔らかい光を与える
const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x1A1A2E, 2); // 空の色(シアン系), 地面の色(背景色), 強さ
scene.add(hemisphereLight);

// オブジェクトの輪郭を強調するキーライト
const dirLight = new THREE.DirectionalLight(0x00FFFF, 1.5); // シアンのアクセントカラー
dirLight.position.set(5, 5, 10);
scene.add(dirLight);

// --- ガラス層を作成 ---
const layerGeometry = new THREE.PlaneGeometry(12, 12);
const layerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 1.0, // ガラスのような透明度
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    // thickness: 0.1, // for ior
});

const layers = [];
for (let i = 0; i < 3; i++) {
    const layer = new THREE.Mesh(layerGeometry, layerMaterial);
    layer.position.z = (i - 1) * 3; // -3, 0, 3 のz位置に配置
    scene.add(layer);
    layers.push(layer);
}

// --- フローアニメーション（矢印の代替） ---
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, -3, 4),
    new THREE.Vector3(-4, 0, 2),
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(4, 0, -2),
    new THREE.Vector3(7, -3, -4)
]);

const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);

// 流れを表現するテクスチャを生成
function createFlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00FFFF';
    for (let i = 0; i < 256; i += 16) {
        ctx.fillRect(i, 0, 8, 8);
    }
    return new THREE.CanvasTexture(canvas);
}

const flowTexture = createFlowTexture();
flowTexture.wrapS = THREE.RepeatWrapping;
flowTexture.wrapT = THREE.RepeatWrapping;
flowTexture.repeat.set(4, 1);

const tubeMaterial = new THREE.MeshBasicMaterial({
    map: flowTexture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
});

const flowTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(flowTube);


// --- 粒子を作成 ---
const particleCount = 5000; // パーティクル数を増やす
const positions = new Float32Array(particleCount * 3);
const initialPositions = []; // 各粒子の初期位置（球状）を保存
const particleUserData = []; // 各粒子に固有のデータを保存

// 粒子を各レイヤーにランダムに配置するための初期位置を計算
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // ランダムなレイヤーを選択
    const layerIndex = i % 3; // 均等に割り振る
    const targetLayer = layers[layerIndex];

    // レイヤーの平面上にランダムな初期位置を生成
    const initialPos = new THREE.Vector3(
        (Math.random() - 0.5) * 10, // x
        (Math.random() - 0.5) * 10, // y
        targetLayer.position.z      // z
    );
    initialPositions.push(initialPos);

    positions[i3] = initialPos.x;
    positions[i3 + 1] = initialPos.y;
    positions[i3 + 2] = initialPos.z;

    particleUserData.push({
        randomFactor: Math.random() + 0.5,
        // 凝集時のターゲット位置を保存（中心から少しずらす）
        aggregationTarget: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        )
    });
}

const particleGeom = new THREE.BufferGeometry();
particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// パーティクルのテクスチャを生成
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.8, 'rgba(200,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(200,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
}

const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    map: createParticleTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
});

const particles = new THREE.Points(particleGeom, particleMaterial);
scene.add(particles);

// --- UI要素の取得 ---
const aggregationSlider = document.getElementById('aggregation-slider');
const sizeSlider = document.getElementById('size-slider');
const distributionSlider = document.getElementById('distribution-slider');

// --- アニメーションループ ---
const targetPosition = new THREE.Vector3(); // 使いまわすためのVector3
const currentPosition = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);

    const aggregationValue = parseFloat(aggregationSlider.value) / 100.0; // 0 (凝集) to 1 (反発)
    const sizeValue = parseFloat(sizeSlider.value) / 100.0;

    particleMaterial.size = sizeValue * 0.5; // sizeSliderで基本サイズを変更

    const positions = particles.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // 現在位置を取得
        currentPosition.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

        // ターゲット位置を計算
        const dispersedPos = initialPositions[i];
        const aggregatedPos = particleUserData[i].aggregationTarget;

        // lerpを使って滑らかにターゲットへ移動
        // aggregationValue: 0 (凝集) to 1 (分散)
        targetPosition.lerpVectors(aggregatedPos, dispersedPos, aggregationValue);
        currentPosition.lerp(targetPosition, 0.05);

        positions[i3] = currentPosition.x;
        positions[i3 + 1] = currentPosition.y;
        positions[i3 + 2] = currentPosition.z;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // フローテクスチャをアニメーションさせる
    flowTexture.offset.x -= 0.01;

    // 凝集度合いに応じて輝きを変化させる
    // 分散(1)すると輝き(bloom)が増し、凝集(0)すると輝きが収まる
    bloomPass.strength = THREE.MathUtils.lerp(0.2, 0.7, aggregationValue); // 少し抑えめに
    bloomPass.radius = THREE.MathUtils.lerp(0.1, 0.3, aggregationValue); // 半径も変化させる
    particleMaterial.opacity = THREE.MathUtils.lerp(0.4, 1.0, aggregationValue);

    controls.update();
    composer.render();
}

// --- イベントリスナー ---
// スライダーを動かした時に再描画をトリガーするが、実際の更新はanimateループ内で行う
aggregationSlider.addEventListener('input', () => {});
sizeSlider.addEventListener('input', () => {});
distributionSlider.addEventListener('input', () => {});

// 初期化
animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});
