import React, { useState } from 'react';
import EditOrderModal from './EditOrderModal';

export default function OrdersTab({
    orders,
    orderItems = [],
    isOrdersLoading,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    filterStatus,
    setFilterStatus,
    fetchOrdersWithFilters,
    handleAcceptOrder,
    handleRejectOrder,
    startEditOrder,
    showEditOrderModal,
    setShowEditOrderModal,
    editingOrder,
    setEditingOrder,
    editingOrderItems,
    menuList,
    handleItemAmtChange,
    handleItemQtyChange,
    handleItemStatusChange,
    handleRemoveOrderItem,
    handleAddDiscountItem,
    handleSaveOrderSubmit
}) {
    const [localStartDate, setLocalStartDate] = useState(filterStartDate);
    const [localEndDate, setLocalEndDate] = useState(filterEndDate);
    const [localStatus, setLocalStatus] = useState(filterStatus);

    const handleSearchClick = () => {
        // 其餘狀態（非待確認與已接單）必須選日期
        if (localStatus !== '待確認' && localStatus !== '已接單') {
            if (!localStartDate || !localEndDate) {
                alert('❌ 其餘訂單狀態（全部、已出貨、已完成、已退回、已取消）必須選擇「下單開始日期」與「下單結束日期」進行篩選！');
                return;
            }
        }
        setFilterStartDate(localStartDate);
        setFilterEndDate(localEndDate);
        setFilterStatus(localStatus);
        fetchOrdersWithFilters(localStatus, localStartDate, localEndDate);
    };

    return (
        <>
            {/* 🔍 篩選查詢控制面板 */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginTop: 0, marginBottom: '16px' }}>
                    🔍 訂單條件篩選
                </h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>下單開始日期</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: 'var(--radius)' }}
                            value={localStartDate}
                            onChange={(e) => setLocalStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>下單結束日期</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: 'var(--radius)' }}
                            value={localEndDate}
                            onChange={(e) => setLocalEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>訂單狀態</label>
                        <select 
                            className="form-control" 
                            style={{ width: '100%', height: '38px', padding: '6px 12px', borderRadius: 'var(--radius)' }}
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="全部">全部</option>
                            <option value="待確認">待確認</option>
                            <option value="已接單">已接單</option>
                            <option value="已出貨">已出貨</option>
                            <option value="已結單">已結單</option>
                            <option value="已退回">已退回</option>
                            <option value="已取消">已取消</option>
                        </select>
                    </div>
                    <div style={{ flex: '0 0 auto' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ height: '38px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={handleSearchClick}
                            disabled={isOrdersLoading}
                        >
                            {isOrdersLoading ? '查詢中...' : '🔍 篩選查詢'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-cards">
                <div className="stat-card stat-card-warning">
                    <div className="stat-label">待處理客戶預約單</div>
                    <div className="stat-value">{orders.filter(o => o.status === '待確認').length} 筆</div>
                </div>
                <div className="stat-card stat-card-success">
                    <div className="stat-label">已接正式訂單</div>
                    <div className="stat-value">{orders.filter(o => o.status !== '待確認').length} 筆</div>
                </div>
                <div className="stat-card stat-card-primary">
                    <div className="stat-label">累計預估總營收</div>
                    <div className="stat-value">
                        ${orders
                            .filter(o => o.status !== '待確認' && o.status !== '已取消')
                            .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)
                            .toLocaleString()}
                    </div>
                </div>
            </div>
            
            {/* 📦 當前篩選區間：品項排單與庫存摘要 */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginTop: 0, marginBottom: '12px', color: 'var(--color-primary)' }}>
                    📦 當前篩選區間：品項排程與庫存摘要
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                    本表自動統計下方篩選結果中所有<strong>「已接單」</strong>狀態訂單之品項需求。結合可用自由庫存，提供精確的製作建議。
                </p>
                <div className="responsive-table-wrap">
                    <table className="admin-table orders-table" style={{ fontSize: '13.5px' }}>
                        <thead>
                            <tr style={{ background: '#fdfaf6', borderBottom: '2px solid #ece6dc' }}>
                                <th>品項名稱</th>
                                <th style={{ textAlign: 'center', width: '90px' }}>實體庫存</th>
                                <th style={{ textAlign: 'center', width: '110px' }}>已分配保留</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>可用自由庫存</th>
                                <th style={{ textAlign: 'center', width: '100px' }}>總訂購需求</th>
                                <th style={{ textAlign: 'center', width: '100px' }}>待製作數量</th>
                                <th style={{ textAlign: 'center', width: '150px' }}>製作建議</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuList
                                .filter(m => m.productId !== 'PROD_DISCOUNT')
                                .map(menu => {
                                    const allStock = menu.stock || 0;
                                    
                                    // 1. 已分配保留：已接單、明細已完成、但尚未出貨結單的品項數量
                                    const resStock = orderItems.filter(item => {
                                        const isMatch = item.productId === menu.productId || item.product_id === menu.productId;
                                        if (!isMatch) return false;
                                        if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                        if (!parent) return false;
                                        return parent.status !== '已出貨' && parent.status !== '已結單' && parent.status !== '已取消' && parent.status !== '已退回';
                                    }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
                                    
                                    const freeStock = allStock - resStock;
                                    const isWeight = String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(menu.productId);
                                    
                                    // 2. 當前總需求：當前篩選出的已接單訂單中該品項的總量
                                    const totalDemand = orderItems.filter(item => {
                                        const isMatch = item.productId === menu.productId || item.product_id === menu.productId;
                                        if (!isMatch) return false;
                                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                        return parent && parent.status === '已接單';
                                    }).reduce((sum, item) => {
                                        const q = parseFloat(item.qty) || 0;
                                        return sum + (isWeight && q > 10 ? 1 : q);
                                    }, 0);

                                    // 3. 待製作數量：當前篩選出的已接單訂單中，該品項明細狀態為「待製作」的數量
                                    const itemPendingQty = orderItems.filter(item => {
                                        const isMatch = item.productId === menu.productId || item.product_id === menu.productId;
                                        if (!isMatch) return false;
                                        if ((item.itemStatus || item.item_status) !== '待製作') return false;
                                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                        return parent && parent.status === '已接單';
                                    }).reduce((sum, item) => {
                                        const q = parseFloat(item.qty) || 0;
                                        return sum + (isWeight && q > 10 ? 1 : q);
                                    }, 0);

                                    // 4. 製作建議計算
                                    let adviceText = '-';
                                    let adviceStyle = { color: '#6b7280', fontWeight: 'normal' };
                                    
                                    if (freeStock > 0 && freeStock >= itemPendingQty && itemPendingQty > 0) {
                                        adviceText = '無須製作';
                                        adviceStyle = { color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0', display: 'inline-block', fontSize: '12px' };
                                    } else if (freeStock === 0 && itemPendingQty === 0) {
                                        adviceText = '-';
                                    } else if (itemPendingQty > 0) {
                                        const needed = itemPendingQty - Math.max(0, freeStock);
                                        if (needed <= 0) {
                                            adviceText = '無須製作';
                                            adviceStyle = { color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0', display: 'inline-block', fontSize: '12px' };
                                        } else {
                                            adviceText = `需再製作 ${needed} 包`;
                                            adviceStyle = { color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fecaca', display: 'inline-block', fontSize: '12px' };
                                        }
                                    }

                                    return (
                                        <tr key={menu.productId}>
                                            <td style={{ fontWeight: 'bold', color: '#1f2937' }}>{menu.name}</td>
                                            <td style={{ textAlign: 'center', color: '#4b5563' }}>{allStock}</td>
                                            <td style={{ textAlign: 'center', color: '#4b5563' }}>{resStock}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: freeStock < 0 ? '#dc2626' : '#1f2937' }}>
                                                {freeStock}
                                            </td>
                                            <td style={{ textAlign: 'center', color: '#4b5563' }}>{totalDemand}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: itemPendingQty > 0 ? 'var(--color-primary)' : '#4b5563' }}>
                                                {itemPendingQty}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={adviceStyle}>{adviceText}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0 }}>📋 訂單總覽 (移動端自動卡片化測試)</h3>
                <div className="responsive-table-wrap">
                    <table className="admin-table orders-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>訂單號</th>
                                <th style={{ width: '95px' }}>顧客名稱</th>
                                <th style={{ width: '115px' }}>聯絡電話</th>
                                <th style={{ width: '75px' }}>金額</th>
                                <th style={{ width: '105px' }}>出貨日期</th>
                                <th style={{ width: '95px' }}>付款狀態</th>
                                <th style={{ width: '135px' }}>訂單狀態</th>
                                <th style={{ width: '90px' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.order_id}>
                                    <td data-label="訂單號"><strong>{o.order_id}</strong></td>
                                    <td data-label="顧客名稱">{o.customer_name}</td>
                                    <td data-label="聯絡電話">{o.phone}</td>
                                    <td data-label="金額">${o.amount}</td>
                                    <td data-label="出貨日期">{o.delivery_date}</td>
                                    <td data-label="付款狀態">
                                        <span className={`badge ${o.payment_status === '已付款' ? 'badge-done' : 'badge-pending'}`}>
                                            {o.payment_status}
                                        </span>
                                    </td>
                                    <td data-label="訂單狀態">
                                        <span className={`badge ${
                                            o.status === '已接單' ? 'badge-shipped' : 
                                            o.status === '已出貨' ? 'badge-shipped' : 
                                            o.status === '已結單' ? 'badge-done' : 
                                            o.status === '已退回' ? 'badge-pending' : 'badge-pending'
                                        }`} style={o.status === '已退回' ? { backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' } : {}}>
                                            {o.status === 'Spacer' ? o.status : o.status === '已接單' ? '已接單 (待排程)' : o.status}
                                        </span>
                                    </td>
                                    <td data-label="操作">
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                            {o.status === '待確認' && (
                                                <>
                                                    <button 
                                                        className="btn btn-sm btn-primary" 
                                                        style={{ padding: '4px 10px', minHeight: '30px', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', width: 'auto' }}
                                                        onClick={() => handleAcceptOrder(o.order_id)}
                                                    >
                                                        接單
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger" 
                                                        style={{ padding: '4px 10px', minHeight: '30px', width: 'auto' }}
                                                        onClick={() => handleRejectOrder(o.order_id)}
                                                    >
                                                        退回
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-outline" 
                                                style={{ padding: '4px 10px', minHeight: '30px', width: 'auto' }}
                                                onClick={() => startEditOrder(o)}
                                            >
                                                編輯
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 編輯訂單彈出視窗 */}
            <EditOrderModal
                show={showEditOrderModal}
                editingOrder={editingOrder}
                setEditingOrder={setEditingOrder}
                editingOrderItems={editingOrderItems}
                menuList={menuList}
                onClose={() => { setShowEditOrderModal(false); setEditingOrder(null); }}
                onItemAmtChange={handleItemAmtChange}
                onItemQtyChange={handleItemQtyChange}
                onItemStatusChange={handleItemStatusChange}
                onRemoveItem={handleRemoveOrderItem}
                onAddDiscount={handleAddDiscountItem}
                onSave={handleSaveOrderSubmit}
            />
        </>
    );
}
