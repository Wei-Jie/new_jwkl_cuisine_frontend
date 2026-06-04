import React from 'react';

export default function SchedulesTab({
    schedules,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedProducts,
    setSelectedProducts,
    scheduleMenu,
    checkedItemIds,
    isSmiLoading,
    orders,
    orderItems,
    menuList,
    queriedProducts,
    handleQueryClick,
    saveBatchSchedules,
    handleStatusSelectChange,
    toggleSelectAll,
    toggleSelectOne
}) {
    return (
        <>
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '100%', minWidth: '320px' }}>
                        <label className="form-label">選擇產品品項 (可複選)</label>
                        <button 
                            type="button"
                            className="form-control"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{ 
                                height: '38px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: '#fff',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: '6px',
                                padding: '0 12px'
                            }}
                        >
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%', fontWeight: '500' }}>
                                {selectedProducts.length === 0 
                                    ? '-- 請選擇產品品項 (可複選) --' 
                                    : `已選擇 ${selectedProducts.length} 個品項 (${selectedProducts.join(', ')})`}
                            </span>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>{isDropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        
                        {isDropdownOpen && (
                            <>
                                <div 
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: 0, 
                                    right: 0, 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e6dfd3', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                                    zIndex: 999, 
                                    marginTop: '4px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    padding: '12px'
                                }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #f2eee6', paddingBottom: '8px' }}>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: '2px 8px', fontSize: '11px', minHeight: '24px', width: 'auto' }}
                                            onClick={() => setSelectedProducts([...scheduleMenu])}
                                        >
                                            全選
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: '2px 8px', fontSize: '11px', minHeight: '24px', width: 'auto' }}
                                            onClick={() => setSelectedProducts([])}
                                        >
                                            清除
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {scheduleMenu.map(name => {
                                            const isChecked = selectedProducts.includes(name);
                                            return (
                                                <label 
                                                    key={name} 
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '13px',
                                                        padding: '4px 6px',
                                                        borderRadius: '4px',
                                                        transition: 'background 0.2s',
                                                        backgroundColor: isChecked ? '#fffbeb' : 'transparent'
                                                    }}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedProducts(prev => [...prev, name]);
                                                            } else {
                                                                setSelectedProducts(prev => prev.filter(p => p !== name));
                                                            }
                                                        }}
                                                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ color: '#292524' }}>{name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleQueryClick}
                        style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        disabled={isSmiLoading}
                    >
                        🔍 查詢排單
                    </button>
                </div>
            </div>

            {schedules.length > 0 && (
                <>
                    <div className="card">
                        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px', marginBottom: '16px' }}>
                            <h3 className="section-title" style={{ margin: 0, whiteSpace: 'nowrap' }}>📊 【{queriedProducts.join(', ')}】排單明細</h3>
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={saveBatchSchedules}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: '600', width: 'auto', whiteSpace: 'nowrap', minHeight: '36px' }}
                                disabled={isSmiLoading}
                            >
                                💾 儲存狀態異動
                            </button>
                        </div>

                        {/* 多品項統計與庫存卡片網格 */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                            gap: '16px', 
                            marginBottom: '20px' 
                        }}>
                            {queriedProducts.map(pName => {
                                const currentProductMenu = menuList.find(m => m.name === pName);
                                if (!currentProductMenu) return null;
                                
                                const isStockManaged = currentProductMenu.isStockManaged || false;
                                const allStock = currentProductMenu.stock || 0;
                                
                                const resStock = orderItems.filter(item => {
                                    if (item.productId !== currentProductMenu.productId && item.product_id !== currentProductMenu.productId) return false;
                                    if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                    const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                    if (!parent) return false;
                                    return parent.status !== '已出貨' && parent.status !== '已完成' && parent.status !== '已取消' && parent.status !== '已退回';
                                }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
                                
                                const freeStock = allStock - resStock;
                                const isWeight = String(currentProductMenu.price).includes('*') || String(currentProductMenu.price).includes('重量') || ['P3001', 'P3002'].includes(currentProductMenu.productId);
                                const unit = isWeight ? 'g' : '個';
                                
                                const itemPendingQty = orderItems.filter(item => {
                                    if ((item.itemStatus || item.item_status) !== '待製作') return false;
                                    const m2 = menuList.find(ml => ml.product_id === (item.productId || item.product_id));
                                    return m2 && m2.name === pName;
                                }).reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
                                const itemTotalQty = schedules.filter(s => s.itemName === pName).reduce((sum, s) => sum + (parseFloat(s.qty) || 0), 0);
                                
                                return (
                                    <div key={pName} className="card" style={{ 
                                        margin: 0, 
                                        padding: '16px', 
                                        borderLeft: '5px solid var(--color-primary)', 
                                        background: 'linear-gradient(135deg, #fffcf6 0%, #ffffff 100%)',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '15px', fontWeight: '700' }}>
                                                🍯 {pName}
                                            </h4>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                color: isStockManaged ? '#15803d' : '#4b5563',
                                                backgroundColor: isStockManaged ? '#dcfce7' : '#f1f5f9',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                border: isStockManaged ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                            }}>
                                                {isStockManaged ? '庫存防守中' : '未啟用庫存'}
                                            </span>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #f2eee6', paddingRight: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>實體總庫 (All):</span>
                                                    <strong style={{ color: '#b45309' }}>{allStock}{unit}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>預約保留 (Res):</span>
                                                    <strong style={{ color: '#4b5563' }}>{resStock}{unit}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #f2eee6', paddingTop: '4px' }}>
                                                    <span style={{ color: '#292524', fontWeight: '600' }}>可用自由 (Free):</span>
                                                    <strong style={{ color: isStockManaged ? (freeStock <= 0 ? '#dc2626' : '#16a34a') : '#4b5563', fontSize: '13px' }}>
                                                        {freeStock}{unit}
                                                    </strong>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>⏳ 待製作:</span>
                                                    <strong style={{ color: '#d97706' }}>{itemPendingQty}{unit}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>📊 總需求:</span>
                                                    <strong style={{ color: '#2563eb' }}>{itemTotalQty}{unit}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="responsive-table-wrap">
                            <table className="admin-table schedule-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px', textAlign: 'center' }}>
                                            <input 
                                                type="checkbox"
                                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                                checked={schedules.length > 0 && checkedItemIds.length === schedules.length}
                                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                                            />
                                        </th>
                                        <th style={{ width: '80px' }}>訂單號</th>
                                        <th style={{ width: '100px' }}>訂單日期</th>
                                        <th style={{ width: '80px' }}>客戶名稱</th>
                                        <th>品項</th>
                                        <th style={{ width: '60px' }}>訂購數量</th>
                                        <th style={{ width: '80px' }}>商品單價</th>
                                        <th style={{ width: '80px' }}>小計價格</th>
                                        <th style={{ width: '145px' }}>製作狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ textAlign: 'center' }} data-label="勾選">
                                                <input 
                                                    type="checkbox"
                                                    checked={checkedItemIds.includes(item.id)}
                                                    onChange={(e) => toggleSelectOne(item.id, e.target.checked)}
                                                    style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                                                />
                                            </td>
                                            <td data-label="訂單號"><strong>{item.orderId}</strong></td>
                                            <td data-label="訂單日期">{item.orderDate}</td>
                                            <td data-label="客戶名稱">{item.customerName}</td>
                                            <td data-label="品項">{item.itemName}</td>
                                            <td data-label="訂購數量" style={{ fontWeight: '700' }}>{item.qty}</td>
                                            <td data-label="商品單價">${item.unitPrice}</td>
                                            <td data-label="小計價格" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                                                ${item.subtotal}
                                            </td>
                                            <td data-label="製作狀態">
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={item.status}
                                                    onChange={(e) => handleStatusSelectChange(item.id, e.target.value)}
                                                    style={{ cursor: 'pointer', fontWeight: '500' }}
                                                >
                                                    <option value="待製作">⏳ 待排程</option>
                                                    <option value="已完成">✅ 已完成</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
