import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  PackageCheck,
  Building2,
  Layers,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Lock,
  Boxes,
  Fuel,
  Flame,
  Wrench,
  HardHat,
  ShieldAlert,
  ChevronRight,
  FileText,
  Weight,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowUpDown,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api.js';

// Category Definitions with distinct styling & icons
const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: Boxes, color: '#0A2947' },
  { id: 'EXPLOSIVES', label: 'Explosives & Blasting', icon: Flame, color: '#dc2626', bg: '#fef2f2' },
  { id: 'FUEL_LUBRICANTS', label: 'Fuel & Lubricants', icon: Fuel, color: '#ea580c', bg: '#fff7ed' },
  { id: 'HEAVY_SPARES', label: 'Heavy Machinery Spares', icon: Wrench, color: '#0284c7', bg: '#f0f9ff' },
  { id: 'CONVEYOR_BELTING', label: 'Conveyor Belting', icon: ArrowUpDown, color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'STRUCTURAL_SUPPORT', label: 'Strata & Roof Support', icon: Layers, color: '#059669', bg: '#ecfdf5' },
  { id: 'SAFETY_PPE', label: 'Safety Gear & PPE', icon: HardHat, color: '#d97706', bg: '#fffbeb' },
  { id: 'CHEMICALS_REAGENTS', label: 'Chemicals & Reagents', icon: ShieldAlert, color: '#4f46e5', bg: '#eef2ff' },
  { id: 'ELECTRICAL', label: 'Electrical & Cabling', icon: Sparkles, color: '#0891b2', bg: '#ecfeff' },
];

export default function MaterialInwardView({ currentUser, onShowToast }) {
  // 1. Resolve User Scope & Clearance Tier
  const userSubroles = currentUser?.subroles || [];
  const primarySubrole = userSubroles[0] || null;

  const isSuperAdmin = currentUser?.permissions?.some(p => p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS') ||
    userSubroles.some(s => s.role_code === 'SUPER_ADMIN' || s.subrole_code === 'FULL_ACCESS_ROOT');

  const userOrgId = primarySubrole?.organization_id ? Number(primarySubrole.organization_id) : null;
  const userOrgName = primarySubrole?.organization_name || null;
  const userMineId = primarySubrole?.mine_id ? Number(primarySubrole.mine_id) : null;
  const userMineName = primarySubrole?.mine_name || null;
  const roleCode = primarySubrole?.role_code || '';

  const isOrgAdmin = !isSuperAdmin && !!userOrgId && !userMineId;
  const isMineAdmin = !isSuperAdmin && !!userMineId && (roleCode.includes('ADMIN') || roleCode.includes('MGR') || roleCode.includes('HEAD'));
  const isStaff = !isSuperAdmin && !isOrgAdmin && !isMineAdmin;

  // 2. Data State
  const [materials, setMaterials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // 3. Filter State
  const [selectedOrg, setSelectedOrg] = useState(isSuperAdmin ? '' : String(userOrgId || ''));
  const [selectedMine, setSelectedMine] = useState(isSuperAdmin || isOrgAdmin ? '' : String(userMineId || ''));
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // 4. Modals State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [viewingGatePass, setViewingGatePass] = useState(null);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [inspectionStatusForm, setInspectionStatusForm] = useState('PASSED');
  const [inspectionNotesForm, setInspectionNotesForm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Form State for Logging New Material
  const [newLogForm, setNewLogForm] = useState({
    organization_id: userOrgId || '',
    mine_id: userMineId || '',
    material_name: '',
    category: 'HEAVY_SPARES',
    quantity: '',
    unit: 'TONS',
    challan_number: '',
    purchase_order_number: '',
    supplier_name: '',
    transporter_name: '',
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    entry_gate: 'Gate 1 - Main North Weighbridge',
    gross_weight_tons: '',
    tare_weight_tons: '',
    net_weight_tons: '',
    inspection_status: 'PASSED',
    remarks: '',
  });

  // Calculate Net Weight automatically when Gross or Tare changes
  const handleWeightChange = (field, val) => {
    const updated = { ...newLogForm, [field]: val };
    const gross = parseFloat(field === 'gross_weight_tons' ? val : updated.gross_weight_tons);
    const tare = parseFloat(field === 'tare_weight_tons' ? val : updated.tare_weight_tons);
    if (!isNaN(gross) && !isNaN(tare)) {
      updated.net_weight_tons = Math.max(0, gross - tare).toFixed(2);
    }
    setNewLogForm(updated);
  };

  // Fetch Organizations and Mines for filter dropdowns
  useEffect(() => {
    const fetchOrgMines = async () => {
      try {
        if (isSuperAdmin) {
          const [orgsRes, minesRes] = await Promise.allSettled([
            api.getOrganizations({ limit: 100 }),
            api.getMines({ limit: 100 }),
          ]);
          if (orgsRes.status === 'fulfilled') {
            setOrganizations(Array.isArray(orgsRes.value) ? orgsRes.value : (orgsRes.value?.organizations || orgsRes.value?.rows || []));
          }
          if (minesRes.status === 'fulfilled') {
            setMines(Array.isArray(minesRes.value) ? minesRes.value : (minesRes.value?.mines || minesRes.value?.rows || []));
          }
        } else if (isOrgAdmin) {
          const minesRes = await api.getMines({ organization_id: userOrgId, limit: 100 });
          setMines(Array.isArray(minesRes) ? minesRes : (minesRes?.mines || minesRes?.rows || []));
        }
      } catch (err) {
        console.warn('Failed to fetch orgs/mines filter lists:', err);
      }
    };

    fetchOrgMines();
  }, [isSuperAdmin, isOrgAdmin, userOrgId]);

  // Fetch Materials List & Summary
  const fetchMaterialData = async () => {
    setLoading(true);
    setSummaryLoading(true);
    try {
      const queryParams = {
        page,
        limit: 15,
        sort: 'created_at',
        order: 'DESC',
      };

      if (selectedOrg) queryParams.organization_id = selectedOrg;
      if (selectedMine) queryParams.mine_id = selectedMine;
      if (selectedCategory && selectedCategory !== 'ALL') queryParams.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'ALL') queryParams.status = selectedStatus;
      if (searchQuery.trim()) queryParams.search = searchQuery.trim();

      const [listRes, summaryRes] = await Promise.allSettled([
        api.getMaterials(queryParams),
        api.getMaterialSummary({
          organization_id: selectedOrg || undefined,
          mine_id: selectedMine || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        }),
      ]);

      if (listRes.status === 'fulfilled') {
        const items = Array.isArray(listRes.value) ? listRes.value : (listRes.value?.data || listRes.value?.items || listRes.value?.rows || []);
        setMaterials(items);
        setTotalRecords(listRes.value?.meta?.total ?? items.length);
      }

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value?.data || summaryRes.value);
      }
    } catch (err) {
      console.error('Failed to load materials data:', err);
      onShowToast?.(err.message || 'Failed to fetch inward materials data', true);
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialData();
  }, [selectedOrg, selectedMine, selectedCategory, selectedStatus, page]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMaterialData();
  };

  // Handle Form Submission (Create Material Log)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLog(true);

    try {
      const payload = {
        material_name: newLogForm.material_name.trim(),
        category: newLogForm.category,
        quantity: parseFloat(newLogForm.quantity),
        unit: newLogForm.unit,
        challan_number: newLogForm.challan_number.trim(),
        purchase_order_number: newLogForm.purchase_order_number.trim() || undefined,
        supplier_name: newLogForm.supplier_name.trim(),
        transporter_name: newLogForm.transporter_name.trim() || undefined,
        vehicle_number: newLogForm.vehicle_number.trim().toUpperCase(),
        driver_name: newLogForm.driver_name.trim() || undefined,
        driver_phone: newLogForm.driver_phone.trim() || undefined,
        entry_gate: newLogForm.entry_gate.trim(),
        gross_weight_tons: newLogForm.gross_weight_tons ? parseFloat(newLogForm.gross_weight_tons) : undefined,
        tare_weight_tons: newLogForm.tare_weight_tons ? parseFloat(newLogForm.tare_weight_tons) : undefined,
        net_weight_tons: newLogForm.net_weight_tons ? parseFloat(newLogForm.net_weight_tons) : undefined,
        inspection_status: newLogForm.inspection_status,
        remarks: newLogForm.remarks.trim() || undefined,
      };

      if (isSuperAdmin) {
        if (newLogForm.mine_id) payload.mine_id = parseInt(newLogForm.mine_id, 10);
        if (newLogForm.organization_id) payload.organization_id = parseInt(newLogForm.organization_id, 10);
      } else if (isOrgAdmin) {
        payload.organization_id = userOrgId;
        if (newLogForm.mine_id) payload.mine_id = parseInt(newLogForm.mine_id, 10);
      } else {
        payload.organization_id = userOrgId;
        payload.mine_id = userMineId;
      }

      await api.createMaterial(payload);
      onShowToast?.(`Inward Material Log successfully registered at ${newLogForm.entry_gate}!`);
      setIsLogModalOpen(false);

      // Reset form
      setNewLogForm({
        organization_id: userOrgId || '',
        mine_id: userMineId || '',
        material_name: '',
        category: 'HEAVY_SPARES',
        quantity: '',
        unit: 'TONS',
        challan_number: '',
        purchase_order_number: '',
        supplier_name: '',
        transporter_name: '',
        vehicle_number: '',
        driver_name: '',
        driver_phone: '',
        entry_gate: 'Gate 1 - Main North Weighbridge',
        gross_weight_tons: '',
        tare_weight_tons: '',
        net_weight_tons: '',
        inspection_status: 'PASSED',
        remarks: '',
      });

      fetchMaterialData();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to submit inward material log', true);
    } finally {
      setSubmittingLog(false);
    }
  };

  // Handle Inspection Status Update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!inspectingItem) return;
    setUpdatingStatus(true);
    try {
      await api.updateMaterialStatus(inspectingItem.id, {
        inspection_status: inspectionStatusForm,
        inspected_by: `${currentUser.first_name || currentUser.username} (${primarySubrole?.subrole_name || 'Inspector'})`,
        remarks: inspectionNotesForm.trim() || undefined,
      });
      onShowToast?.(`Consignment #${inspectingItem.consignment_number} marked as ${inspectionStatusForm}!`);
      setInspectingItem(null);
      fetchMaterialData();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update inspection status', true);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    if (materials.length === 0) {
      onShowToast?.('No material records to export', true);
      return;
    }

    const headers = [
      'Consignment Number',
      'Date Time',
      'Mine Branch',
      'Organization',
      'Material Name',
      'Category',
      'Quantity',
      'Unit',
      'Net Weight Tons',
      'Challan No',
      'PO No',
      'Supplier',
      'Vehicle No',
      'Driver Name',
      'Gate',
      'Inspection Status',
      'Logged By',
    ];

    const rows = materials.map((m) => [
      `"${m.consignment_number}"`,
      `"${new Date(m.created_at).toLocaleString()}"`,
      `"${m.mine_name || ''}"`,
      `"${m.organization_name || ''}"`,
      `"${m.material_name.replace(/"/g, '""')}"`,
      `"${m.category}"`,
      m.quantity,
      `"${m.unit}"`,
      m.net_weight_tons || '',
      `"${m.challan_number || ''}"`,
      `"${m.purchase_order_number || ''}"`,
      `"${m.supplier_name.replace(/"/g, '""')}"`,
      `"${m.vehicle_number || ''}"`,
      `"${m.driver_name || ''}"`,
      `"${m.entry_gate || ''}"`,
      `"${m.inspection_status}"`,
      `"${m.logged_by_name || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coalmin_material_inward_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('CSV Export downloaded successfully');
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PASSED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
          }}>
            <CheckCircle2 size={12} />
            Cleared & Passed
          </span>
        );
      case 'PENDING':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#fffbeb',
            color: '#92400e',
            border: '1px solid #fde68a',
          }}>
            <Clock size={12} />
            Inspection Pending
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #fed7aa',
          }}>
            <AlertTriangle size={12} />
            Conditional Entry
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          }}>
            <XCircle size={12} />
            Quarantine / Rejected
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Quick category badge
  const renderCategoryBadge = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId) || { label: catId, color: '#475569', bg: '#f1f5f9', icon: Boxes };
    const Icon = cat.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: 600,
        backgroundColor: cat.bg || '#f1f5f9',
        color: cat.color,
      }}>
        <Icon size={12} />
        {cat.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner & Scope Clearance Indicator */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', zIndex: 2 }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(10, 41, 71, 0.08)',
            border: '1px solid rgba(10, 41, 71, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Truck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Material Inward & Gate Logistics
              </h1>
              {/* Role Scope Tier Tag */}
              {isSuperAdmin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  👑 Global Clearance: All Organizations & Branches
                </span>
              )}
              {isOrgAdmin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  🏢 Corporate Organization Scope: {userOrgName || 'ECL'}
                </span>
              )}
              {(isMineAdmin || isStaff) && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  ⛏️ Station Branch: {userMineName || 'Rajmahal OCP'} ({isMineAdmin ? 'Admin Clearance' : 'Staff Station'})
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              {isSuperAdmin
                ? 'Full system governance: Monitor cross-subsidiary material intake, weighbridge telemetry, and filter to specific branches.'
                : isOrgAdmin
                ? `Consolidated corporate logistics for ${userOrgName || 'ECL'}. Track inbound equipment and explosives across all subsidiary mines.`
                : `Mine-scoped station register for ${userMineName || 'Rajmahal OCP'}. Log inbound vehicles, inspect consignments, and track station tonnage.`}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
          <button
            onClick={() => fetchMaterialData()}
            className="clay-btn"
            title="Refresh logs & telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              fontSize: '0.84rem',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="clay-btn"
            title="Download CSV Gate Register"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              fontSize: '0.84rem',
            }}
          >
            <Download size={15} color="#2563eb" />
            <span>Export CSV</span>
          </button>

          {/* "+ Log Inward Material" Button - Accessible to ALL roles */}
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="clay-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(10, 41, 71, 0.25)',
            }}
          >
            <Plus size={17} />
            <span>Log Inward Material</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Summary KPI Metric Cards (Quantity & Inbound Intelligence) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Card 1: Main Inward Quantity (Dynamic by unit) */}
        <div className="clay-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Total Inward Quantity
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
              <Weight size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {summaryLoading ? '...' : (summary?.total_net_weight_tons ? `${Number(summary.total_net_weight_tons).toLocaleString()} T` : '0 T')}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {summary?.unit_breakdown?.LITERS && (
              <span style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {Number(summary.unit_breakdown.LITERS).toLocaleString()} L Fuel
              </span>
            )}
            {summary?.unit_breakdown?.UNITS && (
              <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {Number(summary.unit_breakdown.UNITS).toLocaleString()} Units/Spares
              </span>
            )}
            {summary?.unit_breakdown?.METERS && (
              <span style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {Number(summary.unit_breakdown.METERS).toLocaleString()} M Belts
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Consignment Logs Count */}
        <div className="clay-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Total Consignments
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {summaryLoading ? '...' : (summary?.total_consignments ?? 0)}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#64748b' }}>
            Verified delivery trucks / waybill entries
          </div>
        </div>

        {/* Card 3: Quality & Inspection Status */}
        <div className="clay-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Quality & Inspection
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <PackageCheck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669' }}>
              {summary?.status_breakdown?.PASSED ?? 0}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Passed ({summary?.total_consignments ? Math.round(((summary.status_breakdown?.PASSED || 0) / summary.total_consignments) * 100) : 0}%)
            </span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#d97706', fontWeight: 600 }}>
              • {summary?.status_breakdown?.PENDING ?? 0} Pending
            </span>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>
              • {summary?.status_breakdown?.REJECTED ?? 0} Rejected
            </span>
          </div>
        </div>

        {/* Card 4: Active Stations / Scope */}
        <div className="clay-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              {isSuperAdmin || isOrgAdmin ? 'Active Mine Branches' : 'Assigned Station'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isSuperAdmin
              ? (selectedMine ? '1 Branch (Filtered)' : `${summary?.branch_breakdown?.length || 0} Mines Reporting`)
              : isOrgAdmin
              ? (selectedMine ? '1 ECL Branch' : `${summary?.branch_breakdown?.length || 0} ECL Mines`)
              : userMineName || 'Rajmahal OCP'}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#64748b' }}>
            {isSuperAdmin ? 'Filterable across all coal subsidiaries' : isOrgAdmin ? 'Organization-wide inward logistics' : 'Weighbridge & Gate receiving station'}
          </div>
        </div>
      </div>

      {/* 3. Branch Breakdown Drilldown (Super Admin & Org Admin only) */}
      {(isSuperAdmin || isOrgAdmin) && summary?.branch_breakdown && summary.branch_breakdown.length > 0 && !selectedMine && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#2563eb" />
                <span>Subsidiary Branch Volume Comparison</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Click any branch card below to automatically filter and inspect its station-specific inward consignments:
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {summary.branch_breakdown.map((b) => (
              <button
                key={b.mine_id}
                onClick={() => setSelectedMine(String(b.mine_id))}
                className="clay-card"
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  border: selectedMine === String(b.mine_id) ? '2px solid #2563eb' : '1px solid var(--border-subtle)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                    {b.mine_name}
                  </span>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {b.mine_code}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {b.organization_name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>
                    {b.total_net_weight_tons} Tons
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    {b.total_consignments} Consignments {b.pending_count > 0 && `(${b.pending_count} pending)`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Hierarchical Cascading Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Organization & Branch Selectors (Cascading Scope) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              <Filter size={15} />
              <span>Scope Filter:</span>
            </div>

            {/* Organization Dropdown (Super Admin only) */}
            {isSuperAdmin ? (
              <select
                value={selectedOrg}
                onChange={(e) => {
                  setSelectedOrg(e.target.value);
                  setSelectedMine('');
                  setPage(1);
                }}
                className="clay-input"
                style={{ fontSize: '0.82rem', padding: '6px 10px', fontWeight: 600 }}
              >
                <option value="">🏢 All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.code})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
              }}>
                <Building2 size={13} color="#2563eb" />
                <span>{userOrgName || 'Eastern Coalfields Limited'}</span>
                <Lock size={12} color="#94a3b8" />
              </div>
            )}

            {/* Mine Branch Dropdown (Super Admin & Org Admin) */}
            {isSuperAdmin || isOrgAdmin ? (
              <select
                value={selectedMine}
                onChange={(e) => {
                  setSelectedMine(e.target.value);
                  setPage(1);
                }}
                className="clay-input"
                style={{ fontSize: '0.82rem', padding: '6px 10px', fontWeight: 600 }}
              >
                <option value="">⛏️ All Mine Branches</option>
                {mines
                  .filter((m) => !selectedOrg || Number(m.organization_id) === Number(selectedOrg))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
              </select>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
              }}>
                <Layers size={13} color="#059669" />
                <span>{userMineName || 'Rajmahal Open Cast Project'}</span>
                <Lock size={12} color="#94a3b8" />
              </div>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="clay-input"
              style={{ fontSize: '0.82rem', padding: '6px 10px', fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PASSED">Passed / Cleared</option>
              <option value="PENDING">Inspection Pending</option>
              <option value="CONDITIONAL">Conditional Acceptance</option>
              <option value="REJECTED">Quarantine / Rejected</option>
            </select>

            {/* Reset Filter Button */}
            {(selectedMine || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || (isSuperAdmin && selectedOrg)) && (
              <button
                onClick={() => {
                  if (isSuperAdmin) setSelectedOrg('');
                  if (isSuperAdmin || isOrgAdmin) setSelectedMine('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                  setPage(1);
                }}
                style={{
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Right: Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search challan, truck, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="clay-input"
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                fontSize: '0.82rem',
              }}
            />
          </form>
        </div>

        {/* Category Filter Chips Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(10, 41, 71, 0.08)',
        }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  boxShadow: isSelected ? '0 2px 6px rgba(10, 41, 71, 0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={13} color={isSelected ? '#ffffff' : cat.color} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Inward Materials Register Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Consignment Intake Register
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {materials.length} of {totalRecords} logged inward consignments
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(10, 41, 71, 0.1)', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '10px 12px' }}>Consignment & Time</th>
                <th style={{ padding: '10px 12px' }}>Station / Mine & Gate</th>
                <th style={{ padding: '10px 12px' }}>Material & Category</th>
                <th style={{ padding: '10px 12px' }}>Quantity & Unit</th>
                <th style={{ padding: '10px 12px' }}>Net Tonnage</th>
                <th style={{ padding: '10px 12px' }}>Supplier & Vehicle</th>
                <th style={{ padding: '10px 12px' }}>Inspection Status</th>
                <th style={{ padding: '10px 12px' }}>Logged By</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '8px' }}>
                      <RefreshCw size={24} />
                    </div>
                    <div>Loading inward materials registry...</div>
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Truck size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No material inward logs found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      No incoming material deliveries match your currently applied scope and category filters.
                    </div>
                    <button
                      onClick={() => setIsLogModalOpen(true)}
                      className="clay-btn"
                      style={{
                        marginTop: '1rem',
                        padding: '6px 14px',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      + Log First Material Inward
                    </button>
                  </td>
                </tr>
              ) : (
                materials.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(10, 41, 71, 0.05)',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    {/* Consignment & Date */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.84rem' }}>
                        {item.consignment_number}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>

                    {/* Mine & Gate */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.mine_name || 'Station Mine'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                        {item.entry_gate}
                      </div>
                    </td>

                    {/* Material & Category */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', maxWidth: '220px', whiteSpace: 'normal' }}>
                        {item.material_name}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        {renderCategoryBadge(item.category)}
                      </div>
                    </td>

                    {/* Quantity & Unit */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        {Number(item.quantity).toLocaleString()}
                      </span>{' '}
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                        {item.unit}
                      </span>
                    </td>

                    {/* Net Tonnage */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      {item.net_weight_tons ? (
                        <div style={{ fontWeight: 700, color: '#0284c7' }}>
                          {item.net_weight_tons} T
                          {item.gross_weight_tons && item.tare_weight_tons && (
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                              G:{item.gross_weight_tons} / T:{item.tare_weight_tons}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>—</span>
                      )}
                    </td>

                    {/* Supplier & Vehicle */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.supplier_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.vehicle_number}</span>
                        {item.challan_number && (
                          <span style={{ color: '#94a3b8' }}>• DC:{item.challan_number}</span>
                        )}
                      </div>
                    </td>

                    {/* Inspection Status */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      {renderStatusBadge(item.inspection_status)}
                      {item.inspected_by && (
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                          By: {item.inspected_by}
                        </div>
                      )}
                    </td>

                    {/* Logged By */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.logged_by_name || 'Staff User'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {item.logged_by_employee_code || ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => setViewingGatePass(item)}
                          className="clay-btn"
                          title="View Inward Gate Pass Slip"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                          }}
                        >
                          <Printer size={13} />
                          <span>Slip</span>
                        </button>

                        <button
                          onClick={() => {
                            setInspectingItem(item);
                            setInspectionStatusForm(item.inspection_status || 'PASSED');
                            setInspectionNotesForm(item.remarks || '');
                          }}
                          className="clay-btn"
                          title="Verify or update inspection status"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#059669',
                          }}
                        >
                          <FileCheck size={13} />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. "Log Inward Material" Modal Form (Accessible to EVERY Role) */}
      {/* ========================================================================= */}
      {isLogModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 41, 71, 0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-body)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(10, 41, 71, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Log Inbound Consignment & Materials
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Record incoming consumables, parts, explosives, or fuel arriving at mine gate
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Scope Station Indicator */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.82rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#2563eb" />
                  <span style={{ fontWeight: 600 }}>Receiving Station:</span>
                  <span style={{ fontWeight: 800, color: '#1e40af' }}>
                    {isSuperAdmin
                      ? 'Global Authority (Select branch below)'
                      : `${userMineName || 'Rajmahal OCP'} (${userOrgName || 'ECL'})`}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Operator: <strong>{currentUser.first_name || currentUser.username}</strong>
                </div>
              </div>

              {/* Station Selection (If Super Admin or Org Admin) */}
              {(isSuperAdmin || isOrgAdmin) && (
                <div style={{ display: 'grid', gridTemplateColumns: isSuperAdmin ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  {isSuperAdmin && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                        Target Organization *
                      </label>
                      <select
                        required
                        value={newLogForm.organization_id}
                        onChange={(e) => setNewLogForm({ ...newLogForm, organization_id: e.target.value, mine_id: '' })}
                        className="clay-input"
                        style={{ width: '100%', fontSize: '0.82rem' }}
                      >
                        <option value="">Select Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Target Mine Branch *
                    </label>
                    <select
                      required
                      value={newLogForm.mine_id}
                      onChange={(e) => setNewLogForm({ ...newLogForm, mine_id: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="">Select Mine Branch</option>
                      {mines
                        .filter((m) => !newLogForm.organization_id || Number(m.organization_id) === Number(newLogForm.organization_id))
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Material Details */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Boxes size={15} color="#2563eb" />
                  <span>Material Description & Category</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Material Name & Specification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OTR Dumper Radial Tires 27.00R49"
                      value={newLogForm.material_name}
                      onChange={(e) => setNewLogForm({ ...newLogForm, material_name: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      required
                      value={newLogForm.category}
                      onChange={(e) => setNewLogForm({ ...newLogForm, category: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Inward Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      placeholder="e.g. 50.00"
                      value={newLogForm.quantity}
                      onChange={(e) => setNewLogForm({ ...newLogForm, quantity: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Unit of Measure *
                    </label>
                    <select
                      required
                      value={newLogForm.unit}
                      onChange={(e) => setNewLogForm({ ...newLogForm, unit: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="TONS">TONS (Metric Tons)</option>
                      <option value="LITERS">LITERS (Fuel / Liquids)</option>
                      <option value="UNITS">UNITS (Parts / Spares)</option>
                      <option value="METERS">METERS (Belting / Cable)</option>
                      <option value="DRUMS">DRUMS (Oil / Grease)</option>
                      <option value="BOXES">BOXES (Detonators / Hardware)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Consignment & Transporter */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#059669" />
                  <span>Consignment Documents & Carrier</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Delivery Challan / Invoice # *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DC/2026/8921"
                      value={newLogForm.challan_number}
                      onChange={(e) => setNewLogForm({ ...newLogForm, challan_number: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Purchase Order (PO) #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PO-ECL-2026-4412"
                      value={newLogForm.purchase_order_number}
                      onChange={(e) => setNewLogForm({ ...newLogForm, purchase_order_number: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Supplier / Vendor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BEML Mining Spares Ltd"
                      value={newLogForm.supplier_name}
                      onChange={(e) => setNewLogForm({ ...newLogForm, supplier_name: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Transporter / Fleet Agency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Singhania Heavy Haulage"
                      value={newLogForm.transporter_name}
                      onChange={(e) => setNewLogForm({ ...newLogForm, transporter_name: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Truck / Vehicle No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JH-04-AB-8812"
                      value={newLogForm.vehicle_number}
                      onChange={(e) => setNewLogForm({ ...newLogForm, vehicle_number: e.target.value.toUpperCase() })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Driver Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newLogForm.driver_name}
                      onChange={(e) => setNewLogForm({ ...newLogForm, driver_name: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                      Driver Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={newLogForm.driver_phone}
                      onChange={(e) => setNewLogForm({ ...newLogForm, driver_phone: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Gate & Weighbridge Readings */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Weight size={15} color="#d97706" />
                  <span>Receiving Gate & Weighbridge Telemetry</span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                    Receiving Gate / Weighbridge Bay *
                  </label>
                  <select
                    value={newLogForm.entry_gate}
                    onChange={(e) => setNewLogForm({ ...newLogForm, entry_gate: e.target.value })}
                    className="clay-input"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    <option value="Gate 1 - Main North Weighbridge">Gate 1 - Main North Weighbridge</option>
                    <option value="Gate 2 - Central Admin & Logistics Stores">Gate 2 - Central Admin & Logistics Stores</option>
                    <option value="Gate 3 - Heavy Equipment Spares Bay">Gate 3 - Heavy Equipment Spares Bay</option>
                    <option value="Gate 4 - Explosives Magazine Depot">Gate 4 - Explosives Magazine Depot</option>
                    <option value="Pithead Shaft #1 Inward Bay">Pithead Shaft #1 Inward Bay</option>
                    <option value="South Pit Logistics Entry Gate">South Pit Logistics Entry Gate</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                      Gross Weight (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 42.50"
                      value={newLogForm.gross_weight_tons}
                      onChange={(e) => handleWeightChange('gross_weight_tons', e.target.value)}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                      Tare Weight (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 14.20"
                      value={newLogForm.tare_weight_tons}
                      onChange={(e) => handleWeightChange('tare_weight_tons', e.target.value)}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                      Net Weight (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Calculated"
                      value={newLogForm.net_weight_tons}
                      onChange={(e) => setNewLogForm({ ...newLogForm, net_weight_tons: e.target.value })}
                      className="clay-input"
                      style={{ width: '100%', fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}
                    />
                  </div>
                </div>
              </div>

              {/* Inspection & Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                    Receiving Inspection Status
                  </label>
                  <select
                    value={newLogForm.inspection_status}
                    onChange={(e) => setNewLogForm({ ...newLogForm, inspection_status: e.target.value })}
                    className="clay-input"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    <option value="PASSED">Passed / Cleared Immediately</option>
                    <option value="PENDING">Pending Detailed Inspection</option>
                    <option value="CONDITIONAL">Conditional Entry</option>
                    <option value="REJECTED">Rejected / Quarantine</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                    Remarks & Seal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DGMS standard certified. Seals verified intact."
                    value={newLogForm.remarks}
                    onChange={(e) => setNewLogForm({ ...newLogForm, remarks: e.target.value })}
                    className="clay-input"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="clay-btn"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="clay-btn"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                  }}
                >
                  {submittingLog ? 'Registering Consignment...' : '✓ Submit Gate Inward Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. "Printable Inward Gate Pass Slip" Modal */}
      {/* ========================================================================= */}
      {viewingGatePass && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 41, 71, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '2px solid #0A2947',
            padding: '2rem',
            borderRadius: '16px',
          }}>
            {/* Printable Pass Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #0A2947',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0A2947', letterSpacing: '-0.02em' }}>
                  COALMIN LOGISTICS COMMAND
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                  OFFICIAL INWARD MATERIAL DELIVERY PASS & WEIGHBRIDGE SLIP
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {viewingGatePass.mine_name} • {viewingGatePass.organization_name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block',
                  border: '1px dashed #0A2947',
                  padding: '4px 10px',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  backgroundColor: '#f8fafc',
                }}>
                  {viewingGatePass.consignment_number}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                  Issued: {new Date(viewingGatePass.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Pass Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Material Item</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{viewingGatePass.material_name}</strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#2563eb', marginTop: '2px' }}>
                  Category: {viewingGatePass.category}
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Delivered Quantity</span>
                <strong style={{ fontSize: '1.1rem', color: '#059669' }}>
                  {Number(viewingGatePass.quantity).toLocaleString()} {viewingGatePass.unit}
                </strong>
                {viewingGatePass.net_weight_tons && (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#0284c7' }}>
                    Net Weighed: {viewingGatePass.net_weight_tons} Metric Tons
                  </span>
                )}
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Carrier & Vehicle</span>
                <strong>{viewingGatePass.vehicle_number}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Driver: {viewingGatePass.driver_name || 'N/A'} {viewingGatePass.driver_phone ? `(${viewingGatePass.driver_phone})` : ''}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Transporter: {viewingGatePass.transporter_name || 'Vendor Fleet'}
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Supplier & Challan</span>
                <strong>{viewingGatePass.supplier_name}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Challan No: <strong>{viewingGatePass.challan_number}</strong>
                </div>
                {viewingGatePass.purchase_order_number && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    PO No: {viewingGatePass.purchase_order_number}
                  </div>
                )}
              </div>
            </div>

            {/* Weighbridge telemetry readings */}
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontSize: '0.76rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '4px' }}>
                Gate & Weighbridge Station Verification:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                <span>Entry Gate: <strong>{viewingGatePass.entry_gate}</strong></span>
                <span>Gross: <strong>{viewingGatePass.gross_weight_tons || '—'} T</strong></span>
                <span>Tare: <strong>{viewingGatePass.tare_weight_tons || '—'} T</strong></span>
                <span>Net: <strong>{viewingGatePass.net_weight_tons || '—'} T</strong></span>
              </div>
              {viewingGatePass.remarks && (
                <div style={{ marginTop: '4px', color: '#475569', fontStyle: 'italic' }}>
                  Notes: "{viewingGatePass.remarks}"
                </div>
              )}
            </div>

            {/* Signatures Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '1.5rem',
              borderTop: '1px solid #cbd5e1',
              marginTop: '1.5rem',
            }}>
              <div style={{ textAlign: 'center', minWidth: '150px' }}>
                <div style={{ borderBottom: '1px dashed #94a3b8', paddingBottom: '30px', marginBottom: '4px' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Driver Signature</span>
              </div>

              <div style={{ textAlign: 'center', minWidth: '150px' }}>
                <div style={{ borderBottom: '1px dashed #94a3b8', paddingBottom: '30px', marginBottom: '4px', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                  {viewingGatePass.inspected_by || viewingGatePass.logged_by_name}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Receiving Officer Sign</span>
              </div>
            </div>

            {/* Close & Print Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button
                onClick={() => setViewingGatePass(null)}
                className="clay-btn"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Close Slip
              </button>
              <button
                onClick={() => window.print()}
                className="clay-btn"
                style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={14} />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. "Update Inspection Status" Modal */}
      {/* ========================================================================= */}
      {inspectingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 41, 71, 0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-body)',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800 }}>
              Inspection & Quality Sign-Off
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#64748b' }}>
              Update clearance status for Consignment #{inspectingItem.consignment_number} ({inspectingItem.material_name})
            </p>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                  Inspection Determination *
                </label>
                <select
                  value={inspectionStatusForm}
                  onChange={(e) => setInspectionStatusForm(e.target.value)}
                  className="clay-input"
                  style={{ width: '100%', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <option value="PASSED">Cleared & Fully Accepted</option>
                  <option value="CONDITIONAL">Conditional Acceptance (Minor Observation)</option>
                  <option value="PENDING">Hold for Laboratory / DGMS Inspection</option>
                  <option value="REJECTED">Reject / Quarantine at Gate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                  Inspection Observation Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter quality test results, DGMS verification seal status, or remarks..."
                  value={inspectionNotesForm}
                  onChange={(e) => setInspectionNotesForm(e.target.value)}
                  className="clay-input"
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="clay-btn"
                  style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="clay-btn"
                  style={{
                    padding: '7px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                  }}
                >
                  {updatingStatus ? 'Updating...' : 'Save Inspection Sign-Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
