// ar.js - AR扫描页面
const app = getApp();

Page({
  data: {
    isScanning: false,
    isAREnabled: false,
    isLoading: false,
    cameraPosition: 'back', // front/back
    flashMode: 'off',
    recognizedTarget: null,
    scanHint: '正在扫描电竞IP标识...',
    arEnabled: false,
    showPlayer: false,
    showEffects: false,
    showKG: false,
    playerBottom: 300,
    playerLeft: 200,
    effects: [],
    scanHistory: []
  },

  onLoad: function(options) {
    this.checkPermission();
    this.loadScanHistory();
  },

  onShow: function() {
    // 页面显示时尝试启动扫描
    if (this.data.isScanning) {
      // 重新启动摄像头
    }
  },

  onUnload: function() {
    // 页面卸载时停止扫描
    if (this.data.isScanning) {
      this.stopScan();
    }
  },

  // 检查摄像头权限
  checkPermission: function() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          this.setData({ hasCameraAuth: true });
        } else {
          this.setData({ hasCameraAuth: false });
        }
      }
    });
  },

  // 请求摄像头权限
  requestCameraAuth: function() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ hasCameraAuth: true });
        this.startScan();
      },
      fail: () => {
        wx.showModal({
          title: '需要摄像头权限',
          content: 'AR扫描功能需要摄像头权限，请在设置中开启',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  // 开始扫描
  startScan: function() {
    this.setData({ isScanning: true, isLoading: false });
    wx.showToast({
      title: '扫描已开启',
      icon: 'none'
    });

    // 模拟扫描识别过程
    this.simulateScanning();
  },

  // 停止扫描
  stopScan: function() {
    this.setData({ 
      isScanning: false, 
      isAREnabled: false,
      showPlayer: false,
      showEffects: false,
      showKG: false
    });
    wx.showToast({
      title: '扫描已停止',
      icon: 'none'
    });
  },

  // 模拟扫描识别
  simulateScanning: function() {
    // 模拟3秒后识别到一个目标
    setTimeout(() => {
      if (!this.data.isScanning) return;
      
      // 模拟识别到目标
      this.recognizeTarget();
    }, 3000);
  },

  // 识别目标（模拟）
  recognizeTarget: function() {
    // 模拟识别到的目标数据
    const targets = [
      {
        id: 1,
        name: 'EDG冠军奖杯',
        type: 'trophy',
        description: '2021年LPL夏季赛冠军奖杯',
        playerColor: 'linear-gradient(135deg, #ff4444, #ff8833)',
        playerAvatar: '🏆',
        playerName: 'Meiko田野',
        playerRole: '辅助',
        team: 'EDG',
        bond: '与Scout多年默契配合',
        spirit: '团结拼搏，永不言弃',
        scenic: '上海电竞中心',
        time: new Date().toLocaleTimeString()
      },
      {
        id: 2,
        name: 'AG超玩会主场',
        type: 'venue',
        description: '成都AG超玩会主场场馆',
        playerColor: 'linear-gradient(135deg, #00ccff, #9966ff)',
        playerAvatar: '⚡',
        playerName: '一诺',
        playerRole: '发育路',
        team: 'AG超玩会',
        bond: '与Cat的黄金搭档',
        spirit: '心怀荣耀，勇往直前',
        scenic: '成都电竞中心',
        time: new Date().toLocaleTimeString()
      },
      {
        id: 3,
        name: 'KPL总决赛Logo',
        type: 'logo',
        description: 'KPL春季赛总决赛标识',
        playerColor: 'linear-gradient(135deg, #ffd700, #ffaa00)',
        playerAvatar: '👑',
        playerName: 'Fly',
        playerRole: '对抗路',
        team: '狼队',
        bond: '六次总决赛MVP',
        spirit: '坚韧不拔，王者归来',
        scenic: '重庆狼队主场',
        time: new Date().toLocaleTimeString()
      }
    ];

    // 随机选择一个目标
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    
    this.setData({ 
      recognizedTarget: randomTarget,
      scanHint: '已识别: ' + randomTarget.name
    });

    // 保存到历史
    this.saveToHistory(randomTarget);

    // 延迟后显示AR内容
    setTimeout(() => {
      this.enableARContent();
    }, 500);
  },

  // 启用AR内容展示
  enableARContent: function() {
    this.setData({ 
      arEnabled: true,
      showPlayer: true,
      showEffects: true,
      showKG: true
    });

    // 生成粒子特效
    this.generateEffects();

    wx.showToast({
      title: 'AR内容已加载',
      icon: 'success'
    });
  },

  // 生成特效粒子
  generateEffects: function() {
    const effects = [];
    const colors = ['#ff4444', '#ffd700', '#00ccff', '#9966ff', '#66ff66'];
    
    for (let i = 0; i < 12; i++) {
      effects.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        top: Math.random() * 200 + 'rpx',
        left: Math.random() * 300 + 'rpx',
        duration: Math.random() * 2 + 1 + 's'
      });
    }
    
    this.setData({ effects });
  },

  // 切换摄像头
  toggleCamera: function() {
    const newPosition = this.data.cameraPosition === 'back' ? 'front' : 'back';
    this.setData({ cameraPosition: newPosition });
    wx.showToast({
      title: newPosition === 'back' ? '后置摄像头' : '前置摄像头',
      icon: 'none'
    });
  },

  // 切换闪光灯
  toggleFlash: function() {
    const newMode = this.data.flashMode === 'off' ? 'on' : 'off';
    this.setData({ flashMode: newMode });
  },

  // 切换AR开关
  toggleAR: function() {
    if (this.data.arEnabled) {
      this.setData({ 
        arEnabled: false,
        showPlayer: false,
        showEffects: false,
        showKG: false
      });
    } else if (this.data.recognizedTarget) {
      this.enableARContent();
    } else {
      wx.showToast({
        title: '请先扫描识别',
        icon: 'none'
      });
    }
  },

  // 保存到历史记录
  saveToHistory: function(target) {
    const history = this.data.scanHistory;
    history.unshift(target);
    // 最多保存10条
    if (history.length > 10) {
      history.pop();
    }
    this.setData({ scanHistory: history });
    wx.setStorageSync('arScanHistory', history);
  },

  // 加载历史记录
  loadScanHistory: function() {
    try {
      const history = wx.getStorageSync('arScanHistory') || [];
      this.setData({ scanHistory: history });
    } catch (e) {
      console.error('加载历史失败', e);
    }
  },

  // 历史记录点击
  onHistoryTap: function(e) {
    const target = e.currentTarget.dataset.target;
    this.setData({ 
      recognizedTarget: target,
      arEnabled: true,
      showPlayer: true,
      showEffects: true,
      showKG: true
    });
    this.generateEffects();
  },

  // 捕获AR画面
  captureAR: function() {
    wx.showToast({
      title: 'AR截图已保存',
      icon: 'success'
    });
    
    // 这里可以实现真正的截图功能
    wx.vibrateShort();
  },

  // 询问AI
  askAI: function() {
    const target = this.data.recognizedTarget;
    if (target) {
      wx.navigateTo({
        url: `/pages/chat/chat?prefill=${encodeURIComponent(`请告诉我${target.name}的${target.bond}故事和${target.spirit}精神`)}`
      });
    }
  },

  // 生成海报
  generatePoster: function() {
    wx.showLoading({ title: '生成中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '海报已生成',
        icon: 'success'
      });
      
      // 跳转到海报预览页或直接保存
    }, 1500);
  },

  // 查看完整知识图谱
  viewFullKG: function() {
    wx.showModal({
      title: '知识图谱',
      content: `战队: ${this.data.recognizedTarget.team}\n羁绊: ${this.data.recognizedTarget.bond}\n精神: ${this.data.recognizedTarget.spirit}\n景点: ${this.data.recognizedTarget.scenic}`,
      confirmText: '生成文旅路线',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/journey/journey'
          });
        }
      }
    });
  },

  // 激活AR（从识别结果页）
  activateAR: function() {
    this.enableARContent();
  },

  // 权限弹窗确认
  onConfirmPermission: function() {
    this.requestCameraAuth();
  },

  // 权限弹窗取消
  onCancelPermission: function() {
    wx.showToast({
      title: 'AR功能需要摄像头权限',
      icon: 'none'
    });
  },

  // 摄像头停止事件
  onCameraStop: function(e) {
    console.log('Camera stopped', e);
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: 'AR扫描电竞场馆，发现隐藏的冠军故事！',
      path: '/pages/ar/ar',
      imageUrl: '/images/share-ar.jpg'
    };
  }
});
