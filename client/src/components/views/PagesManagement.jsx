import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, Shield, ChevronRight, ChevronDown, Check, X, FolderTree } from 'lucide-react';
import { api } from '../../services/api.js';

export default function PagesManagement({ onShowToast }) {
  const [pages, setPages] = useState([]);
  const [tree, setTree] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'tree'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({
    name: '',
    code: '',
    route: '',
    parent_id: '',
    icon: '',
    sort_order: 0,
    type: 'PAGE',
    status: 'ACTIVE',
  });

  // Permission Attach Modal
  const [permModalPage, setPermModalPage] = useState(null);
  const [pagePerms, setPagePerms] = useState([]);
  const [selectedPermId, setSelectedPermId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesRes, treeRes, permsRes] = await Promise.allSettled([
        api.getPages({ limit: 100 }),
        api.getPageTree(),
        api.getPermissions({ limit: 100 }),
      ]);

      if (pagesRes.status === 'fulfilled') {
        const list = Array.isArray(pagesRes.value) ? pagesRes.value : (pagesRes.value?.pages || pagesRes.value?.rows || []);
        setPages(list);
      }
      if (treeRes.status === 'fulfilled') {
        setTree(Array.isArray(treeRes.value) ? treeRes.value : []);
      }
      if (permsRes.status === 'fulfilled') {
        const pList = Array.isArray(permsRes.value) ? permsRes.value : (permsRes.value?.permissions || permsRes.value?.rows || []);
        setPermissions(pList);
      }
    } catch (err) {
      if (onShowToast) onShowToast('Failed to load pages data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...pageForm,
        parent_id: pageForm.parent_id ? Number(pageForm.parent_id) : null,
        sort_order: Number(pageForm.sort_order || 0),
      };

      if (editingPage) {
        await api.updatePage(editingPage.id, payload);
        if (onShowToast) onShowToast(`Page '${payload.name}' updated successfully!`);
      } else {
        await api.createPage(payload);
        if (onShowToast) onShowToast(`Page '${payload.name}' created successfully!`);
      }

      setIsModalOpen(false);
      setEditingPage(null);
      setPageForm({ name: '', code: '', route: '', parent_id: '', icon: '', sort_order: 0, type: 'PAGE', status: 'ACTIVE' });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving page', true);
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this page?')) return;
    try {
      await api.deletePage(id);
      if (onShowToast) onShowToast('Page deactivated successfully');
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error deactivating page', true);
    }
  };

  const openPermModal = async (page) => {
    setPermModalPage(page);
    try {
      const res = await api.getPagePermissions(page.id);
      setPagePerms(res?.permissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachPerm = async () => {
    if (!selectedPermId || !permModalPage) return;
    try {
      await api.attachPagePermission(permModalPage.id, Number(selectedPermId));
      if (onShowToast) onShowToast('Permission attached to page');
      const res = await api.getPagePermissions(permModalPage.id);
      setPagePerms(res?.permissions || []);
      setSelectedPermId('');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error attaching permission', true);
    }
  };

  const handleDetachPerm = async (permId) => {
    try {
      await api.detachPagePermission(permModalPage.id, permId);
      if (onShowToast) onShowToast('Permission detached from page');
      const res = await api.getPagePermissions(permModalPage.id);
      setPagePerms(res?.permissions || []);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error detaching permission', true);
    }
  };

  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: `${level * 24}px`, marginTop: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
        }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: node.type === 'MENU' ? '#dbeafe' : node.type === 'GROUP' ? '#f3e8ff' : '#f1f5f9',
            color: node.type === 'MENU' ? '#1e40af' : node.type === 'GROUP' ? '#6b21a8' : '#334155',
            fontWeight: '700',
          }}>
            {node.type}
          </span>
          <span style={{ fontWeight: '600', color: '#0f172a' }}>{node.name}</span>
          <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>({node.route || 'No Route'})</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>Order: {node.sort_order}</span>
        </div>
        {node.children && node.children.length > 0 && renderTreeNodes(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#0f172a' }}>Pages & Menu Hierarchy</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage navigation pages, nested menus, and RBAC page permission requirements
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('list')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'list' ? '#ffffff' : 'transparent',
                fontWeight: '600',
                fontSize: '0.85rem',
                color: activeTab === 'list' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
              }}
            >
              List View
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'tree' ? '#ffffff' : 'transparent',
                fontWeight: '600',
                fontSize: '0.85rem',
                color: activeTab === 'tree' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
              }}
            >
              Live Hierarchy Tree
            </button>
          </div>
          <button
            onClick={() => {
              setEditingPage(null);
              setPageForm({ name: '', code: '', route: '', parent_id: '', icon: '', sort_order: 0, type: 'PAGE', status: 'ACTIVE' });
              setIsModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Create Page
          </button>
        </div>
      </div>

      {activeTab === 'tree' ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>
            Live User-Filtered Navigation Hierarchy (/api/v1/pages/tree)
          </h3>
          {tree.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
              No active menu nodes available for your current permission scope.
            </div>
          ) : (
            renderTreeNodes(tree)
          )}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Route</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Parent</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>#{p.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: '#2563eb', fontFamily: 'monospace' }}>{p.code}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.route || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: p.type === 'MENU' ? '#dbeafe' : p.type === 'GROUP' ? '#f3e8ff' : '#f1f5f9',
                      color: p.type === 'MENU' ? '#1e40af' : p.type === 'GROUP' ? '#6b21a8' : '#334155',
                    }}>
                      {p.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.parent_name || (p.parent_id ? `#${p.parent_id}` : 'None')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: p.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: p.status === 'ACTIVE' ? '#166534' : '#991b1b',
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openPermModal(p)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                        title="Manage Required Permissions"
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPage(p);
                          setPageForm({
                            name: p.name,
                            code: p.code,
                            route: p.route || '',
                            parent_id: p.parent_id ? String(p.parent_id) : '',
                            icon: p.icon || '',
                            sort_order: p.sort_order || 0,
                            type: p.type || 'PAGE',
                            status: p.status || 'ACTIVE',
                          });
                          setIsModalOpen(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#2563eb',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePage(p.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Page Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '700' }}>
              {editingPage ? 'Edit Page / Menu' : 'Create New Page / Menu'}
            </h3>
            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Page Name *</label>
                <input
                  type="text"
                  required
                  value={pageForm.name}
                  onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Unique Code *</label>
                <input
                  type="text"
                  required
                  value={pageForm.code}
                  onChange={(e) => setPageForm({ ...pageForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Route Path</label>
                <input
                  type="text"
                  value={pageForm.route}
                  onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
                  placeholder="/admin/organizations"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Type</label>
                  <select
                    value={pageForm.type}
                    onChange={(e) => setPageForm({ ...pageForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="PAGE">PAGE</option>
                    <option value="MENU">MENU</option>
                    <option value="GROUP">GROUP</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Parent Menu</label>
                  <select
                    value={pageForm.parent_id}
                    onChange={(e) => setPageForm({ ...pageForm, parent_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">None (Root)</option>
                    {pages.filter(p => !editingPage || p.id !== editingPage.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Attachment Modal */}
      {permModalPage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '550px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                Required Permissions for '{permModalPage.name}'
              </h3>
              <button onClick={() => setPermModalPage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <select
                value={selectedPermId}
                onChange={(e) => setSelectedPermId(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">Select Permission to require...</option>
                {permissions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
              <button
                onClick={handleAttachPerm}
                disabled={!selectedPermId}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Attach
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {pagePerms.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                  No required permissions. This page is accessible to all logged-in users.
                </div>
              ) : (
                pagePerms.map((p) => (
                  <div key={p.permission_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{p.permission_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace' }}>{p.permission_code}</div>
                    </div>
                    <button
                      onClick={() => handleDetachPerm(p.permission_id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
