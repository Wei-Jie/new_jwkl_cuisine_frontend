import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Calendar, Phone, User, FileText, Send } from 'lucide-react';
import { customFetch } from '../utils/helpers';
import './ShoppingCart.css';

export default function ShoppingCart({
    cart,
    isOpen,
    onClose,
    onUpdateQty,
    onRemoveItem,
    onClearCart,
    minOrderAmount = 300,
    onSubmitOrder,
    onSectionChange
}) {
    // 預約單表單狀態
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [lineId, setLineId] = useState('');
    const [facebook, setFacebook] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [lineLink, setLineLink] = useState('https://line.me/ti/p/~wei750211');
    const [igLink, setIgLink] = useState('https://www.instagram.com/jwkl_cuisine/');

    // 💡 動態載入 LINE 與 IG 聯絡連結
    useEffect(() => {
        if (isOpen) {
            const fetchLinks = async () => {
                try {
                    const res = await customFetch('/api/v1/system-configs');
                    if (res.ok) {
                        const data = await res.json();
                        const line = data.find(c => c.configKey === 'LINE_LINK');
                        const ig = data.find(c => c.configKey === 'IG_LINK');
                        if (line && line.configValue) setLineLink(line.configValue);
                        if (ig && ig.configValue) setIgLink(ig.configValue);
                    }
                } catch (e) {
                    console.error('載入社群聯絡連結失敗，啟用本地預設回退設定。', e);
                }
            };
            fetchLinks();
        }
    }, [isOpen]);

    // 計算購物車總金額
    const totalAmount = cart.reduce((sum, item) => {
        const isWeightItem = String(item.price).includes('*') || String(item.price).includes('重量') || ['P3001', 'P3002'].includes(item.product_id);
        if (isWeightItem) return sum; // 秤重商品下單時小計為 0
        const priceNum = parseFloat(String(item.price).replace(/[$,]/g, ''));
        const cost = isNaN(priceNum) ? 0 : priceNum * item.qty;
        return sum + cost;
    }, 0);

    const hasWeightItem = cart.some(item => String(item.price).includes('*') || String(item.price).includes('重量'));

    const handleShopClick = () => {
        if (onSectionChange) {
            onSectionChange('menu');
        }
        onClose();
    };

    const handlePhoneChange = (val) => {
        // 手機防呆：只允許輸入數字，最大 10 碼
        const cleanVal = val.replace(/\D/g, '').slice(0, 10);
        setPhone(cleanVal);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        // 1. 欄位防呆
        if (!name.trim()) { setValidationError('請填寫姓名！'); return; }
        if (!phone.trim()) { setValidationError('請填寫手機號碼！'); return; }
        if (!/^09\d{8}$/.test(phone)) { setValidationError('手機格式不正確，應為 09 開頭的 10 位數字！'); return; }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setValidationError('電子郵件格式不正確，請重新填寫！');
            return;
        }
        
        // 起訂金額防呆已被管理員要求取消

        setIsSubmitting(true);
        try {
            // 組裝後端所需的送單 JSON payload (包含選填的社群資訊)
            const orderPayload = {
                customer_name: name.trim(),
                phone: phone.trim(),
                instagram: instagram.trim(),
                line_id: lineId.trim(),
                facebook: facebook.trim(),
                email: email.trim(),
                delivery_date: "",
                notes: notes.trim(),
                amount: totalAmount,
                items: cart.flatMap(item => {
                    const isWeightItem = String(item.price).includes('*') || String(item.price).includes('重量') || ['P3001', 'P3002'].includes(item.product_id);
                    if (isWeightItem) {
                        // 秤重商品：依照數量拆成多筆明細，每筆數量均為 1，克數/單價預設為 0
                        const subItems = [];
                        for (let i = 0; i < item.qty; i++) {
                            subItems.push({
                                product_id: item.product_id,
                                qty: 1,
                                product_amt: 0
                            });
                        }
                        return subItems;
                    } else {
                        return [{
                            product_id: item.product_id,
                            qty: item.qty,
                            product_amt: parseFloat(String(item.price).replace(/[$,]/g, '')) || 0
                        }];
                    }
                })
            };

            await onSubmitOrder(orderPayload);
            
            // 下單成功，清空表單
            setName('');
            setPhone('');
            setInstagram('');
            setLineId('');
            setFacebook('');
            setEmail('');
            setDeliveryDate('');
            setNotes('');
            onClearCart();
            onClose();
        } catch (err) {
            setValidationError(err.message || '預約下單失敗，請稍後再試！');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 防止背景滾動 (當購物車開啟時，鎖定手機版背景防止滑動混亂)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="cart-backdrop" onClick={onClose}>
            <div className="cart-panel animate-slide-in" onClick={(e) => e.stopPropagation()}>
                {/* 購物車頭部 */}
                <div className="cart-header">
                    <div className="header-title-wrap">
                        <ShoppingBag size={20} className="text-primary" />
                        <h2>您的預約購物車</h2>
                        <span className="cart-badge">{cart.length} 類品項</span>
                    </div>
                    <button className="cart-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* 購物車內容區 */}
                <div className="cart-body">
                    {cart.length === 0 ? (
                        <div className="empty-cart-view">
                            <ShoppingBag size={48} className="empty-icon" />
                            <p>您的購物車空空的，快去選購吧！</p>
                            <button className="btn btn-primary btn-sm btn-shop" onClick={handleShopClick}>
                                點我選購美食
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* 1. 品項清單 */}
                            <div className="cart-items-section">
                                <h3 className="section-title">🥘 已選購品項</h3>
                                <div className="cart-items-list">
                                    {cart.map((item) => {
                                        const displayPrice = String(item.price).includes('*') ? '秤重計價' : `$${item.price}`;
                                        return (
                                            <div className="cart-item-card" key={item.product_id}>
                                                <div className="item-info">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-price">{displayPrice}</span>
                                                </div>
                                                <div className="item-actions">
                                                    <div className="qty-controls">
                                                        <button 
                                                            className="qty-btn" 
                                                            onClick={() => onUpdateQty(item.product_id, item.qty - 1)}
                                                            disabled={item.qty <= 1}
                                                        >
                                                            <Minus size={13} />
                                                        </button>
                                                        <span className="qty-number">{item.qty}</span>
                                                        <button 
                                                            className="qty-btn" 
                                                            onClick={() => onUpdateQty(item.product_id, item.qty + 1)}
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        className="remove-item-btn"
                                                        onClick={() => onRemoveItem(item.product_id)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="cart-summary-bar">
                                    <span>小計金額：</span>
                                    <span className="summary-price">
                                        ${totalAmount.toLocaleString()}
                                        {hasWeightItem && <span className="weight-tip"> (未含秤重標的之最終金額)</span>}
                                    </span>
                                </div>
                                
                                {/* 起訂限額提示已被管理員要求取消 */}
                            </div>

                            {/* 2. 預約單表單 */}
                            <div className="cart-form-section">
                                <h3 className="section-title">👤 填寫預約與外送資訊</h3>
                                <form onSubmit={handleFormSubmit} className="cart-order-form">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <User size={13} /> 名稱 <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="請輸入您的名稱（暱稱或稱呼均可）"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Phone size={13} /> 手機號碼 <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="請輸入手機 (如 0912345678)"
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            ✉️ 電子郵件 (選填，填寫以接收進度 Email 通知)
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="請輸入電子郵件 (例如 example@gmail.com)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    {/* 社群聯絡管道 (選填欄位，為行動端精心排版為 3 欄並列) */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '11px' }}>Instagram (選填)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="@帳號"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                style={{ padding: '6px 8px', fontSize: '12px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '11px' }}>Line ID (選填)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Line ID"
                                                value={lineId}
                                                onChange={(e) => setLineId(e.target.value)}
                                                style={{ padding: '6px 8px', fontSize: '12px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '11px' }}>Facebook (選填)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="FB名稱"
                                                value={facebook}
                                                onChange={(e) => setFacebook(e.target.value)}
                                                style={{ padding: '6px 8px', fontSize: '12px' }}
                                            />
                                        </div>
                                    </div>



                                    <div className="form-group">
                                        <label className="form-label">
                                            <FileText size={13} /> 備註 (特殊需求、不辣、少油等)
                                        </label>
                                        <textarea
                                            className="form-control text-area"
                                            placeholder="若有特殊需求請留言於此..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    {validationError && (
                                        <div className="cart-validation-error">
                                            {validationError}
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary cart-submit-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            '送單處理中...'
                                        ) : (
                                            <>
                                                <Send size={15} /> 確認送出私廚預約單
                                            </>
                                        )}
                                    </button>
                                </form>
                                
                                {/* 💡 新增社群聯絡管道 */}
                                <div className="cart-contact-section">
                                    <div className="contact-divider">
                                        <span>有任何下單疑問？歡迎直接聯絡我們</span>
                                    </div>
                                    <div className="contact-buttons-grid">
                                        <a 
                                            href={lineLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="contact-btn contact-btn-line"
                                        >
                                            💬 點此聯絡 LINE 客服
                                        </a>
                                        <a 
                                            href={igLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="contact-btn contact-btn-ig"
                                        >
                                            📸 追蹤 Instagram 專頁
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
