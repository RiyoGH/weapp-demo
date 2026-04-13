// index.js - 电竞文旅AI小程序首页
const app = getApp();

Page({
  data: {
    particles: [],
    welcomeEmoji: '🎮',
    welcomeTitle: '欢迎来到电竞世界',
    welcomeMessage: '今天想了解什么电竞故事呢？',
    suggestions: [
      { id: 1, text: 'EDG选手的羁绊故事' },
      { id: 2, text: 'KPL总决赛夺冠时刻' },
      { id: 3, text: '电竞精神是什么' },
      { id: 4, text: '成都AG主场有什么' }
    ],
    hotTeams: [
      {
        id: 1,
        name: 'EDG',
        color: 'linear-gradient(135deg, #ff4444, #ff8833)',
        logoText: 'EDG',
        bonds: 'Meiko&Scout',
        spirit: '团结拼搏',
        path: '/pages/chat/chat'
      },
      {
        id: 2,
        name: 'AG超玩会',
        color: 'linear-gradient(135deg, #00ccff, #9966ff)',
        logoText: 'AG',
        bonds: '一诺&Cat',
        spirit: '永不言弃',
        path: '/pages/journey/journey'
      },
      {
        id: 3,
        name: '狼队',
        color: 'linear-gradient(135deg, #ffd700, #ffaa00)',
        logoText: '狼',
        bonds: 'Fly&胖皇',
        spirit: '坚韧不拔',
        path: '/pages/ar/ar'
      },
      {
        id: 4,
        name: 'TES',
        color: 'linear-gradient(135deg, #66ff66, #00ccff)',
        logoText: 'TES',
        bonds: 'knight&JackeyLove',
        spirit: '无畏前行',
        path: '/pages/chat/chat'
      }
    ]
  },

  onLoad: function(options) {
    this.generateParticles();
    this.updateWelcomeByTime();
  },

  onShow: function() {
    // 更新情感欢迎语
    const emotion = app.globalData.emotion;
    if (emotion && emotion !== 'neutral') {
      this.updateWelcomeByEmotion(emotion);
    }
  },

  // 生成背景粒子效果
  generateParticles: function() {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        color: ['#ff4444', '#ffd700', '#00ccff', '#9966ff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 4 + 2
      });
    }
    this.setData({ particles });
  },

  // 根据时间更新欢迎语
  updateWelcomeByTime: function() {
    const hour = new Date().getHours();
    let emoji, title, message;

    if (hour < 6) {
      emoji = '🌙';
      title = '深夜时光';
      message = '想了解哪个选手的励志故事？';
    } else if (hour < 12) {
      emoji = '☀️';
      title = '早安，召唤师';
      message = '新的一天，为你喜欢的战队加油！';
    } else if (hour < 18) {
      emoji = '🔥';
      title = '下午好，召唤师';
      message = '今天有比赛，来聊聊赛况吧！';
    } else {
      emoji = '🌆';
      title = '晚上好';
      message = '今晚有精彩对决，想了解什么？';
    }

    // 随机添加赛事相关问候
    const eventGreetings = [
      '今天是KPL季后赛，为你支持的战队应援吧！',
      '听说今晚有LPL焦点战，要聊聊吗？',
      '世冠赛正在进行中，想了解最新战报吗？',
      '新赛季即将开启，来聊聊你的期待'
    ];
    
    if (Math.random() > 0.5) {
      message = eventGreetings[Math.floor(Math.random() * eventGreetings.length)];
    }

    this.setData({ welcomeEmoji: emoji, welcomeTitle: title, welcomeMessage: message });
  },

  // 根据情感更新欢迎语
  updateWelcomeByEmotion: function(emotion) {
    const style = app.getEmotionStyle(emotion);
    const messages = {
      passionate: ['感受到你的热血！来聊聊今天的比赛吧！', '斗志满满呢！为你喜欢的战队加油！'],
      nostalgic: ['时光荏苒，电竞情怀永不灭。想回忆哪个经典时刻？', '老将不老，回忆永恒。想聊聊那些经典战役吗？'],
      curious: ['好奇是学习的开始！你想了解什么电竞知识？', '探索精神很棒！带你深入了解电竞世界'],
      confused: ['别迷茫，AI帮你分析！想了解哪个战队或选手？', '选择困难？让我帮你规划电竞文旅路线吧']
    };

    const emotionMessages = messages[emotion] || messages.curious;
    const message = emotionMessages[Math.floor(Math.random() * emotionMessages.length)];

    this.setData({
      welcomeEmoji: style.emoji,
      welcomeTitle: `检测到${style.name}模式`,
      welcomeMessage: message
    });
  },

  // 快捷建议点击
  onSuggestionTap: function(e) {
    const message = e.currentTarget.dataset.message;
    app.globalData.tempChatMessage = message;
    wx.navigateTo({
      url: `/pages/chat/chat?prefill=${encodeURIComponent(message)}`
    });
  },

  // 入口卡片点击
  onEntryTap: function(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({ url: path });
  },

  // 热门战队点击
  onTeamTap: function(e) {
    const team = e.currentTarget.dataset.team;
    wx.navigateTo({
      url: `/pages/chat/chat?team=${team}`
    });
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '电竞文旅AI - 探索电竞世界，感受赛事精神',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    };
  }
});
