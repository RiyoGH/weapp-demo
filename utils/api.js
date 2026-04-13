// utils/api.js - API服务层
const app = getApp();

class ApiService {
  constructor() {
    this.baseURL = app.globalData.apiBaseUrl || 'http://localhost:8080';
    this.timeout = 30000; // 30秒超时
  }

  /**
   * 通用请求方法
   */
  request(options) {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data = {}, header = {} } = options;
      
      const requestURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      wx.request({
        url: requestURL,
        method: method,
        data: data,
        header: {
          'content-type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
          ...header
        },
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.finishReason === 'error') {
              wx.showToast({
                title: res.data.reply || '请求失败',
                icon: 'none'
              });
              reject(res.data);
            } else {
              resolve(res.data);
            }
          } else {
            wx.showToast({
              title: `请求失败: ${res.statusCode}`,
              icon: 'none'
            });
            reject(res);
          }
        },
        fail: (err) => {
          console.error('API请求失败:', err);
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }

  /**
   * 简单对话接口（推荐）
   */
  async chatSimple(message) {
    return this.request({
      url: '/api/chat/simple',
      method: 'GET',
      data: { message }
    });
  }

  /**
   * 完整对话接口
   */
  async chatFull(message, options = {}) {
    return this.request({
      url: '/api/chat',
      method: 'POST',
      data: {
        message,
        model: options.model || 'hunyuan-standard',
        temperature: options.temperature || 0.7
      }
    });
  }

  /**
   * 情感分析（可使用混元API）
   */
  async analyzeEmotion(text) {
    // 调用混元大模型进行情感分析
    const prompt = `请分析以下文本的情感倾向，只返回一个词：passionate(热血)、nostalgic(怀旧)、curious(好奇)、confused(迷茫)、neutral(中性)\n文本：${text}`;
    
    try {
      const result = await this.chatFull(prompt, { temperature: 0.3 });
      return this.parseEmotionResult(result.reply);
    } catch (error) {
      console.error('情感分析失败:', error);
      return app.recognizeEmotion(text); // 降级为本地情感识别
    }
  }

  /**
   * 解析情感分析结果
   */
  parseEmotionResult(text) {
    text = text.toLowerCase();
    if (text.includes('passionate') || text.includes('热血')) return 'passionate';
    if (text.includes('nostalgic') || text.includes('怀旧')) return 'nostalgic';
    if (text.includes('curious') || text.includes('好奇')) return 'curious';
    if (text.includes('confused') || text.includes('迷茫')) return 'confused';
    return 'neutral';
  }

  /**
   * 知识图谱查询
   */
  async queryKnowledgeGraph(query, type = 'all') {
    // 构建知识图谱查询提示
    const prompt = `基于电竞知识图谱，回答以下问题：${query}\n\n如果是关于选手羁绊、战队关系、赛事精神、城市关联等问题，请基于以下知识结构回答：\n- 选手关系：师徒、队友、对手、搭档\n- 战队信息：主场城市、夺冠历史、标志性时刻\n- 赛事精神：团结拼搏、永不言弃、心怀荣耀等\n- 文旅关联：电竞场馆、城市景点、打卡点`;
    
    try {
      const result = await this.chatFull(prompt, { temperature: 0.7 });
      return {
        success: true,
        data: result.reply,
        query: query
      };
    } catch (error) {
      console.error('知识图谱查询失败:', error);
      return {
        success: false,
        data: '抱歉，知识图谱查询暂时不可用',
        query: query
      };
    }
  }

  /**
   * 生成文旅路线
   */
  async generateJourney(preferences) {
    const { teams = [], style = 'passionate', cities = [] } = preferences;
    
    const prompt = `基于用户偏好生成电竞文旅路线：\n喜欢的战队：${teams.join(', ')}\n风格：${style}\n城市：${cities.join(', ')}\n\n生成包含5-7个打卡点的深度路线，每个点包含：\n1. 地点名称\n2. 类型（场馆/展馆/打卡点/AR体验等）\n3. 简介\n4. 关联的选手羁绊故事\n5. 赛事精神解读\n6. AR打卡说明`;
    
    try {
      const result = await this.chatFull(prompt, { temperature: 0.9 });
      return {
        success: true,
        route: result.reply
      };
    } catch (error) {
      console.error('路线生成失败:', error);
      return {
        success: false,
        message: '生成路线失败'
      };
    }
  }

  /**
   * 生成数字内容
   */
  async generateContent(type, content) {
    let prompt = '';
    
    switch (type) {
      case 'poster':
        prompt = `为以下电竞内容生成AR海报描述：${content}`;
        break;
      case 'voice':
        prompt = `为以下内容生成选手语音包风格文案：${content}`;
        break;
      case 'script':
        prompt = `为以下电竞内容生成短视频脚本：${content}`;
        break;
      default:
        prompt = `生成电竞相关数字内容：${content}`;
    }
    
    try {
      const result = await this.chatFull(prompt, { temperature: 0.8 });
      return {
        success: true,
        content: result.reply
      };
    } catch (error) {
      console.error('内容生成失败:', error);
      return {
        success: false,
        message: '内容生成失败'
      };
    }
  }

  /**
   * 获取模型信息
   */
  async getModels() {
    try {
      const result = await this.request({
        url: '/api/models',
        method: 'GET'
      });
      return result;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      return {
        models: [
          { name: 'hunyuan-standard', desc: '标准版' },
          { name: 'hunyuan-pro', desc: '专业版' },
          { name: 'hunyuan-lite', desc: '轻量版' }
        ]
      };
    }
  }
}

module.exports = new ApiService();
