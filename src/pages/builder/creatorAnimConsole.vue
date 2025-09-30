<template>
  <div class="anim-console-wrapper">
    <el-button 
      class="toggle-button"
      type="primary"
      circle
      @click="showConsole = !showConsole"
    >
      <el-icon><VideoCameraFilled /></el-icon>
    </el-button>

    <div class="anim-console" :class="{ 'is-visible': showConsole }">
      <div class="console-header" @mousedown="startDrag">
        <div class="title-group">
          <el-icon><VideoCameraFilled /></el-icon>
          <span>Animation Control</span>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-tooltip content="Play All" placement="top">
              <el-button type="primary" size="small" icon="el-icon-video-play" @click="playAll"></el-button>
            </el-tooltip>
            <el-tooltip content="Pause All" placement="top">  
              <el-button type="warning" size="small" icon="el-icon-video-pause" @click="pauseAll"></el-button>
            </el-tooltip>
          </el-button-group>
          <el-button 
            circle 
            size="small"
            @click="showConsole = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="timeline-list">
        <div v-for="timeline in timelines" 
             :key="timeline.id" 
             class="timeline-item"
        >
          <div class="timeline-row">
            <div class="timeline-info">
              <el-tooltip :content="timeline.id" placement="top">
                <span class="timeline-name text-ellipsis">{{ timeline.id }}</span>
              </el-tooltip>
              <el-switch
                v-model="switchValue[timeline.id]"
                @change="handleSwitch(timeline.id)"
                size="small"
              />
            </div>
            
            <div class="timeline-progress">
              <el-slider
                :min="0"
                :max="1"
                :step="0.01"
                v-model="sliderValue[timeline.id]"
                :show-tooltip="false"
                @input="handleSlider(timeline.id)"
                size="small"
              />
            </div>

            <div class="timeline-status">
              <el-tag size="small" :type="switchValue[timeline.id] ? 'success' : 'info'">
                {{ switchValue[timeline.id] ? 'Playing' : 'Paused' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import engine from './engine.js';
import { VideoCameraFilled, Close } from '@element-plus/icons-vue'
import { projectStore } from './store/projectStore.js';

export default {
  name: 'creator-anim-console',
  components: {
    VideoCameraFilled,
    Close
  },
  emits: ['save'],
  data() {
    return {
      switchValue: {},
      sliderValue: {},
      showConsole: false,
      position: {
        x: 20,
        y: 20
      }
    };
  },
  computed: {
    timelines() {
      return projectStore.projectData.animations.timelines;
    }
  },
  methods: {
    handleSwitch(id) {
      const value = this.switchValue[id];
      if (value) {
        engine.simulatorTimeline.start(id);
      } else {
        engine.simulatorTimeline.pause(id);
      }
    },
    handleSlider(id) {
      const value = this.sliderValue[id];
      // console.log('handleSlider', id, value);
      engine.simulatorTimeline.progress(id, value);
    },

    playAll() {
      this.timelines.forEach(timeline => {
        this.switchValue[timeline.id] = true;
        engine.simulatorTimeline.start(timeline.id);
      });
    },

    pauseAll() {
      this.timelines.forEach(timeline => {
        this.switchValue[timeline.id] = false;
        engine.simulatorTimeline.pause(timeline.id);
      });
    },

    startDrag(event) {
      const consoleEl = event.currentTarget.parentElement
      const startX = event.clientX - this.position.x
      const startY = event.clientY - this.position.y

      const mousemove = (e) => {
        this.position.x = e.clientX - startX
        this.position.y = e.clientY - startY
        consoleEl.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`
      }

      const mouseup = () => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }

      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseup)
    }
  }
};
</script>

<style lang="less" scoped>
.anim-console-wrapper {
  position: absolute;
  top: 24px;
  right: 8px;
  z-index: 2000;

  .toggle-button {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2001;
    width: 32px;
    height: 32px;
    padding: 0;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.anim-console {
  position: absolute;
  top: 40px;
  right: 0;
  width: 400px;
  padding: 8px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  font-size: 12px;
  transform: translate(0, 0);
  transition: all 0.3s;
  opacity: 0;
  visibility: hidden;
  
  &.is-visible {
    opacity: 1;
    visibility: visible;
  }

  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: move;

    .title-group {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--el-text-color-primary);
      font-weight: 500;
      
      .el-icon {
        font-size: 16px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .timeline-item {
    background: var(--el-bg-color);
    border-radius: 4px;
    border: 1px solid var(--el-border-color-lighter);

    .timeline-row {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      gap: 12px;
    }

    .timeline-info {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      
      .timeline-name {
        max-width: 80px;
      }
    }

    .timeline-progress {
      flex: 1;
      min-width: 100px;
      
      :deep(.el-slider__runway) {
        height: 4px;
        margin: 8px 0;
      }

      :deep(.el-slider__bar) {
        height: 4px;
      }

      :deep(.el-slider__button) {
        width: 12px;
        height: 12px;
      }
    }

    .timeline-status {
      min-width: 60px;
    }
  }
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 暗色主题适配
:deep(.dark) {
  .anim-console {
    background: var(--el-bg-color);
  }
}
</style>
