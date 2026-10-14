"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import PostCard from "./PostCard";
import styles from "../social.module.css";

interface Post {
  id: number;
  author: number;
  author_name: string;
  workout_session: number | null;
  group: number | null;
  title: string | null;
  content: string | null;
  media_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_like_id: number | null;
  is_edited: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Dodana flaga isBackgroundRefresh, która omija pokazywanie Skeletonów!
  const fetchPosts = async (url: string = "/api/social/posts/", isLoadMore = false, isBackgroundRefresh = false) => {
    try {
      if (!isLoadMore && !isBackgroundRefresh) setIsLoading(true);
      else if (isLoadMore) setIsLoadingMore(true);

      const response = await api.get<PaginatedResponse>(url);
      
      if (isLoadMore) {
        setPosts((prev) => {
          // Zabezpieczenie przed ewentualnymi duplikatami kluczy w React
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = response.data.results.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(response.data.results);
      }
      setNextUrl(response.data.next);
    } catch (error) {
      console.error("Błąd pobierania feeda:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Nasłuchujemy Eventu, ale odpalamy z "isBackgroundRefresh = true"
    const handleRefresh = () => fetchPosts("/api/social/posts/", false, true);
    window.addEventListener("refreshFeed", handleRefresh);
    return () => window.removeEventListener("refreshFeed", handleRefresh);
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextUrl) {
        fetchPosts(nextUrl, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, nextUrl]);

  return (
    <div className={styles.feedContainer}>
      {isLoading ? (
        <div className="text-center text-gray-500 py-4">Ładowanie...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-4">Brak postów. Bądź pierwszy!</div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              authorId={post.author}
              authorName={post.author_name}
              createdAt={post.created_at}
              content={post.content || ""}
              hasWorkout={post.workout_session !== null}
              initialLikes={post.likes_count}
              initialComments={post.comments_count}
              initialLikeId={post.user_like_id}
              isEdited={post.is_edited}
            />
          ))}

          <div ref={lastElementRef} className="h-4 w-full shrink-0"></div>
          {isLoadingMore && <div className="text-center text-yellow-400 py-2">Ładowanie kolejnych...</div>}
        </>
      )}
    </div>
  );
}