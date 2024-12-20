export enum ImageMode {
  CF_TRUE_COLOR = 'CF_TRUE_COLOR',
  CF_TRUE_COLOR_ALPHA = 'CF_TRUE_COLOR_ALPHA',
  CF_TRUE_COLOR_CHROMA = 'CF_TRUE_COLOR_CHROMA',
  CF_INDEXED_1_BIT = 'CF_INDEXED_1_BIT', 
  CF_INDEXED_2_BIT = 'CF_INDEXED_2_BIT',
  CF_INDEXED_4_BIT = 'CF_INDEXED_4_BIT',
  CF_INDEXED_8_BIT = 'CF_INDEXED_8_BIT',
  CF_ALPHA_1_BIT = 'CF_ALPHA_1_BIT',
  CF_ALPHA_2_BIT = 'CF_ALPHA_2_BIT',
  CF_ALPHA_4_BIT = 'CF_ALPHA_4_BIT',
  CF_ALPHA_8_BIT = 'CF_ALPHA_8_BIT',
  CF_RAW = 'CF_RAW',
  CF_RAW_ALPHA = 'CF_RAW_ALPHA',
  CF_RAW_CHROMA = 'CF_RAW_CHROMA',
  CF_RGB565A8 = 'CF_RGB565A8'
}

export enum OutputMode {
  C = 'C',
  BIN = 'BIN',
  PYTHON = 'PYTHON'
}

export const ImageModeUtil = {
  isTrueColor(mode: ImageMode) {
    return [
      ImageMode.CF_TRUE_COLOR,
      ImageMode.CF_TRUE_COLOR_ALPHA,
      ImageMode.CF_TRUE_COLOR_CHROMA
    ].includes(mode)
  }
} 