// 测试脚本
const StoryAI = {
  API_URL: 'https://api.stepfun.com/v1/chat/completions',
  API_KEY: '4oS7T7XAKtsj9jA21J0ThpPqbU6UXmVmFeLdEOLLNGpaiGrcHi9Mym5aRNtWnHiix',
  MODEL: 'step-3.5-flash',

  lengthConfig: {
    short:  { wordCount: 300,  pageCount: 2, desc: '短篇' }
  },

  safetyGuidelines: `【安全护栏 - 严格禁止以下内容】
1. 恐怖元素：死亡、血腥、暴力、绑架、噩梦、鬼魂、怪物
2. 焦虑情节：父母永久离开、被抛弃、长期孤立
3. 不当示范：撒谎成功、破坏规则、暴力手段
4. 危险行为：独自去危险地方、和陌生人走
5. 复杂情绪：背叛、复仇、嫉妒导致的恶意
【替代方案】黑暗场景→神秘探索，分离→温暖重聚，冲突→沟通解决`,

  getCognitiveElements(age) {
    return '融入社交认知：情感词汇、基础社交概念(分享/轮流)';
  },

  async generateStory({ childName, childAge, childGender, storyType }) {
    const cfg = { wordCount: 300, pageCount: 2 };
    const genderDesc = childGender === 'girl' ? '女孩' : '男孩';
    const pronoun = childGender === 'girl' ? '她' : '他';
    const scenes = ['魔法森林', '彩虹山谷', '星星湖畔', '云朵城堡'];
    const scene = scenes[Math.floor(Math.random() * scenes.length)];

    const prompt = `你是一位专业的儿童睡前故事作家。

【故事要求】
请为一个叫"${childName}"的${childAge}岁${genderDesc}创作一个睡前故事。
- 主角：${childName}（${genderDesc}，用"${pronoun}"指代）
- 场景：${scene}
- 类型：勇气故事
- 字数：约300字，分成2个自然段落
- 风格：温馨、优美、充满想象力，适当使用拟声词

【情节结构】
1. 起：${childName}在${scene}的日常生活
2. 承：遇到一个小挑战或需要帮助的朋友
3. 转：通过善良/勇敢/智慧解决问题
4. 合：温暖圆满的结局，适合入睡

${this.getCognitiveElements(childAge)}

${this.safetyGuidelines}

【输出格式】
{
  "title": "故事标题",
  "pages": [{"text": "段落", "scene": "画面描述"}],
  "tip": "🌟 成长小贴士",
  "moral": "核心道理",
  "wish": "温馨祝愿"
}`;

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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
};

StoryAI.generateStory({
  childName: '小柒',
  childAge: 5,
  childGender: 'girl',
  storyType: 'courage'
}).then(result => {
  console.log('=== AI生成结果 ===');
  console.log(result);
}).catch(err => {
  console.error('错误:', err.message);
});
