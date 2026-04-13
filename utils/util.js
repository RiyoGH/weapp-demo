// utils/util.js - 工具函数库

/**
 * 格式化时间
 */
const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

/**
 * 显示Toast
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  });
};

/**
 * 显示Loading
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

/**
 * 隐藏Loading
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#e63028',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

/**
 * 震动反馈
 */
const vibrate = (type = 'short') => {
  if (type === 'long') {
    wx.vibrateLong();
  } else {
    wx.vibrateShort();
  }
};

/**
 * 复制文本
 */
const copyText = (text) => {
  wx.setClipboardData({
    data: text,
    success: () => {
      showToast('已复制', 'success');
    }
  });
};

/**
 * 保存图片到相册
 */
const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        showToast('保存成功', 'success');
        resolve(true);
      },
      fail: (err) => {
        if (err.errMsg.includes('auth')) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
        reject(err);
      }
    });
  });
};

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 */
const throttle = (fn, interval = 300) => {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      fn.apply(this, args);
      last = now;
    }
  };
};

/**
 * 生成唯一ID
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 深度克隆
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * 本地存储封装
 */
const storage = {
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('��储失败:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const value = wx.getStorageSync(key);
      return value || defaultValue;
    } catch (e) {
      console.error('读取失败:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('删除失败:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('清空失败:', e);
      return false;
    }
  }
};

/**
 * 计算两点距离（用于AR定位）
 */
const calculateDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 格式化文件大小
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  formatTime,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  vibrate,
  copyText,
  saveImageToPhotosAlbum,
  debounce,
  throttle,
  generateId,
  deepClone,
  storage,
  calculateDistance,
  formatSize
};
