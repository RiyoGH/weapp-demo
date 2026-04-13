// chat.js - AI情感对话页面
const app = getApp();

Page({
  data: {
    messages: [],
    inputText: '',
    isTyping: false,
    scrollToView: '',
    emotionStyle: {
      name: '专业',
      color: '#ffffff',
      emoji: '🎮'
    },
    quickQuestions: [
      { id: 1, text: 'EDG选手的羁绊故事' },
      { id: 2, text: '什么是电竞精神？' },
      { id: 3, text: '生成我的文旅路线' },
      { id: 4, text: 'AR场馆在哪里？' },
      { id: 5, text: 'KPL总决赛回顾' },
      { id: 6, text: '选手虚拟人对话' }
    ],
    apiBaseUrl: 'http://localhost:8080'
  },

  onLoad: function(options) {
    // 检查预填充消息
    if (options.prefill) {
      const message = decodeURIComponent(options.prefill);
      this.setData({ inputText: message });
    }
    
    // 如果从首页点击队伍进入
    if (options.team) {
      this.setData({ inputText: `请介绍一下${options.team}战队的故事` });
    }

    // 初始化情感状态
    this.updateEmotionDisplay();
  },

  onShow: function() {
    // 每次显示页面时更新情感状态
    this.updateEmotionDisplay();
  },

  // 更新情感显示
  updateEmotionDisplay: function() {
    const emotion = app.globalData.emotion || 'neutral';
    const style = app.getEmotionStyle(emotion);
    this.setData({ emotionStyle: style });
  },

  // 输入框变化
  onInputChange: function(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 快捷问题点击
  onQuickQuestion: function(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  },

  // 建议点击
  onSuggestionTap: function(e) {
    const suggestion = e.currentTarget.dataset.suggestion;
    this.setData({ inputText: suggestion });
    this.sendMessage();
  },

  // 发送消息
  sendMessage: async function() {
    const message = this.data.inputText.trim();
    if (!message) {
      return;
    }

    // 添加用户消息
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: message,
      time: this.formatTime(new Date()),
      emotionEmoji: this.getEmotionEmoji(app.globalData.emotion)
    };

    this.setData({
      messages: [...this.data.messages, userMsg],
      inputText: '',
      isTyping: true
    });

    // 滚动到底部
    this.scrollToBottom();

    try {
      // 调用后端AI接口
      const response = await this.callAIAPI(message);
      
      // 生成AI回复
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.reply,
        time: this.formatTime(new Date()),
        emotion: app.globalData.emotion,
        suggestions: this.generateSuggestions(message)
      };

      this.setData({
        messages: [...this.data.messages, aiMsg],
        isTyping: false
      });

      // 滚动到底部
      this.scrollToBottom();

      // 保存对话历史
      this.saveChatHistory();

    } catch (error) {
      console.error('AI调用失败:', error);
      wx.showToast({
        title: '请求失败，请检查网络',
        icon: 'none'
      });
      
      // 添加错误消息
      const errorMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: '抱歉，我遇到了一些问题。请检查网络连接或稍后重试。',
        time: this.formatTime(new Date()),
        isError: true
      };

      this.setData({
        messages: [...this.data.messages, errorMsg],
        isTyping: false
      });
    }
  },

  // 调用AI接口
  callAIAPI: async function(message) {
    const apiBaseUrl = this.data.apiBaseUrl;
    
    // 使用简单对话接口
    const response = await wx.request({
      url: `${apiBaseUrl}/api/chat/simple`,
      method: 'GET',
      data: {
        message: message
      },
      header: {
        'content-type': 'application/json'
      }
    });

    if (response.data && response.data.reply) {
      return response.data;
    } else {
      throw new Error('Invalid response');
    }
  },

  // 生成智能建议
  generateSuggestions: function(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    const suggestions = [];

    // 基于问题类型推荐下一步
    if (lowerMsg.includes('羁绊') || lowerMsg.includes('选手')) {
      suggestions.push('查看他们的AR夺冠场景');
      suggestions.push('生成专属文旅路线');
    }
    if (lowerMsg.includes('精神') || lowerMsg.includes('故事')) {
      suggestions.push('了解相关赛事精神');
      suggestions.push('探索更多战队故事');
    }
    if (lowerMsg.includes('路线') || lowerMsg.includes('旅游') || lowerMsg.includes('打卡')) {
      suggestions.push('查看我的路线详情');
      suggestions.push('分享到朋友圈');
    }
    if (lowerMsg.includes('EDG') || lowerMsg.includes('AG') || lowerMsg.includes('KPL')) {
      suggestions.push('扫描战队Logo看AR效果');
      suggestions.push('生成战队数字藏品');
    }

    // 默认建议
    if (suggestions.length === 0) {
      suggestions.push('了解更多相关信息');
      suggestions.push('生成文旅路线');
      suggestions.push('AR虚拟打卡');
    }

    return suggestions.slice(0, 3); // 最多3个建议
  },

  // 获取情绪emoji
  getEmotionEmoji: function(emotion) {
    const emojis = {
      passionate: '🔥',
      nostalgic: '💫',
      curious: '⭐',
      confused: '🤝',
      neutral: '🎮'
    };
    return emojis[emotion] || '🎮';
  },

  // 格式化时间
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 滚动到底部
  scrollToBottom: function() {
    setTimeout(() => {
      this.setData({
        scrollToView: `msg-${this.data.messages.length - 1}`
      });
    }, 100);
  },

  // 保存聊天记录
  saveChatHistory: function() {
    const history = wx.getStorageSync('chatHistory') || [];
    history.push({
      date: new Date().toDateString(),
      messages: this.data.messages.slice(-10) // 保存最近10条
    });
    wx.setStorageSync('chatHistory', history);
  },

  // 清空对话
  clearChat: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话吗？',
      confirmColor: '#e63028',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});
