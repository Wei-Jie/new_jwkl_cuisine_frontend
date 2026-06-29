import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ShareReceiptModal from './ShareReceiptModal';
import { getProductName, customFetch } from '../../utils/helpers';

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
    const [showShareModal, setShowShareModal] = useState(false);
    const [boxes, setBoxes] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);

    useEffect(() => {
        if (show) {
            const fetchBoxes = async () => {
                try {
                    const res = await customFetch('/api/v1/shipping/boxes');
                    if (res.ok) {
                        const data = await res.json();
                        setBoxes(data);
                    }
                } catch (e) {
                    console.error("無法取得箱型清單", e);
                }
            };
            fetchBoxes();
            setRecommendation(null);
        }
    }, [show]);

    const runCalculation = async () => {
        const carrier = editingOrder.shippingCarrier || editingOrder.shipping_carrier;
        if (!carrier) {
            alert("請先選擇物流商（黑貓或7-11）！");
            return;
        }
        setCalcLoading(true);
        try {
            const res = await customFetch('/api/v1/shipping/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: editingOrder.order_id,
                    carrier: carrier
                })
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendation(data);
            } else {
                const err = await res.text();
                alert("試算失敗：" + err);
            }
        } catch (e) {
            alert("試算發生異常錯誤");
        } finally {
            setCalcLoading(false);
        }
    };

    const applyRecommendation = () => {
        if (!recommendation) return;
        setEditingOrder({
            ...editingOrder,
            shippingBoxId: recommendation.recommendedBoxId,
            shipping_box_id: recommendation.recommendedBoxId,
            shippingFee: recommendation.suggestedFee,
            shipping_fee: recommendation.suggestedFee
        });
    };

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
                                value={editingOrder.payment_date ? editingOrder.payment_date.replace(/\//g, '-') : ''}
                                onChange={(e) => setEditingOrder({ ...editingOrder, payment_date: e.target.value ? e.target.value.replace(/-/g, '/') : '' })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">預約單狀態</label>
                            <select 
                                className="form-control" 
                                value={editingOrder.status || '待確認'} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingOrder({ ...editingOrder, status: val });
                                    if (val === '已完成' || val === '已出貨' || val === '已結單') {
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
                                <option value="已完成">已完成</option>
                                <option value="已出貨">已出貨</option>
                                <option value="已結單">已結單</option>
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

                    {/* 📦 配送與運費管理區塊 */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)' }}>📦 配送與運費設定</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">取貨方式</label>
                                <select
                                    className="form-control"
                                    value={editingOrder.shippingMethod || editingOrder.shipping_method || ''}
                                    onChange={(e) => {
                                        const method = e.target.value;
                                        let carrier = null;
                                        if (method === 'home_delivery') carrier = 'black_cat';
                                        if (method === 'store_pickup') carrier = 'seven_eleven';
                                        setEditingOrder({
                                            ...editingOrder,
                                            shippingMethod: method,
                                            shipping_method: method,
                                            shippingCarrier: carrier,
                                            shipping_carrier: carrier,
                                            // 清除其它無關的欄位
                                            ...(method === 'face_to_face' ? { recipientAddress: '', recipient_address: '' } : {})
                                        });
                                        setRecommendation(null);
                                    }}
                                >
                                    <option value="">-- 請選擇 --</option>
                                    <option value="face_to_face">🤝 面交</option>
                                    <option value="home_delivery">🚚 宅配</option>
                                    <option value="store_pickup">🏪 店到店</option>
                                </select>
                            </div>

                            {((editingOrder.shippingMethod || editingOrder.shipping_method) === 'home_delivery' ||
                              (editingOrder.shippingMethod || editingOrder.shipping_method) === 'store_pickup') && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">物流商</label>
                                        <select
                                            className="form-control"
                                            value={editingOrder.shippingCarrier || editingOrder.shipping_carrier || ''}
                                            onChange={(e) => {
                                                setEditingOrder({
                                                    ...editingOrder,
                                                    shippingCarrier: e.target.value,
                                                    shipping_carrier: e.target.value
                                                });
                                                setRecommendation(null);
                                            }}
                                        >
                                            <option value="black_cat">🐱 黑貓冷凍宅配</option>
                                            <option value="seven_eleven">🏪 7-11 冷凍店到店</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">貨運追蹤單號</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editingOrder.trackingNumber || editingOrder.tracking_number || ''}
                                            onChange={(e) => setEditingOrder({
                                                ...editingOrder,
                                                trackingNumber: e.target.value,
                                                tracking_number: e.target.value
                                            })}
                                            placeholder="出貨後填寫"
                                        />
                                    </div>
                                </>
                            )}

                            {(editingOrder.shippingMethod || editingOrder.shipping_method) === 'face_to_face' && (
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">面交地點</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingOrder.storeName || editingOrder.store_name || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            storeName: e.target.value,
                                            store_name: e.target.value
                                        })}
                                        placeholder="例如：安康麥當勞"
                                    />
                                </div>
                            )}
                        </div>

                        {/* 配送詳細資訊 */}
                        {((editingOrder.shippingMethod || editingOrder.shipping_method) === 'home_delivery' ||
                          (editingOrder.shippingMethod || editingOrder.shipping_method) === 'store_pickup') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">收件人姓名</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingOrder.recipientName || editingOrder.recipient_name || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            recipientName: e.target.value,
                                            recipient_name: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">收件人電話</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingOrder.recipientPhone || editingOrder.recipient_phone || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            recipientPhone: e.target.value,
                                            recipient_phone: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        {(editingOrder.shippingCarrier || editingOrder.shipping_carrier) === 'seven_eleven' ? '7-11 門市名稱' : '收件地址'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={(editingOrder.shippingCarrier || editingOrder.shipping_carrier) === 'seven_eleven'
                                            ? (editingOrder.storeName || editingOrder.store_name || '')
                                            : (editingOrder.recipientAddress || editingOrder.recipient_address || '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if ((editingOrder.shippingCarrier || editingOrder.shipping_carrier) === 'seven_eleven') {
                                                setEditingOrder({ ...editingOrder, storeName: val, store_name: val });
                                            } else {
                                                setEditingOrder({ ...editingOrder, recipientAddress: val, recipient_address: val });
                                            }
                                        }}
                                        placeholder={(editingOrder.shippingCarrier || editingOrder.shipping_carrier) === 'seven_eleven' ? '請輸入門市名稱' : '請輸入完整地址'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 裝箱試算與運費選擇 */}
                        {((editingOrder.shippingMethod || editingOrder.shipping_method) === 'home_delivery' ||
                          (editingOrder.shippingMethod || editingOrder.shipping_method) === 'store_pickup') && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>🤖 系統裝箱與運費試算建議</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={runCalculation}
                                        disabled={calcLoading}
                                        style={{ height: '28px', width: 'auto', fontSize: '12px', padding: '0 8px' }}
                                    >
                                        {calcLoading ? '🔄 計算中...' : '🔄 執行裝箱試算'}
                                    </button>
                                </div>

                                {recommendation && (
                                    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>建議箱型：<strong>{recommendation.recommendedBoxName}</strong></span>
                                            <span>估計運費：<strong>${recommendation.suggestedFee} 元</strong></span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                            總點數：{recommendation.totalPoints} 點 | 總重量：{(recommendation.totalWeightG / 1000).toFixed(2)} kg
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold' }}>
                                            ⚠️ 運費試算僅供參考，實際運費請以店家告知最終結果為主。
                                        </div>
                                        {recommendation.warnings && recommendation.warnings.map((w, idx) => (
                                            <div key={idx} style={{ color: '#b45309', fontSize: '11px', display: 'flex', gap: '4px' }}>
                                                ⚠️ {w}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={applyRecommendation}
                                            style={{ height: '26px', fontSize: '11px', width: 'auto', marginTop: '4px' }}
                                        >
                                            套用建議箱型與運費
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label" style={{ fontSize: '12px' }}>使用箱型選擇</label>
                                        <select
                                            className="form-control form-control-sm"
                                            value={editingOrder.shippingBoxId || editingOrder.shipping_box_id || ''}
                                            onChange={(e) => {
                                                const boxId = e.target.value ? parseInt(e.target.value) : null;
                                                const selectedBox = boxes.find(b => b.id === boxId);
                                                setEditingOrder({
                                                    ...editingOrder,
                                                    shippingBoxId: boxId,
                                                    shipping_box_id: boxId,
                                                    shippingFee: selectedBox ? selectedBox.price : 0,
                                                    shipping_fee: selectedBox ? selectedBox.price : 0
                                                });
                                            }}
                                        >
                                            <option value="">-- 請選擇箱型 --</option>
                                            {boxes
                                                .filter(b => b.carrier === (editingOrder.shippingCarrier || editingOrder.shipping_carrier))
                                                .map(b => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name} (${b.price}元 / 容量上限:{b.maxPoints}點)
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label" style={{ fontSize: '12px' }}>最終運費 (可覆蓋)</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={editingOrder.shippingFee !== undefined && editingOrder.shippingFee !== null ? editingOrder.shippingFee : (editingOrder.shipping_fee || 0)}
                                            onChange={(e) => setEditingOrder({
                                                ...editingOrder,
                                                shippingFee: parseInt(e.target.value) || 0,
                                                shipping_fee: parseInt(e.target.value) || 0
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
                                        const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === String(item.productId || item.product_id || '').trim().toLowerCase());
                                        const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
                                        const isWeightItem = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

                                        return (
                                            <tr key={idx}>
                                                <td data-label="品項">
                                                    {isDiscount ? (
                                                        <strong style={{ color: 'var(--color-success)' }}>🎁 折扣折抵</strong>
                                                    ) : (
                                                        <span>{item.productName || item.product_name || getProductName(item.productId || item.product_id, menuList)}</span>
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
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={() => setShowShareModal(true)} 
                            style={{ marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                            📤 分享與下載對帳單
                        </button>
                        <button type="submit" className="btn btn-primary">💾 儲存訂單與排程變更</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>取消</button>
                    </div>
                </form>
            </div>
            
            {/* 分享與對帳單 Modal */}
            <ShareReceiptModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                order={editingOrder} 
                orderItems={editingOrderItems} 
                menuList={menuList} 
            />
        </div>,
        document.body
    );
}
