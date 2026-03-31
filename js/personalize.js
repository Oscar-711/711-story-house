// 个性化话术引擎
const Personalize = {
  // 分类中文名映射
  categoryNames: {
    bedtime: '睡前', fairy: '童话', fable: '寓言', idiom: '成语'
  },

  // 生成开头话术
  generateOpening(child, story) {
    if (!child) return '';
    const vars = this._buildVars(child, story);
    const template = `亲爱的${vars.name}小朋友，今天${vars.timeGreeting}，要给你讲的是一个关于${vars.topic}的${vars.category}故事，故事的名字叫《${vars.title}》。准备好了吗？让我们一起来听吧！`;
    return template;
  },

  // 生成结尾话术
  generateEnding(child, story) {
    if (!child) return '';
    const vars = this._buildVars(child, story);
    const template = `故事讲完啦！这个故事告诉我们${vars.moral}。希望${vars.name}小朋友也能像故事里那样${vars.wish}。好啦，闭上小眼睛，做个甜甜的美梦吧。${vars.name}，晚安！🌙`;
    return template;
  },

  _buildVars(child, story) {
    return {
      name: child.name || '小朋友',
      pronoun: child.gender === 'female' ? '她' : '他',
      timeGreeting: getTimeGreeting(),
      category: this.categoryNames[story.category] || '故事',
      topic: story.topic || '有趣',
      title: story.title || '',
      moral: story.moral || '要做一个好孩子',
      wish: story.wish || '健康快乐地成长'
    };
  }
};
