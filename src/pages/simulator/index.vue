<template>
  <div class="simulator-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" @click="handleRestart">
          <el-icon><Refresh /></el-icon> Restart
        </el-button>
        <el-button type="success" @click="handleSave">
          <el-icon><Download /></el-icon> Save
        </el-button>
        <el-button @click="toggleEditor">
          <el-icon><Edit /></el-icon> Editor
        </el-button>
      </el-button-group>
      
      <div class="right-tools">
        <el-button @click="showHistory">History</el-button>
        <el-button @click="showExamples">Examples</el-button>
        <el-button @click="showHelp">Help</el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 代码编辑器 -->
      <div class="editor-container" v-show="showEditorPanel">
        <VAceEditor
          v-model:value="code"
          lang="python"
          theme="monokai"
          :options="editorOptions"
          @init="editorInit"
          style="height: 100%; width: 100%"
        />
      </div>

      <!-- 输出控制台 -->
      <div class="console-container">
        <div class="console-output" ref="consoleOutput">
          {{ consoleOutput }}
        </div>
        <div class="console-input">
          <el-input
            v-model="consoleInput"
            placeholder="Enter Python code..."
            @keyup.enter="executeCode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/ext-language_tools'

// 状态变量
const code = ref('')
const consoleInput = ref('')
const consoleOutput = ref('')
const showEditorPanel = ref(true)
const editorOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
  showLineNumbers: true,
  tabSize: 4,
  fontSize: 14
}

// 编辑器初始化
const editorInit = (editor: any) => {
  editor.setShowPrintMargin(false)
}

// 方法
const handleRestart = () => {
  // 重置Python环境
  consoleOutput.value = ''
  ElMessage.success('Environment restarted')
}

const handleSave = () => {
  // 保存当前代码
  localStorage.setItem('saved_code', code.value)
  ElMessage.success('Code saved successfully')
}

const toggleEditor = () => {
  showEditorPanel.value = !showEditorPanel.value
}

const executeCode = async () => {
  try {
    // 这里需要集成Pyodide来执行Python代码
    consoleOutput.value += '\n> ' + consoleInput.value
    consoleInput.value = ''
  } catch (error) {
    ElMessage.error('Error executing code')
  }
}

// 其他功能方法
const showHistory = () => {
  // 显示历史记录
}

const showExamples = () => {
  // 显示示例代码
}

const showHelp = () => {
  // 显示帮助文档
}

// 加载保存的代码
onMounted(() => {
  const savedCode = localStorage.getItem('saved_code')
  if (savedCode) {
    code.value = savedCode
  }
})
</script>

<style scoped>
.simulator-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  border-right: 1px solid #ddd;
}

.console-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #fff;
}

.console-output {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-wrap;
}

.console-input {
  padding: 10px;
}
</style> 