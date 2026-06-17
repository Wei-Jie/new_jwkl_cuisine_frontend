import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getProductName } from '../../utils/helpers';

export default function ShareReceiptModal({ isOpen, onClose, order, orderItems, menuList }) {
    const canvasRef = useRef(null);

    if (!isOpen || !order) return null;

    const orderId = order.order_id || order.orderId;
    const customerName = order.customer_name || order.customerName;
    const phone = order.phone;
    const orderDate = order.order_date || order.orderDate;
    const notes = order.notes || '';
    const totalAmount = order.amount || 0;

    // 取得明細
    const items = orderItems.filter(oi => oi.orderId === orderId || oi.order_id === orderId);

    // LINE 文字格式化生成
    const generateLineText = () => {
        let text = `🥘【小灶私廚】預約明細通知！🎉\n`;
        text += `=========================\n`;
        text += ` 訂單號碼：${orderId}\n`;
        text += ` 訂購日期：${orderDate}\n`;
        text += `-------------------------\n`;
        text += ` 顧客名稱：${customerName}\n`;
        text += ` 聯絡電話：${phone}\n`;
        if (order.instagram) text += ` Instagram：${order.instagram}\n`;
        if (order.lineId || order.line_id) text += ` Line ID：${order.lineId || order.line_id}\n`;
        if (order.facebook) text += ` Facebook：${order.facebook}\n`;
        text += `=========================\n`;
        text += ` 🍽️ 訂購明細：\n`;

        items.forEach(item => {
            const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === String(item.productId || item.product_id || '').trim().toLowerCase());
            const pName = item.productName || item.product_name || getProductName(item.productId || item.product_id, menuList);
            const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
            
            if (isDiscount) {
                text += `  - 🎁 折扣折抵 (-$${Math.abs(item.productTotalAmt)})\n`;
            } else {
                const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;
                if (isWeight) {
                    text += `  - ${pName} x${item.qty} (${item.productAmt}g: $${item.productTotalAmt})\n`;
                } else {
                    text += `  - ${pName} x${item.qty} ($${item.productTotalAmt})\n`;
                }
            }
        });

        text += `=========================\n`;
        text += ` 💰 總估計金額：$${parseInt(totalAmount)} 元\n`;
        if (notes.trim()) text += ` 📝 備註事項：${notes.trim()}\n`;
        text += `=========================\n`;
        text += `🔗 線上對帳單隨時查：\n`;
        text += `${window.location.origin}/#/receipt/${orderId}\n`;
        text += `感謝您的訂購，期待為您服務！👩‍🍳`;
        return text;
    };

    // 複製 LINE 文字
    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(generateLineText());
            alert('📋 LINE 文字明細複製成功！可以直接貼上傳送給客戶囉！');
        } catch (err) {
            alert('複製失敗，請手動複製文字區內容。');
        }
    };

    // 複製網址
    const handleCopyUrl = async () => {
        try {
            const url = `${window.location.origin}/#/receipt/${orderId}`;
            await navigator.clipboard.writeText(url);
            alert('🔗 線上對帳單連結複製成功！');
        } catch (err) {
            alert('複製網址失敗');
        }
    };

    // 下載 PNG 圖片 (利用 HTML5 Canvas 繪製精緻 of 預約收據卡片)
    const handleDownloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 動態計算高度
        const rowHeight = 40;
        const itemsHeight = items.length * rowHeight;
        const notesLinesCount = notes ? Math.ceil(notes.length / 20) : 0;
        const notesHeight = notesLinesCount * 22;
        const totalHeight = 460 + itemsHeight + notesHeight;

        canvas.width = 600;
        canvas.height = totalHeight;

        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(0, 0, 600, totalHeight);

        const gradient = ctx.createLinearGradient(0, 0, 600, 0);
        gradient.addColorStop(0, '#b45309');
        gradient.addColorStop(1, '#d97706');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 110);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 26px "Microsoft JhengHei", sans-serif';
        ctx.fillText('🥘 小 灶 私 廚', 300, 48);

        ctx.font = '14px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('預 約 訂 購 對 帳 單 Receipt', 300, 80);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#1f2937';

        ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.fillText(`訂單編號：${orderId}`, 40, 160);
        ctx.fillText(`下單日期：${orderDate}`, 40, 190);
        ctx.fillText(`顧客姓名：${customerName}`, 40, 220);
        
        ctx.textAlign = 'right';
        ctx.fillText(`聯絡電話：${phone}`, 560, 160);
        ctx.fillText(`付款狀態：${order.payment_status || '未付款'}`, 560, 190);
        
        ctx.strokeStyle = '#ece6dc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, 245);
        ctx.lineTo(560, 245);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.fillText('品項', 40, 275);
        
        ctx.textAlign = 'right';
        ctx.fillText('單價/克數', 360, 275);
        ctx.fillText('數量', 460, 275);
        ctx.fillText('小計', 560, 275);

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 290);
        ctx.lineTo(560, 290);
        ctx.stroke();

        let currentY = 325;
        ctx.font = '14px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = '#374151';

        items.forEach((item, index) => {
            const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === String(item.productId || item.product_id || '').trim().toLowerCase());
            const pName = item.productName || item.product_name || getProductName(item.productId || item.product_id, menuList);
            const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
            const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

            ctx.textAlign = 'left';
            ctx.fillStyle = isDiscount ? '#16a34a' : '#1f2937';
            ctx.fillText(pName, 40, currentY);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#4b5563';
            if (isDiscount) {
                ctx.fillText('-', 360, currentY);
            } else if (isWeight) {
                ctx.fillText(`${item.productAmt} g`, 360, currentY);
            } else {
                ctx.fillText(`$${item.productAmt}`, 360, currentY);
            }

            ctx.fillText(`${item.qty}`, 460, currentY);

            ctx.fillStyle = isDiscount ? '#16a34a' : '#b45309';
            ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
            ctx.fillText(`$${parseInt(item.productTotalAmt)}`, 560, currentY);

            ctx.strokeStyle = '#f5f2eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(40, currentY + 12);
            ctx.lineTo(560, currentY + 12);
            ctx.stroke();

            ctx.font = '14px "Microsoft JhengHei", sans-serif';
            currentY += rowHeight;
        });

        ctx.textAlign = 'right';
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.fillText(`總金額：`, 440, currentY + 25);
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
        ctx.fillText(`$${parseInt(totalAmount)}`, 560, currentY + 25);

        if (notes.trim()) {
            const noteY = currentY + 70;
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(40, noteY - 15);
            ctx.lineTo(40, noteY + notesHeight - 5);
            ctx.stroke();

            ctx.fillStyle = '#78350f';
            ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('備註事項：', 50, noteY - 3);

            ctx.fillStyle = '#4b5563';
            ctx.font = '13px "Microsoft JhengHei", sans-serif';
            const maxChars = 32;
            for (let i = 0; i < notesLinesCount; i++) {
                const lineText = notes.substring(i * maxChars, (i + 1) * maxChars);
                ctx.fillText(lineText, 50, noteY + 18 + i * 22);
            }
        }

        const footerY = totalHeight - 35;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('本收據由小灶私廚系統自動產生，歡迎使用線上對帳連結隨時追蹤進度。', 300, footerY);

        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `小灶私廚_對帳單_${orderId}.png`;
        link.href = image;
        link.click();
    };

    return createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-container" style={{ maxWidth: '650px', width: '90%' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #ece6dc', padding: '16px 20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📤 分享與對帳單圖卡預覽
                    </h3>
                    <button className="close-btn" onClick={onClose} style={{ fontSize: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button>
                </div>

                <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                        <button className="btn btn-primary" onClick={handleCopyText} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px' }}>
                            📋 複製 LINE 文字
                        </button>
                        <button className="btn btn-outline" onClick={handleCopyUrl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                            🔗 複製對帳網址
                        </button>
                        <button className="btn btn-success" onClick={handleDownloadImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '10px', backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff' }}>
                            🖼️ 下載明細圖片
                        </button>
                    </div>

                    <div style={{ 
                        border: '1px solid #ece6dc', 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        backgroundColor: '#ffffff'
                    }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #b45309, #d97706)', 
                            padding: '24px 20px', 
                            textAlign: 'center', 
                            color: '#ffffff' 
                        }}>
                            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>🥘 小灶私廚</h2>
                            <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.9 }}>預約訂購對帳單 (線上對帳版)</p>
                        </div>

                        <div style={{ padding: '24px 20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                                <div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>訂單編號</div>
                                    <strong style={{ color: '#1f2937' }}>{orderId}</strong>
                                </div>
                                <div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>下單日期</div>
                                    <strong style={{ color: '#1f2937' }}>{orderDate}</strong>
                                </div>
                                <div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>顧客名稱</div>
                                    <strong style={{ color: '#1f2937' }}>{customerName}</strong>
                                </div>
                                <div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>聯絡電話</div>
                                    <strong style={{ color: '#1f2937' }}>{phone}</strong>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ece6dc', color: '#6b7280', textAlign: 'left', fontWeight: 'bold' }}>
                                        <th style={{ padding: '8px 4px' }}>品項</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'right', width: '100px' }}>單價/克數</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'center', width: '50px' }}>數量</th>
                                        <th style={{ padding: '8px 4px', textAlign: 'right', width: '80px' }}>小計</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === String(item.productId || item.product_id || '').trim().toLowerCase());
                                        const pName = item.productName || item.product_name || getProductName(item.productId || item.product_id, menuList);
                                        const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
                                        const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '10px 4px', color: isDiscount ? '#16a34a' : '#1f2937', fontWeight: isDiscount ? 'bold' : 'normal' }}>
                                                    {pName}
                                                </td>
                                                <td style={{ padding: '10px 4px', textAlign: 'right', color: '#6b7280' }}>
                                                    {isDiscount ? '-' : (isWeight ? `${item.productAmt} g` : `$${item.productAmt}`)}
                                                </td>
                                                <td style={{ padding: '10px 4px', textAlign: 'center', color: '#6b7280' }}>
                                                    {item.qty}
                                                </td>
                                                <td style={{ padding: '10px 4px', textAlign: 'right', color: isDiscount ? '#16a34a' : '#b45309', fontWeight: 'bold' }}>
                                                    ${parseInt(item.productTotalAmt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div style={{ textAlign: 'right', padding: '10px 0', fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>
                                總計金額：<span style={{ color: '#b45309', fontSize: '20px' }}>${parseInt(totalAmount)}</span> 元
                            </div>

                            {notes.trim() && (
                                <div style={{ backgroundColor: '#fafaf9', borderLeft: '4px solid #d97706', padding: '10px 12px', marginTop: '14px', fontSize: '12px', borderRadius: '0 4px 4px 0' }}>
                                    <strong style={{ color: '#78350f' }}>備註：</strong>{notes}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="modal-footer" style={{ borderTop: '1px solid #ece6dc', padding: '12px 20px', textAlign: 'right' }}>
                    <button className="btn btn-outline" onClick={onClose} style={{ minHeight: '36px', minWidth: '80px' }}>
                        關閉
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
