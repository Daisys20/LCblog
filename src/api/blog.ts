import type {
  BlogArchiveGroup,
  BlogCategory,
  BlogPostDetail,
  BlogPostSummary,
  BlogTag,
  PageResult,
} from '../types/blog';
import { httpClient } from './client';

export interface PostQuery {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  categoryId?: number;
  tag?: string;
  month?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/** 已发布文章分页 */
export function getPostPage(params: PostQuery, signal?: AbortSignal) {
  return httpClient.get<PageResult<BlogPostSummary>>('/blog/post/page', params, signal);
}

/** 文章详情（按别名） */
export function getPostBySlug(slug: string, signal?: AbortSignal) {
  return httpClient.get<BlogPostDetail>('/blog/post/get-by-slug', { slug }, signal);
}

/** 文章详情（按编号） */
export function getPostById(id: number, signal?: AbortSignal) {
  return httpClient.get<BlogPostDetail>('/blog/post/get', { id }, signal);
}

/** 分类列表 */
export function getCategoryList(signal?: AbortSignal) {
  return httpClient.get<BlogCategory[]>('/blog/category/list', undefined, signal);
}

/** 标签列表 */
export function getTagList(signal?: AbortSignal) {
  return httpClient.get<BlogTag[]>('/blog/post/tag-list', undefined, signal);
}

/** 归档列表 */
export function getArchiveList(signal?: AbortSignal) {
  return httpClient.get<BlogArchiveGroup[]>('/blog/post/archive-list', undefined, signal);
}
