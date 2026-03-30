// 测试3岁版本
const StoryAI = {
  API_URL: 'https://api.stepfun.com/v1/chat/completions',
  API_KEY: '4oS7T7XAKtsj9jA21J0ThpPqbU6UXmVmFeLdEOLLNGpaiGrcHi9Mym5aRNtWnHiix',
  MODEL: 'step-3.5-flash',

  getCognitiveElements(age) {
    if (age <= 3) return '融入基础认知：数数(1-5)、基本颜色、简单形状。语言要求：句子简短(10字以内)，节奏重复性强，多用叠词和拟声词';
    return '融入社交认知：情感词汇、基础社交概念';
  },

  getLanguageStyle(age) {
    if (age <= 3) return '语言风格：句子极短(5-10字)，节奏重复，多用叠词("亮晶晶""软绵绵")，拟声词丰富("叮咚""哗啦")，可加入简单的重复句式如"铺一片，亮一下。再铺一片，又亮一下。"';
    return '语言风格：优美生动';
  },

  safetyGuidelines: `【安全护栏】禁止：恐怖、暴力、分离焦虑、危险行为`,

  async generateStory({ childName, childAge, childGender }) {
    const genderDesc = childGender === 'girl' ? '女孩' : '男孩';
    const pronoun = childGender === 'girl' ? '她' : '他';
    const scenes = ['彩虹山谷', '星星湖畔', '云朵城堡'];
    const scene = scenes[Math.floor(Math.random() * scenes.length)];

    const prompt = `你是一位专业的儿童睡前故事作家。

【故事要求】
请为一个叫"${childName}"的${childAge}岁${genderDesc}创作一个睡前故事。
- 主角：${childName}（${genderDesc}，用"${pronoun}"指代）
- 场景：${scene}
- 类型：勇气故事
- 字数：约200字，分成2个自然段落

${this.getCognitiveElements(childAge)}

${this.getLanguageStyle(childAge)}

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
  childAge: 3,
  childGender: 'girl'
}).then(result => {
  console.log('=== AI生成结果 (3岁版) ===');
  console.log(result);
}).catch(err => {
  console.error('错误:', err.message);
});
