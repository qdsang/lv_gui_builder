import { ImageMode, OutputMode, ImageModeUtil } from './enums'

export interface ConverterOptions {
  dith?: boolean
  cf: ImageMode
  outputFormat: OutputMode
  binaryFormat: ImageMode
  swapEndian: boolean
  outName: string
  useLegacyFooterOrder?: boolean
  use565A8alpha?: boolean
  overrideWidth?: number
  overrideHeight?: number
}

// 颜色转换工具类
class ColorUtil {
  static rgb565(r: number, g: number, b: number): number {
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
  }

  static rgb888(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b
  }

  static rgba8888(r: number, g: number, b: number, a: number): number {
    return (a << 24) | (r << 16) | (g << 8) | b
  }
}

// 图片转换器类
export class Converter {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private imageData: ImageData
  private width: number
  private height: number
  private options: ConverterOptions

  constructor(img: HTMLImageElement, options: ConverterOptions) {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    
    this.width = options.overrideWidth || img.width
    this.height = options.overrideHeight || img.height
    
    this.canvas.width = this.width
    this.canvas.height = this.height
    
    this.ctx.drawImage(img, 0, 0, this.width, this.height)
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height)
    this.options = options
  }

  // 转换为C代码
  private convertToC(): string {
    const pixels = this.processPixels()
    const headerComment = this.generateHeaderComment()
    const dataArray = this.generateDataArray(pixels)
    const descriptor = this.generateDescriptor()
    
    return `${headerComment}\n${dataArray}\n${descriptor}`
  }

  // 转换为二进制
  private convertToBinary(): Uint8Array {
    const pixels = this.processPixels()
    const header = this.generateBinaryHeader()
    const data = new Uint8Array(header.length + pixels.length)
    data.set(header)
    data.set(pixels, header.length)
    return data
  }

  // 转换为Python代码
  private convertToPython(): string {
    const pixels = this.processPixels()
    const headerComment = this.generatePythonHeaderComment()
    const dataArray = this.generatePythonDataArray(pixels)
    const descriptor = this.generatePythonDescriptor()
    
    return `${headerComment}\n${dataArray}\n${descriptor}`
  }

  // 处理像素数据
  private processPixels(): Uint8Array {
    const { cf, dith } = this.options
    const pixels = this.imageData.data
    const output: number[] = []

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      if (ImageModeUtil.isTrueColor(cf)) {
        switch (cf) {
          case ImageMode.CF_TRUE_COLOR:
            output.push(ColorUtil.rgb565(r, g, b))
            break
          case ImageMode.CF_TRUE_COLOR_ALPHA:
            output.push(ColorUtil.rgba8888(r, g, b, a))
            break
          // 添加其他颜色格式的处理...
        }
      } else {
        // 处理索引色和其他格式...
        if (dith) {
          // 实现抖动算法...
        }
      }
    }

    return new Uint8Array(output)
  }

  // 生成C代码头部注释
  private generateHeaderComment(): string {
    return `/*
 * Generated by LVGL Image Converter
 * Width: ${this.width}
 * Height: ${this.height}
 * Color Format: ${this.options.cf}
 */`
  }

  // 生成Python代码头部注释
  private generatePythonHeaderComment(): string {
    return `"""
Generated by LVGL Image Converter
Width: ${this.width}
Height: ${this.height}
Color Format: ${this.options.cf}
"""\n
import lvgl as lv\n`
  }

  // 生成C数组数据
  private generateDataArray(pixels: Uint8Array): string {
    const chunks: string[] = []
    const bytesPerLine = 16

    chunks.push(`const uint8_t ${this.options.outName}_map[] = {`)
    
    for (let i = 0; i < pixels.length; i += bytesPerLine) {
      const line = Array.from(pixels.slice(i, i + bytesPerLine))
        .map(b => '0x' + b.toString(16).padStart(2, '0'))
        .join(', ')
      chunks.push(`    ${line}${i + bytesPerLine < pixels.length ? ',' : ''}`)
    }
    
    chunks.push('};')
    return chunks.join('\n')
  }

  // 生成Python数组数据
  private generatePythonDataArray(pixels: Uint8Array): string {
    const chunks: string[] = []
    const bytesPerLine = 16

    chunks.push(`${this.options.outName}_map = bytes([`)
    
    for (let i = 0; i < pixels.length; i += bytesPerLine) {
      const line = Array.from(pixels.slice(i, i + bytesPerLine))
        .map(b => '0x' + b.toString(16).padStart(2, '0'))
        .join(', ')
      chunks.push(`    ${line}${i + bytesPerLine < pixels.length ? ',' : ''}`)
    }
    
    chunks.push('])')
    return chunks.join('\n')
  }

  // 生成LVGL描述符
  private generateDescriptor(): string {
    return `
const lv_img_dsc_t ${this.options.outName} = {
    .header.cf = ${this.options.cf},
    .header.always_zero = 0,
    .header.reserved = 0,
    .header.w = ${this.width},
    .header.h = ${this.height},
    .data_size = ${this.width * this.height * this.getBytesPerPixel()},
    .data = ${this.options.outName}_map,
};`
  }

  // 生成Python LVGL描述符
  private generatePythonDescriptor(): string {
    return `
${this.options.outName} = lv.img_dsc_t({
    'header': {
        'cf': lv.img.CF.${this.options.cf},
        'always_zero': 0,
        'reserved': 0,
        'w': ${this.width},
        'h': ${this.height}
    },
    'data_size': ${this.width * this.height * this.getBytesPerPixel()},
    'data': ${this.options.outName}_map
})`
  }

  // 生成二进制头部
  private generateBinaryHeader(): Uint8Array {
    const header = new Uint8Array(8)
    const view = new DataView(header.buffer)
    
    // LVGL二进制格式头部
    view.setUint32(0, 0x4C564744, !this.options.swapEndian) // 'LVGL' magic
    view.setUint16(4, this.width, !this.options.swapEndian)
    view.setUint16(6, this.height, !this.options.swapEndian)
    
    return header
  }

  // 获取每个像素的字节数
  private getBytesPerPixel(): number {
    switch (this.options.cf) {
      case ImageMode.CF_TRUE_COLOR:
        return 2 // RGB565
      case ImageMode.CF_TRUE_COLOR_ALPHA:
        return 4 // RGBA8888
      // 添加其他格式的字节数...
      default:
        return 1
    }
  }

  // 执行转换
  convert(): string | Uint8Array {
    switch (this.options.outputFormat) {
      case OutputMode.C:
        return this.convertToC()
      case OutputMode.PYTHON:
        return this.convertToPython()
      case OutputMode.BIN:
        return this.convertToBinary()
      default:
        throw new Error('Unsupported output format')
    }
  }
}

// 转换图片的主函数
export async function convertImageBlob(
  img: HTMLImageElement,
  options: ConverterOptions
): Promise<string | Uint8Array> {
  const converter = new Converter(img, options)
  return converter.convert()
}

// export { convertImageBlob, Converter } 