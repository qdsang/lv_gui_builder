function copyPaste(bool) {
  // 右键菜单
  document.oncontextmenu = function () {
    return bool;
  };

  // 文字选择
  document.onselectstart = function () {
    return bool;
  };

  // 复制
  document.oncopy = function () {
    return bool;
  };

  // 剪切
  document.oncut = function () {
    return bool;
  };

  // 粘贴
  document.onpaste = function () {
    return bool;
  };
}

function enable() {
  copyPaste(true);
}

function disable() {
  copyPaste(false);
}

export default { enable, disable };
