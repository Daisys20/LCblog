const SITE_TITLE = import.meta.env.VITE_SITE_TITLE ?? '我的个人博客';
const SITE_DESCRIPTION = import.meta.env.VITE_SITE_DESCRIPTION ?? '记录技术、阅读与生活';

export default function AboutPage() {
  return (
    <article className="card article">
      <h1 className="article__title">关于本站</h1>
      <div className="article__meta">
        <span>{SITE_DESCRIPTION}</span>
      </div>
      <div className="markdown-body">
        <p>
          这是一个基于 <strong>ruoyi-vue-pro</strong> 搭建的个人博客：文章内容、分类与标签由后台管理，
          前台页面通过开放的 <code>/app-api</code> 接口读取数据。
        </p>
        <h2>技术栈</h2>
        <ul>
          <li>后端：ruoyi-vue-pro（Spring Boot + MyBatis Plus + MySQL + Redis）</li>
          <li>后台管理：yudao-ui-admin-vben（Vue3 + Vben Admin）</li>
          <li>博客前台：React 18 + Vite + TypeScript</li>
        </ul>
        <h2>如何写文章</h2>
        <ol>
          <li>启动后端服务（默认 http://127.0.0.1:48080）</li>
          <li>打开后台管理，使用管理员账号登录</li>
          <li>进入「博客管理 → 分类管理」维护分类</li>
          <li>进入「博客管理 → 文章管理」写文章，支持 Markdown，状态改为「已发布」后前台立即可见</li>
        </ol>
        <blockquote>
          保持记录，保持思考。 —— {SITE_TITLE}
        </blockquote>
      </div>
    </article>
  );
}
