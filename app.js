// 电竞文旅AI小程序 - 全局App配置
App({
  globalData: {
    // API配置 - 替换为实际的服务器地址
    apiBaseUrl: 'http://localhost:8080',
    
    // 情感状态
    emotion: 'neutral', // neutral, passionate, nostalgic, curious, confused
    
    // 用户偏好
    userPreferences: {
      favoriteTeams: [],
      favoritePlayers: [],
      preferredStyle: 'passionate', // passionate, warm, inspirational
      cities: []
    },
    
    // 知识图谱缓存
    knowledgeGraphCache: {},
    
    // 用户旅程记录
    journeyRecords: [],
    
    // 数字藏品
    digitalCollectibles: []
  },

  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env || 'your-env-id',
        traceUser: true,
      });
    }
    
    // 加载用户数据
    this.loadUserData();
    
    // 初始化情感计算模块
    this.initEmotionModule();
  },

  // 加载用户本地数据
  loadUserData: function() {
    try {
      const userPrefs = wx.getStorageSync('userPreferences');
      if (userPrefs) {
        this.globalData.userPreferences = userPrefs;
      }
      
      const journeyRecords = wx.getStorageSync('journeyRecords');
      if (journeyRecords) {
        this.globalData.journeyRecords = journeyRecords;
      }
      
      const digitalCollectibles = wx.getStorageSync('digitalCollectibles');
      if (digitalCollectibles) {
        this.globalData.digitalCollectibles = digitalCollectibles;
      }
    } catch (e) {
      console.error('加载用户数据失败', e);
    }
  },

  // 保存用户数据
  saveUserData: function() {
    try {
      wx.setStorageSync('userPreferences', this.globalData.userPreferences);
      wx.setStorageSync('journeyRecords', this.globalData.journeyRecords);
      wx.setStorageSync('digitalCollectibles', this.globalData.digitalCollectibles);
    } catch (e) {
      console.error('保存用户数据失败', e);
    }
  },

  // 初始化情感计算模块
  initEmotionModule: function() {
    // 情感词典 - 用于识别用户情绪
    this.emotionKeywords = {
      passionate: ['冠军', '胜利', '热血', '牛逼', '太强了', '加油', '战斗', '拼搏', '夺冠', '牛逼', '厉害', '支持', '必胜', '热血'],
      nostalgic: ['回忆', '当年', '以前', '曾经', '怀念', '老将', '经典', '巅峰', '岁月', '情怀', '那时候', '当年'],
      curious: ['是什么', '怎么', '为什么', '哪里', '哪个', '多少', '如何', '介绍一下', '讲讲', '想了解'],
      confused: ['迷茫', '不懂', '怎么选', '哪个好', '该怎么办', '求助', '纠结', '不知道', '犹豫']
    };
  },

  // 情感识别
  recognizeEmotion: function(message) {
    const lowerMessage = message.toLowerCase();
    let maxScore = 0;
    let detectedEmotion = 'neutral';

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          score++;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    this.globalData.emotion = detectedEmotion;
    return detectedEmotion;
  },

  // 获取情感对应的回复风格
  getEmotionStyle: function(emotion) {
    const styles = {
      passionate: {
        name: '热血',
        color: '#ff4444',
        emoji: '🔥',
        style: '激情热血，充满战斗意志'
      },
      nostalgic: {
        name: '温情',
        color: '#ffaa00',
        emoji: '💫',
        style: '温暖回忆，传递电竞情怀'
      },
      curious: {
        name: '励志',
        color: '#00ccff',
        emoji: '⭐',
        style: '知识讲解，传递赛事精神'
      },
      confused: {
        name: '鼓励',
        color: '#66ff66',
        emoji: '🤝',
        style: '耐心引导，给予支持鼓励'
      },
      neutral: {
        name: '专业',
        color: '#ffffff',
        emoji: '🎮',
        style: '专业解答，传递电竞知识'
      }
    };
    return styles[emotion] || styles.neutral;
  },

  // API请求封装
  requestAPI: function(endpoint, data, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = `${this.globalData.apiBaseUrl}${endpoint}`;
      
      wx.request({
        url: url,
        method: method,
        data: method === 'POST' ? data : null,
        header: {
          'content-type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.data.finishReason === 'error') {
            wx.showToast({
              title: '服务异常',
              icon: 'none'
            });
            reject(res.data);
          } else {
            resolve(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }
});
