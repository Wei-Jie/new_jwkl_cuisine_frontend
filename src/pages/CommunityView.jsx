import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, MessageSquare, Send, Calendar, Tag } from 'lucide-react';
import { customFetch } from '../utils/helpers';
import './CommunityView.css';

export default function CommunityView() {
    const navigate = useNavigate();
    
    // 狀態定義
    const [activeCategory, setActiveCategory] = useState('STORY'); // STORY, ANNOUNCEMENT, EVENT, SERIAL
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [configs, setConfigs] = useState({
        ENABLE_COMMUNITY_ZONE: true,
        ENABLE_COMMUNITY_COMMENTS: true
    });
    
    // 燈箱 (Lightbox) 狀態
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    
    // 留言表單狀態
    const [newComment, setNewComment] = useState({ author: '', content: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // 1. 初始化時加載系統參數 (做危機卡控)
    useEffect(() => {
        const fetchSystemConfigs = async () => {
            try {
                const res = await customFetch('/api/v1/system-configs');
                if (res.ok) {
                    const data = await res.json();
                    
                    const zoneConfig = data.find(c => c.configKey === 'ENABLE_COMMUNITY_ZONE');
                    const commentsConfig = data.find(c => c.configKey === 'ENABLE_COMMUNITY_COMMENTS');
                    
                    const isZoneEnabled = zoneConfig ? zoneConfig.configValue.trim().toLowerCase() === 'true' : true;
                    const isCommentsEnabled = commentsConfig ? commentsConfig.configValue.trim().toLowerCase() === 'true' : true;
                    
                    setConfigs({
                        ENABLE_COMMUNITY_ZONE: isZoneEnabled,
                        ENABLE_COMMUNITY_COMMENTS: isCommentsEnabled
                    });

                    // 🔒 第一重防線：如果動態專區被關閉，立刻退回首頁
                    if (!isZoneEnabled) {
                        navigate('/');
                    }
                }
            } catch (err) {
                console.error("無法載入系統參數", err);
            }
        };

        fetchSystemConfigs();
    }, [navigate]);

    // 2. 當切換分類時加載文章
    useEffect(() => {
        if (!configs.ENABLE_COMMUNITY_ZONE) return;

        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                // 根據命名規約，我們拉取指定 category 的 posts
                const res = await customFetch(`/api/v1/posts?category=${activeCategory}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // 為了雙向命名相容，我們對欄位做一層 normalize 處理
                    const normalized = data.map(p => ({
                        ...p,
                        coverImageUrl: p.coverImageUrl || p.cover_image_url || '',
                        cover_image_url: p.coverImageUrl || p.cover_image_url || '',
                        chapterNum: p.chapterNum !== undefined ? p.chapterNum : p.chapter_num,
                        chapter_num: p.chapterNum !== undefined ? p.chapterNum : p.chapter_num,
                        createdAt: p.createdAt || p.created_at,
                        created_at: p.createdAt || p.created_at
                    }));

                    setPosts(normalized);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error("載入文章失敗", err);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [activeCategory, configs.ENABLE_COMMUNITY_ZONE]);

    // 3. 當選中文章時載入其留言列表
    useEffect(() => {
        if (!selectedPost) {
            setComments([]);
            return;
        }

        const fetchComments = async () => {
            setIsCommentsLoading(true);
            try {
                const res = await customFetch(`/api/v1/comments/post/${selectedPost.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const normalized = data.map(c => ({
                        ...c,
                        createdAt: c.createdAt || c.created_at,
                        created_at: c.createdAt || c.created_at
                    }));
                    setComments(normalized);
                }
            } catch (err) {
                console.error("載入留言失敗", err);
            } finally {
                setIsCommentsLoading(false);
            }
        };

        fetchComments();
    }, [selectedPost]);

    // 4. 發言功能
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!configs.ENABLE_COMMUNITY_COMMENTS) {
            alert("【防範騷擾】留言功能維護中，目前暫不開放發表新留言！");
            return;
        }
        if (!newComment.author.trim()) {
            alert("請填寫您的暱稱！");
            return;
        }
        if (!newComment.content.trim()) {
            alert("請輸入留言內容！");
            return;
        }

        setIsSubmittingComment(true);
        try {
            const res = await customFetch(`/api/v1/comments/post/${selectedPost.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: newComment.author.trim(),
                    content: newComment.content.trim()
                })
            });

            if (res.ok) {
                const data = await res.json();
                const normalized = {
                    ...data,
                    createdAt: data.createdAt || data.created_at,
                    created_at: data.createdAt || data.created_at
                };
                setComments(prev => [...prev, normalized]);
                setNewComment(prev => ({ ...prev, content: '' })); // 清空內容，保留作者名字方便下一次留言
                
                // 成功回饋
                if (window.sweetAlert) {
                    window.sweetAlert("留言發表成功！");
                } else {
                    alert("留言發表成功！");
                }
            } else {
                const errData = await res.json();
                alert(errData.message || "發表留言失敗，請稍後再試！");
            }
        } catch (err) {
            console.error("發表留言發生錯誤", err);
            alert("發表留言失敗，請檢查網路連線！");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // 5. 燈箱上一篇/下一篇切換邏輯 (尤其適用於日常隨筆與小說連載)
    const handlePrevPost = (e) => {
        e.stopPropagation();
        if (!selectedPost) return;
        const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
        if (currentIndex > 0) {
            setSelectedPost(posts[currentIndex - 1]);
        }
    };

    const handleNextPost = (e) => {
        e.stopPropagation();
        if (!selectedPost) return;
        const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
        if (currentIndex < posts.length - 1) {
            setSelectedPost(posts[currentIndex + 1]);
        }
    };

    const hasPrev = selectedPost ? posts.findIndex(p => p.id === selectedPost.id) > 0 : false;
    const hasNext = selectedPost ? posts.findIndex(p => p.id === selectedPost.id) < posts.length - 1 : false;

    // 6. 格式化時間
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${d} ${hh}:${mm}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="community-layout main-layout">
            <div className="container">
                {/* 頂部質感 Banner */}
                <div className="community-banner">
                    <h1>📸 灶下動態</h1>
                    <p>分享灶下的柴米油鹽、日常瑣事與最新的活動消息</p>
                </div>

                {/* 分類 Tab Bar */}
                <div className="community-tabs-container">
                    <div className="community-tabs">
                        {[
                            { id: 'STORY', label: '📸 日常隨筆' },
                            { id: 'ANNOUNCEMENT', label: '🥘 灶下公告' },
                            { id: 'EVENT', label: '🎉 限時活動' },
                            { id: 'SERIAL', label: '📖 故事連載' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`community-tab-btn ${activeCategory === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(tab.id);
                                    setSelectedPost(null);
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 內容展示區域 */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                        <div>美味動態載入中...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🍃</div>
                        <div style={{ fontWeight: '700' }}>目前該頻道尚無發布動態</div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>店主與闆娘正在用心籌備中，敬請期待！</div>
                    </div>
                ) : (
                    <>
                        {/* 依據分類展示不同的排版 */}
                        {activeCategory === 'STORY' && (
                            <div className="stories-grid">
                                {posts.map(post => (
                                    <div 
                                        key={post.id} 
                                        className="story-grid-item"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {post.coverImageUrl ? (
                                            <img 
                                                src={post.coverImageUrl} 
                                                alt="日常隨筆" 
                                                className="story-grid-image"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="story-text-card">
                                                <div className="story-text-preview">{post.content}</div>
                                                <div className="story-text-meta">
                                                    <span>✍️ 闆娘隨筆</span>
                                                    <span>{formatDateTime(post.createdAt).split(' ')[0]}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {(activeCategory === 'ANNOUNCEMENT' || activeCategory === 'EVENT') && (
                            <div className="blog-list">
                                {posts.map(post => (
                                    <div 
                                        key={post.id} 
                                        className="blog-card"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {post.coverImageUrl ? (
                                            <img src={post.coverImageUrl} alt={post.title} className="blog-card-cover" loading="lazy" />
                                        ) : (
                                            <div className="blog-card-placeholder">
                                                {activeCategory === 'ANNOUNCEMENT' ? '📢' : '🎉'}
                                            </div>
                                        )}
                                        <div className="blog-card-content">
                                            <span className="blog-card-date">
                                                🗓️ {formatDateTime(post.createdAt).split(' ')[0]}
                                            </span>
                                            <h3 className="blog-card-title">{post.title}</h3>
                                            <p className="blog-card-summary">{post.content}</p>
                                            
                                            <div className="blog-card-footer">
                                                <div className="tag-chips">
                                                    {post.tags ? post.tags.split(',').map((tag, idx) => (
                                                        <span key={idx} className="tag-chip">#{tag.trim()}</span>
                                                    )) : (
                                                        <span className="tag-chip">#{activeCategory === 'ANNOUNCEMENT' ? '公告' : '活動'}</span>
                                                    )}
                                                </div>
                                                <span className="read-more-text">閱讀全文 →</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeCategory === 'SERIAL' && (
                            <div className="serial-list">
                                {posts.map(post => (
                                    <div 
                                        key={post.id} 
                                        className="serial-card"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {post.coverImageUrl && (
                                            <img src={post.coverImageUrl} alt={post.title} className="serial-card-cover" loading="lazy" />
                                        )}
                                        <div className="serial-card-info">
                                            <div>
                                                <div className="serial-chapter-tag">
                                                    第 {post.chapterNum || 0} 章
                                                </div>
                                                <h3 className="serial-card-title">{post.title}</h3>
                                                <p className="serial-card-excerpt">{post.content}</p>
                                            </div>
                                            <div className="serial-card-meta">
                                                <span>📅 連載日期: {formatDateTime(post.createdAt).split(' ')[0]}</span>
                                                <span className="read-more-text">點擊閱讀章節 →</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* 雙欄高質感燈箱 (Lightbox) */}
                {selectedPost && (
                    <div className="lightbox-overlay" onClick={() => setSelectedPost(null)}>
                        {/* 燈箱本體 */}
                        <div className="lightbox-container card" onClick={(e) => e.stopPropagation()}>
                            {/* 關閉按鈕 */}
                            <button className="lightbox-close-btn" onClick={() => setSelectedPost(null)}>
                                <X size={18} />
                            </button>

                            {/* 燈箱左側：大圖 (僅在有圖片時展示，或顯示漸層背景與大標) */}
                            <div className="lightbox-left">
                                {selectedPost.coverImageUrl ? (
                                    <img src={selectedPost.coverImageUrl} alt="動態圖片" className="lightbox-main-img" />
                                ) : (
                                    <div className="lightbox-text-placeholder">
                                        <div>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                                {selectedPost.category === 'ANNOUNCEMENT' ? '📢' : 
                                                 selectedPost.category === 'EVENT' ? '🎉' : 
                                                 selectedPost.category === 'SERIAL' ? '📖' : '📸'}
                                            </div>
                                            <h2>{selectedPost.title || '日常隨筆'}</h2>
                                        </div>
                                    </div>
                                )}

                                {/* 燈箱內的左右切換箭頭 (當有上一篇或下一篇時) */}
                                {hasPrev && (
                                    <button className="lightbox-nav-btn prev" onClick={handlePrevPost}>
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                {hasNext && (
                                    <button className="lightbox-nav-btn next" onClick={handleNextPost}>
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>

                            {/* 燈箱右側：內文詳情與留言 */}
                            <div className="lightbox-right">
                                {/* 右側 Header (作者與時間) */}
                                <div className="lightbox-header">
                                    <div className="lightbox-author-info">
                                        <div className="lightbox-avatar">
                                            {selectedPost.category === 'SERIAL' ? '✍️' : '👩'}
                                        </div>
                                        <div className="lightbox-author-meta">
                                            <h4>
                                                {selectedPost.category === 'STORY' ? '闆娘隨筆' : 
                                                 selectedPost.category === 'SERIAL' ? '故事連載' : '小灶私廚'}
                                            </h4>
                                            <span>發布於 {formatDateTime(selectedPost.createdAt)}</span>
                                        </div>
                                    </div>
                                    {selectedPost.title && (
                                        <h3 className="lightbox-title">
                                            {selectedPost.category === 'SERIAL' && `第 ${selectedPost.chapterNum} 章：`}
                                            {selectedPost.title}
                                        </h3>
                                    )}
                                </div>

                                {/* 右側 Body (內文滾動與留言) */}
                                <div className="lightbox-body-scroll">
                                    {/* 文章完整內文 */}
                                    <p className="lightbox-post-content">{selectedPost.content}</p>

                                    {/* 故事連載專屬的章節導航 */}
                                    {selectedPost.category === 'SERIAL' && (
                                        <div className="serial-navigation">
                                            <button 
                                                className="serial-nav-btn"
                                                onClick={handlePrevPost}
                                                disabled={!hasPrev}
                                            >
                                                👈 上一章
                                            </button>
                                            <button 
                                                className="serial-nav-btn"
                                                onClick={handleNextPost}
                                                disabled={!hasNext}
                                            >
                                                下一章 👉
                                            </button>
                                        </div>
                                    )}

                                    {/* 留言系統區塊 */}
                                    <div className="comments-section">
                                        <div className="comments-section-title">
                                            <MessageSquare size={16} />
                                            <span>留言交流 ({comments.length})</span>
                                        </div>

                                        {isCommentsLoading ? (
                                            <div style={{ textAlign: 'center', padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                載入留言中...
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="no-comments">
                                                目前尚無留言。留下一句溫暖的話吧！
                                            </div>
                                        ) : (
                                            <div className="comment-list">
                                                {comments.map(comment => (
                                                    <div key={comment.id} className="comment-item">
                                                        <div className="comment-meta">
                                                            <span className="comment-author">{comment.author}</span>
                                                            <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
                                                        </div>
                                                        <div className="comment-content">{comment.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 右側 Footer (留言表單) */}
                                <div className="comment-form-panel">
                                    {configs.ENABLE_COMMUNITY_COMMENTS ? (
                                        <form className="comment-form" onSubmit={handleCommentSubmit}>
                                            <div className="comment-form-inputs">
                                                <input
                                                    type="text"
                                                    className="comment-form-control comment-input-author"
                                                    placeholder="您的暱稱"
                                                    value={newComment.author}
                                                    onChange={(e) => setNewComment(prev => ({ ...prev, author: e.target.value }))}
                                                    maxLength={15}
                                                    required
                                                    disabled={isSubmittingComment}
                                                />
                                                <textarea
                                                    className="comment-form-control comment-textarea"
                                                    placeholder="寫下您的留言..."
                                                    value={newComment.content}
                                                    onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                                                    maxLength={200}
                                                    required
                                                    disabled={isSubmittingComment}
                                                    onKeyDown={(e) => {
                                                        // 支援 Ctrl+Enter 或 Command+Enter 送出留言
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                            handleCommentSubmit(e);
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    type="submit" 
                                                    className="comment-submit-btn"
                                                    disabled={isSubmittingComment}
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-light)', padding: '10px', borderRadius: '8px', fontWeight: '700' }}>
                                            ⚠️ 留言功能維護中，目前暫不開放發表新留言！
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
