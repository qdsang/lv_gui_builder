<template>
  <el-container class="main-container">
    <div class="aside-wrapper left" :class="{ 'is-collapsed': leftCollapsed }">
      <el-aside :width="leftWidth + 'px'" class="resizable-aside resizable-aside-left">
        <slot name="left"></slot>
      </el-aside>
      <div class="resize-handle left" 
        @mousedown="startResize($event, 'left')"
      ></div>
      <div class="collapse-handle left" @click="toggleLeftPanel">
        <el-icon :class="{ 'is-collapsed': leftCollapsed }">
          <CaretLeft />
        </el-icon>
      </div>
    </div>

    <el-main style="padding: 0">
      <slot name="center"></slot>
    </el-main>

    <div class="aside-wrapper right" :class="{ 'is-collapsed': rightCollapsed }">
      <div class="collapse-handle right" @click="toggleRightPanel">
        <el-icon :class="{ 'is-collapsed': rightCollapsed }">
          <CaretRight />
        </el-icon>
      </div>
      <div class="resize-handle right" 
        @mousedown="startResize($event, 'right')"
      ></div>
      <el-aside :width="rightWidth + 'px'" class="resizable-aside resizable-aside-right">
        <slot name="right"></slot>
      </el-aside>
    </div>
  </el-container>
</template>
<script>
import { CaretLeft, CaretRight } from '@element-plus/icons-vue'

export default {
  name: 'CreatorWindow',
  components: {
    CaretLeft,
    CaretRight,
  },
  data() {
    return {
      leftWidth: 220,  // 左侧面板宽度
      rightWidth: 220, // 右侧面板宽度
      leftCollapsed: false,  // 左侧面板折叠状态
      rightCollapsed: false, // 右侧面板折叠状态
      leftWidthBeforeCollapse: 280,  // 记录折叠前的宽度
      rightWidthBeforeCollapse: 320,
    }
  },
  mounted() {
    // 从本地存储加载面板状态
    this.loadPanelStates();
  },
  methods: {
    // 从本地存储加载面板状态
    loadPanelStates() {
      try {
        const savedLeftCollapsed = localStorage.getItem('creatorWindow.leftCollapsed');
        const savedRightCollapsed = localStorage.getItem('creatorWindow.rightCollapsed');
        const savedLeftWidth = localStorage.getItem('creatorWindow.leftWidth');
        const savedRightWidth = localStorage.getItem('creatorWindow.rightWidth');
        const savedLeftWidthBeforeCollapse = localStorage.getItem('creatorWindow.leftWidthBeforeCollapse');
        const savedRightWidthBeforeCollapse = localStorage.getItem('creatorWindow.rightWidthBeforeCollapse');

        if (savedLeftCollapsed !== null) {
          this.leftCollapsed = JSON.parse(savedLeftCollapsed);
        }
        
        if (savedRightCollapsed !== null) {
          this.rightCollapsed = JSON.parse(savedRightCollapsed);
        }
        
        if (savedLeftWidth !== null) {
          this.leftWidth = JSON.parse(savedLeftWidth);
        }
        
        if (savedRightWidth !== null) {
          this.rightWidth = JSON.parse(savedRightWidth);
        }
        
        if (savedLeftWidthBeforeCollapse !== null) {
          this.leftWidthBeforeCollapse = JSON.parse(savedLeftWidthBeforeCollapse);
        }
        
        if (savedRightWidthBeforeCollapse !== null) {
          this.rightWidthBeforeCollapse = JSON.parse(savedRightWidthBeforeCollapse);
        }
        
        // 如果面板处于折叠状态，确保宽度为0
        if (this.leftCollapsed) {
          this.leftWidth = 0;
        }
        
        if (this.rightCollapsed) {
          this.rightWidth = 0;
        }
      } catch (error) {
        console.error('Failed to load panel states from localStorage:', error);
      }
    },
    
    // 保存面板状态到本地存储
    savePanelStates() {
      try {
        localStorage.setItem('creatorWindow.leftCollapsed', JSON.stringify(this.leftCollapsed));
        localStorage.setItem('creatorWindow.rightCollapsed', JSON.stringify(this.rightCollapsed));
        localStorage.setItem('creatorWindow.leftWidth', JSON.stringify(this.leftWidth));
        localStorage.setItem('creatorWindow.rightWidth', JSON.stringify(this.rightWidth));
        localStorage.setItem('creatorWindow.leftWidthBeforeCollapse', JSON.stringify(this.leftWidthBeforeCollapse));
        localStorage.setItem('creatorWindow.rightWidthBeforeCollapse', JSON.stringify(this.rightWidthBeforeCollapse));
      } catch (error) {
        console.error('Failed to save panel states to localStorage:', error);
      }
    },

    // 开始拖拽调整宽度
    startResize(event, side) {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = side === 'left' ? this.leftWidth : this.rightWidth;
      
      const handleMouseMove = (e) => {
        const delta = e.clientX - startX;
        if (side === 'left') {
          this.leftCollapsed = false;
          const newWidth = startWidth + delta;
          this.leftWidth = Math.max(100, Math.min(newWidth, 600)); // 限制最小/最大宽度
        } else {
          this.rightCollapsed = false;
          const newWidth = startWidth - delta;
          this.rightWidth = Math.max(100, Math.min(newWidth, 600));
        }
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // 保存面板状态
        this.savePanelStates();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },

    // 切换左侧面板
    toggleLeftPanel() {
      if (this.leftCollapsed) {
        this.leftWidth = this.leftWidthBeforeCollapse;
      } else {
        this.leftWidthBeforeCollapse = this.leftWidth;
        this.leftWidth = 0;
      }
      this.leftCollapsed = !this.leftCollapsed;
      // 保存面板状态
      this.savePanelStates();
    },

    // 切换右侧面板
    toggleRightPanel() {
      if (this.rightCollapsed) {
        this.rightWidth = this.rightWidthBeforeCollapse;
      } else {
        this.rightWidthBeforeCollapse = this.rightWidth;
        this.rightWidth = 0;
      }
      this.rightCollapsed = !this.rightCollapsed;
      // 保存面板状态
      this.savePanelStates();
    },
  }
}
</script>
<style lang="less" scoped>
.creator-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-container {
  position: relative;
  height: calc(100% - 60px);
}

.aside-wrapper {
  position: relative;
  height: 100%;
  transition: transform 0.1s;
  z-index: 1;

  &.left {
    &.is-collapsed {
      transform: translateX(-100%);
      
      .collapse-handle {
        transform: translateX(100%);
        right: 0;
      }
    }
  }

  &.right {
    &.is-collapsed {
      transform: translateX(100%);
      
      .collapse-handle {
        transform: translateX(-100%);
        left: 0;
      }
    }
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.1s;

  &:hover {
    background: var(--el-color-primary-light-8);
  }

  &.left {
    right: -2px;
  }

  &.right {
    left: -2px;
  }
}

.resizable-aside {
  height: 100%;
  overflow: scroll;
  background: var(--el-bg-color-overlay);
  border-right: 1px solid var(--el-border-color-lighter);
  transition: width 0.1s;
}
.resizable-aside-right {
  border-left: 1px solid var(--el-border-color);
}

.collapse-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  z-index: 10;
  transition: all 0.1s;

  &:hover {
    background: var(--el-color-primary-light-9);
  }

  &.left {
    right: -15px;
    border-left: none;
  }

  &.right {
    left: -15px;
    border-right: none;
    border-radius: 4px 0 0 4px;
  }

  .el-icon {
    transition: transform 0.1s;
    
    &.is-collapsed {
      transform: rotate(180deg);
    }
  }
}
</style>
