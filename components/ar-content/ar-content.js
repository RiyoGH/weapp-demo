// components/ar-content/ar-content.js - AR内容组件
Component({
  properties: {
    target: {
      type: Object,
      value: {}
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    playerAnimation: 'idle',
    effectsVisible: false
  },

  lifetimes: {
    attached() {
      // 组件加载完成
    }
  },

  observers: {
    'show' (visible) {
      if (visible) {
        this.enterARMode();
      } else {
        this.exitARMode();
      }
    }
  },

  methods: {
    // 进入AR模式
    enterARMode() {
      wx.vibrateShort();
      this.setData({ playerAnimation: 'enter' });
      
      // 延迟显示特效
      setTimeout(() => {
        this.setData({ effectsVisible: true });
      }, 500);
    },

    // 退出AR模式
    exitARMode() {
      this.setData({ 
        playerAnimation: 'exit',
        effectsVisible: false 
      });
    },

    // 捕获AR画面
    capture() {
      this.triggerEvent('capture');
    },

    // 询问AI
    askAI() {
      this.triggerEvent('askai', { target: this.data.target });
    },

    // 生成海报
    generatePoster() {
      this.triggerEvent('generateposter', { target: this.data.target });
    }
  }
});
