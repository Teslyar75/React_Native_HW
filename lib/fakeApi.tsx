import axios, { isAxiosError } from "axios";

export const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type NewPost = Pick<Post, "title" | "body" | "userId">;

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response) {
      return `HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}

export async function fetchPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/posts");
  return data;
}

export async function fetchPost(id: number): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`);
  return data;
}

export async function createPost(payload: NewPost): Promise<Post> {
  const { data } = await api.post<Post>("/posts", payload);
  return data;
}

export async function updatePost(id: number, payload: NewPost): Promise<Post> {
  const { data } = await api.put<Post>(`/posts/${id}`, { ...payload, id });
  return data;
}

/** POST — оновлення посту (за завданням; API повертає оновлений об'єкт) */
export async function updatePostViaPost(
  id: number,
  payload: NewPost,
): Promise<Post> {
  const { data } = await api.post<Post>("/posts", { ...payload, id });
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`);
}

export default api;
