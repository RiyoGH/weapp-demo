// journey.js - 电竞文旅路线页面
const app = getApp();

Page({
  data: {
    preferenceOptions: {
      teams: [
        { id: 1, name: 'EDG' },
        { id: 2, name: 'AG超玩会' },
        { id: 3, name: '狼队' },
        { id: 4, name: 'TES' },
        { id: 5, name: 'RNG' }
      ],
      styles: [
        { id: 'passionate', name: '热血' },
        { id: 'warm', name: '温情' },
        { id: 'inspirational', name: '励志' }
      ],
      cities: [
        { id: 1, name: '上海' },
        { id: 2, name: '成都' },
        { id: 3, name: '北京' },
        { id: 4, name: '武汉' },
        { id: 5, name: '深圳' }
      ]
    },
    selectedTeams: [],
    selectedStyles: [],
    selectedCities: [],
    isGenerating: false,
    currentRoute: null,
    myRoutes: [],
    collectibles: []
  },

  onLoad: function() {
    this.loadUserData();
    this.initDefaultSelections();
  },

  onShow: function() {
    // 每次显示更新数据
    this.loadUserData();
  },

  // 初始化默认选择
  initDefaultSelections: function() {
    const prefs = app.globalData.userPreferences || {};
    this.setData({
      selectedTeams: prefs.favoriteTeams || [],
      selectedStyles: prefs.preferredStyle ? [prefs.preferredStyle] : [],
      selectedCities: prefs.cities || []
    });
  },

  // 加载用户数据
  loadUserData: function() {
    try {
      const routes = wx.getStorageSync('myRoutes') || [];
      const collectibles = wx.getStorageSync('collectibles') || [];
      this.setData({
        myRoutes: routes,
        collectibles: collectibles
      });
    } catch (e) {
      console.error('加载数据失败', e);
    }
  },

  // 切换偏好选择
  togglePreference: function(e) {
    const { type, id } = e.currentTarget.dataset;
    const key = `selected${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    let current = this.data[key];
    
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    
    this.setData({ [key]: current });
  },

  // 生成路线
  generateRoute: async function() {
    const { selectedTeams, selectedStyles, selectedCities } = this.data;
    
    if (selectedTeams.length === 0) {
      wx.showToast({
        title: '请至少选择一个战队',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      // 调用AI生成路线（模拟）
      const route = await this.generateRouteFromAI();
      
      this.setData({
        currentRoute: route,
        isGenerating: false
      });

      // 保存到我的路线
      this.saveRoute(route);

      wx.showToast({
        title: '路线生成成功',
        icon: 'success'
      });

    } catch (error) {
      console.error('生成路线失败', error);
      this.setData({ isGenerating: false });
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  },

  // AI生成路线（模拟）
  generateRouteFromAI: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 根据用户选择生成路线
        const teams = this.data.selectedTeams.map(id => {
          const team = this.data.preferenceOptions.teams.find(t => t.id === id);
          return team ? team.name : '';
        }).filter(Boolean);

        const style = this.data.selectedStyles.length > 0 
          ? this.data.preferenceOptions.styles.find(s => s.id === this.data.selectedStyles[0]).name
          : '热血';

        const city = this.data.selectedCities.length > 0
          ? this.data.preferenceOptions.cities.find(c => c.id === this.data.selectedCities[0]).name
          : '上海';

        // 生成路线节点
        const nodes = [
          {
            id: 1,
            name: `${city}电竞中心`,
            type: '场馆',
            description: `参观${city}电竞中心，感受职业赛场氛围`,
            story: '这里是' + teams[0] + '的主场，见证过无数经典时刻',
            spirit: style === '热血' ? '拼搏精神' : style === '温情' ? '情怀传承' : '永不言弃',
            bond: `与${teams[0]}的羁绊从这里开始`,
            location: `${city}电竞中心`,
            completed: false,
            collected: false
          },
          {
            id: 2,
            name: `${teams[0]}战队展馆`,
            type: '展馆',
            description: `深入了解${teams[0]}战队历史和荣誉`,
            story: `从建队到夺冠，${teams[0]}一路走来充满传奇`,
            spirit: style === '热血' ? '冠军之心' : '电竞梦想',
            bond: `感受${teams[0]}的团队精神`,
            location: `${city}电竞博物馆`,
            completed: false,
            collected: false
          },
          {
            id: 3,
            name: `选手应援墙`,
            type: '打卡点',
            description: `为${teams[0]}选手留下祝福`,
            story: `每一位选手都值得被铭记，他们的故事激励着所有人`,
            spirit: '支持与热爱',
            bond: `与${teams[0]}选手的羁绊`,
            location: `城市电竞广场`,
            completed: false,
            collected: false
          },
          {
            id: 4,
            name: 'AR虚拟赛场',
            type: 'AR体验',
            description: '通过AR技术重温经典比赛瞬间',
            story: '科技让电竞记忆永存',
            spirit: '科技与电竞融合',
            bond: '虚拟与现实的连接',
            location: `线上AR体验点`,
            completed: false,
            collected: false
          },
          {
            id: 5,
            name: '电竞主题咖啡馆',
            type: '休息点',
            description: '电竞主题咖啡馆，品尝特色饮品',
            story: '在电竞氛围中放松身心',
            spirit: '电竞生活方式',
            bond: '电竞文化的延伸',
            location: `电竞主题街区`,
            completed: false,
            collected: false
          }
        ];

        const route = {
          id: Date.now(),
          title: `${teams[0]}·${style}文旅路线`,
          description: `${city} · ${teams[0]} · ${style}风格 · 5个打卡点`,
          nodes: nodes,
          totalCount: nodes.length,
          completedCount: 0,
          collectibles: 0,
          style: style,
          teams: teams,
          city: city,
          createdTime: new Date().toISOString()
        };

        resolve(route);
      }, 2000);
    });
  },

  // 保存路线
  saveRoute: function(route) {
    let routes = this.data.myRoutes;
    routes.unshift(route);
    // 只保留最近10条
    if (routes.length > 10) {
      routes = routes.slice(0, 10);
    }
    
    this.setData({ myRoutes: routes });
    wx.setStorageSync('myRoutes', routes);
  },

  // 节点点击
  onNodeTap: function(e) {
    const node = e.currentTarget.dataset.node;
    wx.showModal({
      title: node.name,
      content: node.story,
      confirmText: '查看AR',
      cancelText: node.completed ? '已打卡' : '开始打卡',
      success: (res) => {
        if (res.confirm) {
          this.openAR({ currentTarget: { dataset: { node: node } } });
        } else if (!node.completed) {
          this.checkInNode(node);
        }
      }
    });
  },

  // 节点打卡
  checkInNode: function(node) {
    wx.showToast({
      title: '打卡成功！',
      icon: 'success'
    });
    
    // 更新节点状态
    const route = this.data.currentRoute;
    const nodeIndex = route.nodes.findIndex(n => n.id === node.id);
    if (nodeIndex > -1) {
      route.nodes[nodeIndex].completed = true;
      route.completedCount++;
      
      this.setData({ currentRoute: route });
      this.updateRouteInList(route);
      
      // 生成数字藏品
      this.generateCollectible(route.nodes[nodeIndex]);
    }
  },

  // 更新路线列表中的路线
  updateRouteInList: function(updatedRoute) {
    const routes = this.data.myRoutes;
    const index = routes.findIndex(r => r.id === updatedRoute.id);
    if (index > -1) {
      routes[index] = updatedRoute;
      this.setData({ myRoutes: routes });
      wx.setStorageSync('myRoutes', routes);
    }
  },

  // 打开AR打卡
  openAR: function(e) {
    const node = e.currentTarget.dataset.node;
    wx.navigateTo({
      url: `/pages/ar/ar?target=${encodeURIComponent(node.name)}`
    });
  },

  // 收藏节点
  collectNode: function(e) {
    const node = e.currentTarget.dataset.node;
    const route = this.data.currentRoute;
    const nodeIndex = route.nodes.findIndex(n => n.id === node.id);
    
    if (nodeIndex > -1) {
      route.nodes[nodeIndex].collected = !route.nodes[nodeIndex].collected;
      if (route.nodes[nodeIndex].collected) {
        route.collectibles++;
      } else {
        route.collectibles--;
      }
      
      this.setData({ currentRoute: route });
      this.updateRouteInList(route);
      
      wx.showToast({
        title: route.nodes[nodeIndex].collected ? '已收藏' : '已取消收藏',
        icon: 'none'
      });
    }
  },

  // 生成数字藏品
  generateCollectible: function(node) {
    const colors = [
      'linear-gradient(135deg, #ff4444, #ff8833)',
      'linear-gradient(135deg, #00ccff, #9966ff)',
      'linear-gradient(135deg, #ffd700, #ffaa00)',
      'linear-gradient(135deg, #66ff66, #00ccff)',
      'linear-gradient(135deg, #ff6b6b, #ffd700)'
    ];
    const emojis = ['🏆', '🎮', '⚡', '🔥', '💎', '👑', '🎯', '🏅'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const collectible = {
      id: Date.now(),
      name: `${node.name}纪念章`,
      type: '打卡藏品',
      image: '', // 不再使用图片
      color: randomColor,
      emoji: randomEmoji,
      badge: '打卡纪念',
      obtainedAt: new Date().toISOString(),
      nodeId: node.id
    };

    let collectibles = this.data.collectibles;
    collectibles.unshift(collectible);
    this.setData({ collectibles });
    wx.setStorageSync('collectibles', collectibles);
  },

  // 查看路线详情
  viewRoute: function(e) {
    const route = e.currentTarget.dataset.route;
    this.setData({ currentRoute: route });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  // 查看所有藏品
  viewAllCollectibles: function() {
    // 可以跳转到专门的藏品展示页
    wx.showToast({
      title: '藏品展示功能开发中',
      icon: 'none'
    });
  },

  // 查看单个藏品
  viewCollectible: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.name,
      content: `类型：${item.type}\n获取时间：${new Date(item.obtainedAt).toLocaleDateString()}`,
      confirmText: '分享',
      success: (res) => {
        if (res.confirm) {
          this.shareCollectible(item);
        }
      }
    });
  },

  // 分享藏品
  shareCollectible: function(item) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 分享整个页面
  onShareAppMessage: function() {
    return {
      title: '我的电竞文旅路线',
      path: '/pages/journey/journey',
      imageUrl: '/images/share-journey.jpg'
    };
  }
});
