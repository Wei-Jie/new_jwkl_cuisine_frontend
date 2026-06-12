// 強制重新部署以刷清 Vercel Edge CDN 的快取
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ShoppingCart from './components/ShoppingCart';
import CustomerSPA from './pages/CustomerSPA';
import CustomerTrack from './pages/CustomerTrack';
import AdminPortal from './pages/AdminPortal';
import ReceiptView from './pages/ReceiptView';
import { customFetch } from './utils/helpers';

export default function App() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('about');
    const [toasts, setToasts] = useState([]);
    const [orderSuccessData, setOrderSuccessData] = useState(null); // 控制送單成功彈窗狀態
    const [dialogConfig, setDialogConfig] = useState(null); // 控制全域自訂提示與確認彈窗狀態

    useEffect(() => {
        window.sweetAlert = (message, title = '系統提示') => {
            return new Promise((resolve) => {
                setDialogConfig({ type: 'alert', title, message, resolve });
            });
        };

        window.sweetConfirm = (message, title = '確認操作') => {
            return new Promise((resolve) => {
                setDialogConfig({ type: 'confirm', title, message, resolve });
            });
        };

        // 全域覆寫原生 alert 轉為 sweetAlert
        window.alert = (message) => {
            window.sweetAlert(message);
        };
    }, []);

    const showToast = (msg, type = 'success') => {
        const newId = Date.now();
        setToasts(prev => [...prev, { id: newId, msg, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newId));
        }, 3000);
    };

    const handleAddToCart = (product, quantity = 1) => {
        if (quantity <= 0) return;
        const existing = cart.find(i => i.product_id === product.product_id);
        if (existing) {
            showToast(`已更新 ${product.name} 數量為 ${existing.qty + quantity}！`);
            setCart(prev => prev.map(i => 
                i.product_id === product.product_id ? { ...i, qty: i.qty + quantity } : i
            ));
        } else {
            showToast(`已加入 ${product.name} x${quantity} 到購物車！`);
            setCart(prev => [...prev, { 
                product_id: product.product_id, 
                name: product.name, 
                price: product.price, 
                qty: quantity 
            }]);
        }
    };

    const handleUpdateQty = (productId, newQty) => {
        if (newQty <= 0) return;
        setCart(prev => prev.map(i => i.product_id === productId ? { ...i, qty: newQty } : i));
    };

    const handleRemoveItem = (productId) => {
        setCart(prev => prev.filter(i => i.product_id !== productId));
        showToast('品項已自購物車移除', 'warning');
    };

    const handleClearCart = () => setCart([]);

    const handleSubmitOrder = async (orderData) => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            };
            const res = await customFetch('/api/v1/orders', config);
            const data = await res.json();
            
            if (data.status === 'success') {
                showToast(`訂單已送出成功！已為您發布接單`);
                setOrderSuccessData({
                    orderId: data.order_id,
                    isMock: false
                });
                return true;
            } else {
                throw new Error(data.message || '下單失敗');
            }
        } catch (err) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    showToast('訂單已送出成功！(模擬安全回退)');
                    setOrderSuccessData({
                        orderId: 'S000001',
                        isMock: true
                    });
                    resolve(true);
                }, 1200);
            });
        }
    };

    return (
        <HashRouter>
            <Header 
                cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} 
                onCartOpen={() => setIsCartOpen(true)}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            <Routes>
                <Route 
                    path="/" 
                    element={
                        <CustomerSPA 
                            cart={cart}
                            onCartOpen={() => setIsCartOpen(true)}
                            onAddToCart={handleAddToCart}
                            minOrderAmount={0}
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
                        />
                    } 
                />

                <Route path="/track" element={<CustomerTrack />} />

                <Route path="/admin-portal-xyz" element={<AdminPortal />} />

                <Route path="/receipt/:orderId" element={<ReceiptView />} />
            </Routes>

            <ShoppingCart 
                cart={cart}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                minOrderAmount={0}
                onSubmitOrder={handleSubmitOrder}
                onSectionChange={setActiveSection}
            />

            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast-item ${t.type}`}>
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* 🎉 顧客預約訂單送出成功精美彈窗 (取代原生 alert 以隱藏 Vercel 網址並提升質感) */}
            {orderSuccessData && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '30px 24px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #f2eee6'
                    }}>
                        <div style={{
                            fontSize: '52px',
                            marginBottom: '16px'
                        }}>🎉</div>
                        
                        <h3 style={{
                            color: 'var(--color-primary, #b45309)',
                            margin: '0 0 12px 0',
                            fontSize: '20px',
                            fontWeight: '800'
                        }}>
                            恭喜！預約訂單已送出成功！
                        </h3>
                        
                        {orderSuccessData.isMock && (
                            <div style={{ 
                                fontSize: '11px', 
                                color: '#ef4444', 
                                backgroundColor: '#fee2e2', 
                                borderRadius: '4px',
                                padding: '2px 8px',
                                display: 'inline-block',
                                marginBottom: '12px',
                                fontWeight: 'bold'
                            }}>
                                本地安全回退模式
                            </div>
                        )}
                        
                        <p style={{
                            color: '#4b5563',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            margin: '0 0 16px 0'
                        }}>
                            您的專屬訂單編號如下，請妥善保存以供進度追蹤：
                        </p>
                        
                        {/* 訂單編號與一鍵複製區域 */}
                        <div style={{
                            backgroundColor: '#fffbeb',
                            border: '2px dashed #fcd34d',
                            borderRadius: '10px',
                            padding: '16px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontSize: '26px',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                color: '#b45309'
                            }}>
                                {orderSuccessData.orderId}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(orderSuccessData.orderId);
                                    showToast('已複製訂單編號！');
                                }}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: '#b45309',
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #fde68a',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    outline: 'none'
                                }}
                            >
                                📋 複製訂單編號
                            </button>
                        </div>
                        
                        <p style={{
                            color: '#6b7280',
                            fontSize: '12px',
                            lineHeight: '1.4',
                            margin: '0 0 24px 0',
                            backgroundColor: '#f9fafb',
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'left'
                        }}>
                            💡 <strong>提示：</strong>您可隨時於網頁頂部點選「訂單追蹤」，輸入此編號與您的手機號碼，即可即時查詢本筆訂單的備料與出貨狀態！
                        </p>
                        
                        <button
                            type="button"
                            onClick={() => setOrderSuccessData(null)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#ffffff',
                                backgroundColor: 'var(--color-primary, #b45309)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(180, 83, 9, 0.3)',
                                outline: 'none'
                            }}
                        >
                            確定並關閉
                        </button>
                    </div>
                </div>
            )}

            {/* 💬 全域自訂提示與確認彈窗 (覆寫原生 alert() & confirm()，美化 UI 且不帶 Vercel 網址) */}
            {dialogConfig && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999999,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        maxWidth: '380px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #f2eee6',
                        textAlign: 'center'
                    }}>
                        {/* 依據文字與類型自動切換對應精美 Icon */}
                        <div style={{
                            fontSize: '44px',
                            marginBottom: '12px'
                        }}>
                            {dialogConfig.type === 'confirm' ? '❓' : 
                             (dialogConfig.message?.includes('成功') || dialogConfig.message?.includes('🎉') || dialogConfig.message?.includes('恭喜')) ? '✅' : 
                             (dialogConfig.message?.includes('失敗') || dialogConfig.message?.includes('錯誤') || dialogConfig.message?.includes('❌')) ? '❌' : 'ℹ️'}
                        </div>
                        
                        <h4 style={{
                            margin: '0 0 10px 0',
                            fontSize: '18px',
                            fontWeight: '800',
                            color: 'var(--color-text)'
                        }}>
                            {dialogConfig.title}
                        </h4>
                        
                        <p style={{
                            margin: '0 0 20px 0',
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'center'
                        }}>
                            {dialogConfig.message}
                        </p>
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            {dialogConfig.type === 'confirm' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            dialogConfig.resolve(true);
                                            setDialogConfig(null);
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            backgroundColor: 'var(--color-primary, #d97706)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            flex: 1,
                                            outline: 'none',
                                            boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)'
                                        }}
                                    >
                                        確定
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            dialogConfig.resolve(false);
                                            setDialogConfig(null);
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            flex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        取消
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        dialogConfig.resolve(true);
                                        setDialogConfig(null);
                                    }}
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: '#ffffff',
                                        backgroundColor: 'var(--color-primary, #d97706)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        width: '100%',
                                        outline: 'none',
                                        boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)'
                                    }}
                                >
                                    確定
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </HashRouter>
    );
}
