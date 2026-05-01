import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// 场景变量
let scene, camera, renderer;
let textMesh = null;
let animationId = null;
let onAnimationLoop = null;

// 初始化场景
export function initScene(containerId) {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // 创建相机
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById(containerId).appendChild(renderer.domElement);
    
    // 添加光源
    addLights();
    
    // 加载字体并创建文字
    loadFont();
    
    // 添加窗口大小调整事件
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    startAnimationLoop();
    
    return {
        getTextMesh: () => textMesh,
        getScene: () => scene,
        getCamera: () => camera,
        getRenderer: () => renderer,
        render: render,
        dispose: dispose
    };
}

// 添加光源
function addLights() {
    // 环境光 - 提高整体亮度
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // 方向光 - 模拟右上角的主光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(5, 5, 5); // 右上角位置
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 点光源 - 增强高光效果（白色反光）
    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);
    
    // 第二个点光源 - 从不同角度提供照明
    const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight2.position.set(-3, 5, 2);
    scene.add(pointLight2);
    
    // 半球光 - 模拟环境反射
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemisphereLight);
}

// 加载字体
function loadFont() {
    const fontLoader = new FontLoader();
    
    // 使用Three.js内置的字体
    fontLoader.load(
        'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
        function(font) {
            createText(font);
        },
        // 加载进度
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // 加载错误
        function(error) {
            console.error('An error happened while loading the font:', error);
            // 如果加载失败，尝试使用另一种方法
            loadFallbackFont();
        }
    );
}

// 备用字体加载方案
function loadFallbackFont() {
    console.log('Trying to load fallback font...');
    const fontLoader = new FontLoader();
    
    // 尝试加载另一个字体
    fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
        function(font) {
            console.log('Fallback font loaded successfully');
            createText(font);
        },
        null,
        function(error) {
            console.error('Fallback font also failed:', error);
            // 最后尝试：使用简单几何体代替文字
            createFallbackGeometry();
        }
    );
}

// 创建备用几何体（当字体加载失败时）
function createFallbackGeometry() {
    console.log('Creating fallback geometry...');
    
    const group = new THREE.Group();
    
    // 创建一个简单的3D形状代替文字
    const boxGeometry = new THREE.BoxGeometry(4, 1, 0.5);
    const material = createYellowMetalMaterial();
    const box = new THREE.Mesh(boxGeometry, material);
    group.add(box);
    
    // 计算边界框并居中
    group.computeBoundingBox();
    const center = new THREE.Vector3();
    group.boundingBox.getCenter(center);
    group.position.sub(center);
    
    textMesh = group;
    scene.add(textMesh);
}

// 创建文字
function createText(font) {
    const textGeometry = new TextGeometry('Hello World', {
        font: font,
        size: 1,
        height: 0.4,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.03,
        bevelSegments: 5
    });
    
    // 创建黄色金属材质
    const material = createYellowMetalMaterial();
    
    // 计算边界框并居中几何体
    textGeometry.computeBoundingBox();
    const box = textGeometry.boundingBox;
    const centerOffsetX = -0.5 * (box.max.x - box.min.x);
    const centerOffsetY = -0.5 * (box.max.y - box.min.y);
    const centerOffsetZ = -0.5 * (box.max.z - box.min.z);
    
    // 平移几何体使其中心位于原点
    textGeometry.translate(centerOffsetX, centerOffsetY, centerOffsetZ);
    
    // 创建文字网格
    textMesh = new THREE.Mesh(textGeometry, material);
    
    scene.add(textMesh);
}

// 创建黄色金属材质
function createYellowMetalMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xffff00, // 纯黄色
        metalness: 0.7, // 适度金属感，避免颜色被完全反射覆盖
        roughness: 0.2, // 适度粗糙度，平衡反光和颜色显示
        emissive: 0x333300, // 微弱的黄色自发光，增强颜色饱和度
        emissiveIntensity: 0.3
    });
}

// 渲染场景
function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// 开始动画循环
function startAnimationLoop() {
    function animate() {
        animationId = requestAnimationFrame(animate);
        if (onAnimationLoop) {
            onAnimationLoop();
        }
        render();
    }
    animate();
}

// 设置动画循环回调
export function setAnimationLoop(callback) {
    onAnimationLoop = callback;
}

// 窗口大小调整
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 清理资源
function dispose() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
}
