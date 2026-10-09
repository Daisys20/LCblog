/** 与后端 blog 模块 VO 对齐的类型定义 */

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogTag {
  name: string;
  count: number;
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  coverUrl?: string;
  categoryId?: number;
  categoryName?: string;
  tags: string[];
  viewCount: number;
  readingTime: number;
  /** 毫秒时间戳 */
  publishedAt?: number;
}

export interface BlogPostDetail extends BlogPostSummary {
  contentMd: string;
}

export interface BlogArchiveGroup {
  year: string;
  month: string;
  count: number;
  posts: BlogPostSummary[];
}

export interface PageResult<T> {
  total: number;
  list: T[];
}
