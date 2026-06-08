import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { customFetch } from '../../utils/helpers';

const ConfigsTab = ({
    adminAnnouncement,
    setAdminAnnouncement,
    handleSaveAnnouncement,
    adminAboutText1,
    setAdminAboutText1,
    handleSaveAboutText1,
    adminAboutText2,
    setAdminAboutText2,
    handleSaveAboutText2,
    adminLineLink,
    setAdminLineLink,
    handleSaveLineLink,
    adminIgLink,
    setAdminIgLink,
    handleSaveIgLink,
    faqList,
    isConfigsLoading,
    editingFaqId,
    setEditingFaqId,
    editingFaq,
    setEditingFaq,
    newFaqForm,
    setNewFaqForm,
    showAddFaqModal,
    setShowAddFaqModal,
    startEditFaq,
    handleDeleteFaq,
    handleSaveFaq
}) => {
    const [isUploading, setIsUploading] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* 公告與簡介設定 */}
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>⚙️ 品牌簡介與首頁跑馬燈設定</h3>
                    
                    <div className="form-group">
                        <label className="form-label">首頁跑馬燈系統公告</label>
                        <textarea 
                            className="form-control" 
                            value={adminAnnouncement}
                            onChange={(e) => setAdminAnnouncement(e.target.value)}
                            rows={2}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveAnnouncement} style={{ marginTop: '8px', width: 'auto' }}>儲存公告設定</button>
                    </div>

                    <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                        <label className="form-label">關於小灶介紹 - 第一段</label>
                        <textarea 
                            className="form-control" 
                            value={adminAboutText1}
                            onChange={(e) => setAdminAboutText1(e.target.value)}
                            rows={3}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveAboutText1} style={{ marginTop: '8px', width: 'auto' }}>儲存第一段</button>
                    </div>

                    <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                        <label className="form-label">關於小灶介紹 - 第二段</label>
                        <textarea 
                            className="form-control" 
                            value={adminAboutText2}
                            onChange={(e) => setAdminAboutText2(e.target.value)}
                            rows={3}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveAboutText2} style={{ marginTop: '8px', width: 'auto' }}>儲存第二段</button>
                    </div>

                    <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                        <label className="form-label">LINE 客服聯絡連結</label>
                        <input 
                            type="text"
                            className="form-control" 
                            value={adminLineLink}
                            onChange={(e) => setAdminLineLink(e.target.value)}
                            placeholder="例如: https://line.me/ti/p/~wei750211"
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveLineLink} style={{ marginTop: '8px', width: 'auto' }}>儲存 LINE 連結</button>
                    </div>

                    <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                        <label className="form-label">Instagram 粉絲專頁網址</label>
                        <input 
                            type="text"
                            className="form-control" 
                            value={adminIgLink}
                            onChange={(e) => setAdminIgLink(e.target.value)}
                            placeholder="placeholder: https://www.instagram.com/jwkl_cuisine/"
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveIgLink} style={{ marginTop: '8px', width: 'auto' }}>儲存 IG 連結</button>
                    </div>
                </div>

                {/* FAQ 常見問題維護 */}
                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>❓ FAQ 常見問題維護</h3>
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { setEditingFaqId(null); setNewFaqForm({ question: '', answer: '', sortOrder: 0, imageUrl: '' }); setShowAddFaqModal(true); }}
                            style={{ height: '32px', width: 'auto' }}
                        >
                            ➕ 新增問答
                        </button>
                    </div>

                    {isConfigsLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>載入問答中...</div>
                    ) : (
                        <div className="responsive-table-wrap" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            <table className="admin-table faq-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>排序</th>
                                        <th>問答主題</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faqList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(faq => (
                                        <tr key={faq.id}>
                                            <td data-label="排序">{faq.sortOrder}</td>
                                            <td data-label="問答主題">
                                                <strong style={{ color: 'var(--color-primary)', fontSize: '13px' }}>Q: {faq.question}</strong>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>A: {faq.answer}</div>
                                            </td>
                                            <td data-label="操作">
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => { startEditFaq(faq); setShowAddFaqModal(true); }} style={{ padding: '2px 8px' }}>編輯</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFaq(faq.id)} style={{ padding: '2px 8px' }}>刪除</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* FAQ 新增/編輯 Modal */}
            {showAddFaqModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-container card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div className="modal-header">
                            <h3>{editingFaqId ? '✏️ 編輯常見問題' : '➕ 新增常見問題'}</h3>
                            <button className="modal-close" onClick={() => setShowAddFaqModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">問答主題 (Question)</label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    value={editingFaqId ? editingFaq.question : newFaqForm.question}
                                    onChange={(e) => {
                                        if (editingFaqId) setEditingFaq({ ...editingFaq, question: e.target.value });
                                        else setNewFaqForm({ ...newFaqForm, question: e.target.value });
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">詳細回答 (Answer)</label>
                                <textarea 
                                    className="form-control"
                                    value={editingFaqId ? editingFaq.answer : newFaqForm.answer}
                                    onChange={(e) => {
                                        if (editingFaqId) setEditingFaq({ ...editingFaq, answer: e.target.value });
                                        else setNewFaqForm({ ...newFaqForm, answer: e.target.value });
                                    }}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">排序權重 (越小越靠前)</label>
                                <input 
                                    type="number"
                                    className="form-control"
                                    value={editingFaqId ? editingFaq.sortOrder : newFaqForm.sortOrder}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        if (editingFaqId) setEditingFaq({ ...editingFaq, sortOrder: val });
                                        else setNewFaqForm({ ...newFaqForm, sortOrder: val });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">說明圖片網址 (選填)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder="pic/faq_detail.jpg 或是網址"
                                        value={editingFaqId ? editingFaq.imageUrl : newFaqForm.imageUrl}
                                        onChange={(e) => {
                                            if (editingFaqId) setEditingFaq({ ...editingFaq, imageUrl: e.target.value });
                                            else setNewFaqForm({ ...newFaqForm, imageUrl: e.target.value });
                                        }}
                                        style={{ flexGrow: 1 }}
                                    />
                                    <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px', height: '48px', margin: 0, fontSize: '13px' }}>
                                        📁 上傳圖片
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                if (file.size > 2 * 1024 * 1024) {
                                                    alert('上傳失敗：圖片檔案不可超過 2MB！');
                                                    return;
                                                }
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                
                                                const uploadStartTime = Date.now();
                                                setIsUploading(true);
                                                let uploadSuccess = false;
                                                let uploadErrorMsg = '';
                                                let uploadedUrl = '';

                                                try {
                                                    const res = await customFetch('/api/v1/upload', {
                                                        method: 'POST',
                                                        headers: {
                                                            'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                                                        },
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
                                                    uploadErrorMsg = '網路連線失敗，無法上傳圖片！';
                                                } finally {
                                                    const elapsedTime = Date.now() - uploadStartTime;
                                                    const minDelay = 1200;
                                                    if (elapsedTime < minDelay) {
                                                        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
                                                    }
                                                    setIsUploading(false);

                                                    if (uploadSuccess) {
                                                        if (editingFaqId) setEditingFaq({ ...editingFaq, imageUrl: uploadedUrl });
                                                        else setNewFaqForm({ ...newFaqForm, imageUrl: uploadedUrl });
                                                        setTimeout(() => alert('圖片上傳成功！'), 100);
                                                    } else if (uploadErrorMsg) {
                                                        setTimeout(() => alert('上傳失敗：' + uploadErrorMsg), 100);
                                                    }
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <small style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                    💡 提示：支援專案本機路徑（如 <code>pic/filename.jpg</code>）或外部直接圖片網址。<br />
                                    若使用 Google Drive 圖片，請將分享連結的 <b>檔案ID</b> 代入以下直連格式：<br />
                                    <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px', wordBreak: 'break-all', display: 'inline-block', marginTop: '2px' }}>https://lh3.googleusercontent.com/d/您的檔案ID</code>
                                </small>
                            </div>
                            <div className="modal-footer" style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" disabled={isUploading}>儲存問答</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddFaqModal(false)} disabled={isUploading}>取消</button>
                            </div>
                        </form>
                        {isUploading && (
                            <div className="upload-loading-overlay">
                                <div className="upload-loading-card">
                                    <img src="/pic/chef_mascot_transparent.png" className="mascot-uploading" alt="上傳中" />
                                    <div className="upload-loading-text">美味圖片上傳中，請稍候...</div>
                                    <div className="upload-loading-bar-container">
                                        <div className="upload-loading-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ConfigsTab;
