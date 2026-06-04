import React, { useState } from 'react';
import EditOrderModal from './EditOrderModal';

export default function OrdersTab({
    orders,
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
                            className="input" 
                            style={{ width: '100%', minHeight: '38px' }}
                            value={localStartDate}
                            onChange={(e) => setLocalStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>下單結束日期</label>
                        <input 
                            type="date" 
                            className="input" 
                            style={{ width: '100%', minHeight: '38px' }}
                            value={localEndDate}
                            onChange={(e) => setLocalEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>訂單狀態</label>
                        <select 
                            className="input" 
                            style={{ width: '100%', minHeight: '38px' }}
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                        >
                            <option value="全部">全部</option>
                            <option value="待確認">待確認</option>
                            <option value="已接單">已接單</option>
                            <option value="已出貨">已出貨</option>
                            <option value="已完成">已完成</option>
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

            <div className="card">
                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0 }}>📋 訂單總覽 (移動端自動卡片化測試)</h3>
                <div className="responsive-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>訂單號</th>
                                <th>顧客名稱</th>
                                <th>聯絡電話</th>
                                <th>金額</th>
                                <th>出貨日期</th>
                                <th>付款狀態</th>
                                <th>訂單狀態</th>
                                <th>操作</th>
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
                                            o.status === '已完成' ? 'badge-done' : 
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
