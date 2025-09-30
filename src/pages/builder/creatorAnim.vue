<template>
  <div class="creator-anim">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">Animation Timeline</div>
      <div class="toolbar-actions">
        <el-button class="action-btn" type="primary" icon="el-icon-plus" size="small" @click="timelineAdd">Timeline</el-button>
        <el-button class="action-btn" type="success" icon="el-icon-refresh" size="small" @click="timelineSave">Save</el-button>
      </div>
    </div>

    <div class="anim-editor-container">
      <!-- 主时间线区域 -->
      <div class="main-timeline-panel">
        <div class="timeline-header">
          <div class="time-ruler" ref="timeRuler">
            <div 
              v-for="tick in 11" 
              :key="tick" 
              class="time-tick"
              :style="{ left: `${(tick-1) * 10}%` }"
            >
              {{ (tick-1) * 200 }}ms
            </div>
          </div>
        </div>
        
        <div class="timeline-content" ref="timelineContent">
          <div 
            v-for="(timeline, tindex) in timelines" 
            :key="timeline.id" 
            class="timeline-track-group"
          >
            <!-- 时间线组行 -->
            <div 
              class="timeline-row"
              :class="{ 'selected': selectedTimeline === timeline }"
              @click="selectTimeline(timeline)"
            >
              <div class="row-content">
                <el-button 
                  icon="el-icon-arrow-right" 
                  :class="{ 'expanded': expandedTimelines.has(timeline.id) }"
                  @click.stop="toggleTimeline(timeline)"
                />
                <span class="timeline-id-display">{{ timeline.id }}</span>
              </div>
              <div class="timeline-actions">
                <el-tooltip content="Add Animation" placement="top">
                  <el-button type="primary" size="small" icon="el-icon-plus" circle @click.stop="animAdd(timeline)"></el-button>
                </el-tooltip>
                <el-tooltip content="Duplicate Timeline" placement="top">
                  <el-button type="info" size="small" icon="el-icon-copy-document" circle @click.stop="timelineCopy(timeline)"></el-button>
                </el-tooltip>
                <el-tooltip content="Delete Timeline" placement="top">
                  <el-button type="danger" size="small" icon="el-icon-delete" circle @click.stop="timelineRemove(tindex)"></el-button>
                </el-tooltip>
              </div>
            </div>
            
            <!-- 动画项行（可折叠） -->
            <div 
              v-show="expandedTimelines.has(timeline.id)" 
              class="anim-track-list"
            >
              <div 
                v-for="(anim, aindex) in timeline.anims" 
                :key="anim.id || aindex"
                class="anim-row"
                :class="{ 'selected': selectedAnim === anim }"
                @click="selectAnim(anim, timeline)"
                @dblclick="openAnimEditDialog(anim, timeline)"
              >
                <div class="anim-info">
                  <span class="anim-name">{{ anim.name || anim.path_cb || 'Animation' }}</span>
                </div>
                <div class="anim-track-wrapper">
                  <div class="anim-track">
                    <div 
                      class="anim-block"
                      :style="{
                        left: `${(anim.start_time / 2000) * 100}%`,
                        width: `${Math.max((anim.time / 2000) * 100, 0.5)}%`
                      }"
                    >
                      <div class="anim-content">
                        <div class="drag-handle left" @mousedown="startDrag($event, anim, 'start')"></div>
                        <div class="drag-handle right" @mousedown="startDrag($event, anim, 'end')"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 动画编辑弹窗 -->
    <el-dialog
      v-model="animEditDialogVisible"
      title="Edit Animation"
      width="500px"
      :before-close="handleAnimEditDialogClose"
    >
      <div v-if="editingAnim" class="anim-edit-dialog">
        <div class="property-group">
          <div class="property-item">
            <label>Name</label>
            <el-input 
              v-model="editingAnim.name" 
              size="small" 
              placeholder="Animation name"
            />
          </div>
          
          <div class="property-item">
            <label>Path</label>
            <el-input 
              v-model="editingAnim.path_cb" 
              size="small" 
              placeholder="Path callback"
            />
          </div>
          
          <div class="property-item">
            <label>Start Time</label>
            <el-input-number 
              v-model="editingAnim.start_time" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Duration</label>
            <el-input-number 
              v-model="editingAnim.time" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Value Min</label>
            <el-input-number 
              v-model="editingAnim.valueMin" 
              size="small" 
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Value Max</label>
            <el-input-number 
              v-model="editingAnim.valueMax" 
              size="small" 
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Playback Delay</label>
            <el-input-number 
              v-model="editingAnim.playback_delay" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Playback Time</label>
            <el-input-number 
              v-model="editingAnim.playback_time" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Repeat Delay</label>
            <el-input-number 
              v-model="editingAnim.repeat_delay" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <div class="property-item">
            <label>Repeat Count</label>
            <el-input-number 
              v-model="editingAnim.repeat_count" 
              size="small" 
              :min="0"
              controls-position="right"
            />
          </div>
          
          <!-- Objects Section -->
          <div class="property-item">
            <label>Objects</label>
            <div class="objs-container">
              <div 
                v-for="(obj, objIndex) in editingAnim.objs" 
                :key="objIndex"
                class="obj-item"
              >
                <div class="obj-row">
                  <el-input 
                    v-model="obj.id"
                    size="small" 
                    placeholder="Object ID"
                    class="obj-id-input"
                  />
                  <el-input 
                    v-model="obj.attr"
                    size="small" 
                    placeholder="Attribute"
                    class="obj-attr-input"
                  />
                  <el-button 
                    type="danger" 
                    size="small" 
                    icon="el-icon-delete" 
                    circle 
                    @click="removeObjFromDialog(objIndex)"
                  ></el-button>
                </div>
              </div>
              <el-button 
                type="primary" 
                size="small" 
                icon="el-icon-plus" 
                @click="addObjToDialog"
              >
                Add Object
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAnimEditDialog">Cancel</el-button>
          <el-button type="primary" @click="saveAnimEditDialog">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import engine from './engine.js';
import { projectStore } from './store/projectStore.js';
import { useDark } from '@vueuse/core';

export default {
  name : 'creator-anim',
  emits: ['save'],
  data: function() {
      return {
        selectedTimeline: null,
        selectedAnim: null,
        expandedTimelines: new Set(),
        isDragging: false,
        dragType: null,
        dragAnim: null,
        startX: 0,
        startStartTime: 0,
        startDuration: 0,
        // 动画编辑弹窗相关数据
        animEditDialogVisible: false,
        editingAnim: null,
        editingAnimOriginal: null,
        editingTimeline: null
      }
  },
  setup() {
    const isDark = useDark();
    return { isDark };
  },
  watch: {
  },
  computed: {
    timelines() {
      return projectStore.projectData.animations.timelines;
    }
  },
  mounted() {
    // 默认展开所有时间线
    this.timelines.forEach(timeline => {
      this.expandedTimelines.add(timeline.id);
    });
    
    // 添加鼠标移动和松开事件监听器
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  },
  beforeUnmount() {
    // 清理事件监听器
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  },
  methods: {
    toggleTimeline(timeline) {
      if (this.expandedTimelines.has(timeline.id)) {
        this.expandedTimelines.delete(timeline.id);
      } else {
        this.expandedTimelines.add(timeline.id);
      }
    },
    
    selectTimeline(timeline) {
      this.selectedTimeline = timeline;
      this.selectedAnim = null;
    },
    
    selectAnim(anim, timeline) {
      this.selectedAnim = anim;
      this.selectedTimeline = timeline;
    },    

    openAnimEditDialog(anim, timeline) {
      // 保存原始数据用于取消操作
      this.editingAnimOriginal = JSON.parse(JSON.stringify(anim));
      this.editingAnim = JSON.parse(JSON.stringify(anim));
      this.editingTimeline = timeline;
      this.animEditDialogVisible = true;
    },
    
    closeAnimEditDialog() {
      this.animEditDialogVisible = false;
      this.editingAnim = null;
      this.editingTimeline = null;
    },
    
    saveAnimEditDialog() {
      if (this.editingAnim && this.editingTimeline) {
        // 找到对应的动画并更新
        const animIndex = this.editingTimeline.anims.findIndex(a => a.id === this.editingAnim.id);
        if (animIndex !== -1) {
          // 更新动画数据
          this.editingTimeline.anims[animIndex] = JSON.parse(JSON.stringify(this.editingAnim));
        }
      }
      this.closeAnimEditDialog();
    },
    
    handleAnimEditDialogClose() {
      this.closeAnimEditDialog();
    },
    
    animAdd(timeline) {
      let anim = engine.Widget.createTimelineAnim();
      // 为动画添加一个唯一ID
      anim.id = 'anim_' + Date.now();
      // 初始化name字段
      anim.name = 'Animation ' + (timeline.anims.length + 1);
      timeline.anims.push(anim);
      // 确保时间线是展开的
      this.expandedTimelines.add(timeline.id);
    },
    
    animCopy(props, timeline) {
      let anim = JSON.parse(JSON.stringify(props.row));
      anim.id = 'anim_' + Date.now();
      timeline.anims.push(anim);
    },
    
    animRemove(props, timeline) {
      timeline.anims.splice(props.$index, 1);
      if (this.selectedAnim === props.row) {
        this.selectedAnim = null;
      }
    },
    
    animCopyFromPanel() {
      if (!this.selectedAnim || !this.selectedTimeline) return;
      
      let anim = JSON.parse(JSON.stringify(this.selectedAnim));
      anim.id = 'anim_' + Date.now();
      this.selectedTimeline.anims.push(anim);
    },
    
    animRemoveFromPanel() {
      if (!this.selectedAnim || !this.selectedTimeline) return;
      
      const index = this.selectedTimeline.anims.indexOf(this.selectedAnim);
      if (index !== -1) {
        this.selectedTimeline.anims.splice(index, 1);
      }
    },

    objAdd(anim) {
      let obj = engine.Widget.createTimelineObj();
      anim.objs.push(obj);
    },
    
    objRemove(index, anim) {
      anim.objs.splice(index, 1);
    },
    
    addObj(anim) {
      this.objAdd(anim);
    },
    
    removeObj(index, anim) {
      this.objRemove(index, anim);
    },
    
    // 弹窗中添加对象的方法
    addObjToDialog() {
      if (this.editingAnim) {
        let obj = engine.Widget.createTimelineObj();
        this.editingAnim.objs.push(obj);
      }
    },
    
    // 弹窗中移除对象的方法
    removeObjFromDialog(index) {
      if (this.editingAnim) {
        this.editingAnim.objs.splice(index, 1);
      }
    },
    
    edit(props) {
      props.row.iseditor = true;
    },
    
    save(props) {
      props.row.iseditor = false;
    },
    
    timelineAdd() {
      let timeline = engine.Widget.createTimeline();
      timeline.id = 'timeline_' + (this.timelines.length + 1);
      this.timelines.push(timeline);
      this.selectedTimeline = timeline;
      this.selectedAnim = null;
      // 展开新添加的时间线
      this.expandedTimelines.add(timeline.id);
    },
    
    timelineCopy(timeline2) {
      let timeline = JSON.parse(JSON.stringify(timeline2));
      timeline.id = 'timeline_' + (this.timelines.length + 1);
      this.timelines.push(timeline);
    },
    
    timelineRemove(index) {
      const timeline = this.timelines[index];
      if (this.selectedTimeline === timeline) {
        this.selectedTimeline = null;
        this.selectedAnim = null;
      }
      // 从展开集合中移除
      this.expandedTimelines.delete(timeline.id);
      this.timelines.splice(index, 1);
    },
    
    timelineSave() {
      this.$emit('save');
    },
    
    handleClick() {

    },
    
    startDrag(event, anim, type) {
      event.preventDefault();
      this.isDragging = true;
      this.dragType = type;
      this.dragAnim = anim;
      this.startX = event.clientX;
      this.startStartTime = anim.start_time;
      this.startDuration = anim.time;
    },
    
    onDrag(event) {
      if (!this.isDragging) return;
      
      const timelineContent = this.$refs.timelineContent;
      if (!timelineContent) return;
      
      // 计算拖拽偏移量
      const deltaX = event.clientX - this.startX;
      const rect = timelineContent.getBoundingClientRect();
      const pixelsPerMs = (rect.width - 162) / 2000; // 减去动画信息区域宽度(150px + 12px)
      
      if (this.dragType === 'start') {
        // 拖动开始时间
        const deltaMs = deltaX / pixelsPerMs;
        const newStartTime = Math.max(0, this.startStartTime + deltaMs);
        const newDuration = Math.max(0, this.startDuration - (newStartTime - this.startStartTime));
        this.dragAnim.start_time = Math.round(newStartTime);
        this.dragAnim.time = Math.round(newDuration);
      } else if (this.dragType === 'end') {
        // 拖动结束时间（修改持续时间）
        const deltaMs = deltaX / pixelsPerMs;
        const newDuration = Math.max(0, this.startDuration + deltaMs);
        this.dragAnim.time = Math.round(newDuration);
      }
    },
    
    stopDrag() {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragType = null;
        this.dragAnim = null;
      }
    }
  },
};
</script>
<style lang="less" scoped>
.creator-anim {
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 6px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);

    &-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    &-actions {
      display: flex;
      gap: 8px;
      
      .el-button {
        padding: 8px 12px;
      }
    }
  }

  .anim-editor-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 16px;
  }

  .main-timeline-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-color-white);
    border-radius: 4px;
    border: none; // 去掉边框
  }

  .timeline-header {
    padding: 2px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .time-ruler {
      position: relative;
      height: 30px;
      width: 100%;
      background: var(--el-color-white);
      border-radius: 4px;
      margin-left: 162px; /* 150px (anim-info宽度) + 12px (padding-right) */
      
      .time-tick {
        position: absolute;
        font-size: 11px;
        color: var(--el-text-color-secondary);
        transform: translateX(-50%);
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        height: 100%;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 8px;
          background-color: var(--el-border-color-lighter);
        }
      }
    }
  }

  .timeline-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0; // 减少内边距
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color-light);
      border-radius: 3px;
    }
    
    .timeline-track-group {
      margin-bottom: 12px; // 减少间距
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .timeline-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    border: none; // 去掉边框
    border-radius: 4px;
    margin-bottom: 8px;
    background: var(--el-color-white);
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    
    &.selected {
      background-color: rgba(120, 120, 120, 0.1); // 半透明背景表示选中状态
    }
    
    .row-content {
      display: flex;
      align-items: center;
      flex: 1;
      
      .el-button {
        transition: transform 0.2s ease;
        color: var(--el-color-primary);
        padding: 0;
        width: 20px;
        height: 20px;
        min-width: 20px;
        
        &.expanded {
          transform: rotate(90deg);
        }
      }
      
      .timeline-id-input {
        margin-left: 8px;
        flex: 1;
        max-width: 200px;
        border-radius: 3px;
        border: 1px solid var(--el-border-color-light);
        font-size: 13px;
        
        &:focus {
          border-color: var(--el-color-primary);
        }
      }
      
      .timeline-id-display {
        margin-left: 8px;
        font-size: 13px;
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
    }
    
    .timeline-actions {
      display: flex;
      gap: 4px;
      
      .el-button {
        width: 24px;
        height: 24px;
        min-width: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
  }

  .anim-track-list {
    padding-left: 12px;
    
    .anim-row {
      display: flex;
      align-items: center;
      padding: 2px 0px;
      cursor: pointer;
      // border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      margin-bottom: 0px;
      background: var(--el-color-white);
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      &.selected {
        background-color: var(--el-color-primary-light-8); // 动画项选中时使用更明显的背景色
        // border-color: var(--el-color-primary-light-4);
      }
      
      .anim-info {
        display: flex;
        flex-direction: column;
        width: 150px;
        min-width: 150px;
        padding-right: 12px;
        
        .anim-name {
          font-size: 13px;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      
      .anim-track-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        
        .anim-track {
          position: relative;
          height: 24px;
          background: var(--el-color-primary-light-9);
          border-radius: 3px;
          overflow: hidden;
          // margin-bottom: 4px;
          cursor: pointer;
          
          .anim-block {
            position: absolute;
            height: 16px;
            background: var(--el-color-primary); // 使用纯色背景替代渐变色
            border-radius: 2px;
            top: 4px;
            min-width: 20px; // 确保有足够的空间显示内容
            transition: all 0.1s ease;
            
            .anim-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: 100%;
              padding: 0 4px;
              color: white;
              font-size: 11px;
              white-space: nowrap;
            }
            
            &:hover {
              opacity: 0.9;
            }
          }
          
          .drag-handle {
            position: absolute;
            width: 6px;
            height: 100%;
            cursor: col-resize;
            z-index: 10;
            
            &.left {
              left: 0;
            }
            
            &.right {
              right: 0;
            }
            
            &:hover {
              &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 2px;
                height: 100%;
                background-color: white;
              }
            }
          }
        }
        
        .anim-time {
          font-size: 11px;
          color: var(--el-text-color-secondary);
          text-align: left;
          padding-left: 4px;
        }
      }
      
      .anim-label {
        position: absolute;
        top: -20px;
        left: 0;
        font-size: 10px;
        color: var(--el-color-primary);
        background: rgba(255, 255, 255, 0.9);
        padding: 1px 4px;
        border-radius: 2px;
        white-space: nowrap;
      }
    }
  }

  .properties-panel {
    width: 280px;
    background: var(--el-color-white);
    border-radius: 4px;
    padding: 16px;
    overflow-y: auto;
    height: fit-content;
    max-height: 100%;
    border: 1px solid var(--el-border-color-light);
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color-light);
      border-radius: 3px;
    }
  }

  .property-section {
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
      font-size: 15px;
      font-weight: 600;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }

  .property-group {
    display: flex;
    // flex-direction: column;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .property-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 0 0 48%;
    
    label {
      font-size: 12px;
      color: var(--el-text-color-regular);
      font-weight: 500;
    }
    
    :deep(.el-input), 
    :deep(.el-input-number) {
      width: 100%;
    }
    
    :deep(.el-input-number) {
      .el-input__inner {
        text-align: left;
        font-size: 13px;
        padding: 0 8px;
      }
      
      .el-input-number__decrease, 
      .el-input-number__increase {
        background: var(--el-color-primary-light-9);
        border-left: 1px solid var(--el-border-color-light);
        width: 20px;
      }
    }
    
    :deep(.el-input__inner) {
      font-size: 13px;
      padding: 0 8px;
    }
  }

  .objs-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .obj-item {
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      padding: 8px;
      
      .obj-row {
        display: flex;
        gap: 8px;
        align-items: center;
        
        .obj-id-input,
        .obj-attr-input {
          flex: 1;
        }
        
        .el-button {
          flex-shrink: 0;
        }
      }
    }
    
    .el-button {
      align-self: flex-start;
    }
  }

  .section-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-light);
    
    .el-button {
      flex: 1;
      border-radius: 4px;
      font-size: 13px;
      padding: 8px 12px;
    }
  }

  .no-selection {
    text-align: center;
    color: var(--el-text-color-secondary);
    padding: 30px 10px;
    
    .placeholder-content {
      p {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }
  }
  
  .anim-edit-dialog {
    max-height: 60vh;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color-light);
      border-radius: 3px;
    }
  }
}

// 深色模式样式
html.dark {
  .creator-anim {
    .main-timeline-panel,
    .properties-panel {
      background: var(--el-bg-color-overlay);
      border: none; // 去掉边框
    }
    
    .timeline-row {
      background: var(--el-bg-color-overlay);
      
      &:hover {
        background-color: var(--el-color-primary-light-2);
      }
      
      &.selected {
        background-color: rgba(120, 120, 120, 0.2); // 深色模式下半透明背景
      }
      
      .timeline-id-input {
        background: var(--el-bg-color-page);
        border-color: var(--el-border-color-dark);
        color: var(--el-text-color-primary);
      }
      
      .timeline-id-display {
        color: var(--el-text-color-primary);
      }
    }
    
    .anim-track-list {
      .anim-row {
        background: var(--el-bg-color-overlay);
        
        &:hover {
          background-color: var(--el-color-primary-light-2);
        }
        
        &.selected {
          background-color: #33333399;
        }
        
        .anim-track {
          background: var(--el-color-primary-light-2);
        }
        
        .anim-label {
          background: rgba(0, 0, 0, 0.7);
          color: var(--el-color-primary-light-9);
        }
        
        .anim-info {
          .anim-name {
            color: var(--el-text-color-primary);
          }
        }
        
        .anim-content {
          color: white;
        }
        
        .anim-time {
          color: var(--el-text-color-regular);
        }
      }
    }
    
    .timeline-header {
      border-color: var(--el-border-color-dark);
      
      .time-ruler {
        background: var(--el-bg-color-overlay);
        margin-left: 162px; /* 150px (anim-info宽度) + 12px (padding-right) */
        
        .time-tick {
          color: var(--el-text-color-regular);
          
          &::before {
            background-color: var(--el-border-color-dark);
          }
        }
      }
    }
    
    .property-section {
      h3 {
        color: var(--el-text-color-primary);
        border-color: var(--el-border-color-dark);
      }
    }
    
    .property-item {
      label {
        color: var(--el-text-color-regular);
      }
    }
    
    .objs-container {
      .obj-item {
        border-color: var(--el-border-color-dark);
      }
    }
    
    .section-actions {
      border-color: var(--el-border-color-dark);
    }
    
    .no-selection {
      color: var(--el-text-color-secondary);
      
      .placeholder-content {
        p {
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
<style lang="less">
</style>