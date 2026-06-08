import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { customFetch } from '../../utils/helpers';

export function AddMenuModal({
    show,
    onClose,
    newMenuForm,
    setNewMenuForm,
    onSubmit
}) {
    if (!show) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', margin: 'auto' }}>
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
                            <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px', height: '48px', margin: 0, fontSize: '13px' }}>
                                📁 上傳圖片
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        
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
                                                    setNewMenuForm({ 
                                                        ...newMenuForm, 
                                                        image_url: data.url,
                                                        image_filename: data.url
                                                    });
                                                    alert('商品圖片上傳成功！');
                                                } else {
                                                    alert('上傳失敗：' + (data.message || '未知錯誤'));
                                                }
                                            } else {
                                                const errTxt = await res.text();
                                                alert('上傳失敗，錯誤：' + errTxt);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('網路連線失敗，無法上傳圖片！');
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">確認新增</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>取消</button>
                    </div>
                </form>
            </div>
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
    if (!show) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
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
                            <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px', height: '48px', margin: 0, fontSize: '13px' }}>
                                📁 上傳圖片
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        
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
                                                    setEditingProduct({ 
                                                        ...editingProduct, 
                                                        image_url: data.url,
                                                        image_filename: data.url
                                                    });
                                                    alert('商品圖片上傳成功！');
                                                } else {
                                                    alert('上傳失敗：' + (data.message || '未知錯誤'));
                                                }
                                            } else {
                                                const errTxt = await res.text();
                                                alert('上傳失敗，錯誤：' + errTxt);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('網路連線失敗，無法上傳圖片！');
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
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
                            >
                                下架
                            </button>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">儲存修改</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>取消</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
