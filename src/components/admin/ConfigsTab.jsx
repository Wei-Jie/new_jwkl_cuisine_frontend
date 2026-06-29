import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { customFetch } from '../../utils/helpers';

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
    adminEnableCommunityZone,
    setAdminEnableCommunityZone,
    handleSaveCommunityZone,
    adminEnableCommunityComments,
    setAdminEnableCommunityComments,
    handleSaveCommunityComments,
    adminShippingEnabled,
    setAdminShippingEnabled,
    handleSaveShippingEnabled,
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
    const [pushStatus, setPushStatus] = useState('checking'); // checking, unsupported, denied, prompt, subscribed

    React.useEffect(() => {
        checkPushSubscription();
    }, []);

    const checkPushSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setPushStatus('unsupported');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                setPushStatus('subscribed');
            } else {
                const permission = Notification.permission;
                if (permission === 'denied') {
                    setPushStatus('denied');
                } else {
                    setPushStatus('prompt');
                }
            }
        } catch (err) {
            console.error("檢查推播狀態出錯", err);
            setPushStatus('unsupported');
        }
    };

    const handleSubscribePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert("您的瀏覽器不支援 Web Push 通知！");
            return;
        }
        
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert("您拒絕了通知權限，無法開啟即時通知。請在瀏覽器設定中允許此網站發送通知。");
                setPushStatus('denied');
                return;
            }

            const registration = await navigator.serviceWorker.ready;

            const keyRes = await customFetch('/api/v1/system-configs/web-push/public-key');
            if (!keyRes.ok) {
                throw new Error("無法取得 Web Push 公鑰");
            }
            const { publicKey } = await keyRes.json();
            if (!publicKey) {
                throw new Error("Web Push 公鑰為空，請確認後端金鑰是否已初始化");
            }

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            const saveRes = await customFetch('/api/v1/system-configs/web-push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (saveRes.ok) {
                alert("即時留言通知開啟成功！當有顧客在灶下動態留言時，此瀏覽器將收到即時通知。");
                setPushStatus('subscribed');
            } else {
                throw new Error("儲存訂閱資訊失敗");
            }
        } catch (err) {
            console.error("訂閱推播失敗", err);
            alert("開啟即時通知失敗: " + err.message);
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
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

                    {/* 🔒 雙重危機防護緊急卡控開關 */}
                    <div className="form-group" style={{ borderTop: '2px dashed var(--color-danger, #dc2626)', paddingTop: '16px', marginTop: '8px' }}>
                        <label className="form-label" style={{ color: 'var(--color-danger, #dc2626)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🚨 動態專區危機防護卡控 (一鍵避險)
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>1. 前台動態專區顯示</label>
                                <select 
                                    className="form-control"
                                    value={adminEnableCommunityZone}
                                    onChange={(e) => setAdminEnableCommunityZone(e.target.value)}
                                    style={{ border: adminEnableCommunityZone === 'false' ? '1.5px solid var(--color-danger)' : '1px solid var(--color-border)' }}
                                >
                                    <option value="true">🟢 正常啟用 (前台顯示專區)</option>
                                    <option value="false">🔴 緊急隱蔽 (完全關閉前台動態專區)</option>
                                </select>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveCommunityZone} style={{ marginTop: '6px', width: 'auto', backgroundColor: adminEnableCommunityZone === 'false' ? 'var(--color-danger)' : 'var(--color-primary)' }}>儲存顯示設定</button>
                            </div>

                            <div style={{ marginTop: '8px', borderTop: '1px dotted var(--color-border)', paddingTop: '10px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>2. 前台動態留言功能</label>
                                <select 
                                    className="form-control"
                                    value={adminEnableCommunityComments}
                                    onChange={(e) => setAdminEnableCommunityComments(e.target.value)}
                                    style={{ border: adminEnableCommunityComments === 'false' ? '1.5px solid var(--color-danger)' : '1px solid var(--color-border)' }}
                                >
                                    <option value="true">🟢 正常開啟 (允許前台留言)</option>
                                    <option value="false">🔴 緊急關閉 (停用前台留言發言功能)</option>
                                </select>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveCommunityComments} style={{ marginTop: '6px', width: 'auto', backgroundColor: adminEnableCommunityComments === 'false' ? 'var(--color-danger)' : 'var(--color-primary)' }}>儲存留言設定</button>
                            </div>
                        </div>
                        <small style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                            💡 <b>防護機制說明：</b><br />
                            - 若選擇「緊急隱蔽」，前台導覽列將隱藏動態專區，且手動輸入網址也會被重定向回首頁。<br />
                            - 若選擇「緊急關閉」，前台動態將不提供留言表單，且後端 API 寫入亦會直接阻斷並回傳 403 錯誤。
                        </small>
                    </div>

                    {/* 📦 配送功能開關 */}
                    <div className="form-group" style={{ borderTop: '2px dashed #2563eb', paddingTop: '16px', marginTop: '8px' }}>
                        <label className="form-label" style={{ color: '#1d4ed8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📦 配送與運費計算功能開關
                        </label>
                        <select
                            className="form-control"
                            value={adminShippingEnabled}
                            onChange={(e) => setAdminShippingEnabled(e.target.value)}
                            style={{ border: adminShippingEnabled === 'true' ? '1.5px solid #2563eb' : '1px solid var(--color-border)' }}
                        >
                            <option value="false">🔴 關閉（前台不顯示取貨方式選項）</option>
                            <option value="true">🟢 開啟（前台顯示取貨方式、運費試算功能）</option>
                        </select>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveShippingEnabled}
                            style={{ marginTop: '6px', width: 'auto', backgroundColor: adminShippingEnabled === 'true' ? '#2563eb' : 'var(--color-primary)' }}
                        >
                            儲存配送功能設定
                        </button>
                        <small style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                            💡 <b>功能說明：</b><br />
                            - 開啟後，顧客在購物車頁面將看到「取貨方式」選項（面交 / 黑貓宅配 / 7-11 店到店）。<br />
                            - 關閉時，前台完全不顯示任何配送 UI，訂單流程維持原樣。<br />
                            - 後台訂單管理的配送資訊欄位不受此開關影響，店主任何時候都可補填。
                        </small>
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
                        <div className="responsive-table-wrap">
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

                {/* 店主即時留言通知設定 */}
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>🔔 即時留言推播通知（店主專用）</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        啟用此功能後，當有顧客在「灶下動態」發表新留言時，您的瀏覽器會立即彈出通知（即使您已關閉此網頁）。
                    </p>
                    
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-background-hover)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>推播通知狀態：</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                {pushStatus === 'checking' && '⏳ 檢查中...'}
                                {pushStatus === 'unsupported' && '❌ 瀏覽器不支援'}
                                {pushStatus === 'denied' && '🔴 已封鎖通知權限'}
                                {pushStatus === 'prompt' && '🟡 尚未開啟'}
                                {pushStatus === 'subscribed' && '🟢 已開啟即時通知'}
                            </span>
                        </div>
                        {pushStatus === 'denied' && (
                            <small style={{ color: 'var(--color-danger, #dc2626)', fontSize: '11px' }}>
                                💡 請點擊瀏覽器網址列旁的鎖頭，將「通知」權限改為「允許」，並重新整理頁面。
                             </small>
                        )}
                    </div>

                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubscribePush}
                        disabled={pushStatus === 'unsupported' || pushStatus === 'subscribed'}
                        style={{ 
                            width: '100%', 
                            backgroundColor: pushStatus === 'subscribed' ? '#10b981' : 'var(--color-primary)',
                            opacity: pushStatus === 'unsupported' ? 0.6 : 1,
                            cursor: (pushStatus === 'unsupported' || pushStatus === 'subscribed') ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {pushStatus === 'subscribed' ? '✓ 已成功訂閱此裝置' : '🔔 開啟此裝置即時通知'}
                    </button>
                    
                    <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                        * 請使用您平時用來管理後台的裝置（如手機或電腦瀏覽器）開啟此設定。<br />
                        * 如果您使用多個裝置管理，請在各裝置的瀏覽器上分別點擊一次開啟。
                    </small>
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
                                        value={editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl}
                                        onChange={(e) => {
                                            if (editingFaqId) setEditingFaq({ ...editingFaq, imageUrl: e.target.value });
                                            else setNewFaqForm({ ...newFaqForm, imageUrl: e.target.value });
                                        }}
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
                                                    alert('上傳失敗：圖片檔案過大（不可超過 20MB）！');
                                                    return;
                                                }

                                                const uploadStartTime = Date.now();
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
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                                {(editingFaqId ? editingFaq.imageUrl : newFaqForm.imageUrl) && (
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>圖片預覽：</span>
                                        <img 
                                            key={editingFaqId ? editingFaq.imageUrl : newFaqForm.imageUrl}
                                            src={
                                                (editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl).startsWith('http') || 
                                                (editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl).startsWith('/') || 
                                                (editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl).startsWith('pic/') 
                                                    ? ((editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl).startsWith('pic/') 
                                                        ? '/' + (editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl) 
                                                        : (editingFaqId ? (editingFaq.imageUrl || '') : newFaqForm.imageUrl)) 
                                                    : ''
                                            } 
                                            alt="圖片預覽" 
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
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
                    </div>
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default ConfigsTab;
