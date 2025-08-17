<template>
  <div 
    ref="floatingButton"
    class="floating-dropdown"
    :style="isClient ? { top: `${position.y}px`, right: `${position.x}px` } : {}"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="startDrag"
  >
    <!-- 主按钮 -->
    <div class="main-button" :class="{ dragging: isDragging }">
      <i class="i-tabler-shield-lock text-4"></i>
    </div>

    <!-- Dropdown 菜单 -->
    <div 
      class="dropdown-menu" 
      :class="{ 'show': isExpanded && !isDragging }"
    >
      <div v-if="!isLoggedIn" class="dropdown-item" @click="handleLogin">
        <i class="i-tabler-login"></i>
        <span>登录</span>
      </div>
      <div v-if="isLoggedIn" class="dropdown-item" @click="handleAdmin">
        <i class="i-tabler-settings"></i>
        <span>管理后台</span>
      </div>
      <div v-if="isLoggedIn" class="dropdown-item" @click="handleLogout">
        <i class="i-tabler-logout"></i>
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isLoggedIn, logout, loadUserFromToken } = useAuth()

// 响应式状态
const floatingButton = ref<HTMLElement>()
const isExpanded = ref(false)
const isDragging = ref(false)
const isClient = ref(false)

// 位置状态
const position = ref({
  x: 0, // 距离右边的距离，贴右边
  y: 300 // 默认位置，客户端挂载后会重新计算
})

// 拖拽状态
const dragState = ref({
  startX: 0,
  startY: 0,
  startRight: 0,
  startTop: 0
})

// 鼠标进入 - 自动展开
function handleMouseEnter() {
  if (!isDragging.value) {
    isExpanded.value = true
  }
}

// 鼠标离开 - 收起
function handleMouseLeave() {
  if (!isDragging.value) {
    isExpanded.value = false
  }
}

// 菜单项点击处理
function handleLogin() {
  isExpanded.value = false
  navigateTo('/login')
}

function handleAdmin() {
  isExpanded.value = false
  navigateTo('/admin')
}

function handleLogout() {
  isExpanded.value = false
  logout()
}


// 拖拽开始
function startDrag(e: MouseEvent) {
  e.preventDefault()
  
  const startPos = { x: e.clientX, y: e.clientY }
  
  const handleFirstMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - startPos.x)
    const deltaY = Math.abs(moveEvent.clientY - startPos.y)
    
    // 移动超过5px才开始拖拽
    if (deltaX > 5 || deltaY > 5) {
      isDragging.value = true
      isExpanded.value = false
      
      dragState.value = {
        startX: startPos.x,
        startY: startPos.y,
        startRight: position.value.x,
        startTop: position.value.y
      }

      document.removeEventListener('mousemove', handleFirstMove)
      document.addEventListener('mousemove', onDrag)
      document.body.style.userSelect = 'none'
    }
  }
  
  const handleFirstUp = () => {
    document.removeEventListener('mousemove', handleFirstMove)
    document.removeEventListener('mouseup', handleFirstUp)
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', handleFirstMove)
  document.addEventListener('mouseup', handleFirstUp)
  document.addEventListener('mouseup', stopDrag)
}

// 拖拽过程
function onDrag(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = dragState.value.startX - e.clientX
  const deltaY = e.clientY - dragState.value.startY

  const newRight = Math.max(0, Math.min(window.innerWidth - 40, dragState.value.startRight + deltaX))
  const newTop = Math.max(0, Math.min(window.innerHeight - 40, dragState.value.startTop + deltaY))

  position.value = {
    x: newRight,
    y: newTop
  }
}

// 拖拽结束
function stopDrag() {
  if (!isDragging.value) return
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.userSelect = ''
  
  // 吸附到右边
  snapToRight()
  
  // 重置拖拽状态
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// 吸附到右边
function snapToRight() {
  position.value.x = 0 // 贴右边
}

// 窗口大小变化处理
function handleResize() {
  const maxTop = window.innerHeight - 40
  position.value.y = Math.min(position.value.y, maxTop)
  snapToRight()
}

// 组件挂载
onMounted(async () => {
  if (typeof window !== 'undefined') {
    isClient.value = true
    position.value.y = window.innerHeight / 2 - 20
    window.addEventListener('resize', handleResize)
    
    // 加载登录状态
    await loadUserFromToken()
  }
})

// 组件卸载
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
})
</script>

<style scoped>
.floating-dropdown {
  position: fixed;
  z-index: 1000;
  /* 服务端渲染默认位置 */
  top: 300px;
  right: 0px;
}

.main-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  color: rgb(156 163 175);
  position: relative;
  backdrop-filter: blur(20px);
}

.main-button:hover {
  background: var(--logo-bg);
  border-color: var(--logo-bg);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--logo-bg), transparent 70%);
  color: white;
  transform: translateX(-2px);
}

.main-button.dragging {
  cursor: grabbing;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.dropdown-menu {
  position: absolute;
  top: 50%;
  right: 44px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-50%) translateX(15px) scale(0.95);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 130px;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(0) scale(1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  color: rgb(55 65 81);
  white-space: nowrap;
  position: relative;
}

.dropdown-item:hover {
  background: var(--logo-bg);
  color: white;
  transform: translateX(-2px);
}

.dropdown-item i {
  margin-right: 8px;
  color: rgb(107 114 128);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.dropdown-item:hover i {
  color: white;
}

.dropdown-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-button {
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }

  .dropdown-menu {
    right: 40px;
    min-width: 110px;
  }

  .dropdown-item {
    padding: 8px 12px;
    font-size: 12px;
  }

  .dropdown-item i {
    margin-right: 6px;
    width: 14px;
    height: 14px;
    font-size: 12px;
  }
}

/* 暗黑模式 */
.dark .main-button {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
  color: rgb(107 114 128);
}

.dark .main-button:hover {
  background: var(--logo-bg);
  border-color: var(--logo-bg);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--logo-bg), transparent 60%);
  color: white;
}

.dark .main-button.dragging {
  background: rgba(0, 0, 0, 0.15);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.1);
}

.dark .dropdown-menu {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.dark .dropdown-item {
  color: rgb(243 244 246);
}

.dark .dropdown-item:hover {
  background: var(--logo-bg);
  color: white;
}

.dark .dropdown-item i {
  color: rgb(156 163 175);
}

.dark .dropdown-item:hover i {
  color: white;
}

.dark .dropdown-item:not(:last-child)::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}
</style>