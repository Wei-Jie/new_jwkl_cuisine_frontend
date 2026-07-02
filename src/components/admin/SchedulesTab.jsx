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
    toggleSelectOne,
    scheduleDateRangeMode,
    setScheduleDateRangeMode,
    scheduleStartDate,
    setScheduleStartDate,
    scheduleEndDate,
    setScheduleEndDate,
    handleScheduleDateRangeModeChange
}) {
    return (
        <>
            {/* 📅 排單時間區間篩選面板 */}
            <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>📅 排單時間區間：</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['today', 'week', 'month', 'year', 'all', 'custom'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => handleScheduleDateRangeModeChange(mode)}
                                    className={`btn btn-sm ${scheduleDateRangeMode === mode ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ padding: '4px 10px', fontSize: '12px', minHeight: '28px', borderRadius: '15px' }}
                                >
                                    {{
                                        today: '今天',
                                        week: '本週',
                                        month: '本月',
                                        year: '今年',
                                        all: '全部歷史',
                                        custom: '自訂區間'
                                    }[mode]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="date"
                            className="form-control"
                            value={scheduleStartDate}
                            disabled={scheduleDateRangeMode !== 'custom'}
                            onChange={(e) => {
                                setScheduleStartDate(e.target.value);
                                setScheduleDateRangeMode('custom');
                            }}
                            style={{ height: '32px', padding: '4px 8px', fontSize: '13px', width: '135px' }}
                        />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>至</span>
                        <input
                            type="date"
                            className="form-control"
                            value={scheduleEndDate}
                            disabled={scheduleDateRangeMode !== 'custom'}
                            onChange={(e) => {
                                setScheduleEndDate(e.target.value);
                                setScheduleDateRangeMode('custom');
                            }}
                            style={{ height: '32px', padding: '4px 8px', fontSize: '13px', width: '135px' }}
                        />
                    </div>
                </div>
            </div>

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

            {queriedProducts.length > 0 && (
                <>
                    <div className="card">
                        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                            <h3 className="section-title" style={{ margin: 0, minWidth: 0, flex: '1 1 200px', wordBreak: 'break-all', lineHeight: '1.5' }}>📊 【{queriedProducts.join(', ')}】排單明細</h3>
                            {schedules.length > 0 && (
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={saveBatchSchedules}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: '600', width: 'auto', whiteSpace: 'nowrap', minHeight: '36px', flexShrink: 0 }}
                                    disabled={isSmiLoading}
                                >
                                    💾 儲存狀態異動
                                </button>
                            )}
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
                                    const itemId = item.productId || item.product_id;
                                    const menuId = currentProductMenu.productId || currentProductMenu.product_id;
                                    if (!itemId || !menuId || itemId !== menuId) return false;
                                    if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                    const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                    if (!parent) return false;
                                    return parent.status !== '已出貨' && parent.status !== '已結單' && parent.status !== '已取消' && parent.status !== '已退回';
                                }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
                                
                                const freeStock = allStock - resStock;
                                const isWeight = String(currentProductMenu.price).includes('*') || String(currentProductMenu.price).includes('重量') || ['P3001', 'P3002'].includes(currentProductMenu.productId);
                                const unit = '個';
                                
                                const itemPendingQty = orderItems.filter(item => {
                                    if ((item.itemStatus || item.item_status) !== '待製作') return false;
                                    const itemProductName = item.productName || item.product_name || '';
                                    if (itemProductName.trim().toLowerCase() !== pName.trim().toLowerCase()) return false;

                                    // 關聯母訂單狀態排除無效訂單 (Bug 修復，只計算已接單訂單)
                                    const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                    if (!parent || parent.status !== '已接單') return false;

                                    // 結合排單日期區間進行過濾 (時間區間篩選連動)
                                    if (scheduleDateRangeMode !== 'all') {
                                        const parseDate = (dStr) => {
                                            if (!dStr) return 0;
                                            const parts = dStr.replace(/-/g, '/').split('/');
                                            return parts.length === 3 ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime() : 0;
                                        };
                                        const t = parseDate(parent.order_date || parent.orderDate);
                                        const start = scheduleStartDate ? new Date(scheduleStartDate.replace(/-/g, '/')).getTime() : 0;
                                        const end = scheduleEndDate ? new Date(scheduleEndDate.replace(/-/g, '/')).getTime() + 86400000 - 1 : Infinity;
                                        if (t < start || t > end) return false;
                                    }
                                    return true;
                                }).reduce((sum, item) => {
                                    const q = parseFloat(item.qty) || 0;
                                    return sum + (isWeight && q > 10 ? 1 : q);
                                }, 0);
                                const itemTotalQty = schedules.filter(s => s.itemName === pName).reduce((sum, s) => {
                                    const q = parseFloat(s.qty) || 0;
                                    return sum + (isWeight && q > 10 ? 1 : q);
                                }, 0);
                                
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
                                                {/* 製作建議提示 */}
                                                {((freeStock > 0 && freeStock >= itemPendingQty && itemPendingQty > 0) || (freeStock < itemPendingQty && itemPendingQty >= 1)) && (
                                                    <div style={{ 
                                                        marginTop: '4px',
                                                        paddingTop: '4px',
                                                        borderTop: '1px dashed #f2eee6',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        fontSize: '11px'
                                                    }}>
                                                        <span style={{ color: '#8c857b' }}>💡 建議:</span>
                                                        {freeStock > 0 && freeStock >= itemPendingQty && itemPendingQty > 0 ? (
                                                            <strong style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px', scale: '0.95', transformOrigin: 'right' }}>無須製作</strong>
                                                        ) : (
                                                            <strong style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px', scale: '0.95', transformOrigin: 'right' }}>
                                                                需再製作: {itemPendingQty - freeStock}{unit}
                                                            </strong>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {schedules.length > 0 ? (
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
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', marginTop: '16px' }}>
                                ℹ️ 選擇的品項在目前篩選的時間區間內，無任何待排程或已完成的訂單。
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
