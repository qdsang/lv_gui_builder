

import { create } from 'xmlbuilder2';

export function lvToJson(lv) {
  return JSON.stringify(lv);
}

export function jsonToLv(json) {
    // 创建 XML 文档
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('lv')
        .ele('project')
          .att('id', json.id)
          .att('version', json.version)
          .att('versionCode', json.versionCode)
          .ele('name').txt(json.name).up()
          .ele('description').txt(json.description).up()
          .ele('author').txt(json.author || '').up()
        .up();

    // 添加组件
    const components = doc.ele('components');
    Object.entries(json.components).forEach(([id, comp]) => {
      const elem = components.ele(comp.type)
        .att('id', id)
        .att('zindex', comp.zindex)
        .att('parent', comp.parent || '');

      // 添加基本属性
      if (comp.attributes) {
        elem.att('attributes', comp.attributes);
      }
      
      // 添加数据
      if (comp.data) {
        const data = elem.ele('data');
        Object.entries(comp.data).forEach(([key, value]) => {
          data.ele(key).txt(value?.toString() || '');
        });
      }

      // 添加样式
      if (comp.styles) {
        elem.att('styles', comp.styles);
      }

      // 添加 APIs
      if (comp.apis) {
        elem.att('apis', comp.apis);
      }
    });

    // 添加动画
    if (json.animations) {
      const animations = doc.ele('animations');
      if (json.animations.timelines) {
        const timelines = animations.ele('timelines');
        json.animations.timelines.forEach(timeline => {
          timelines.ele('timeline')
            .att('id', timeline.id)
            .att('title', timeline.title || '')
            .ele('anims')
            // ... 添加动画细节
            .up();
        });
      }
    }

    // 添加资源
    if (json.assets) {
      const assets = doc.ele('assets');
      // 添加图片
      if (json.assets.images) {
        const images = assets.ele('images');
        json.assets.images.forEach(img => {
          images.ele('image')
            .att('id', img.id)
            .att('title', img.title)
            .att('path', img.path)
            .att('size', img.size)
            .att('width', img.width)
            .att('height', img.height);
        });
      }
      // 添加字体
      if (json.assets.fonts) {
        const fonts = assets.ele('fonts');
        json.assets.fonts.forEach(font => {
          fonts.ele('font')
            .att('id', font.id)
            .att('name', font.name)
            .att('path', font.path);
        });
      }
    }

    // 添加设置
    if (json.settings) {
      const settings = doc.ele('settings');
      Object.entries(json.settings).forEach(([key, value]) => {
        const setting = settings.ele(key);
        Object.entries(value).forEach(([k, v]) => {
          setting.ele(k).txt(v?.toString() || '');
        });
      });
    }

    // 生成格式化的 XML 字符串
    const xmlStr = doc.end({ prettyPrint: true, indent: '  ' });
    return xmlStr;
}