// StoryAI v3.0 - 2026-03-30 - Fixed JSON parsing for unquoted keys
// API 配置：部署后改为 Workers 地址
const API_CONFIG = {
  // 部署后改为: 'https://your-worker.workers.dev/api/story'
  storyUrl: 'https://api.stepfun.com/v1/chat/completions',
  // 部署后改为: 'https://your-worker.workers.dev/api/tts'  
  ttsUrl: null,
  // 部署后移除此 key（由 Workers 代理注入）
  apiKey: '4oS7T7XAKtsj9jA21J0ThpPqbU6UXmVmFeLdEOLLNGpaiGrcHi9Mym5aRNtWnHiix'
};

// AI 故事生成模块 - 专业儿童睡前故事引擎
const StoryAI = {
  API_URL: API_CONFIG.storyUrl,
  API_KEY: API_CONFIG.apiKey,
  MODEL: 'step-3.5-flash',

  lengthConfig: {
    short:  { wordCount: 300,  pageCount: 2, desc: '短篇' },
    medium: { wordCount: 600,  pageCount: 4, desc: '中篇' },
    long:   { wordCount: 1000, pageCount: 6, desc: '长篇' },
    extra:  { wordCount: 1500, pageCount: 8, desc: '超长篇' }
  },

  typeDesc: {
    fairy: '童话故事', fable: '寓言故事', myth: '神话传说',
    animal: '动物故事', scifi: '科幻冒险', science: '科学探索',
    princess: '公主故事', ocean: '海洋冒险', fantasy: '奇幻冒险',
    habit: '好习惯养成', friendship: '友情故事', courage: '勇气故事',
    custom: '自定义'
  },

  // 安全护栏：禁止内容清单
  safetyGuidelines: `
【安全护栏 - 严格禁止以下内容】
1. 恐怖元素：死亡、血腥、暴力、绑架、噩梦、鬼魂、怪物
2. 焦虑情节：父母永久离开、被抛弃、长期孤立、无法解决的无助困境
3. 不当示范：撒谎成功、破坏规则、暴力手段达成目标
4. 危险行为：独自去危险地方、和陌生人走、模仿危险动作
5. 复杂情绪：背叛、复仇、嫉妒导致的恶意行为

【替代方案】
- 黑暗/可怕场景 → 神秘但安全的探索
- 分离焦虑 → 短暂的分离后温暖重聚
- 冲突 → 通过沟通、合作、创意解决
- 挑战 → 可解决的困难，在帮助下克服
`,

  // 认知发展元素（按年龄）
  getCognitiveElements(age) {
    if (age <= 3) return '融入基础认知：数数(1-5)、基本颜色、简单形状。语言要求：句子简短(10字以内)，节奏重复性强，多用叠词和拟声词';
    if (age <= 4) return '融入基础认知：数数(1-10)、基本颜色(红/黄/蓝/绿)、简单形状(圆/方/三角)、常见动物名称。语言要求：句子简短，适当重复';
    if (age <= 6) return '融入社交认知：情感词汇(开心/难过/骄傲/害羞)、基础社交概念(分享/轮流/说"请"和"谢谢")';
    return '融入成长认知：简单逻辑推理、因果关系、友谊与合作的深层意义';
  },

  // 语言风格要求（按年龄）
  getLanguageStyle(age) {
    if (age <= 3) return '语言风格：句子极短(5-10字)，节奏重复，多用叠词("亮晶晶""软绵绵")，拟声词丰富("叮咚""哗啦")，可加入简单的重复句式如"铺一片，亮一下。再铺一片，又亮一下。"';
    if (age <= 4) return '语言风格：句子简短(10-15字)，节奏舒缓，多用拟声词，适当重复关键句';
    return '语言风格：优美生动，适当使用形容词，情节完整有起伏';
  },

  async generateStory({ childName, childAge, childGender, storyType, customPrompt, length }) {
    // 本地文件测试模式：如果 fetch 失败，返回模拟故事
    const isLocalFile = window.location.protocol === 'file:';
    
    try {
      return await this._doGenerate({ childName, childAge, childGender, storyType, customPrompt, length });
    } catch(e) {
      console.warn('API调用失败，使用模拟故事:', e);
      if (isLocalFile) {
        return this._getMockStory(childName, childAge, childGender, storyType);
      }
      throw e;
    }
  },

  // 模拟故事（用于本地测试）
  _getMockStory(childName, childAge, childGender, storyType) {
    const pronoun = childGender === 'girl' ? '她' : '他';
    const typeName = this.typeDesc[storyType] || '童话';
    return {
      title: `${childName}的${typeName}冒险`,
      pages: [
        { text: `从前，在一个美丽的彩虹山谷里，住着一个叫${childName}的${childAge}岁小朋友。${pronoun}有一双亮晶晶的眼睛，总是充满好奇地看着这个世界。

一天早晨，${childName}发现家门口多了一扇神奇的小门。门上写着："只有勇敢又善良的小朋友才能打开。"${childName}轻轻推开门，一道温暖的光芒照了进来。`, scene: '彩虹山谷，神奇的小门，温暖的光芒' },
        { text: `门后面是一个奇妙的花园！会说话的花朵、跳舞的蝴蝶、还有一只可爱的小兔子。小兔子说："${childName}，欢迎来到梦想花园！这里需要帮助才能变得更美丽。"

${childName}开心地答应了。${pronoun}帮花儿浇水，帮蝴蝶整理翅膀，还和小兔子一起种下了希望的种子。`, scene: '梦想花园，会说话的花朵，跳舞的蝴蝶，小兔子' },
        { text: `太阳慢慢下山了，花园变得金光闪闪。小兔子送给${childName}一颗星星种子："这是勇气的种子，种在心里，你永远都不会害怕。"

${childName}小心地把种子放进口袋里。小兔子说："该回家了，但记得，只要心中有爱，梦想花园永远为你敞开。"`, scene: '金色的夕阳，星星种子，温馨告别' },
        { text: `${childName}回到家，发现口袋里真的有一颗亮晶晶的种子！${pronoun}把种子种在窗台的小花盆里，对它说："晚安，小种子，明天见。"

那天晚上，${childName}做了一个甜甜的梦，梦见自己和小兔子在彩虹上玩耍。`, scene: '温馨的房间，窗台上的种子，甜甜的美梦' }
      ],
      tip: `🌟 给${childName}的成长小贴士：勇敢不是不害怕，而是即使有点害怕，也愿意去尝试和帮助他人。`,
      moral: '善良和勇敢能让世界变得更美好',
      wish: `${childName}能永远保持善良和勇敢的心`
    };
  },

  async _doGenerate({ childName, childAge, childGender, storyType, customPrompt, length }) {
    const cfg = this.lengthConfig[length] || this.lengthConfig.medium;
    const genderDesc = childGender === 'girl' ? '女孩' : '男孩';
    const pronoun = childGender === 'girl' ? '她' : '他';
    let typeDesc = this.typeDesc[storyType] || '童话故事';
    
    // 自定义类型处理
    if (storyType === 'custom' && customPrompt) {
      typeDesc = `关于"${customPrompt}"的定制故事`;
    }

    // 个性化场景（可选）
    const scenes = ['魔法森林', '彩虹山谷', '星星湖畔', '云朵城堡', '糖果小镇', '水晶海底'];
    const scene = scenes[Math.floor(Math.random() * scenes.length)];

    const prompt = `你是一位专业的儿童睡前故事作家，擅长创作温馨、安全、富有想象力的故事。

【故事要求】
请为一个叫"${childName}"的${childAge}岁${genderDesc}创作一个睡前故事。
- 主角：${childName}（${genderDesc}，用"${pronoun}"指代）
- 场景：${scene}
- 类型：${typeDesc}
- 字数：约${cfg.wordCount}字，分成${cfg.pageCount}个自然段落
- 风格：温馨、优美、充满想象力，适当使用拟声词（如"呼呼"、"沙沙"、"叮咚"）

【情节结构】
1. 起：${childName}在${scene}的日常生活或遇到的契机
2. 承：遇到一个小挑战或需要帮助的朋友
3. 转：通过善良/勇敢/智慧/合作解决问题
4. 合：温暖圆满的结局，适合入睡

【教育元素】
${this.getCognitiveElements(childAge)}

${this.getLanguageStyle(childAge)}

${this.safetyGuidelines}

【输出格式】
请按以下JSON格式输出（只输出JSON，不要其他内容）：
{
  "title": "故事标题（包含${childName}）",
  "pages": [
    {"text": "第1段内容", "scene": "场景画面描述（用于AI插画）"},
    {"text": "第2段内容", "scene": "场景画面描述"}
  ],
  "tip": "🌟 给${childName}的成长小贴士",
  "moral": "故事传递的核心道理（一句话）",
  "wish": "对${childName}的温馨祝愿"
}

【语气要求】
- 语言简单优美，句子不要太长
- 结尾逐渐归于平静，有助于情绪安抚
- 可以有一处邀请想象画面的轻柔描述`;

    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: this.MODEL,
        max_tokens: 4096,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是一个儿童故事创作助手。请始终用中文回复，输出合法的JSON格式。' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('API Error:', res.status, err);
      throw new Error(`API请求失败: ${res.status} - ${err.substring(0, 200)}`);
    }

    const data = await res.json();
    console.log('API Response:', data);
    const content = data.choices?.[0]?.message?.content || '';
    console.log('Generated content:', content.substring(0, 500));
    return this.parseStoryJSON(content, childName);
  },

  parseStoryJSON(text, childName) {
    // 清理文本：移除 Markdown 代码块标记
    text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    
    // 如果有多余的说明文字，尝试提取 JSON 部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    // 提取第一个 {...}
    let start = text.indexOf('{');
    if (start === -1) throw new Error('未找到JSON内容');

    let depth = 0, end = -1, inString = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"' && (i === 0 || text[i-1] !== '\\')) inString = !inString;
      if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
    }

    let jsonStr;
    if (end === -1) {
      // 截断修复：补齐括号
      jsonStr = text.slice(start);
      let openBraces = 0, openBrackets = 0, inStr = false;
      for (let i = 0; i < jsonStr.length; i++) {
        const ch = jsonStr[i];
        if (ch === '"' && (i === 0 || jsonStr[i-1] !== '\\')) inStr = !inStr;
        if (!inStr) {
          if (ch === '{') openBraces++;
          else if (ch === '}') openBraces--;
          else if (ch === '[') openBrackets++;
          else if (ch === ']') openBrackets--;
        }
      }
      jsonStr += ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces));
    } else {
      jsonStr = text.slice(start, end + 1);
    }

    // 修复常见 JSON 格式问题
    // 步骤1: 先将所有单引号临时替换为特殊标记，避免干扰
    const SINGLE_QUOTE_MARKER = '\x00SINGLE\x00';
    jsonStr = jsonStr.replace(/'/g, SINGLE_QUOTE_MARKER);
    
    // 步骤2: 修复未加引号的属性名（如 {title: "..."} → {"title": "..."}）
    // 匹配 {key: 或 ,key: 或 [key: 的情况
    jsonStr = jsonStr.replace(/([{,\[]\s*)([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)(\s*:)/g, '$1"$2"$3');
    
    // 步骤3: 将字符串内的单引号标记替换回实际单引号（但 JSON 需要双引号）
    // 找到所有双引号字符串，将其中的标记替换为转义单引号
    jsonStr = jsonStr.replace(/"([^"]*)"/g, function(match, content) {
      return '"' + content.replace(new RegExp(SINGLE_QUOTE_MARKER, 'g'), "'") + '"';
    });
    
    // 步骤4: 移除注释
    jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
    
    // 步骤5: 修复尾部逗号（数组和对象）
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
    
    // 步骤6: 修复多余的逗号
    jsonStr = jsonStr.replace(/,\s*,/g, ',');
    
    // 步骤7: 修复未转义的换行符（在字符串内）
    jsonStr = jsonStr.replace(/("[^"]*?)\n([^"]*?")/g, '$1\\n$2');
    
    // 步骤8: 再次清理尾部逗号
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

    let story;
    try {
      story = JSON.parse(jsonStr);
    } catch(e) {
      console.error('JSON解析失败，原始内容:', text.substring(0, 1000));
      console.error('提取的JSON:', jsonStr.substring(0, 1000));
      console.error('错误信息:', e.message);
      throw new Error('JSON解析失败: ' + e.message);
    }

    // 验证并补充默认值
    if (!story.title) story.title = `${childName}的奇妙冒险`;
    if (!Array.isArray(story.pages) || story.pages.length === 0) {
      throw new Error('故事缺少内容段落');
    }
    if (!story.tip) story.tip = `🌟 ${childName}真棒！`;
    if (!story.moral) story.moral = '善良和勇敢是最好的品质';
    if (!story.wish) story.wish = '健康快乐地成长';

    return story;
  },

  // 安全审查：检查生成的故事
  safetyCheck(story) {
    const forbiddenWords = ['死', '杀', '血', '鬼', '怪物', '恐怖', '害怕', '危险', '绑架', '失踪'];
    const text = JSON.stringify(story);
    const found = forbiddenWords.filter(w => text.includes(w));
    if (found.length > 0) {
      console.warn('安全审查发现敏感词:', found);
      return { safe: false, issues: found };
    }
    return { safe: true };
  }
};
