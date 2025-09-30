// 辅助函数：将样式对象转换为CSS格式字符串
function stylesToCss(stylesObj) {
  if (!stylesObj) return '';
  
  const cssLines = [];
  Object.entries(stylesObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // 将LVGL样式属性名转换为CSS风格
      // 例如: INDICATOR.arc_color -> indicator-arc-color
      const cssProperty = key.toLowerCase().replace(/\./g, '-');
      cssLines.push(`  ${cssProperty}: ${value};`);
    }
  });
  
  return cssLines.join('\n');
}

// 辅助函数：提取组件的样式属性并按部分分类
function extractStylesByPart(component) {
  const parts = {};
  if (component.data) {
    Object.entries(component.data).forEach(([key, value]) => {
      // 检查是否为样式属性（包含点号的属性通常为样式）
      if (key.includes('.')) {
        // 分离部分和属性名
        // 例如: INDICATOR.arc_color -> part: INDICATOR, property: arc_color
        const [part, property] = key.split('.');
        if (!parts[part]) {
          parts[part] = {};
        }
        parts[part][property] = value;
      }
    });
  }
  return parts;
}

// 辅助函数：提取组件的基础属性（x, y, width, height）
function extractBaseAttributes(component) {
  const baseAttrs = {};
  if (component.data) {
    if (component.data.x !== undefined) baseAttrs.x = component.data.x;
    if (component.data.y !== undefined) baseAttrs.y = component.data.y;
    if (component.data.width !== undefined) baseAttrs.width = component.data.width;
    if (component.data.height !== undefined) baseAttrs.height = component.data.height;
  }
  return baseAttrs;
}

// 辅助函数：提取组件的attributes列表中的属性
function extractListedAttributes(component) {
  const attributes = {};
  if (component.data && component.attributes) {
    component.attributes.forEach(attr => {
      // 跳过基础属性，因为它们已经在组件标签属性中定义
      if (attr !== 'x' && attr !== 'y' && attr !== 'width' && attr !== 'height') {
        if (component.data[attr] !== undefined) {
          attributes[attr] = component.data[attr];
        }
      }
    });
  }
  return attributes;
}

// 辅助函数：生成CSS样式表，支持类似CSS伪类的选择器
function generateStylesheet(components) {
  const cssRules = [];
  Object.entries(components).forEach(([id, comp]) => {
    const parts = extractStylesByPart(comp);
    
    // 为每个组件的每个部分创建CSS规则
    Object.entries(parts).forEach(([part, styles]) => {
      if (Object.keys(styles).length > 0) {
        // 创建选择器，例如: #arc_0::indicator
        const selector = part === 'MAIN' ? `#${id}` : `#${id}::${part.toLowerCase()}`;
        let rule = `${selector} {`;
        
        // 添加该部分的所有样式
        Object.entries(styles).forEach(([property, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // 将属性名转换为CSS风格
            const cssProperty = property.toLowerCase().replace(/_/g, '-');
            rule += `\n  ${cssProperty}: ${value};`;
          }
        });
        
        rule += '\n}';
        cssRules.push(rule);
      }
    });
    
    // 添加组件attributes列表中的属性到MAIN部分
    const listedAttributes = extractListedAttributes(comp);
    if (Object.keys(listedAttributes).length > 0) {
      let rule = `#${id} {`;
      Object.entries(listedAttributes).forEach(([attr, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const cssProperty = attr.toLowerCase().replace(/_/g, '-');
          rule += `\n  ${cssProperty}: ${value};`;
        }
      });
      rule += '\n}';
      cssRules.push(rule);
    }
  });
  
  // 过滤掉空规则并用两个换行符连接规则
  return cssRules.filter(rule => rule.trim() !== '').join('\n\n');
}

// 辅助函数：生成脚本数据（包含timeline、assets、settings等）
function generateScriptData(json) {
  const scriptVars = [];
  
  // 添加项目信息
  scriptVars.push(`const project = ${JSON.stringify({
    id: json.id,
    version: json.version,
    versionCode: json.versionCode,
    name: json.name,
    description: json.description,
    author: json.author || ''
  }, null, 2)};`);
  
  // 添加动画数据
  if (json.animations) {
    scriptVars.push(`const animations = ${JSON.stringify(json.animations, null, 2)};`);
  }
  
  // 添加资源数据
  if (json.assets) {
    scriptVars.push(`const assets = ${JSON.stringify(json.assets, null, 2)};`);
  }
  
  // 添加设置数据
  if (json.settings) {
    scriptVars.push(`const settings = ${JSON.stringify(json.settings, null, 2)};`);
  }
  
  // 添加导出语句
  const exports = [];
  exports.push('project');
  if (json.animations) exports.push('animations');
  if (json.assets) exports.push('assets');
  if (json.settings) exports.push('settings');
  
  scriptVars.push(`export { ${exports.join(', ')} };`);
  
  return scriptVars.join('\n\n');
}

// 辅助函数：将属性对象转换为属性字符串
function attributesToString(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

// 辅助函数：递归构建组件树结构
function buildComponentTree(components, parentId = '') {
  let xml = '';
  
  // 查找所有直接子组件
  const children = Object.entries(components)
    .filter(([id, comp]) => comp.parent === parentId)
    .sort((a, b) => a[1].zindex - b[1].zindex); // 按zindex排序
  
  children.forEach(([id, comp]) => {
    // 添加基础属性 (x, y, width, height)
    const baseAttrs = extractBaseAttributes(comp);
    
    // 添加API方法作为组件属性，从data中获取值
    const apiAttrs = {};
    if (comp.apis && comp.apis.length > 0 && comp.data) {
      comp.apis.forEach(api => {
        if (comp.data[api] !== undefined) {
          apiAttrs[api] = comp.data[api];
        }
      });
    }
    
    const allAttrs = {
      id: id,
      ...baseAttrs,
      ...apiAttrs,
      zindex: comp.zindex
    };
    
    // 如果有子组件，则递归构建
    const hasChildren = Object.values(components).some(c => c.parent === id);
    
    if (hasChildren) {
      xml += `    <${comp.type} ${attributesToString(allAttrs)}>\n`;
      xml += buildComponentTree(components, id); // 递归构建子组件
      xml += `    </${comp.type}>\n`;
    } else {
      xml += `    <${comp.type} ${attributesToString(allAttrs)}></${comp.type}>\n`;
    }
  });
  
  return xml;
}

export function lvToJson(lv) {
  return JSON.stringify(lv);
}

export function jsonToLv(json) {
  // 构建组件部分（根据父子关系嵌套）
  let componentsXml = '  <components>\n';
  componentsXml += buildComponentTree(json.components);
  componentsXml += '  </components>';
  
  // 构建完整的LV文件
  const templateSection = `<template>\n${componentsXml}\n</template>`;
  const styleSection = `<style>\n${generateStylesheet(json.components)}\n</style>`;
  const scriptSection = `<script>\n${generateScriptData(json)}\n</script>`;
  
  return `${templateSection}\n${styleSection}\n${scriptSection}`;
}