// 旋转状态管理
let rotationState = {
    isRotating: false,
    direction: 1, // 1 for clockwise (right click), -1 for counter-clockwise (left click)
    currentAngle: 0,
    targetAngle: 12 * Math.PI, // 6 full rotations
    startTime: 0,
    duration: 3000 // 3 seconds for rotation
};
let lastClickTime = 0;
let sceneAPI = null;

// 初始化控制
export function initControl(sceneAPIRef) {
    sceneAPI = sceneAPIRef;
    
    // 添加点击事件监听
    window.addEventListener('click', onMouseClick);
    
    return {
        isRotating: () => rotationState.isRotating,
        getCurrentAngle: () => rotationState.currentAngle,
        update: updateRotation
    };
}

// 处理鼠标点击
function onMouseClick(event) {
    if (!sceneAPI) return;
    
    const textMesh = sceneAPI.getTextMesh();
    if (!textMesh) return;
    
    const currentTime = Date.now();
    
    // 检查点击间隔是否超过0.4秒
    if (currentTime - lastClickTime < 400) {
        console.log('Click too fast, please wait 0.4 seconds');
        return;
    }
    
    lastClickTime = currentTime;
    
    // 计算点击位置相对于屏幕中心的偏移
    const screenCenterX = window.innerWidth / 2;
    const clickX = event.clientX;
    
    // 确定旋转方向
    // 点击左边：从左边开始旋转（逆时针）
    // 点击右边：从右边开始旋转（顺时针）
    if (clickX < screenCenterX) {
        console.log('Clicked left side - rotating counter-clockwise from left');
        rotationState.direction = -1; // 逆时针
    } else {
        console.log('Clicked right side - rotating clockwise from right');
        rotationState.direction = 1; // 顺时针
    }
    
    // 开始旋转
    startRotation();
}

// 开始旋转
function startRotation() {
    if (rotationState.isRotating) {
        // 如果正在旋转，重置旋转状态
        rotationState.startTime = Date.now();
        return;
    }
    
    rotationState.isRotating = true;
    rotationState.startTime = Date.now();
}

// 更新旋转状态（在动画循环中调用）
function updateRotation() {
    if (!sceneAPI) return false;
    
    const textMesh = sceneAPI.getTextMesh();
    if (!textMesh) return false;
    
    if (!rotationState.isRotating) return false;
    
    const currentTime = Date.now();
    const elapsed = currentTime - rotationState.startTime;
    
    if (elapsed < rotationState.duration) {
        // 计算动画进度（0到1）
        const progress = elapsed / rotationState.duration;
        
        // 使用缓动函数：由快到慢（easeOutQuad）
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        
        // 计算当前角度
        const targetAngle = rotationState.direction * rotationState.targetAngle;
        rotationState.currentAngle = easedProgress * targetAngle;
        
        // 应用旋转（围绕Y轴旋转，以文字中心为中心）
        textMesh.rotation.y = rotationState.currentAngle;
        
        return true; // 继续旋转
    } else {
        // 旋转完成
        rotationState.isRotating = false;
        rotationState.currentAngle = 0;
        textMesh.rotation.y = 0; // 恢复到初始位置
        
        return false; // 旋转结束
    }
}

// 停止旋转
export function stopRotation() {
    rotationState.isRotating = false;
}

// 重置旋转状态
export function resetRotation() {
    rotationState.isRotating = false;
    rotationState.currentAngle = 0;
    rotationState.direction = 1;
    
    if (sceneAPI) {
        const textMesh = sceneAPI.getTextMesh();
        if (textMesh) {
            textMesh.rotation.y = 0;
        }
    }
}
