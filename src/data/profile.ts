/**
 * 首页（个人主页）的全部文案与数据集中在这里，改这一个文件就能换成你自己的信息。
 */

export interface SkillItem {
  /** 对应的图标 key，见 components/TechIcon.tsx */
  key: string;
  /** 方格下方常显的技术名 */
  name: string;
}

export interface MusicTrack {
  /** 歌曲名 */
  title: string;
  /** 歌手，多个用 / 分隔 */
  artist: string;
  /**
   * 网易云歌曲 ID。填写后会走官方外链直连播放。
   * 获取方式：网易云网页版打开歌曲，地址栏 `#/song?id=` 后面的数字。
   */
  neteaseId?: number;
  /**
   * 本地音频文件路径，优先级高于 neteaseId。
   * 把 mp3 放进 `public/music/`，这里填 `/music/xxx.mp3`。
   */
  src?: string;
  /** 封面图 URL，留空则用默认唱片图案 */
  cover?: string;
}

export interface BarItem {
  label: string;
  /** 0-100 */
  value: number;
}

export interface WorldNode {
  key: string;
  title: string;
  desc: string;
}

/** 生活页缩略图的画法：没有实拍图时用 SVG 画一张，见 components/Artwork.tsx */
export type GalleryKind = 'scene' | 'game' | 'music' | 'movie' | 'gadget';

/**
 * 一张展示卡——生活页里所有标签页共用这一种模板：
 * 竖构图的缩略图 + 标题 + 说明 + 右下角的小注脚。
 */
export interface GalleryItem {
  title: string;
  desc: string;
  /** 小注脚，例如「2023 · 210 小时」 */
  meta?: string;
  /** 有实拍图就填图片路径 */
  image?: string;
  /** 没有实拍图就用 art 画一张（两者只填一个） */
  art?: GalleryKind;
}

/**
 * 生活页的一个标签页：标签不同、封面不同、条目不同，模板完全一样。
 * 顺序即标签栏顺序，第一个是「生活展示」。
 */
export interface GalleryTab {
  key: GalleryKind;
  label: string;
  en: string;
  /** 一句话说明，同时用在首页「我的收藏」卡片上 */
  desc: string;
  /** 标签页顶部的大图 */
  cover: string;
  /** 页面上的长引子 */
  intro?: string;
  items: GalleryItem[];
}

/** 项目缩略图的画法，见 components/Artwork.tsx */
export type ProjectArt = 'iot' | 'ai' | 'twin' | 'web' | 'tool' | 'data';

export interface ProjectItem {
  title: string;
  desc: string;
  /** 项目页上的补充说明 */
  detail: string;
  /** 分类 key，项目页靠它筛选 */
  kind: 'platform' | 'app' | 'visual';
  year: string;
  role: string;
  stack: string[];
  art: ProjectArt;
}

export interface JourneyGroup {
  year: number;
  items: { date: string; text: string }[];
}

/** 一条具体计划：权重即完成它能为所属大类加多少进度 */
export interface PlanTask {
  title: string;
  /** 完成该项增加的进度点（同一大类下所有 weight 之和 = 100） */
  weight: number;
  /** 初始是否已完成 */
  done?: boolean;
}

/** 一大类计划（如「学习」），下面挂若干具体计划 */
export interface PlanCategory {
  key: string;
  /** 图标 key，见 components/PanelCards.tsx */
  icon: string;
  label: string;
  desc: string;
  tasks: PlanTask[];
}

export const profile = {
  /** 顶部横幅 */
  hero: {
    title: ['正在认真生活', '也在观察这个世界'],
    name: 'ALKAID',
    role: 'Frontend / Builder / Observer',
    desc: '一个前端工程师的技术笔记与生活记录',
    location: '成都',
    weather: '晴',
    image: '/images/hero-journey.jpg',
  },

  /** 当前状态：城市 / 日期 / 天气 + 两行文字，直接叠在第一行横幅图上 */
  status: {
    todayNote: '今天也在积累。',
    note: '总有一天会感谢现在的坚持。',
  },

  /** 我的个人属性 */
  attributes: {
    label: '我的个人属性',
    os: 'ALKAID OS v2.6',
    online: true,
    /** 改成你自己的城市与职业 */
    facts: [
      { key: 'Current XP', value: '78%' },
    ],
    footnote: '数值随状态浮动，每月复盘更新',
    bars: [
      { label: '技术', value: 88 },
      { label: '身体', value: 67 },
      { label: '财富', value: 71 },
      { label: '情感', value: 58 },
      { label: '好奇', value: 92 },
      { label: '自由', value: 65 },
      { label: '精力', value: 43 },
    ] as BarItem[],
  },

  /** 我的能力 */
  skills: {
    label: '我的能力',
    items: [
      { key: 'vue', name: 'Vue 3' },
      { key: 'react', name: 'React' },
      { key: 'threejs', name: 'Three.js' },
      { key: 'typescript', name: 'TS' },
      { key: 'javascript', name: 'JS' },
      { key: 'nodejs', name: 'Node.js' },
      { key: 'spring', name: 'Spring Boot' },
      { key: 'mysql', name: 'MySQL' },
      { key: 'docker', name: 'Docker' },
      { key: 'git', name: 'Git' },
      { key: 'linux', name: 'Linux' },
      { key: 'figma', name: 'Figma' },
    ] as SkillItem[],
  },

  /** 我的世界观：中心 + 一圈节点。数组顺序即方位，从正上方起顺时针每 60° 一个 */
  worldview: {
    label: '我的世界观',
    center: 'ME',
    nodes: [
      { key: 'ai', title: 'AI', desc: '让智能更有温度' }, // 上
      { key: 'tech', title: '技术', desc: '解决问题与创造价值' }, // 右上
      { key: 'relation', title: '关系', desc: '理解人与人的连接' }, // 右下
      { key: 'life', title: '生活', desc: '体验当下的好事' }, // 下
      { key: 'travel', title: '旅行', desc: '去更多的地方' }, // 左下
      { key: 'money', title: '投资', desc: '理解风险与自由' }, // 左上
    ] as WorldNode[],
  },

  /**
   * 2026 年计划：大类（学习 / 健身 / 投资 / 旅行 / 睡眠）+ 具体计划。
   * 每个大类下面挂若干条具体计划，勾选完成一条，进度条就按它的 weight 前进。
   * 大类的进度 = 已完成的 weight 之和（所以才说「完成这一计划进度条就动」）。
   */
  plan: {
    label: '2026 年计划',

    categories: [
      {
        key: 'study',
        icon: 'code',
        label: '学习',
        desc: 'AI 应用前端 · 技术笔记',
        tasks: [
          { title: '读完 12 本一直想读的书', weight: 20, done: true },
          { title: '系统学习 AI 应用开发', weight: 25, done: true },
          { title: '每天写 30 分钟技术笔记', weight: 15, done: true },
          { title: '完成两个 side project', weight: 25 },
          { title: '输出 12 篇技术文章', weight: 15 },
        ],
      },
      {
        key: 'fitness',
        icon: 'health',
        label: '健身',
        desc: '每周 4 练 · 保持体能',
        tasks: [
          { title: '每周健身 4 次', weight: 20, done: true },
          { title: '跑一次半程马拉松', weight: 15, done: true },
          { title: '把体脂降到 15%', weight: 20, done: true },
          { title: '学会游泳', weight: 25 },
          { title: '规律作息，不熬夜', weight: 20 },
        ],
      },
      {
        key: 'invest',
        icon: 'invest',
        label: '投资',
        desc: '定投 · 定期复盘',
        tasks: [
          { title: '建立 6 个月应急基金', weight: 20, done: true },
          { title: '每月坚持定投', weight: 20, done: true },
          { title: '读完 5 本投资经典', weight: 20 },
          { title: '写一份年度投资复盘', weight: 20 },
          { title: '了解期权与对冲基础', weight: 20 },
        ],
      },
      {
        key: 'travel',
        icon: 'travel',
        label: '旅行',
        desc: '去更多地方看看',
        tasks: [
          { title: '去一次高原', weight: 20, done: true },
          { title: '看一次海', weight: 10, done: true },
          { title: '出国旅行一次', weight: 30 },
          { title: '自驾 1000 公里', weight: 25 },
          { title: '拍一组满意的照片', weight: 15 },
        ],
      },
      {
        key: 'sleep',
        icon: 'sleep',
        label: '睡眠',
        desc: '23:30 前入睡',
        tasks: [
          { title: '每天 23:30 前入睡', weight: 25, done: true },
          { title: '戒掉睡前刷手机', weight: 20, done: true },
          { title: '每周运动三次助眠', weight: 20 },
          { title: '养成 20 分钟午休', weight: 15 },
          { title: '卧室不放电子设备', weight: 20 },
        ],
      },
    ] as PlanCategory[],
  },

  /** 最近在想什么：内容来自后端文章列表 */
  thoughts: {
    label: '最近在想什么',
    badge: '来自博客',
    moreText: '更多 →',
  },

  /**
   * 生活页（/life）：五个标签页共用同一套模板，只是标签、封面、条目不一样。
   * 首页从这里取数据——「生活展示」卡取第一个标签页的前三条，
   * 「我的收藏」卡的四个入口取其余四个标签页（所以去掉相机只用删这里的条目）。
   */
  gallery: {
    label: '生活',
    title: '生活展示',
    en: 'Life · Things I Love',
    desc: '把喜欢的东西放在一起：走过的风景、玩过的游戏、循环的歌、看完的电影，还有用顺手的小物件。',
    /** 首页「我的收藏」卡片的标题与副标题 */
    collectLabel: '我的收藏',
    collectSubtitle: 'Things I Love',
    tabs: [
      {
        key: 'scene',
        label: '生活展示',
        en: 'Life',
        desc: '那些让人安静的瞬间',
        cover: '/images/scene-2.jpg',
        intro: '随手拍下的风景和一些生活的小片段，没什么技术含量，只是不想忘记。',
        items: [
          {
            title: '看山，看海',
            desc: '那些让人安静的瞬间',
            meta: '2025 · 大理',
            image: '/images/scene-1.jpg',
          },
          {
            title: '山谷里的秋天',
            desc: '一年里最短的那段金色',
            meta: '2024 · 川西',
            image: '/images/scene-2.jpg',
          },
          {
            title: '公路与远方',
            desc: '去哪都行，先出发',
            meta: '2024 · 青甘环线',
            image: '/images/scene-3.jpg',
          },
          { title: '黄昏的坡地', desc: '落日刚好落在树后面', meta: '2026 · 深圳', art: 'scene' },
          { title: '出海那天', desc: '船开出去很远，岸变小了', meta: '2025 · 惠州', art: 'scene' },
          { title: '山里的月亮', desc: '夜里安静得能听见风', meta: '2024 · 四姑娘山', art: 'scene' },
        ] as GalleryItem[],
      },
      {
        key: 'game',
        label: '游戏',
        en: 'Games',
        desc: '让人保持好奇的地方',
        cover: '/images/thing-game.jpg',
        intro: '玩得慢，喜欢把地图走完、把支线做完再推主线。',
        items: [
          { title: '塞尔达传说 · 王国之泪', desc: '在天上地下乱逛，舍不得推主线', meta: '2023 · 210 小时', art: 'game' },
          { title: '艾尔登法环', desc: '第一次体会到「被游戏教育」的乐趣', meta: '2022 · 160 小时', art: 'game' },
          { title: '星露谷物语', desc: '种地钓鱼造房子，最治愈的慢生活', meta: '2021 · 300 小时', art: 'game' },
          { title: '双人成行', desc: '和朋友一起通关，笑到停不下来', meta: '2021 · 15 小时', art: 'game' },
          { title: '空洞骑士', desc: '手绘的地底世界，音乐比画面还难忘', meta: '2018 · 60 小时', art: 'game' },
          { title: '文明 6', desc: '「再来一回合」是个骗局', meta: '2019 · 420 小时', art: 'game' },
        ] as GalleryItem[],
      },
      {
        key: 'music',
        label: '音乐',
        en: 'Music',
        desc: '一首歌，就让你想念一个时代',
        cover: '/images/thing-music.jpg',
        intro: '写代码和走路时都在听，歌单比歌单名更重要。',
        items: [
          { title: '写代码的时候听', desc: '后摇 / 纯音乐，没有歌词的那种', meta: '歌单 · 42 首', art: 'music' },
          { title: '深夜散步', desc: '城市夜晚，慢一点', meta: '歌单 · 28 首', art: 'music' },
          { title: '罗生门（Follow）', desc: '梨冻紧 / Wiz_H张子豪', meta: '单曲循环最多', art: 'music' },
          { title: '冬眠', desc: '司南', meta: '冬天写代码的标配', art: 'music' },
          { title: '范特西', desc: '周杰伦', meta: '2001 · 很难过时的一张', art: 'music' },
          { title: 'Ants From Up There', desc: 'Black Country, New Road', meta: '2022 · 今年听得最多', art: 'music' },
        ] as GalleryItem[],
      },
      {
        key: 'movie',
        label: '电影',
        en: 'Movies',
        desc: '放空，去看更大的世界',
        cover: '/images/thing-movie.jpg',
        intro: '偏爱对话多的片子，看完会想很久的那种。',
        items: [
          { title: '海边的曼彻斯特', desc: '关于「回不去」的那件事', meta: '2016', art: 'movie' },
          { title: '爱在黎明破晓前', desc: '最会聊天的一部电影', meta: '1995', art: 'movie' },
          { title: '星际穿越', desc: '第一次在电影院被震住', meta: '2014', art: 'movie' },
          { title: '瞬息全宇宙', desc: '看完想抱一下家里人', meta: '2022', art: 'movie' },
          { title: '请以你的名字呼唤我', desc: '夏天、单车和桃子', meta: '2017', art: 'movie' },
          { title: '疯狂动物城', desc: '每年都想再看一遍', meta: '2016', art: 'movie' },
        ] as GalleryItem[],
      },
      {
        key: 'gadget',
        label: '物件',
        en: 'Gadgets',
        desc: '数码 / 小东西',
        cover: '/images/thing-gadget.jpg',
        intro: '不算发烧，只是喜欢那些每天都会用到、又刚好趁手的东西。',
        items: [
          { title: 'HHKB Professional Hybrid', desc: '键盘 · 用过就回不去了', meta: '2019 至今', art: 'gadget' },
          { title: 'Sony WH-1000XM4', desc: '降噪耳机 · 通勤和写代码的安静', meta: '2020', art: 'gadget' },
          { title: 'Kindle Oasis', desc: '电子书 · 出差路上的图书馆', meta: '2018', art: 'gadget' },
          { title: 'MacBook Pro 14"', desc: '主力生产力，也是主力娱乐', meta: '2022', art: 'gadget' },
          { title: 'LAMY 2000', desc: '钢笔 · 写得慢，所以想得更清楚', meta: '2021', art: 'gadget' },
          { title: '小米手环', desc: '记录睡眠和步数，偶尔提醒我站起来', meta: '2023', art: 'gadget' },
        ] as GalleryItem[],
      },
    ] as GalleryTab[],
  },

  /** 我的项目：首页只展示前三条，项目页（/projects）用全部 + 分类筛选 */
  projects: {
    label: '我的项目',
    title: '项目',
    en: 'Projects',
    desc: '做过的一些东西，从设备侧的平台前端，到三维可视化和我自己用的小工具。',
    /** 项目页的筛选标签，全部 + 三类 */
    filters: [
      { key: 'all', label: '全部' },
      { key: 'platform', label: '平台' },
      { key: 'app', label: '应用' },
      { key: 'visual', label: '可视化' },
    ],
    items: [
      {
        title: '工业物联网平台',
        desc: '设备接入、实时监控、数据可视化',
        detail: '接入 2000+ 台设备，负责前端架构与实时数据链路，把 MQTT 上报的数据压到 1s 内上屏。',
        kind: 'platform',
        year: '2024',
        role: '前端负责人',
        stack: ['Vue3', 'ECharts', 'WebSocket', 'MQTT'],
        art: 'iot',
      },
      {
        title: 'AI 应用平台',
        desc: '对话编排、知识库、模型接入',
        detail: '面向内部的 AI 应用搭建平台，支持多模型接入、流式输出与知识库检索。',
        kind: 'app',
        year: '2025 · 进行中',
        role: '全栈',
        stack: ['Next.js', 'TypeScript', 'LLM', 'SSE'],
        art: 'ai',
      },
      {
        title: '数字孪生可视化',
        desc: '三维场景与实时数据映射',
        detail: '把园区设备搬进浏览器，用 WebGL 做三维场景，和实时数据一一对应。',
        kind: 'visual',
        year: '2024',
        role: '可视化开发',
        stack: ['Three.js', 'WebGL', 'GLSL'],
        art: 'twin',
      },
      {
        title: '个人博客前台',
        desc: '也就是你现在看到的这个站',
        detail: 'React + Vite 重写的一版前台，包含 Bento 首页、音乐播放器和这套卡片动效。',
        kind: 'app',
        year: '2026',
        role: '独立开发',
        stack: ['React', 'Vite', 'TypeScript'],
        art: 'web',
      },
      {
        title: '前端脚手架 CLI',
        desc: '一条命令起一个新项目',
        detail: '自己用的脚手架，内置团队规范、目录约定和 CI 模板，省掉每次新建项目的重复劳动。',
        kind: 'platform',
        year: '2023',
        role: '独立开发',
        stack: ['Node.js', 'Commander', 'Rollup'],
        art: 'tool',
      },
      {
        title: '运营数据大屏',
        desc: '一屏看完当天所有关键指标',
        detail: '对接后台接口做的大屏，自适应 4K 与拼接屏，重点解决数字滚动和大数据量图表的性能问题。',
        kind: 'visual',
        year: '2023',
        role: '前端开发',
        stack: ['Vue3', 'ECharts', 'DataV'],
        art: 'data',
      },
    ] as ProjectItem[],
  },

  /**
   * 人生日志：首页取近几条，日志页（/journey）展示全部。
   * 数据按时间顺着写就行——年份、月份统一在组件里倒序，新条目随便插。
   */
  journey: {
    label: '人生日志',
    title: '人生日志',
    en: 'Journal',
    desc: '从把想法写下来的那天开始，记一些自己觉得值得记的事。',
    groups: [
      {
        year: 2026,
        items: [
          { date: '01-08', text: '开始整理自己的技术笔记' },
          { date: '02-19', text: '把博客从零重写了一遍' },
          { date: '03-27', text: '第一次尝试把 AI 接进工作流' },
          { date: '05-14', text: '去了一趟海边，什么都没想' },
          { date: '07-02', text: '读完了一本一直没读完的书' },
        ],
      },
      {
        year: 2025,
        items: [
          { date: '04-11', text: '换了一份更想做的事' },
          { date: '09-23', text: '开始规律地运动和早睡' },
        ],
      },
      {
        year: 2024,
        items: [{ date: '06-16', text: '把想法写下来的第一天' }],
      },
    ] as JourneyGroup[],
  },

  /** 名言卡 */
  quote: {
    text: '人不能同时拥有所有美好的东西，但可以认真选择此刻最想要的。',
    author: 'ALKAID',
    image: '/images/quote-mountain.jpg',
  },

  /** Keep going 卡：新底图 + 浮在图上的一段文字
   *  title 已烤在新底图里（手写体），所以这里只放正文；
   *  每个子数组是一段，数组里每一项是一行（按设计稿断行，不靠自动折行）。 */
  keepGoing: {
    title: 'Keep going.',
    paragraphs: [
      ['The world is changing quickly,', "I'm still trying to understand it."],
      [
        'And while doing so,',
        "I'd like to see a few more places,",
        'build a few more things,',
        'meet a few more people,',
        'and remember a few more moments.',
      ],
    ],
    image: '/images/keep-going-photo.jpg',
  },

  music: {
    label: '音乐',
    title: '我的歌单',
    desc: '边听边写 Bug 🎧',
    /**
     * 想换成自己的歌：改 neteaseId 即可（网页版网易云打开歌曲，复制地址里 id= 后面的数字）。
     * 想放本地音乐：把 mp3 丢进 public/music/，然后写 src: '/music/xxx.mp3'。
     * 注意：网易云对部分歌曲收回了外链权限，无版权时会提示换一首。
     */
    tracks: [
      {
        title: '罗生门（Follow）',
        artist: '梨冻紧 / Wiz_H张子豪',
        neteaseId: 1456890009,
        cover: 'https://p1.music.126.net/yN1ke1xYMJ718FiHaDWtYQ==/109951165076380471.jpg',
      },
      {
        title: '一点',
        artist: 'Muyoi / Pezzi',
        neteaseId: 2641867659,
        cover: 'https://p1.music.126.net/PiSqUS2bxc9x2Zbz2vt4sQ==/109951170099752710.jpg',
      },
      {
        title: '童话',
        artist: '刘大拿 / 刘兆宇 / AFMC黑子',
        neteaseId: 2051580537,
        cover: 'https://p1.music.126.net/QsEcRA6Mmf4vr5DgP7oOlA==/109951168647497239.jpg',
      },
      {
        title: '爱一个人',
        artist: 'Hugo / 火晚晴',
        neteaseId: 2020308859,
        cover: 'https://p2.music.126.net/seoLixgTSot7uJNaTuOrmQ==/109951168290203441.jpg',
      },
      {
        title: '冬眠',
        artist: '司南',
        neteaseId: 1398663411,
        cover: 'https://p1.music.126.net/4KDBaQXnQywQovmqvjx-8Q==/109951164444131697.jpg',
      },
      {
        title: '入秋',
        artist: 'RAMBO GANG / Trakin99 / T-BONE / 江楠',
        neteaseId: 1477144603,
        cover: 'https://p1.music.126.net/UyUrqSp-GzCsqWgNm4F44Q==/109951165005286070.jpg',
      },
    ] as MusicTrack[],
  },
};

export type Profile = typeof profile;

/* ------------------------------------------------------------------
   派生数据：首页与子页面共用同一份数据，避免两处各维护一份
   ------------------------------------------------------------------ */

/** 生活页的第一个标签页（生活展示）：首页那张「生活展示」卡取它的前三条 */
export const lifeTab: GalleryTab = profile.gallery.tabs[0];

/** 首页「我的收藏」的四个入口 = 生活页里除「生活展示」外的四个标签页 */
export const collectTabs: GalleryTab[] = profile.gallery.tabs.slice(1);

/**
 * 人生日志的年份、月份统一倒序（新的在上面）。
 * date 是 'MM-DD' 定长格式，直接字符串比较就等于时间比较。
 */
export function sortJourneyGroups(groups: JourneyGroup[]): JourneyGroup[] {
  return [...groups]
    .sort((a, b) => b.year - a.year)
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => b.date.localeCompare(a.date)),
    }));
}

/** 把今天的日期格式化成 2026.10.08 */
export function formatToday(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/** '01-08' → '01'（日志页的大号月份） */
export function monthOf(date: string) {
  return date.slice(0, 2);
}

/** '01-08' → '08' */
export function dayOf(date: string) {
  return date.slice(3, 5);
}
