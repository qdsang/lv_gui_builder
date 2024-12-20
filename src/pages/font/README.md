
# 字体转换功能

本项目支持将TTF/WOFF/OTF字体文件转换为LVGL兼容的位图字体格式。

## 功能特点

- 支持TTF、WOFF、WOFF2、OTF格式字体文件
- 可调节字体大小和位深度
- 支持自定义字符范围
- 提供字体预览功能
- 支持压缩和字距调整
- 导出LVGL兼容的字体文件

## 使用说明

1. 上传字体文件：支持拖拽或点击上传
2. 设置转换参数：
   - 字体大小：8-96像素
   - 位深度：1-4位
   - 字符范围：使用十六进制格式，如"0x20-0x7F"
3. 预览效果
4. 点击"生成字体文件"进行转换

## 注意事项

- 建议使用位深度1-2位以获得较小的文件体积
- 仅选择需要的字符范围以减小文件大小
- 压缩功能可以进一步减小文件体积，但可能影响加载速度