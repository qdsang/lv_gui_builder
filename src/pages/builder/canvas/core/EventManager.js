import Konva from 'konva';

/**
 * 事件管理器
 * 负责处理KonvaCanvas的各种事件
 */
export class EventManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.isShiftPressed = false;
    this.isSpacePressed = false;
    this.lastPanX = 0;
    this.lastPanY = 0;
  }

  /**
   * 初始化事件管理器
   */
  init() {
    // 添加用于跟踪触摸板双指拖动状态的变量
    this.isTrackpadPanning = false;
    this.trackpadPanTimeout = null;
    
    this.canvas.stage.on('dragmove', () => {
      this.canvas.eventSystem.emit('canvasDragMove', { });
    });
    
    // 监听鼠标按下事件
    this.canvas.stage.on('mousedown', (evt) => {
      // 重置触摸板双指拖动状态
      this.isTrackpadPanning = false;
    });
    
    // 右键点击事件
    this.canvas.stage.on('contextmenu', (event) => {
      event.evt.preventDefault(); // 阻止默认右键菜单
      
      // 如果点击在非空白区域且不是舞台，则不阻止默认行为
      if (event.target !== this.canvas.stage && event.target !== this.canvas.screenGroup) {
        return;
      }
      
      // 触发自定义右键菜单事件
      this.canvas.eventSystem.emit('contextmenu', {
        type: 'contextmenu',
        stage: this.canvas.stage,
        target: event.target,
        evt: event.evt,
        pointerPos: {
          x: event.evt.clientX,
          y: event.evt.clientY
        }
      });
    });
    
    // 鼠标滚轮事件（缩放和触摸板手势）
    this.canvas.stage.on('wheel', (event) => {
      event.evt.preventDefault();
      
      // 检查是否为触摸板双指操作（deltaX和deltaY同时存在且ctrlKey不存在）
      const isTrackpadPan = event.evt.deltaX !== 0 && !event.evt.ctrlKey || this.isTrackpadPanning;
      
      // 检查是否为双指缩放（在Mac上，双指捏合会触发带有ctrlKey的wheel事件）
      const isTrackpadZoom = event.evt.ctrlKey;
      
      // 判断是否为鼠标滚轮操作
      const isMouseWheel = !isTrackpadPan && !isTrackpadZoom;
      
      // 检查是否按住shift键进行水平滚动（仅适用于鼠标滚轮）
      if (event.evt.shiftKey && isMouseWheel) {
        // 检查是否已经在触摸板双指拖动模式中
        if (this.isTrackpadPanning) return;
        
        // 水平滚动
        const deltaX = event.evt.deltaY > 0 ? 10 : -10;
        // 使用contentGroup而不是stage进行水平滚动
        if (this.canvas.contentGroup) {
          const newPos = {
            x: this.canvas.contentGroup.x() - deltaX,
            y: this.canvas.contentGroup.y()
          };
          this.canvas.viewportX = newPos.x;
          this.canvas.viewportY = newPos.y;
          this.canvas.contentGroup.position(newPos);
          this.canvas.layer.batchDraw();
          if (this.canvas.fixedLayer) {
            this.canvas.fixedLayer.batchDraw();
          }
        }
        this.canvas.eventSystem.emit('canvasDragMove', { });
        return;
      }
      
      // 如果是双指拖动（触摸板平移）
      if (isTrackpadPan) {
        // 设置双指拖动模式
        this.isTrackpadPanning = true;
        
        // 清除之前的超时定时器
        if (this.trackpadPanTimeout) {
          clearTimeout(this.trackpadPanTimeout);
        }
        
        // 设置新的超时定时器，在一定时间后退出双指拖动模式
        this.trackpadPanTimeout = setTimeout(() => {
          this.isTrackpadPanning = false;
        }, 200); // 100ms后退出模式，模拟手势结束
        
        // 双指拖动平移画布
        const deltaX = event.evt.deltaX;
        const deltaY = event.evt.deltaY;
        
        // 使用contentGroup而不是stage进行平移
        if (this.canvas.contentGroup) {
          const newPos = {
            x: this.canvas.contentGroup.x() - deltaX,
            y: this.canvas.contentGroup.y() - deltaY
          };
          this.canvas.viewportX = newPos.x;
          this.canvas.viewportY = newPos.y;
          this.canvas.contentGroup.position(newPos);
          this.canvas.layer.batchDraw();
          if (this.canvas.fixedLayer) {
            this.canvas.fixedLayer.batchDraw();
          }
          
          // 触发视图变化事件
          this.canvas.eventSystem.emit('canvasScale', {
            scale: this.canvas.scale,
            viewportX: this.canvas.viewportX,
            viewportY: this.canvas.viewportY,
            type: 'canvasScale'
          });
        }
        return;
      }
      
      // 检查是否为双指缩放（在Mac上，双指捏合会触发带有ctrlKey的wheel事件）
      if (isTrackpadZoom) {
        // 退出双指拖动模式
        this.isTrackpadPanning = false;
        
        const scaleBy = 1.023;
        const stage = event.target.getStage();
        
        // 使用contentGroup的缩放而不是stage的缩放
        const oldScale = this.canvas.contentGroup ? this.canvas.contentGroup.scaleX() : 1;
        
        const pointer = stage.getPointerPosition();
        
        // 使用contentGroup的位置而不是stage的位置进行计算
        const contentX = this.canvas.contentGroup ? this.canvas.contentGroup.x() : 0;
        const contentY = this.canvas.contentGroup ? this.canvas.contentGroup.y() : 0;
        
        const mousePointTo = {
          x: (pointer.x - contentX) / oldScale,
          y: (pointer.y - contentY) / oldScale,
        };
        
        // 根据deltaY确定缩放方向
        let direction = event.evt.deltaY > 0 ? -1 : 1;
        
        let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        // 限制缩放范围
        newScale = Math.min(Math.max(newScale, 0.1), 5);
        
        this.canvas.scale = newScale;
        
        // 只缩放contentGroup而不是整个舞台
        if (this.canvas.contentGroup) {
          this.canvas.contentGroup.scale({ x: newScale, y: newScale });
        }
        
        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        
        this.canvas.viewportX = newPos.x;
        this.canvas.viewportY = newPos.y;
        // 只移动contentGroup而不是整个舞台
        if (this.canvas.contentGroup) {
          this.canvas.contentGroup.position(newPos);
        }
        this.canvas.layer.batchDraw();
        
        // 触发自定义缩放事件，通知插件更新
        this.canvas.eventSystem.emit('canvasScale', { scale: newScale, oldScale: oldScale });
        return;
      }
      
      // 退出双指拖动模式
      this.isTrackpadPanning = false;
      
      // 默认的垂直滚动行为（仅适用于鼠标滚轮）
      if (isMouseWheel) {
        const deltaY = event.evt.deltaY;
        if (deltaY !== 0) {
          // 调整滚动敏感度，触摸板的deltaY值通常比鼠标滚轮大得多
          let scrollAmount;
          if (Math.abs(deltaY) > 50) {
            // 触摸板滚动，降低敏感度
            scrollAmount = (deltaY > 0 ? 1 : -1) * 20;
          } else {
            // 鼠标滚轮滚动，使用标准滚动速度
            scrollAmount = deltaY > 0 ? 20 : -20;
          }
          
          if (this.canvas.contentGroup) {
            const newPos = {
              x: this.canvas.contentGroup.x(),
              y: this.canvas.contentGroup.y() - scrollAmount * 0.5
            };
            this.canvas.viewportX = newPos.x;
            this.canvas.viewportY = newPos.y;
            this.canvas.contentGroup.position(newPos);
            this.canvas.layer.batchDraw();
            if (this.canvas.fixedLayer) {
              this.canvas.fixedLayer.batchDraw();
            }
          }
        }
        this.canvas.eventSystem.emit('canvasDragMove', { });
      }
    });
    
    // 鼠标按下事件（开始拖动）
    this.canvas.stage.on('mousedown touchstart', (event) => {
      // 如果点击在非空白区域且不是舞台，则不处理画布拖动
      if (event.target !== this.canvas.stage && event.target !== this.canvas.screenGroup) {
        return;
      }
      
      const evt = event.evt;
      const stage = this.canvas.stage;
      
      // 获取指针位置
      const pointer = stage.getPointerPosition();
      
      // 检查是否按住空格键或鼠标中键进行拖动画布
      // 添加对触摸板双指拖动的支持
      if (this.isSpacePressed || evt.button === 1 || (evt.button === 0 && evt.shiftKey) || this.isTwoFingerPan) { // 空格键、中键、shift+左键或双指拖动
        this.canvas.isPanning = true;
        this.canvas.stage.container().style.cursor = 'grabbing';
        this.lastPanX = pointer.x;
        this.lastPanY = pointer.y;
        return;
      }
      
      // 点击空白区域，取消所有选中
      if (event.target === this.canvas.stage) {
        this.canvas.deselectAllElements();
      }
      
      // 如果是左键点击空白区域，开始绘制选择框
      if (evt.button === 0 && event.target === this.canvas.stage) {
        this.canvas.isSelecting = true;
        
        // 获取相对于舞台的坐标
        const stage = this.canvas.stage;
        const pointer = stage.getPointerPosition();
        
        // 使用CoordinateUtils来处理坐标转换
        const pointerPos = this.canvas.coordinateUtils.canvasToElement(pointer.x, pointer.y);
        
        this.selectionStart = {
          x: pointer.x,
          y: pointer.y,
        };
        
        // 创建选择框
        this.canvas.selectionRect = new Konva.Rect({
          x: pointerPos.x,
          y: pointerPos.y,
          width: 0,
          height: 0,
          fill: 'rgba(0, 123, 255, 0.1)',
          stroke: 'rgba(0, 123, 255, 0.5)',
          strokeWidth: 1,
          visible: false
        });
        
        this.canvas.contentGroup.add(this.canvas.selectionRect);
        this.canvas.layer.batchDraw();
      }
    });
    
    // 鼠标移动事件（拖动中）
    this.canvas.stage.on('mousemove touchmove', (event) => {
      const evt = event.evt;
      const stage = this.canvas.stage;
      const pointer = stage.getPointerPosition();
      
      // 拖动画布
      if (this.canvas.isPanning) {
        this.canvas.isDragging = true;
        this.canvas.stage.container().style.cursor = 'grabbing';
        
        // 计算移动距离
        const dx = pointer.x - this.lastPanX;
        const dy = pointer.y - this.lastPanY;
        
        // 更新内容组位置而不是舞台位置
        if (this.canvas.contentGroup) {
          const newPos = {
            x: this.canvas.contentGroup.x() + dx,
            y: this.canvas.contentGroup.y() + dy
          };
          
          this.canvas.viewportX = newPos.x;
          this.canvas.viewportY = newPos.y;
          this.canvas.contentGroup.position(newPos);
          this.canvas.layer.batchDraw();
        }
        
        // 更新最后位置
        this.lastPanX = pointer.x;
        this.lastPanY = pointer.y;
        this.canvas.eventSystem.emit('canvasDragMove', { });

        return;
      }
      
      // 绘制选择框
      if (this.canvas.isSelecting && this.canvas.selectionRect) {
        // 使用CoordinateUtils来处理坐标转换
        const pointerPos = this.canvas.coordinateUtils.canvasToElement(pointer.x, pointer.y);
        const startPos = this.canvas.coordinateUtils.canvasToElement(
          this.selectionStart.x, 
          this.selectionStart.y
        );
        
        let x = 0, width = 0, y = 0, height = 0;
        if (pointerPos.x < startPos.x) {
          x = parseInt(pointerPos.x);
          width = parseInt(startPos.x - pointerPos.x);
        } else {
          x = parseInt(startPos.x);
          width = parseInt(pointerPos.x - startPos.x);
        }
        if (pointerPos.y < startPos.y) {
          y = parseInt(pointerPos.y);
          height = parseInt(startPos.y - pointerPos.y);
        } else {
          y = parseInt(startPos.y);
          height = parseInt(pointerPos.y - startPos.y);
        }
        
        this.canvas.selectionRect.setAttrs({
          x: x,
          y: y,
          width: width,
          height: height,
          visible: width > 3 || height > 3 // 只有当选择框足够大时才可见
        });
        
        this.canvas.layer.batchDraw();
        return;
      }
    });
    
    // 鼠标释放事件（结束拖动）
    this.canvas.stage.on('mouseup touchend', (event) => {
      // 处理画布拖动结束
      if (this.canvas.isDragging) {
        this.canvas.isDragging = false;
        this.canvas.isPanning = false;
        this.canvas.stage.container().style.cursor = 'default';
      }
      
      // 处理选择框结束
      if (this.canvas.isSelecting) {
        this.canvas.isSelecting = false;
        
        if (this.canvas.selectionRect) {
          // 如果选择框足够大，则选择其中的元素
          if (this.canvas.selectionRect.width() > 5 || this.canvas.selectionRect.height() > 5) {
            this.canvas.selectElementsInRect(this.canvas.selectionRect);
          }
          
          // 移除选择框
          this.canvas.selectionRect.destroy();
          this.canvas.selectionRect = null;
          this.canvas.layer.batchDraw();
        }
      }
    });
    
    // 监听键盘事件
    this.handleKeyDown = (e) => {
      // 更新按键状态
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.isShiftPressed = true;
      }
      
      // 按住空格键时切换为拖动模式
      if (e.code === 'Space') {
        e.preventDefault();
        this.isSpacePressed = true;
        if (!this.canvas.isPanning) {
          this.canvas.stage.container().style.cursor = 'grab';
        }
      }
      
      // Delete键删除选中元素
      if (e.code === 'Delete' || e.code === 'Backspace') {
        // 使用新的事件系统触发删除事件
        if (this.canvas.selectedElements.size > 0) {
          this.canvas.eventSystem.emit('delete', Array.from(this.canvas.selectedElements));
        }
      }
    };
    
    this.handleKeyUp = (e) => {
      // 更新按键状态
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.isShiftPressed = false;
      }
      
      // 松开空格键时恢复
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        if (this.canvas.isPanning && !this.canvas.isDragging) {
          this.canvas.isPanning = false;
          this.canvas.stage.container().style.cursor = 'default';
        } else if (!this.canvas.isDragging) {
          this.canvas.stage.container().style.cursor = 'default';
        }
      }
    };
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // 移除键盘事件监听器
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}