import React from 'react';
import { X } from 'lucide-react';

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
                            <table className="admin-table">
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
            {showAddFaqModal && (
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
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="pic/faq_detail.jpg 或是網址"
                                    value={editingFaqId ? editingFaq.imageUrl : newFaqForm.imageUrl}
                                    onChange={(e) => {
                                        if (editingFaqId) setEditingFaq({ ...editingFaq, imageUrl: e.target.value });
                                        else setNewFaqForm({ ...newFaqForm, imageUrl: e.target.value });
                                    }}
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary">儲存問答</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddFaqModal(false)}>取消</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigsTab;
