// profile.js - 个人中心页面
const app = getApp();

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickname: ''
    },
    currentEmotion: {
      emoji: '🎮',
      name: '专业'
    },
    userStats: [
      { id: 1, value: 0, label: '打卡次数', icon: '📍' },
      { id: 2, value: 0, label: '数字藏品', icon: '🎨' },
      { id: 3, value: 0, label: '生成路线', icon: '🗺️' },
      { id: 4, value: 0, label: '对话次数', icon: '💬' }
    ],
    quickActions: [
      { id: 1, icon: '🗺️', text: '我的路线', action: 'routes', badge: 0 },
      { id: 2, icon: '🎨', text: '数字藏品', action: 'collectibles', badge: 0 },
      { id: 3, icon: '🏆', text: '羁绊勋章', action: 'badges', badge: 0 },
      { id: 4, icon: '📤', text: '分享邀请', action: 'share', badge: 0 }
    ],
    favoriteTeamsText: '未设置',
    preferredStyleText: '热血风格',
    targetCitiesText: '未设置',
    notificationEnabled: true,
    cacheSize: '0 KB'
  },

  onLoad: function() {
    this.loadUserData();
    this.calculateStats();
  },

  onShow: function() {
    this.loadUserData();
    this.calculateStats();
    this.updateEmotionDisplay();
    this.calculateCacheSize();
  },

  // 加载用户数据
  loadUserData: function() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const prefs = wx.getStorageSync('userPreferences') || {};
      
      this.setData({
        userInfo: {
          avatarUrl: userInfo.avatarUrl || '',
          nickname: userInfo.nickname || ''
        },
        favoriteTeamsText: prefs.favoriteTeams?.length > 0 
          ? prefs.favoriteTeams.map(id => this.getTeamName(id)).join('、') 
          : '未设置',
        preferredStyleText: this.getStyleText(prefs.preferredStyle),
        targetCitiesText: prefs.cities?.length > 0 
          ? prefs.cities.map(id => this.getCityName(id)).join('、') 
          : '未设置'
      });
    } catch (e) {
      console.error('加载用户数据失败', e);
    }
  },

  // 计算统计数据
  calculateStats: function() {
    try {
      const checkins = wx.getStorageSync('checkins') || [];
      const collectibles = wx.getStorageSync('collectibles') || [];
      const routes = wx.getStorageSync('myRoutes') || [];
      const chatHistory = wx.getStorageSync('chatHistory') || [];

      const stats = [
        { id: 1, value: checkins.length, label: '打卡次数', icon: '📍' },
        { id: 2, value: collectibles.length, label: '数字藏品', icon: '🎨' },
        { id: 3, value: routes.length, label: '生成路线', icon: '🗺️' },
        { id: 4, value: chatHistory.length, label: '对话次数', icon: '💬' }
      ];

      // 更新快速操作徽章
      const quickActions = this.data.quickActions.map(item => {
        if (item.action === 'routes') item.badge = routes.length;
        if (item.action === 'collectibles') item.badge = collectibles.length;
        return item;
      });

      this.setData({
        userStats: stats,
        quickActions: quickActions
      });
    } catch (e) {
      console.error('计算统计数据失败', e);
    }
  },

  // 更新情感显示
  updateEmotionDisplay: function() {
    const emotion = app.globalData.emotion || 'neutral';
    const style = app.getEmotionStyle(emotion);
    this.setData({ currentEmotion: style });
  },

  // 选择头像
  onChooseAvatar: function(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
    this.saveUserInfo();
    wx.showToast({
      title: '头像已更新',
      icon: 'success'
    });
  },

  // 修改昵称
  onNicknameChange: function(e) {
    const nickname = e.detail.value;
    this.setData({
      'userInfo.nickname': nickname
    });
    this.saveUserInfo();
  },

  // 保存用户信息
  saveUserInfo: function() {
    try {
      wx.setStorageSync('userInfo', this.data.userInfo);
    } catch (e) {
      console.error('保存用户信息失败', e);
    }
  },

  // 编辑个人资料
  editProfile: function() {
    wx.showModal({
      title: '编辑资料',
      content: '完善个人资料，获得更好的个性化推荐',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '点击头像或昵称即可编辑',
            icon: 'none'
          });
        }
      }
    });
  },

  // 快速操作
  onQuickAction: function(e) {
    const action = e.currentTarget.dataset.action;
    
    switch (action) {
      case 'routes':
        wx.switchTab({ url: '/pages/journey/journey' });
        break;
      case 'collectibles':
        wx.showToast({
          title: '查看数字藏品',
          icon: 'none'
        });
        break;
      case 'badges':
        this.showBadges();
        break;
      case 'share':
        this.shareApp();
        break;
    }
  },

  // 偏好设置
  onPreferenceSetting: function(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    let options = [];
    
    switch (type) {
      case 'teams':
        title = '选择喜欢的战队';
        options = [
          { id: 1, name: 'EDG' },
          { id: 2, name: 'AG超玩会' },
          { id: 3, name: '狼队' },
          { id: 4, name: 'TES' },
          { id: 5, name: 'RNG' }
        ];
        break;
      case 'style':
        title = '选择交互风格';
        options = [
          { id: 'passionate', name: '热血风格' },
          { id: 'warm', name: '温情风格' },
          { id: 'inspirational', name: '励志风格' }
        ];
        break;
      case 'city':
        title = '选择目标城市';
        options = [
          { id: 1, name: '上海' },
          { id: 2, name: '成都' },
          { id: 3, name: '北京' },
          { id: 4, name: '武汉' },
          { id: 5, name: '深圳' }
        ];
        break;
    }

    this.showMultiSelectModal(title, options, type);
  },

  // 显示多选弹窗
  showMultiSelectModal: function(title, options, type) {
    const prefs = app.globalData.userPreferences;
    let selected = [];
    
    if (type === 'teams') selected = prefs.favoriteTeams || [];
    if (type === 'style') selected = prefs.preferredStyle ? [prefs.preferredStyle] : [];
    if (type === 'city') selected = prefs.cities || [];

    wx.showModal({
      title: title,
      content: `当前选择：${selected.length > 0 ? selected.join('、') : '无'}`,
      confirmText: '修改',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 实际应用中应该跳转到选择页面
          wx.showToast({
            title: '请在主页偏好区选择',
            icon: 'none'
          });
        }
      }
    });
  },

  // 查看历史记录
  onViewHistory: function(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    
    switch (type) {
      case 'chat':
        title = '对话历史';
        break;
      case 'scan':
        title = 'AR扫描记录';
        break;
      case 'checkin':
        title = '打卡记录';
        break;
    }

    wx.showModal({
      title: title,
      content: '查看完整历史记录功能开发中',
      confirmText: '知道了'
    });
  },

  // 通知设置
  onNotificationSetting: function() {
    wx.showToast({
      title: '通知设置',
      icon: 'none'
    });
  },

  // 通知开关变化
  onNotificationChange: function(e) {
    this.setData({
      notificationEnabled: e.detail.value
    });
    wx.showToast({
      title: e.detail.value ? '已开启通知' : '已关闭通知',
      icon: 'none'
    });
  },

  // AR设置
  onARSetting: function() {
    wx.showModal({
      title: 'AR设置',
      content: 'AR功能设置项：\n• 摄像头权限\n• AR特效显示\n• 截图质量\n• 保存位置',
      confirmText: '知道了'
    });
  },

  // 清理缓存
  onClearCache: function() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理缓存吗？',
      confirmText: '清理',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            this.calculateCacheSize();
            this.calculateStats();
            wx.showToast({
              title: '缓存已清理',
              icon: 'success'
            });
          } catch (e) {
            wx.showToast({
              title: '清理失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 计算缓存大小
  calculateCacheSize: function() {
    try {
      const info = wx.getStorageInfoSync();
      const sizeInKB = (info.currentSize / 1024).toFixed(2);
      this.setData({
        cacheSize: sizeInKB > 1024 
          ? (sizeInKB / 1024).toFixed(2) + ' MB' 
          : sizeInKB + ' KB'
      });
    } catch (e) {
      this.setData({ cacheSize: '0 KB' });
    }
  },

  // 显示羁绊勋章
  showBadges: function() {
    wx.showModal({
      title: '🏆 羁绊勋章',
      content: '收集更多羁绊，解锁专属勋章！\n\n当前已获得：0/20\n\n继续探索电竞世界吧！',
      confirmText: '去探索'
    });
  },

  // 关于我们
  onAbout: function() {
    wx.showModal({
      title: '关于我们',
      content: '电竞文旅AI小程序\n\n结合腾讯混元大模型、知识图谱和AR技术，为电竞爱好者提供沉浸式的文旅体验。\n\n版本：1.0.0\n\nPowered by 腾讯AI',
      confirmText: '知道了'
    });
  },

  // 使用帮助
  onHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '1️⃣ 首页：查看智能推荐和热门战队\n\n2️⃣ AI对话：与AI畅聊电竞知识\n\n3️⃣ AR扫描：扫描电竞标识体验AR\n\n4️⃣ 文旅路线：生成专属打卡路线\n\n5️⃣ 个人中心：管理偏好和历史',
      confirmText: '知道了'
    });
  },

  // 意见反馈
  onFeedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！\n\n您可以通过以下方式联系我们：\n• 在小程序内提交反馈\n• 联系客服邮箱',
      confirmText: '提交反馈'
    });
  },

  // 分享小程序
  shareApp: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 获取战队名称
  getTeamName: function(id) {
    const teams = { 1: 'EDG', 2: 'AG超玩会', 3: '狼队', 4: 'TES', 5: 'RNG' };
    return teams[id] || '';
  },

  // 获取风格文本
  getStyleText: function(style) {
    const styles = { passionate: '热血风格', warm: '温情风格', inspirational: '励志风格' };
    return styles[style] || '热血风格';
  },

  // 获取城市名称
  getCityName: function(id) {
    const cities = { 1: '上海', 2: '成都', 3: '北京', 4: '武汉', 5: '深圳' };
    return cities[id] || '';
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '电竞文旅AI - 探索电竞世界，感受赛事精神',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    };
  }
});
