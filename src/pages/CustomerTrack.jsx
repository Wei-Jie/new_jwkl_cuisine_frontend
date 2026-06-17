import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { customFetch, getProductName } from '../utils/helpers';

export default function CustomerTrack() {
    const [phone, setPhone] = useState('');
    const [orderId, setOrderId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [menuList, setMenuList] = useState([]);

    // 載入商品列表以供明細比對名稱與秤重判斷
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await customFetch('/api/v1/menus');
                if (res.ok) {
                    const data = await res.json();
                    const normalized = data.map(m => ({
                        ...m,
                        product_id: m.productId || m.product_id,
                        image_filename: m.imageFilename || m.image_filename
                    }));
                    setMenuList(normalized);
                }
            } catch (e) {
                console.error("無法獲取商品列表", e);
            }
        };
        fetchMenu();
    }, []);

    const handleTrack = async (e) => {
        e.preventDefault();
        setError('');
        setSearchResult(null);

        if (!phone || !orderId) { setError('請輸入手機與訂單編號！'); return; }
        if (!/^09\d{8}$/.test(phone)) { setError('手機格式不正確！'); return; }

        setIsLoading(true);
        try {
            const res = await customFetch(`/api/v1/orders/track?phone=${phone}&orderId=${orderId}`);
            if (res.ok) {
                const data = await res.json();
                const orderObj = data.order || {};
                const detailsArr = data.details || [];
                const normalized = {
                    ...orderObj,
                    order_id: orderObj.orderId || orderObj.order_id,
                    customer_name: orderObj.customerName || orderObj.customer_name,
                    amount: orderObj.amount,
                    delivery_date: orderObj.deliveryDate || orderObj.delivery_date,
                    payment_status: orderObj.paymentStatus || orderObj.payment_status,
                    status: orderObj.status,
                    details: detailsArr
                };
                setSearchResult(normalized);
            } else {
                throw new Error("查無此訂單！");
            }

        } catch (err) {
            // Mock 安全回退
            setTimeout(() => {
                setIsLoading(false);
                if (orderId === 'S000001') {
                    setSearchResult({
                        order_id: 'S000001',
                        customer_name: '測試王先生',
                        amount: 720,
                        status: '已接單',
                        payment_status: '已付款',
                        delivery_date: '2026/06/05'
                    });
                } else {
                    setError('查無此訂單，請再次確認電話與訂單編號是否正確！');
                }
            }, 800);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-layout container animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Search size={28} className="text-primary" />
                    <h2>🔍 預約訂單進度追蹤</h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    請輸入您預約時所填寫的手機號碼與專屬訂單編號，即可即時查詢私廚目前的排程製作狀態與收款狀態。
                </p>

                <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">顧客手機號碼</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入 10 碼行動電話 (如 0912345678)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.trim())}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">訂單編號 (流水號)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入 S 開頭的編號 (如 S000001)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value.trim())}
                        />
                    </div>

                    {error && <div className="cart-validation-error">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px', fontWeight: '600' }} disabled={isLoading}>
                        {isLoading ? '查詢中...' : '🔍 查詢最新狀態'}
                    </button>
                </form>

                {searchResult && (
                    <div className="card animate-fade-in" style={{ marginTop: '28px', backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', margin: '0' }}>
                            <CheckCircle size={18} /> 訂單查詢成功！
                        </h3>
                        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', marginTop: '8px' }}>
                            <div>訂單號碼：<strong>{searchResult.order_id}</strong></div>
                            <div>顧客名稱：{searchResult.customer_name}</div>
                            <div>合計金額：${searchResult.amount} 元</div>
                            <div>預定出貨/取貨日：{searchResult.delivery_date || '排程中'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                收款狀態：
                                <span className={`badge ${searchResult.payment_status === '已付款' ? 'badge-done' : 'badge-pending'}`}>
                                    {searchResult.payment_status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                預約狀態：
                                <span className={`badge ${searchResult.status === '已接單' ? 'badge-shipped' : searchResult.status === 'row已出貨' ? 'badge-shipped' : searchResult.status === '已出貨' ? 'badge-shipped' : 'badge-pending'}`}>
                                    {searchResult.status}
                                </span>
                            </div>

                            {/* 🍽️ 預約訂購明細列表 */}
                            {searchResult.details && searchResult.details.length > 0 && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-primary)' }}>🍽️ 預約訂購明細</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                                                <th style={{ padding: '6px 0' }}>品項</th>
                                                <th style={{ padding: '6px 0', textAlign: 'center', width: '60px' }}>數量</th>
                                                <th style={{ padding: '6px 0', textAlign: 'right', width: '100px' }}>金額</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResult.details.map((item, idx) => {
                                                const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === String(item.productId || item.product_id || '').trim().toLowerCase());
                                                const priceStr = menu?.price || '';
                                                const isWeight = priceStr.includes('*') || priceStr.includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id);
                                                const qtyDisplay = `${item.qty} 個`;
                                                
                                                let subtotalDisplay = `$${item.productTotalAmt}`;
                                                if (isWeight && (parseInt(item.productTotalAmt) === 0 || !item.productTotalAmt)) {
                                                    subtotalDisplay = '$0 (出貨前依製作後實際秤重計價)';
                                                }

                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px dashed #f2eee6' }}>
                                                        <td style={{ padding: '8px 0', color: '#2d2a26' }}>
                                                            {item.productName || item.product_name || getProductName(item.productId || item.product_id, menuList)}
                                                            {isWeight && item.productAmt > 0 && (
                                                                <span style={{ fontSize: '11px', color: '#8c857b', marginLeft: '6px' }}>
                                                                    ({item.productAmt}g)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#6b6151' }}>
                                                            {qtyDisplay}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '8px 0', 
                                                            textAlign: 'right', 
                                                            fontWeight: '600', 
                                                            color: isWeight && (!item.productAmt || parseInt(item.productAmt) === 0) ? '#d97706' : '#2d2a26',
                                                            fontSize: isWeight && (!item.productAmt || parseInt(item.productAmt) === 0) ? '11px' : '12px'
                                                        }}>
                                                            {subtotalDisplay}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
