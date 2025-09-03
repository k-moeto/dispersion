import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

// --- 初期設定 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 15);

// --- ライト ---
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- 代表的なマテリアル（粒子全体で共有）---
const sharedMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B0000, // ナイロン織物のような濃い赤
    roughness: 0.8,
    metalness: 0.1
});

// --- 粒子を作成 ---
const particles = [];
const particleCount = 300;
const particleGeom = new THREE.SphereGeometry(0.2, 16, 16);

// 粒子を球状に配置するための初期位置を計算
for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const particle = new THREE.Mesh(particleGeom, sharedMaterial);
    
    // 均一に分散した初期位置（反発状態）
    const initialPos = new THREE.Vector3();
    initialPos.setFromSphericalCoords(5, phi, theta);
    particle.position.copy(initialPos);

    // 各粒子に固有の情報を追加
    particle.userData = {
        initialPosition: initialPos, // 反発時のターゲット位置
        randomFactor: Math.random() + 0.5 // 粒子径分布用
    };
    
    scene.add(particle);
    particles.push(particle);
}

// --- UI要素の取得 ---
const aggregationSlider = document.getElementById('aggregation-slider');
const sizeSlider = document.getElementById('size-slider');
const distributionSlider = document.getElementById('distribution-slider');

// --- 状態を更新する関数 ---
function updateSimulation() {
    // スライダーの値を取得
    const aggregationValue = parseFloat(aggregationSlider.value) / 100.0; // 0 (凝集) to 1 (反発)
    const sizeValue = parseFloat(sizeSlider.value) / 100.0;
    const distributionValue = parseFloat(distributionSlider.value) / 100.0;
    
    // 凝集度合いに応じてマテリアルの質感を変更
    // 凝集するとマットに(roughness=1)、分散するとツルツルに(roughness=0.1)
    sharedMaterial.roughness = THREE.MathUtils.lerp(1.0, 0.1, aggregationValue);
    sharedMaterial.metalness = THREE.MathUtils.lerp(0.0, 0.5, aggregationValue);

    particles.forEach(p => {
        // 1. 凝集・反発のターゲット位置を計算
        // aggregationValueが0のとき中心、1のとき初期位置になるように線形補間
        const targetPosition = new THREE.Vector3().lerpVectors(
            new THREE.Vector3(0, 0, 0), // 凝集時のターゲット
            p.userData.initialPosition,  // 反発時のターゲット
            aggregationValue
        );

        // 2. 現在位置からターゲット位置へ滑らかに移動
        p.position.lerp(targetPosition, 0.05);

        // 3. 粒子径と分布をスケールに反映
        const baseScale = sizeValue;
        const randomScale = p.userData.randomFactor * distributionValue;
        const finalScale = baseScale + randomScale;
        p.scale.set(finalScale, finalScale, finalScale);
    });
}

// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    // 毎フレームシミュレーションの状態を更新
    updateSimulation();

    controls.update();
    renderer.render(scene, camera);
}

// 初期化 & アニメーション開始
animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
