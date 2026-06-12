import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { customFetch } from '../utils/helpers';

export default function ReceiptView() {
    const { orderId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [menuList, setMenuList] = useState([]);

    // 取得資料
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. 獲取選單項目 (用於顯示商品中文名稱)
                const menuRes = await customFetch('/api/v1/menus');
                if (menuRes.ok) {
                    const menus = await menuRes.json();
                    const normalized = menus.map(m => ({
                        ...m,
                        product_id: m.productId || m.product_id
                    }));
                    setMenuList(normalized);
                }

                // 2. 獲取去識別化後的公開安全對帳單資料
                const res = await customFetch(`/api/v1/orders/receipt/${orderId}`);
                if (!res.ok) {
                    throw new Error('查無此預約對帳單，請確認網址是否正確！');
                }
                const resData = await res.json();
                setData(resData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            loadData();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#faf8f5', color: '#b45309' }}>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #b45309', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>對帳單安全載入中...</div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#faf8f5', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>讀取失敗</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', maxWidth: '400px', margin: '0 0 20px 0' }}>
                    {error || '無法讀取訂單資訊，可能單號有誤。'}
                </p>
                <a href="/" style={{ color: '#b45309', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '1px solid #b45309', padding: '8px 16px', borderRadius: '20px' }}>
                    返回小灶私廚首頁
                </a>
            </div>
        );
    }

    const { order, details } = data;

    return (
        <div style={{ 
            backgroundColor: '#f6f4f0', 
            minHeight: '100vh', 
            padding: '40px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, "Microsoft JhengHei", sans-serif'
        }}>
            {/* 對帳單卡片 */}
            <div style={{ 
                maxWidth: '600px', 
                width: '100%', 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03)',
                border: '1px solid #ece6dc',
                overflow: 'hidden',
                marginBottom: '24px'
            }}>
                {/* 橘色漸層 Header */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #b45309, #d97706)', 
                    padding: '36px 20px', 
                    textAlign: 'center', 
                    color: '#ffffff' 
                }}>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', letterSpacing: '2px' }}>🥘 小灶私廚</h1>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>預約訂購對帳單 (線上即時版)</p>
                </div>

                {/* 對帳單內容區 */}
                <div style={{ padding: '30px 24px', color: '#4b5563', lineHeight: '1.6' }}>
                    <p style={{ fontSize: '15px', marginTop: 0, color: '#1f2937' }}>
                        親愛的 <strong>{order.customerName}</strong> 您好：
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
                        以下為您在小灶私廚的預約明細。此連結隨時提供最新製作進度查詢。
                    </p>

                    {/* 基本資訊 */}
                    <h3 style={{ color: '#b45309', borderBottom: '2px solid #ece6dc', paddingBottom: '8px', margin: '24px 0 12px 0', fontSize: '15px' }}>📋 訂單基本資訊</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: '14px', marginBottom: '24px' }}>
                        <div>
                            <span style={{ color: '#8c857b' }}>訂單編號：</span>
                            <strong style={{ color: '#1f2937' }}>{order.orderId}</strong>
                        </div>
                        <div>
                            <span style={{ color: '#8c857b' }}>下單日期：</span>
                            <span style={{ color: '#1f2937' }}>{order.orderDate}</span>
                        </div>
                        <div>
                            <span style={{ color: '#8c857b' }}>聯絡電話：</span>
                            <span style={{ color: '#1f2937' }}>{order.phone}</span>
                        </div>
                        <div>
                            <span style={{ color: '#8c857b' }}>訂單狀態：</span>
                            <span style={{ 
                                backgroundColor: order.status === '已結單' ? '#dcfce7' : '#fef3c7', 
                                color: order.status === '已結單' ? '#15803d' : '#b45309', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '12px', 
                                fontWeight: 'bold' 
                            }}>
                                {order.status === '已接單' ? '已接單 (製作中)' : order.status}
                            </span>
                        </div>
                    </div>

                    {/* 商品明細表格 */}
                    <h3 style={{ color: '#b45309', borderBottom: '2px solid #ece6dc', paddingBottom: '8px', margin: '24px 0 12px 0', fontSize: '15px' }}>🍳 訂購商品明細</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ background: '#fdfaf6', borderBottom: '2px solid #ece6dc', color: '#6b7280', textAlign: 'left', fontWeight: 'bold' }}>
                                <th style={{ padding: '10px 8px' }}>品項</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right', width: '100px' }}>單價/克數</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: '50px' }}>數量</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right', width: '90px' }}>小計</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((item, idx) => {
                                const menu = menuList.find(m => {
                                    const mId = m.productId || m.product_id;
                                    const iId = item.productId || item.product_id;
                                    return mId && iId && mId === iId;
                                });
                                const pName = item.productId === 'PROD_DISCOUNT' ? '🎁 折扣折抵' : (menu ? menu.name : item.productId);
                                const isDiscount = item.productId === 'PROD_DISCOUNT';
                                const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 8px', color: isDiscount ? '#16a34a' : '#1f2937', fontWeight: isDiscount ? 'bold' : 'normal' }}>
                                            {pName}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#6b7280' }}>
                                            {isDiscount ? '-' : (isWeight ? `${item.productAmt} g` : `$${item.productAmt}`)}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                                            {item.qty}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', color: isDiscount ? '#16a34a' : '#b45309', fontWeight: 'bold' }}>
                                            ${parseInt(item.productTotalAmt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* 總額 */}
                    <div style={{ textAlign: 'right', padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937', borderTop: '2px solid #ece6dc' }}>
                        總計金額：<span style={{ color: '#b45309', fontSize: '22px' }}>${parseInt(order.amount)}</span> 元
                    </div>

                    {/* 備註 */}
                    {order.notes && (
                        <div style={{ backgroundColor: '#fafaf9', borderLeft: '4px solid #d97706', padding: '12px 14px', marginTop: '20px', fontSize: '13px', borderRadius: '0 6px 6px 0', lineHeight: '1.5' }}>
                            <strong style={{ color: '#78350f' }}>備註說明：</strong>{order.notes}
                        </div>
                    )}
                </div>

                {/* 底部去識別說明 */}
                <div style={{ backgroundColor: '#faf8f5', borderTop: '1px solid #ece6dc', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
                    🔒 為保護您的個資安全，此頁面已自動將您的手機與聯絡管道去識別化遮蔽。<br/>
                    如有任何問題，請直接與小灶私廚聯絡。
                </div>
            </div>

            {/* 快速聯絡按鈕群 */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px', width: '100%' }}>
                <a href="https://line.me/ti/p/~@072qcqvn" target="_blank" rel="noreferrer" style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#06c755', color: '#ffffff', 
                    padding: '10px 20px', borderRadius: '24px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)'
                }}>
                    💬 聯絡 LINE 客服
                </a>
                <a href="https://www.instagram.com/jwkl_cuisine/" target="_blank" rel="noreferrer" style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#ffffff', 
                    padding: '10px 20px', borderRadius: '24px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)'
                }}>
                    📸 瀏覽 IG 粉絲團
                </a>
            </div>
        </div>
    );
}
