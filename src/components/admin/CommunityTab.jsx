import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Edit, Trash2, Plus, Eye, EyeOff, Calendar } from 'lucide-react';
import { customFetch } from '../../utils/helpers';

// 圖片壓縮為 WebP 並限制在 2MB 以內
const compressAndConvertToWebP = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/') || !window.HTMLCanvasElement) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const webpFile = new File([blob], `${rawName}.webp`, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(webpFile);
                }, 'image/webp', 0.82);
            };
            img.onerror = (err) => {
                console.error("圖片載入失敗", err);
                resolve(file);
            };
        };
        reader.onerror = (err) => {
            console.error("檔案讀取失敗", err);
            resolve(file);
        };
    });
};

const CommunityTab = () => {
    const [posts, setPosts] = useState([]);
    const [isPostsLoading, setIsPostsLoading] = useState(false);
    
    // 編輯/新增 Modal 狀態
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [postForm, setPostForm] = useState({
        title: '',
        content: '',
        category: 'STORY', // STORY, ANNOUNCEMENT, EVENT, SERIAL
        coverImageUrl: '',
        tags: '',
        chapterNum: 0,
        status: 'PUBLISHED' // PUBLISHED, DRAFT
    });
    
    // 留言審查面板狀態
    const [activePostForComments, setActivePostForComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    
    const [isUploading, setIsUploading] = useState(false);

    // 1. 載入所有文章 (後台專用)
    const fetchAllPosts = async () => {
        setIsPostsLoading(true);
        try {
            const res = await customFetch('/api/v1/posts/all');
            if (res.ok) {
                const data = await res.json();
                
                // 命名雙向相容 normalize
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
            }
        } catch (err) {
            console.error("載入後台文章失敗", err);
        } finally {
            setIsPostsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPosts();
    }, []);

    // 2. 顯示/隱藏留言面板並獲取留言
    const handleToggleCommentsPanel = async (post) => {
        if (activePostForComments && activePostForComments.id === post.id) {
            setActivePostForComments(null);
            setComments([]);
            return;
        }

        setActivePostForComments(post);
        setIsCommentsLoading(true);
        try {
            const res = await customFetch(`/api/v1/comments/post/${post.id}/all`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error("載入所有留言失敗", err);
        } finally {
            setIsCommentsLoading(false);
        }
    };

    // 3. 審核/隱蔽/還原留言狀態
    const handleUpdateCommentStatus = async (commentId, currentStatus) => {
        const nextStatus = currentStatus === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
        const confirmMsg = nextStatus === 'HIDDEN' ? '確定要隱蔽此留言嗎？隱蔽後前台將無法看到此留言。' : '確定要還原此留言嗎？還原後前台將重新顯示此留言。';
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await customFetch(`/api/v1/comments/${commentId}/status?status=${nextStatus}`, {
                method: 'PUT'
            });

            if (res.ok) {
                setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, status: nextStatus } : c
                ));
            } else {
                alert("修改留言狀態失敗");
            }
        } catch (err) {
            console.error("修改留言狀態出錯", err);
        }
    };

    // 4. 新增或編輯文章 Modal 打開
    const handleOpenPostModal = (post = null) => {
        if (post) {
            setEditingPostId(post.id);
            setPostForm({
                title: post.title || '',
                content: post.content || '',
                category: post.category || 'STORY',
                coverImageUrl: post.coverImageUrl || '',
                tags: post.tags || '',
                chapterNum: post.chapterNum || 0,
                status: post.status || 'PUBLISHED'
            });
        } else {
            setEditingPostId(null);
            setPostForm({
                title: '',
                content: '',
                category: 'STORY',
                coverImageUrl: '',
                tags: '',
                chapterNum: 0,
                status: 'PUBLISHED'
            });
        }
        setShowPostModal(true);
    };

    // 5. 儲存/發布文章
    const handleSavePost = async (e) => {
        e.preventDefault();
        
        // STORY (日常隨筆) 可不用標題，其餘分類必填
        if (postForm.category !== 'STORY' && !postForm.title.trim()) {
            alert("請填寫動態標題！");
            return;
        }
        if (!postForm.content.trim()) {
            alert("請填寫動態內文！");
            return;
        }

        const isEdit = !!editingPostId;
        const url = isEdit ? `/api/v1/posts/${editingPostId}` : '/api/v1/posts';
        const method = isEdit ? 'PUT' : 'POST';

        // 建立後端所需 Payload (包含駝峰與底線命名雙對齊以相容後端)
        const payload = {
            title: postForm.category === 'STORY' ? '' : postForm.title.trim(),
            content: postForm.content.trim(),
            category: postForm.category.toUpperCase(),
            coverImageUrl: postForm.coverImageUrl.trim(),
            cover_image_url: postForm.coverImageUrl.trim(),
            tags: postForm.tags.trim(),
            chapterNum: postForm.category === 'SERIAL' ? parseInt(postForm.chapterNum) || 0 : 0,
            chapter_num: postForm.category === 'SERIAL' ? parseInt(postForm.chapterNum) || 0 : 0,
            status: postForm.status
        };

        try {
            const res = await customFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(isEdit ? "動態更新成功！" : "動態發布成功！");
                setShowPostModal(false);
                fetchAllPosts();
                
                // 如果留言面板開著，順便關閉
                setActivePostForComments(null);
                setComments([]);
            } else {
                const errData = await res.json();
                alert(errData.message || "儲存文章失敗！");
            }
        } catch (err) {
            console.error("儲存文章發生錯誤", err);
            alert("儲存文章失敗，請檢查網路！");
        }
    };

    // 6. 刪除文章
    const handleDeletePost = async (postId) => {
        if (!window.confirm("🔴 確定要刪除此文章嗎？刪除後文章將永久消失，且關聯的留言也會被一併刪除，此操作不可逆！")) return;

        try {
            const res = await customFetch(`/api/v1/posts/${postId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert("文章刪除成功！");
                fetchAllPosts();
                if (activePostForComments && activePostForComments.id === postId) {
                    setActivePostForComments(null);
                    setComments([]);
                }
            } else {
                alert("刪除失敗");
            }
        } catch (err) {
            console.error("刪除文章發生錯誤", err);
        }
    };

    // 格式化顯示分類
    const getCategoryLabel = (cat) => {
        switch (cat) {
            case 'STORY': return '📸 日常隨筆';
            case 'ANNOUNCEMENT': return '🥘 灶下公告';
            case 'EVENT': return '🎉 限時活動';
            case 'SERIAL': return '📖 故事連載';
            default: return cat;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 上方標題與新增按鈕 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>📸 動態與部落格專區管理</h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>發布公告、活動、日常隨筆或故事連載，並審查前台的留言交流</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => handleOpenPostModal()}
                    style={{ height: '42px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={16} /> 發布新動態
                </button>
            </div>

            {/* 主要版面：左側文章列表，右側留言審查（當點選查看留言時） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. 文章列表卡片 */}
                <div className="card" style={{ padding: '20px' }}>
                    {isPostsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>載入動態列表中...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>目前尚無動態。趕快點擊右上角發布第一篇動態吧！</div>
                    ) : (
                        <div className="responsive-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>頻道分類</th>
                                        <th>動態主題/內文摘要</th>
                                        <th style={{ width: '100px' }}>狀態</th>
                                        <th style={{ width: '120px' }}>發布時間</th>
                                        <th style={{ width: '180px' }}>管理操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr key={post.id} style={{ backgroundColor: activePostForComments?.id === post.id ? 'var(--color-primary-light)' : 'transparent' }}>
                                            <td data-label="頻道分類">
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '700',
                                                    backgroundColor: post.category === 'ANNOUNCEMENT' ? '#fee2e2' : 
                                                                    post.category === 'EVENT' ? '#fef3c7' : 
                                                                    post.category === 'SERIAL' ? '#e0f2fe' : '#f0fdf4',
                                                    color: post.category === 'ANNOUNCEMENT' ? '#991b1b' : 
                                                           post.category === 'EVENT' ? '#92400e' : 
                                                           post.category === 'SERIAL' ? '#075985' : '#166534'
                                                }}>
                                                    {getCategoryLabel(post.category)}
                                                </span>
                                                {post.category === 'SERIAL' && (
                                                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 'bold' }}>
                                                        第 {post.chapterNum} 章
                                                    </div>
                                                )}
                                            </td>
                                            <td data-label="動態主題/內文摘要">
                                                {post.title ? (
                                                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>{post.title}</strong>
                                                ) : null}
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                                                    {post.content}
                                                </div>
                                                {post.tags ? (
                                                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                                                        {post.tags.split(',').map((t, i) => (
                                                            <span key={i} style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '10px' }}>
                                                                #{t.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td data-label="狀態">
                                                <span style={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: '700',
                                                    color: post.status === 'PUBLISHED' ? 'var(--color-success)' : 'var(--color-text-muted)'
                                                }}>
                                                    {post.status === 'PUBLISHED' ? '● 已發布' : '○ 草稿'}
                                                </span>
                                            </td>
                                            <td data-label="發布時間" style={{ fontSize: '12px' }}>
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('zh-TW', { hour: '2-digit', minute:'2-digit' }) : '-'}
                                            </td>
                                            <td data-label="管理操作">
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button 
                                                        className={`btn btn-sm ${activePostForComments?.id === post.id ? 'btn-primary' : 'btn-outline'}`}
                                                        onClick={() => handleToggleCommentsPanel(post)}
                                                        style={{ padding: '4px 8px', fontSize: '12px', height: '30px', width: 'auto' }}
                                                    >
                                                        <MessageSquare size={12} /> 留言
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleOpenPostModal(post)}
                                                        style={{ padding: '4px 8px', fontSize: '12px', height: '30px', width: 'auto' }}
                                                    >
                                                        <Edit size={12} /> 編輯
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        style={{ padding: '4px 8px', fontSize: '12px', height: '30px', width: 'auto' }}
                                                    >
                                                        <Trash2 size={12} /> 刪除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 2. 留言審查面板 (當選中某一篇文章時在下方展開) */}
                {activePostForComments && (
                    <div className="card animate-fade-in" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                                    💬 留言管理：【{activePostForComments.title || '日常隨筆'}】
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>您可以審查本篇動態的留言，並隨時隱藏惡意留言避免傷害擴大</p>
                            </div>
                            <button 
                                className="modal-close" 
                                onClick={() => { setActivePostForComments(null); setComments([]); }}
                                style={{ border: '1px solid var(--color-border)', borderRadius: '50%', padding: '4px' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {isCommentsLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>載入留言中...</div>
                        ) : comments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>本篇動態目前尚無留言交流。</div>
                        ) : (
                            <div className="responsive-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '100px' }}>留言者</th>
                                            <th>留言內容</th>
                                            <th style={{ width: '120px' }}>來源 IP</th>
                                            <th style={{ width: '130px' }}>留言時間</th>
                                            <th style={{ width: '100px' }}>狀態</th>
                                            <th style={{ width: '100px' }}>審查操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comments.map(comment => (
                                            <tr key={comment.id} style={{ opacity: comment.status === 'HIDDEN' ? 0.6 : 1, backgroundColor: comment.status === 'HIDDEN' ? '#f3f4f6' : 'transparent' }}>
                                                <td data-label="留言者">
                                                    <strong>{comment.author}</strong>
                                                </td>
                                                <td data-label="留言內容" style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                                                    {comment.content}
                                                </td>
                                                <td data-label="來源 IP" style={{ fontSize: '11px', color: '#6b7280' }}>
                                                    <code>{comment.ipAddress || comment.ip_address || '未知'}</code>
                                                </td>
                                                <td data-label="留言時間" style={{ fontSize: '11px' }}>
                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString('zh-TW') : '-'}
                                                </td>
                                                <td data-label="狀態">
                                                    <span style={{ 
                                                        fontWeight: 'bold', 
                                                        fontSize: '12px',
                                                        color: comment.status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-danger)' 
                                                    }}>
                                                        {comment.status === 'APPROVED' ? '顯示中' : '已隱藏'}
                                                    </span>
                                                </td>
                                                <td data-label="審查操作">
                                                    <button
                                                        className={`btn btn-sm ${comment.status === 'APPROVED' ? 'btn-danger' : 'btn-primary'}`}
                                                        onClick={() => handleUpdateCommentStatus(comment.id, comment.status)}
                                                        style={{ padding: '4px 8px', fontSize: '12px', height: '28px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        {comment.status === 'APPROVED' ? (
                                                            <>
                                                                <EyeOff size={12} /> 隱藏
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye size={12} /> 恢復顯示
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 新增/編輯文章 Modal (React Portal) */}
            {showPostModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-container card" style={{ maxWidth: '650px', width: '90%' }}>
                        <div className="modal-header">
                            <h3>{editingPostId ? '✏️ 編輯動態文章' : '📸 發布全新動態'}</h3>
                            <button className="modal-close" onClick={() => setShowPostModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">頻道分類 (Category)</label>
                                    <select 
                                        className="form-control"
                                        value={postForm.category}
                                        onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                                        style={{ height: '48px' }}
                                    >
                                        <option value="STORY">📸 日常隨筆 (IG 風格)</option>
                                        <option value="ANNOUNCEMENT">🥘 灶下公告 (部落格長文)</option>
                                        <option value="EVENT">🎉 限時活動 (部落格長文)</option>
                                        <option value="SERIAL">📖 故事連載 (章節排版)</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">發布狀態 (Status)</label>
                                    <select 
                                        className="form-control"
                                        value={postForm.status}
                                        onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                                        style={{ height: '48px' }}
                                    >
                                        <option value="PUBLISHED">已發布 (前台可見)</option>
                                        <option value="DRAFT">草稿 (暫存後台)</option>
                                    </select>
                                </div>
                            </div>

                            {/* 智慧型欄位適應：如果是日常隨筆 (STORY) 標題為選填；若是小說連載 (SERIAL) 標題是章節名稱 */}
                            <div className="form-group">
                                <label className="form-label">
                                    {postForm.category === 'SERIAL' ? '章節名稱 (標題)' : '動態標題'}
                                    {postForm.category === 'STORY' ? ' (選填)' : ' (必填)'}
                                </label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder={
                                        postForm.category === 'STORY' ? '日常隨筆可不填標題，像 IG 的發文' :
                                        postForm.category === 'SERIAL' ? '例如：初探灶下秘境' : '例如：端午佳節包粽活動開跑'
                                    }
                                    value={postForm.title}
                                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                                    required={postForm.category !== 'STORY'}
                                />
                            </div>

                            {/* 智慧型欄位適應：如果是故事連載 (SERIAL) 則顯示「章節編號」輸入框 */}
                            {postForm.category === 'SERIAL' && (
                                <div className="form-group">
                                    <label className="form-label">章節編號 (整數，系統會依此排序)</label>
                                    <input 
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        placeholder="例如：1 表示第一章"
                                        value={postForm.chapterNum}
                                        onChange={(e) => setPostForm({ ...postForm, chapterNum: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">詳細內文 (Content)</label>
                                <textarea 
                                    className="form-control"
                                    placeholder="填寫動態內容... 支援 emoji 表情符號 🎉"
                                    value={postForm.content}
                                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                                    rows={postForm.category === 'STORY' ? 4 : 8}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">封面/發文圖片 (選填)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder="直接貼上圖片連結，或者點擊右側上傳本機圖片"
                                        value={postForm.coverImageUrl}
                                        onChange={(e) => setPostForm({ ...postForm, coverImageUrl: e.target.value })}
                                        style={{ flexGrow: 1 }}
                                    />
                                    <label 
                                        className="btn btn-outline" 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            cursor: 'pointer', 
                                            whiteSpace: 'nowrap', 
                                            padding: '0 12px', 
                                            height: '48px', 
                                            margin: 0, 
                                            fontSize: '13px',
                                            pointerEvents: isUploading ? 'none' : 'auto',
                                            opacity: isUploading ? 0.6 : 1
                                        }}
                                    >
                                        {isUploading ? '⏳ 上傳中...' : '📁 上傳圖片'}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const rawFile = e.target.files[0];
                                                if (!rawFile) return;
                                                
                                                if (rawFile.size > 20 * 1024 * 1024) {
                                                    alert('上傳失敗：圖片檔案不可超過 20MB！');
                                                    return;
                                                }

                                                setIsUploading(true);
                                                let uploadSuccess = false;
                                                let uploadErrorMsg = '';
                                                let uploadedUrl = '';
  
                                                try {
                                                    const file = await compressAndConvertToWebP(rawFile);
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        throw new Error('壓縮後的圖片大小仍超過 2MB！');
                                                    }
 
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    
                                                    const res = await customFetch('/api/v1/upload', {
                                                        method: 'POST',
                                                        headers: {},
                                                        body: formData
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        if (data.status === 'success') {
                                                            uploadedUrl = data.url;
                                                            uploadSuccess = true;
                                                        } else {
                                                            uploadErrorMsg = data.message || '未知錯誤';
                                                        }
                                                    } else {
                                                        uploadErrorMsg = await res.text();
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    uploadErrorMsg = err.message || '網路連線失敗，無法上傳圖片！';
                                                } finally {
                                                    setIsUploading(false);
                                                    if (uploadSuccess) {
                                                        setPostForm(prev => ({ ...prev, coverImageUrl: uploadedUrl }));
                                                        setTimeout(() => alert('圖片上傳成功！'), 100);
                                                    } else if (uploadErrorMsg) {
                                                        setTimeout(() => alert('上傳失敗：' + uploadErrorMsg), 100);
                                                    }
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                                {postForm.coverImageUrl && (
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>圖片預覽：</span>
                                        <img 
                                            src={postForm.coverImageUrl} 
                                            alt="圖片預覽" 
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">標籤 (Tags，多個以半角逗號區隔)</label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="例如：小灶私廚, 闆娘隨筆, 灶下日常"
                                    value={postForm.tags}
                                    onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer" style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" disabled={isUploading}>儲存發布</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowPostModal(false)} disabled={isUploading}>取消</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CommunityTab;
