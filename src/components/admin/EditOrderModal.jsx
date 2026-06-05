import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function EditOrderModal({
    show,
    editingOrder,
    setEditingOrder,
    editingOrderItems,
    setEditingOrderItems,
    menuList,
    onClose,
    onItemAmtChange,
    onItemQtyChange,
    onItemStatusChange,
    onRemoveItem,
    onAddDiscount,
    onSave
}) {
    if (!show || !editingOrder) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container card" style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h3>✏️ 編輯訂單資訊：<strong>{editingOrder.order_id}</strong></h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                
                <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                    {/* 顧客基本資料 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">顧客姓名</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={editingOrder.customer_name || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })} 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">聯絡電話</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={editingOrder.phone || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} 
                                required
                            />
                        </div>
                    </div>

                    {/* 社群聯絡資料 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>LINE ID</span>
                                {editingOrder.line_id && (
                                    <a 
                                        href={`https://line.me/ti/p/~${editingOrder.line_id.trim()}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: '#06c755', fontWeight: 'bold', textDecoration: 'none', fontSize: '12px' }}
                                    >
                                        💬 聯絡 LINE
                                    </a>
                                )}
                            </label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={editingOrder.line_id || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, line_id: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={editingOrder.instagram || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, instagram: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Facebook</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={editingOrder.facebook || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, facebook: e.target.value })} 
                            />
                        </div>
                    </div>

                    {/* 訂單主檔其它資訊 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">預約出貨/自取日期</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={editingOrder.delivery_date ? editingOrder.delivery_date.replace(/\//g, '-') : ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, delivery_date: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">聯絡電子郵件 (Email)</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={editingOrder.email || ''} 
                                onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">付款狀態</label>
                            <select 
                                className="form-control" 
                                style={{ height: '48px' }}
                                value={editingOrder.payment_status || '未付款'} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
                                    setEditingOrder({ 
                                        ...editingOrder, 
                                        payment_status: val,
                                        payment_date: val === 'Spacer' || val === '已付款' ? today : ''
                                    });
                                }}
                            >
                                <option value="未付款">未付款</option>
                                <option value="Spacer" style={{ display: 'none' }}></option>
                                <option value="已付款">已付款</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">收款日期</label>
                            <input 
                                type="date" 
                                className="form-control"
                                style={{ height: '48px' }}
                                value={editingOrder.payment_date ? editingOrder.payment_date.replace(/\//g, '-') : ''}
                                onChange={(e) => setEditingOrder({ ...editingOrder, payment_date: e.target.value ? e.target.value.replace(/-/g, '/') : '' })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">預約單狀態</label>
                            <select 
                                className="form-control" 
                                style={{ height: '48px' }}
                                value={editingOrder.status || '待確認'} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingOrder({ ...editingOrder, status: val });
                                    if (val === '已出貨' || val === '已完成') {
                                        setEditingOrderItems(prev => prev.map(item => {
                                            const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
                                            if (isDiscount) return item;
                                            return {
                                                ...item,
                                                itemStatus: '已完成',
                                                item_status: 'processed' in item || 'item_status' in item ? '已完成' : '已完成'
                                            };
                                        }));
                                    }
                                }}
                            >
                                <option value="待確認">待確認</option>
                                <option value="已接單">已接單 (待排程)</option>
                                <option value="已出貨">已出貨</option>
                                <option value="已完成">已完成 (已結單)</option>
                                <option value="已退回">已退回</option>
                                <option value="已取消">已取消</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">訂單備註</label>
                        <textarea 
                            className="form-control" 
                            value={editingOrder.notes || ''} 
                            onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })} 
                            rows={2}
                        />
                    </div>

                    {/* 🍽️ 訂單品項明細表格 */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>🍽️ 訂購品項排程與計價明細</h4>
                            <button 
                                type="button" 
                                className="btn btn-outline btn-sm" 
                                onClick={onAddDiscount}
                                style={{ height: '30px', width: 'auto' }}
                            >
                                🎁 新增折扣折抵項目
                            </button>
                        </div>
                        
                        <div className="responsive-table-wrap">
                            <table className="admin-table" style={{ fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th>品項</th>
                                        <th style={{ width: '130px' }}>單價 / 重量(g)</th>
                                        <th style={{ width: '90px' }}>數量</th>
                                        <th style={{ width: '100px' }}>小計</th>
                                        <th style={{ width: '140px' }}>製作狀態</th>
                                        <th style={{ width: '50px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editingOrderItems.map((item, idx) => {
                                        const menu = menuList.find(m => m.product_id === item.productId || m.product_id === item.product_id);
                                        const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
                                        const isWeightItem = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

                                        return (
                                            <tr key={idx}>
                                                <td data-label="品項">
                                                    {isDiscount ? (
                                                        <strong style={{ color: 'var(--color-success)' }}>🎁 折扣折抵</strong>
                                                    ) : (
                                                        <span>{menu?.name || item.productId}</span>
                                                    )}
                                                </td>
                                                <td data-label="單價 / 重量(g)">
                                                    {isDiscount ? (
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-sm"
                                                            style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}
                                                            value={item.productAmt || 0}
                                                            onChange={(e) => onItemAmtChange(idx, e.target.value)}
                                                        />
                                                    ) : isWeightItem ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-sm"
                                                                style={{ width: '100px', fontWeight: 'bold', height: '32px' }}
                                                                value={item.productAmt || 0}
                                                                onChange={(e) => onItemAmtChange(idx, e.target.value)}
                                                                min={0}
                                                                placeholder="輸入克數(g)"
                                                            />
                                                            <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>
                                                                ⚖️ 待製作後秤重
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span>${item.productAmt} 元</span>
                                                    )}
                                                </td>
                                                <td data-label="數量">
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-sm"
                                                        value={item.qty}
                                                        onChange={(e) => onItemQtyChange(idx, e.target.value)}
                                                        disabled={isDiscount || isWeightItem}
                                                        min={1}
                                                    />
                                                </td>
                                                <td data-label="小計" style={{ fontWeight: 'bold', color: item.productTotalAmt < 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                                                    ${item.productTotalAmt} 元
                                                </td>
                                                <td data-label="製作狀態">
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={item.itemStatus || item.item_status || '待製作'}
                                                        onChange={(e) => onItemStatusChange(idx, e.target.value)}
                                                        disabled={isDiscount}
                                                    >
                                                        <option value="待製作">⏳ 待排程</option>
                                                        <option value="已完成">✅ 已完成</option>
                                                    </select>
                                                </td>
                                                <td data-label="操作">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-danger" 
                                                        onClick={() => onRemoveItem(idx)}
                                                        style={{ padding: '2px 8px', minHeight: '26px' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '15px', fontWeight: 'bold' }}>
                            計算後訂單總金額：<span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>${editingOrder.amount}</span> 元
                        </div>
                    </div>

                    {/* Modal 底部按鈕 */}
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary">💾 儲存訂單與排程變更</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>取消</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
