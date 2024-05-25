/**
 * npm i prettier eslint-config-prettier eslint-plugin-prettier -D // 安装prettier
 *
 * npx mrm lint-staged -D // 安装husky和lint-stage，并且配置好husky。
 *
 * npm install @commitlint/cli @commitlint/config-conventional -D // 安装commitlint校验提交信息格式
 */

module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false, // 是否使用tab进行缩进，默认为false
  singleQuote: true, // 是否使用单引号代替双引号，默认为false
  semi: true, // 行尾是否使用分号，默认为true
  arrowParens: 'always',
  endOfLine: 'auto',
  vueIndentScriptAndStyle: true,
  htmlWhitespaceSensitivity: 'strict',
};
