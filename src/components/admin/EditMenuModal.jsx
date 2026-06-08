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

export function AddMenuModal({
    show,
    onClose,
    newMenuForm,
    setNewMenuForm,
    onSubmit
}) {
    const [isUploading, setIsUploading] = useState(false);

    if (!show) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', margin: 'auto', position: 'relative' }}>
                <div className="modal-header">
                    <h3>➕ 新增菜單商品</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                        <label className="form-label">商品料號 (如 PROD_009)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newMenuForm.product_id}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, product_id: e.target.value.trim() })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品分類</label>
                        <select 
                            className="form-control"
                            value={newMenuForm.category}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, category: e.target.value })}
                        >
                            <option value="麵食">麵食</option>
                            <option value="小菜">小菜</option>
                            <option value="滷味">滷味</option>
                            <option value="料理包">料理包</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品名稱</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newMenuForm.name}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">價格或計價模式 (如 240 或 2.5*重量)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newMenuForm.price}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">成本 (元，選填)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="form-control" 
                            value={newMenuForm.cost}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, cost: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">內部管理備註 (選填)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newMenuForm.pureNote}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, pureNote: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品描述</label>
                        <textarea 
                            className="form-control" 
                            value={newMenuForm.description}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, description: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">圖片檔名 (如 water_dumplings.jpg)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newMenuForm.image_filename}
                            onChange={(e) => setNewMenuForm({ ...newMenuForm, image_filename: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">圖片網址 / 位置 (如 pic/P1001.jpg)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={newMenuForm.image_url}
                                onChange={(e) => setNewMenuForm({ ...newMenuForm, image_url: e.target.value })}
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
                                                setNewMenuForm({ 
                                                    ...newMenuForm, 
                                                    image_url: uploadedUrl,
                                                    image_filename: uploadedUrl
                                                });
                                                setTimeout(() => alert('商品圖片上傳成功！'), 100);
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
                        {newMenuForm.image_url && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>圖片預覽：</span>
                                <img 
                                    key={newMenuForm.image_url}
                                    src={newMenuForm.image_url.startsWith('http') || newMenuForm.image_url.startsWith('/') || newMenuForm.image_url.startsWith('pic/') 
                                        ? (newMenuForm.image_url.startsWith('pic/') ? '/' + newMenuForm.image_url : newMenuForm.image_url) 
                                        : ''} 
                                    alt="圖片預覽" 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary" disabled={isUploading}>確認新增</button>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isUploading}>取消</button>
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
    );
}

export function EditMenuModal({
    show,
    onClose,
    editingProduct,
    setEditingProduct,
    onSubmit
}) {
    const [isUploading, setIsUploading] = useState(false);

    if (!show) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', position: 'relative' }}>
                <div className="modal-header">
                    <h3>✏️ 編輯菜單商品</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                        <label className="form-label">商品料號</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingProduct.product_id || ''}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品分類</label>
                        <select
                            className="form-control"
                            value={editingProduct.category || '麵食'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        >
                            <option value="麵食">麵食</option>
                            <option value="小菜">小菜</option>
                            <option value="滷味">滷味</option>
                            <option value="料理包">料理包</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品名稱</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingProduct.name || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">價格或計價模式 (如 240 或 2.5*重量)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingProduct.price || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">成本 (元，選填)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={editingProduct.cost || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, cost: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">內部管理備註 (選填)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingProduct.pureNote || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, pureNote: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">商品描述</label>
                        <textarea
                            className="form-control"
                            value={editingProduct.description || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">圖片檔名 (如 water_dumplings.jpg)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingProduct.image_filename || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, image_filename: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">圖片網址 / 位置 (如 pic/P1001.jpg)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="form-control"
                                value={editingProduct.image_url || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
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
                                                setEditingProduct({ 
                                                    ...editingProduct, 
                                                    image_url: uploadedUrl,
                                                    image_filename: uploadedUrl
                                                });
                                                setTimeout(() => alert('商品圖片上傳成功！'), 100);
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
                        {editingProduct.image_url && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>圖片預覽：</span>
                                <img 
                                    key={editingProduct.image_url}
                                    src={editingProduct.image_url.startsWith('http') || editingProduct.image_url.startsWith('/') || editingProduct.image_url.startsWith('pic/') 
                                        ? (editingProduct.image_url.startsWith('pic/') ? '/' + editingProduct.image_url : editingProduct.image_url) 
                                        : ''} 
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
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>商品狀態</label>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, status: '上架' })}
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid ' + (editingProduct.status === '上架' ? '#bbf7d0' : '#d1d5db'),
                                    backgroundColor: editingProduct.status === '上架' ? '#dcfce7' : '#ffffff',
                                    color: editingProduct.status === '上架' ? '#15803d' : '#374151'
                                }}
                                disabled={isUploading}
                            >
                                上架
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, status: '下架' })}
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid ' + (editingProduct.status === '下架' ? '#fecaca' : '#d1d5db'),
                                    backgroundColor: editingProduct.status === '下架' ? '#fee2e2' : '#ffffff',
                                    color: editingProduct.status === '下架' ? '#b91c1c' : '#374151'
                                }}
                                disabled={isUploading}
                            >
                                下架
                            </button>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary" disabled={isUploading}>儲存修改</button>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isUploading}>取消</button>
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
    );
}
