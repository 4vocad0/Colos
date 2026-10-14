"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import styles from "../social.module.css";

interface PostCardProps {
  postId: number;
  authorId: number;
  authorName: string;
  createdAt: string; 
  content: string;
  hasWorkout?: boolean;
  initialLikes: number;
  initialComments: number;
  initialLikeId: number | null;
  isEdited: boolean;
}

interface Comment {
  id: number;
  author: number;
  author_name: string;
  content: string;
  created_at: string;
  is_edited: boolean;
}

const formatCount = (num: number) => {
  if (num === 0) return "";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function PostCard({
  postId,
  authorId,
  authorName,
  createdAt,
  content,
  hasWorkout,
  initialLikes,
  initialComments,
  initialLikeId,
  isEdited,
}: PostCardProps) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [localContent, setLocalContent] = useState(content);
  const [localIsEdited, setLocalIsEdited] = useState(isEdited);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(content);
  
  const [liked, setLiked] = useState(initialLikeId !== null);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likeId, setLikeId] = useState<number | null>(initialLikeId);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  
  const [likePop, setLikePop] = useState(false);
  const [commentPop, setCommentPop] = useState(false);
  const [menuPop, setMenuPop] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  
  const [nextCommentUrl, setNextCommentUrl] = useState<string | null>(null);
  const [isFetchingMoreComments, setIsFetchingMoreComments] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []);

  const animateSquish = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.classList.remove(styles.animSquish);
    void el.offsetWidth; 
    el.classList.add(styles.animSquish);
    setTimeout(() => el.classList.remove(styles.animSquish), 300);
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    setLikePop(true);
    setTimeout(() => setLikePop(false), 350);

    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      try {
        const res = await api.post("/api/social/likes/", { post: postId });
        setLikeId(res.data.id);
      } catch {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } else {
      if (!likeId) return;
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      try {
        await api.delete(`/api/social/likes/${likeId}/`);
        setLikeId(null);
      } catch {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }
  };

  const loadComments = async (url: string, isLoadMore = false) => {
    try {
      isLoadMore ? setIsFetchingMoreComments(true) : setIsFetchingComments(true);
      const res = await api.get(url);
      setNextCommentUrl(res.data.next);
      isLoadMore 
        ? setComments(prev => [...prev, ...res.data.results]) 
        : setComments(res.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingComments(false);
      setIsFetchingMoreComments(false);
    }
  };

  const toggleComments = () => {
    setCommentPop(true);
    setTimeout(() => setCommentPop(false), 300);

    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow && comments.length === 0) {
      loadComments(`/api/social/comments/?post=${postId}`);
    }
  };

  const handleMenuClick = () => {
    setMenuPop(true);
    setTimeout(() => setMenuPop(false), 300);
    setIsMenuOpen(!isMenuOpen);
  };

  const commentObserver = useRef<IntersectionObserver | null>(null);
  const lastCommentRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingMoreComments) return;
    if (commentObserver.current) commentObserver.current.disconnect();
    commentObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCommentUrl) {
        loadComments(nextCommentUrl, true);
      }
    });
    if (node) commentObserver.current.observe(node);
  }, [isFetchingMoreComments, nextCommentUrl]);

  const savePostEdit = async () => {
    if (editPostContent.trim() === localContent.trim()) {
      setIsEditingPost(false); 
      return;
    }
    try {
      await api.patch(`/api/social/posts/${postId}/`, { content: editPostContent });
      setLocalContent(editPostContent);
      setLocalIsEdited(true); 
      setIsEditingPost(false);
    } catch {
      alert("Nie udało się zaktualizować posta.");
    }
  };

  const deletePost = async () => {
    if (!confirm("Na pewno usunąć?")) return;
    try {
      await api.delete(`/api/social/posts/${postId}/`);
      window.dispatchEvent(new Event("refreshFeed"));
    } catch {}
  };

  const submitNewComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post("/api/social/comments/", { post: postId, content: newComment });
      setComments([res.data, ...comments]);
      setNewComment("");
      setCommentsCount((prev) => prev + 1);
    } catch {}
  };

  const saveCommentEdit = async (cId: number) => {
    const commentToEdit = comments.find(c => c.id === cId);
    if (commentToEdit && editCommentContent.trim() === commentToEdit.content.trim()) {
      setEditingCommentId(null); 
      return;
    }
    try {
      await api.patch(`/api/social/comments/${cId}/`, { content: editCommentContent });
      setComments((prev) => prev.map(c => 
        c.id === cId ? { ...c, content: editCommentContent, is_edited: true } : c
      ));
      setEditingCommentId(null);
    } catch {}
  };

  const deleteComment = async (cId: number) => {
    if (!confirm("Usunąć komentarz?")) return;
    try {
      await api.delete(`/api/social/comments/${cId}/`);
      setComments((prev) => prev.filter(c => c.id !== cId));
      setCommentsCount((prev) => prev - 1);
    } catch {}
  };

  const isMyPost = currentUserId !== null && Number(currentUserId) === Number(authorId);
  const avatarLetter = authorName ? authorName.charAt(0).toUpperCase() : "U";

  return (
    <article className={`${styles.card} ${styles.animNewPost}`}>
      <div className={styles.postHeader}>
        <div className={styles.avatar}>{avatarLetter}</div>
        <div className={`${styles.authorInfo} flex-1`}>
          <span className={styles.authorName}>{authorName}</span>
          <span className={styles.timeText}>
            {formatDateTime(createdAt)} {localIsEdited && "(Edytowano)"}
          </span>
        </div>
        
        {isMyPost && (
          <div className="relative">
            <button 
              onClick={handleMenuClick} 
              className={`${styles.menuBtn} ${menuPop ? styles.animSquish : ""}`}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className={styles.optionsMenu}>
                <button 
                  onClick={() => { setIsEditingPost(true); setIsMenuOpen(false); }} 
                  className={styles.menuItem}>Edytuj</button>
                <button 
                  onClick={deletePost} 
                  className={`${styles.menuItem} ${styles.menuItemDelete}`}>Usuń</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditingPost ? (
        <div className={styles.editContainer}>
          <textarea 
            className={styles.textarea} 
            value={editPostContent} 
            onChange={(e) => setEditPostContent(e.target.value)} 
            rows={3} 
          />
          <div className="flex gap-3 mb-2 mt-1">
            <button onClick={savePostEdit} onMouseDown={animateSquish} className={styles.editSaveBtn}>Zapisz</button>
            <button onClick={() => setIsEditingPost(false)} onMouseDown={animateSquish} className={styles.editCancelBtn}>Anuluj</button>
          </div>
        </div>
      ) : (
        <p className={styles.postContent}>{localContent}</p>
      )}

      {hasWorkout && (
        <div className={styles.workoutBadge}>
          <span className="text-2xl">🏋️</span>
          <div>Zrealizowano zaplanowany trening</div>
        </div>
      )}

      <div className={styles.actionRow}>
        <button 
          onClick={handleLike} 
          className={`${styles.actionBtn} ${liked ? styles.btnActive : ""}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={liked ? 0 : 1.8}
            className={`w-6 h-6 transition-colors ${likePop ? styles.animHeartPop : ""} ${liked ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-400 hover:text-yellow-400"}`}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d={liked 
                ? "m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" 
                : "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              } 
            />
          </svg>
          <span className="ml-1 text-base">{formatCount(likesCount)}</span>
        </button>
        
        <button 
          onClick={toggleComments} 
          className={`${styles.actionBtn} ${commentPop ? styles.animSquish : ""} ${showComments ? "text-white" : ""}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={showComments ? 0 : 1.8}
            className={`w-6 h-6 transition-colors ${showComments ? "fill-white text-white" : "fill-none text-gray-400 hover:text-white"}`}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fillRule={showComments ? "evenodd" : undefined}
              clipRule={showComments ? "evenodd" : undefined}
              d={showComments 
                ? "M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z" 
                : "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              } 
            />
          </svg>
          <span className="ml-1 text-base">{formatCount(commentsCount)}</span>
        </button>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          <div className={styles.commentsScrollArea} style={{ flexDirection: 'column-reverse' }}>
            {isFetchingComments && comments.length === 0 ? (
              <p className={styles.loadingText}>Ładowanie...</p>
            ) : (
              comments.map((comment) => {
                const isMyComment = currentUserId !== null && Number(currentUserId) === Number(comment.author);
                
                return (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>
                      {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className={styles.commentBubble}>
                      <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>{comment.author_name}</span>
                        
                        <div className="flex gap-2 items-center">
                          <span className={styles.commentTime}>
                            {formatDateTime(comment.created_at)} {comment.is_edited && "(Edytowano)"}
                          </span>
                          
                          {isMyComment && (
                            <div className="relative">
                              <button 
                                onClick={() => setOpenCommentMenuId(openCommentMenuId === comment.id ? null : comment.id)} 
                                onMouseDown={animateSquish}
                                className="text-gray-500 hover:text-white px-1 leading-none text-lg"
                              >
                                ⋮
                              </button>
                              
                              {openCommentMenuId === comment.id && (
                                <div className={`${styles.optionsMenu} right-0 top-5`}>
                                  <button 
                                    onClick={() => { 
                                      setEditingCommentId(comment.id); 
                                      setEditCommentContent(comment.content); 
                                      setOpenCommentMenuId(null); 
                                    }} 
                                    onMouseDown={animateSquish}
                                    className={styles.menuItem}
                                  >
                                    Edytuj
                                  </button>
                                  <button 
                                    onClick={() => deleteComment(comment.id)} 
                                    onMouseDown={animateSquish}
                                    className={`${styles.menuItem} ${styles.menuItemDelete}`}
                                  >
                                    Usuń
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="flex flex-col gap-2 mt-1">
                          <input 
                            className={styles.commentInput} 
                            value={editCommentContent} 
                            onChange={(e) => setEditCommentContent(e.target.value)} 
                          />
                          <div className="flex gap-3 mt-2 mb-2">
                            <button onClick={() => saveCommentEdit(comment.id)} onMouseDown={animateSquish} className={styles.editSaveBtn}>Zapisz</button>
                            <button onClick={() => setEditingCommentId(null)} onMouseDown={animateSquish} className={styles.editCancelBtn}>Anuluj</button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.commentText}>{comment.content}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {nextCommentUrl && (
              <div ref={lastCommentRef} className="h-4 w-full shrink-0 flex justify-center">
                {isFetchingMoreComments && <span className="text-xs text-yellow-400">...</span>}
              </div>
            )}
          </div>

          <form onSubmit={submitNewComment} className={styles.commentForm}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Napisz komentarz..."
              className={styles.commentInput}
            />
            {/* PRZYWRÓCONA FUNKCJA ANIMACJI NA PRZYCISKU WYSYŁANIA */}
            <button 
              type="submit" 
              onMouseDown={animateSquish}
              className={`${styles.commentSubmitBtn} !px-4 !py-3 flex items-center justify-center`} 
              disabled={!newComment.trim()}
              title="Wyślij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -rotate-45 mb-1 ml-1">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>

        </div>
      )}
    </article>
  );
}