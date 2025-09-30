/**
 * 事件处理插件
 * 负责处理KonvaCanvas的各种事件
 */
export class EventPlugin {
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
   * 初始化插件
   */
  init() {
    // 延迟绑定事件，确保stage已经初始化
    setTimeout(() => {
      this.bindEvents();
    }, 0);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 开启 Konva 高级触摸支持
    // this.canvas.stage.container().style.touchAction = 'none';
    // this.canvas.Konva.pixelRatio = 1; // 防止缩放模糊

    // 确保stage存在
    if (!this.canvas.stage) {
      console.warn('Stage not initialized, cannot bind events');
      return;
    }
    
    // 鼠标滚轮事件（缩放）
    this.canvas.stage.on('wheel', (event) => {
      event.evt.preventDefault();
      
      // 检查是否按住shift键进行水平滚动
      if (event.evt.shiftKey) {
        // 水平滚动
        const deltaX = event.evt.deltaY > 0 ? 10 : -10;
        const stage = this.canvas.stage;
        const newPos = {
          x: stage.x() - deltaX,
          y: stage.y()
        };
        this.canvas.viewportX = newPos.x;
        this.canvas.viewportY = newPos.y;
        stage.position(newPos);
        this.canvas.layer.batchDraw();
        return;
      }
      
      const scaleBy = 1.023;
      const stage = event.target.getStage();
      const oldScale = stage.scaleX();
      
      const pointer = stage.getPointerPosition();
      
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      
      let direction = event.evt.deltaY > 0 ? -1 : 1;
      
      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      // 限制缩放范围
      newScale = Math.min(Math.max(newScale, 0.1), 5);
      
      this.canvas.scale = newScale;
      
      stage.scale({ x: newScale, y: newScale });
      
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      
      this.canvas.viewportX = newPos.x;
      this.canvas.viewportY = newPos.y;
      stage.position(newPos);
      this.canvas.layer.batchDraw();
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
      if (this.isSpacePressed || evt.button === 1 || (evt.button === 0 && evt.shiftKey)) { // 空格键、中键或shift+左键
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
        
        // 获取相对于舞台的坐标（考虑缩放）
        const stage = this.canvas.stage;
        const pointer = stage.getPointerPosition();
        const scale = stage.scaleX();
        
        this.selectionStart = {
          x: pointer.x - stage.x(),
          y: pointer.y - stage.y(),
        };

        // 计算考虑缩放后的坐标
        const x = (pointer.x - stage.x()) / scale;
        const y = (pointer.y - stage.y()) / scale;
        
        // 创建选择框
        this.canvas.selectionRect = new this.canvas.Konva.Rect({
          x: x,
          y: y,
          width: 0,
          height: 0,
          fill: 'rgba(0, 123, 255, 0.1)',
          stroke: 'rgba(0, 123, 255, 0.5)',
          strokeWidth: 1,
          visible: false
        });
        
        this.canvas.layer.add(this.canvas.selectionRect);
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
        
        // // 计算移动距离
        // const dx = pointer.x - this.lastPanX;
        // const dy = pointer.y - this.lastPanY;
        
        // // 更新画布位置
        // const newPos = {
        //   x: stage.x() + dx,
        //   y: stage.y() + dy
        // };
        
        // this.canvas.viewportX = newPos.x;
        // this.canvas.viewportY = newPos.y;
        // stage.position(newPos);
        // this.canvas.layer.batchDraw();
        
        // // 更新最后位置
        // this.lastPanX = pointer.x;
        // this.lastPanY = pointer.y;
        return;
      }
      
      // 绘制选择框
      if (this.canvas.isSelecting && this.canvas.selectionRect) {
        const stage = this.canvas.stage;
        const pointer = stage.getPointerPosition();
        const scale = stage.scaleX();
        
        // 计算考虑缩放后的坐标
        const pointerX = (pointer.x - stage.x());
        const pointerY = (pointer.y - stage.y());
        
        let x = 0, width = 0, y = 0, height = 0;
        if (pointerX < this.selectionStart.x) {
          x = parseInt(pointerX);;
          width = parseInt(this.selectionStart.x - pointerX);;
        } else {
          x = parseInt(this.selectionStart.x);
          width = parseInt(pointerX - this.selectionStart.x);
        }
        if (pointerY < this.selectionStart.y) {
          y = parseInt(pointerY);
          height = parseInt(this.selectionStart.y - pointerY);
        } else {
          y = parseInt(this.selectionStart.y);
          height = parseInt(pointerY - this.selectionStart.y);
        }
        
        this.canvas.selectionRect.setAttrs({
          x: x / scale,
          y: y / scale,
          width: width / scale,
          height: height / scale,
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
        // 触发删除事件
        if (this.canvas.selectedElements.size > 0) {
          const event = new CustomEvent('event', {
            detail: {
              action: 'delete',
              elementIds: Array.from(this.canvas.selectedElements)
            }
          });
          this.canvas.container.dispatchEvent(event);
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
   * 销毁插件
   */
  destroy() {
    // 移除键盘事件监听器
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}