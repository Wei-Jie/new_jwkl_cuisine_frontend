import React from 'react';
import { AddMenuModal, EditMenuModal } from './EditMenuModal';
import { isEmptyValue, parseNoteCost } from '../../utils/helpers';

export default function MenuTab({
    menuList,
    isMenuLoading,
    showAddMenuModal,
    setShowAddMenuModal,
    showEditMenuModal,
    setShowEditMenuModal,
    newMenuForm,
    setNewMenuForm,
    editingProduct,
    setEditingProduct,
    startEditMenu,
    handleAddMenuSubmit,
    saveEditMenu
}) {
    return (
        <>
            <div className="card-header-row" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title" style={{ margin: 0, borderLeft: 'none', paddingLeft: 0 }}>🥦 菜單品項維護</h3>
                <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setShowAddMenuModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', width: 'auto' }}
                >
                    ➕ 新增菜單商品
                </button>
            </div>
            {isMenuLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>載入菜單商品中...</div>
            ) : (
                <div className="responsive-table-wrap">
                    <table className="admin-table menu-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>品項料號</th>
                                <th style={{ width: '90px' }}>商品分類</th>
                                <th style={{ width: '180px' }}>商品名稱</th>
                                <th style={{ width: '90px' }}>售價/單價</th>
                                <th style={{ width: '95px' }}>成本 (元)</th>
                                <th style={{ width: '100px' }}>備註</th>
                                <th>商品描述</th>
                                <th style={{ textAlign: 'center', width: '90px' }}>狀態</th>
                                <th style={{ width: '80px' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => {
                                const { cost, pureNote } = parseNoteCost(m.note);
                                return (
                                    <tr key={m.product_id}>
                                        <td data-label="品項料號"><strong>{m.product_id}</strong></td>
                                        <td data-label="商品分類">{m.category}</td>
                                        <td data-label="商品名稱"><strong>{m.name}</strong></td>
                                        <td data-label="售價/單價">{m.price}</td>
                                        <td data-label="成本">{(cost || '-')}</td>
                                        <td data-label="備註" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                                            {!isEmptyValue(pureNote) ? pureNote : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>無</span>}
                                        </td>
                                        <td data-label="商品描述" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                                            {!isEmptyValue(m.description) ? m.description : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>無</span>}
                                        </td>
                                        <td data-label="狀態" style={{ textAlign: 'center' }}>
                                            <span className={`badge ${m.status === '上架' ? 'badge-done' : 'badge-pending'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td data-label="操作">
                                            <button className="btn btn-sm btn-outline" onClick={() => startEditMenu(m)}>編輯</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 新增菜單商品 Modal */}
            <AddMenuModal
                show={showAddMenuModal}
                onClose={() => setShowAddMenuModal(false)}
                newMenuForm={newMenuForm}
                setNewMenuForm={setNewMenuForm}
                onSubmit={handleAddMenuSubmit}
            />

            {/* 編輯菜單商品 Modal */}
            <EditMenuModal
                show={showEditMenuModal}
                onClose={() => setShowEditMenuModal(false)}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                onSubmit={(e) => { e.preventDefault(); saveEditMenu(); }}
            />
        </>
    );
}
