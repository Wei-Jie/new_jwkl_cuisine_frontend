import React from 'react';

const InventoryTab = ({
    menuList,
    orderItems,
    orders,
    setMenuList,
    selectedInvProduct,
    setSelectedInvProduct,
    invAddQty,
    setInvAddQty,
    isInvSaving,
    isBatchInvSaving,
    handleInvAddSubmit,
    handleBatchUpdateStock,
    handleUpdateStockDirect
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 庫存說明圖卡 (置頂全寬展示) */}
            <div className="inventory-top-row">
                {/* 💡 庫存配銷核心公式與數字說明 */}
                <div className="card animate-fade-in" style={{ 
                    padding: '16px 20px', 
                    background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', 
                    borderLeft: '5px solid var(--color-primary)', 
                    boxShadow: 'var(--shadow-sm)',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💡 庫存配銷核心公式與數字說明
                        </h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                            gap: '12px', 
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.5'
                        }}>
                            <div>
                                <strong>• 實體總庫存 (All Stock)</strong>
                                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                    目前實際備料數量。僅在主訂單為「已出貨」或「已完成」時扣除。
                                </div>
                            </div>
                            <div>
                                <strong>• 預約保留庫存 (Res Stock)</strong>
                                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                    已接單且排程為「已完成」的累加數量（動態即時加總）。
                                </div>
                            </div>
                            <div>
                                <strong>• 可用自由庫存 (Free Stock)</strong>
                                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                    公式：<strong>實體總庫存 − 預約保留庫存</strong>。不足時將雙向硬限制。
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '10px', 
                        borderTop: '1px dashed var(--color-border)', 
                        fontSize: '11.5px', 
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <span>🛡️ <strong>庫存防守</strong>：若可用自由庫存為 0 時預約下單與後台更新會進行阻斷。</span>
                        <span>🛍️ <strong>上下架</strong>：下架商品在前台將隱藏不顯示，但後台仍能進行管理。</span>
                    </div>
                </div>

                {/* ➕ 商品入庫登記 */}
                <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '16px' }}>➕ 新增商品庫存 (入庫登記)</h3>
                        <form onSubmit={handleInvAddSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                                <label className="form-label">選擇商品</label>
                                <select 
                                    className="form-control"
                                    value={selectedInvProduct}
                                    onChange={(e) => setSelectedInvProduct(e.target.value)}
                                    required
                                >
                                    <option value="">-- 請選擇商品 --</option>
                                    {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => (
                                        <option key={m.product_id} value={m.product_id}>
                                            【{m.category}】{m.name} (目前實體: {m.stock || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ width: '110px', marginBottom: 0 }}>
                                <label className="form-label">入庫數量</label>
                                <input 
                                    type="number"
                                    className="form-control"
                                    style={{ height: '38px' }}
                                    value={invAddQty}
                                    onChange={(e) => setInvAddQty(e.target.value)}
                                    required
                                    min={1}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ width: 'auto', minHeight: '38px', height: '38px', whiteSpace: 'nowrap', padding: '0 20px', display: 'flex', alignItems: 'center' }} 
                                disabled={isInvSaving}
                            >
                                {isInvSaving ? '儲存中...' : '📦 確認入庫'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 下方：庫存實體與可用庫存大表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div className="card" style={{ padding: '20px', margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>📋 實體與可用自由庫存大表</h3>
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={handleBatchUpdateStock}
                            style={{ height: '34px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                            disabled={isBatchInvSaving}
                        >
                            {isBatchInvSaving ? '儲存中...' : '💾 批次儲存設定'}
                        </button>
                    </div>
                    
                    <div className="responsive-table-wrap">
                        <table className="admin-table inventory-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>料號</th>
                                    <th>品名</th>
                                    <th style={{ width: '90px' }}>分類</th>
                                    <th style={{ width: '120px' }}>實體總庫存</th>
                                    <th style={{ width: '100px' }}>預約保留</th>
                                    <th style={{ width: '120px' }}>可用自由庫存</th>
                                    <th style={{ width: '90px' }}>庫存防守</th>
                                    <th style={{ textAlign: 'center', width: '90px' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => {
                                    const allStock = m.stock || 0;
                                    const resStock = orderItems.filter(item => {
                                        if (item.productId !== m.product_id && item.product_id !== m.product_id) return false;
                                        if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                        if (!parent) return false;
                                        return parent.status !== '已出貨' && parent.status !== '已結單' && parent.status !== '已取消' && parent.status !== '已退回';
                                    }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

                                    const freeStock = allStock - resStock;
                                    const isManaged = m.isStockManaged || false;
                                    const unit = '個';

                                    return (
                                        <tr key={m.product_id}>
                                            <td data-label="料號"><code>{m.product_id}</code></td>
                                            <td data-label="品名"><strong>{m.name}</strong></td>
                                            <td data-label="分類"><span className="badge badge-secondary">{m.category}</span></td>
                                            <td data-label="實體總庫存">
                                                <input 
                                                    type="number"
                                                    className="form-control"
                                                    style={{ padding: '2px 6px', height: '28px', width: '90px' }}
                                                    value={m.stock || 0}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setMenuList(prev => prev.map(x => x.product_id === m.product_id ? { ...x, stock: val } : x));
                                                    }}
                                                />
                                            </td>
                                            <td data-label="預約保留" style={{ fontWeight: '600', color: '#4b5563' }}>{resStock} {unit}</td>
                                            <td data-label="可用自由庫存" style={{ fontWeight: 'bold', color: isManaged ? (freeStock <= 0 ? '#dc2626' : '#16a34a') : '#4b5563' }}>{freeStock} {unit}</td>
                                            <td data-label="庫存防守">
                                                <input 
                                                    type="checkbox"
                                                    checked={isManaged}
                                                    onChange={(e) => {
                                                        const val = e.target.checked;
                                                        setMenuList(prev => prev.map(x => x.product_id === m.product_id ? { ...x, isStockManaged: val } : x));
                                                    }}
                                                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                />
                                            </td>

                                            <td data-label="操作" style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn btn-sm btn-primary"
                                                    style={{ padding: '4px 10px', minHeight: '26px' }}
                                                    onClick={() => handleUpdateStockDirect(m.product_id, m.stock || 0, isManaged)}
                                                >
                                                    💾 儲存
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryTab;
