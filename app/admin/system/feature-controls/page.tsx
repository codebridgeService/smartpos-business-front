'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FeatureControl,
  MaintenanceType,
  FeatureStatus,
} from '@/types/feature-control';
import {
  getFeatureControls,
  createFeatureControl,
  updateFeatureControl,
  deleteFeatureControl,
  startMaintenance,
  activateFeature,
  disableFeature,
  extendMaintenance,
  restoreFeatureControl,
} from '@/lib/api/feature-controls';

const STANDARD_FEATURE_KEYS = [
  { key: 'dashboard.products', name: 'Products Dashboard', service: 'Product Service' },
  { key: 'dashboard.inventory', name: 'Inventory Dashboard', service: 'Product Service' },
  { key: 'dashboard.sales', name: 'Sales Dashboard', service: 'Business Service' },
  { key: 'dashboard.customers', name: 'Customers Dashboard', service: 'Business Service' },
  { key: 'dashboard.reports', name: 'Reports Dashboard', service: 'Business Service' },
  { key: 'product.create', name: 'Create Product Action', service: 'Product Service' },
  { key: 'product.update', name: 'Update Product Action', service: 'Product Service' },
  { key: 'product.delete', name: 'Delete Product Action', service: 'Product Service' },
  { key: 'product.import', name: 'Import Products Action', service: 'Product Service' },
  { key: 'inventory.adjust', name: 'Adjust Inventory Action', service: 'Product Service' },
  { key: 'inventory.transfer', name: 'Transfer Inventory Action', service: 'Product Service' },
  { key: 'sales.checkout', name: 'POS Checkout Register', service: 'Business Service' },
  { key: 'sales.refund', name: 'Sales Refund Action', service: 'Business Service' },
  { key: 'sales.void', name: 'Sales Void Action', service: 'Business Service' },
];

export default function FeatureControlsAdminPage() {
  const [controls, setControls] = useState<FeatureControl[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedControl, setSelectedControl] = useState<FeatureControl | null>(null);

  // Form states for Maintenance Modal
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('BUG_FIX');
  const [reason, setReason] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<number>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [showCountdown, setShowCountdown] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states for Create Feature Modal
  const [newKey, setNewKey] = useState<string>('dashboard.products');
  const [newName, setNewName] = useState<string>('Products Dashboard');
  const [newService, setNewService] = useState<string>('Product Service');
  const [newDescription, setNewDescription] = useState<string>('');

  // Live timer tick for table countdowns
  const [, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadFeatureControls = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFeatureControls({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setControls(data);
    } catch (err) {
      console.error('Failed to load feature controls:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadFeatureControls();
  }, [loadFeatureControls]);

  // Handle Quick Actions
  const handleActivate = async (uuid: string) => {
    try {
      await activateFeature(uuid);
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to activate feature: ' + err);
    }
  };

  const handleDisable = async (uuid: string) => {
    const disableReason = prompt('Enter reason for disabling this feature:');
    if (disableReason === null) return;

    try {
      await disableFeature(uuid, disableReason);
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to disable feature: ' + err);
    }
  };

  const handleExtend = async (uuid: string, minutes: number) => {
    try {
      await extendMaintenance(uuid, { minutes });
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to extend maintenance: ' + err);
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this feature control rule?')) return;
    try {
      await deleteFeatureControl(uuid);
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to delete: ' + err);
    }
  };

  const handleOpenMaintenanceModal = (control: FeatureControl) => {
    setSelectedControl(control);
    setMaintenanceType(control.maintenance_type || 'BUG_FIX');
    setReason(control.reason || 'Fixing system issue and optimizing stability');
    setEstimatedHours(1);
    setEstimatedMinutes(0);
    setShowCountdown(control.show_countdown ?? true);
    setIsMaintenanceModalOpen(true);
  };

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedControl) return;

    setIsSubmitting(true);
    try {
      const targetTime = new Date();
      targetTime.setHours(targetTime.getHours() + Number(estimatedHours));
      targetTime.setMinutes(targetTime.getMinutes() + Number(estimatedMinutes));

      await startMaintenance(selectedControl.uuid, {
        maintenance_type: maintenanceType,
        reason,
        estimated_completed_at: targetTime.toISOString(),
        show_countdown: showCountdown,
      });

      setIsMaintenanceModalOpen(false);
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to start maintenance: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Find business UUID from existing controls or dummy fallback
      const businessUuid = controls[0]?.business_uuid || '00000000-0000-0000-0000-000000000001';

      await createFeatureControl({
        business_uuid: businessUuid,
        feature_key: newKey,
        name: newName,
        service: newService,
        description: newDescription,
        status: 'ACTIVE',
        show_countdown: true,
        allow_owner_bypass: true,
        allow_admin_bypass: true,
      });

      setIsCreateModalOpen(false);
      await loadFeatureControls();
    } catch (err) {
      alert('Failed to register feature: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format live remaining countdown
  const getRemainingTimeFormatted = (estimatedTimeStr?: string | null) => {
    if (!estimatedTimeStr) return '--:--:--';
    const diff = new Date(estimatedTimeStr).getTime() - Date.now();
    if (diff <= 0) return '00:00:00';

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Feature Controls & Maintenance Manager
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centrally manage application features, trigger maintenance mode with live countdowns, and protect operational stability.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Register Feature Control
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search feature key, name, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'MAINTENANCE', 'DISABLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Feature / Key</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Maintenance Details</th>
                <th className="py-3.5 px-4 text-center">Countdown</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading feature controls...</p>
                  </td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No feature controls found. Click &quot;Register Feature Control&quot; to add one.
                  </td>
                </tr>
              ) : (
                controls.map((control) => {
                  const isMaint = control.status === 'MAINTENANCE';
                  const isDis = control.status === 'DISABLED';
                  const countdownStr = isMaint ? getRemainingTimeFormatted(control.estimated_completed_at) : null;

                  return (
                    <tr key={control.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Feature & Key */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {control.name}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {control.feature_key}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {control.service || 'Core POS'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {control.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ACTIVE
                          </span>
                        )}
                        {isMaint && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            MAINTENANCE
                          </span>
                        )}
                        {isDis && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            DISABLED
                          </span>
                        )}
                      </td>

                      {/* Maintenance details */}
                      <td className="py-3.5 px-4">
                        {isMaint ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {control.maintenance_type?.replace(/_/g, ' ')}
                            </span>
                            <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                              {control.reason || 'No description provided'}
                            </div>
                            {control.estimated_completed_at && (
                              <div className="text-[11px] text-slate-400">
                                Est: {new Date(control.estimated_completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        ) : isDis ? (
                          <span className="text-xs text-slate-400 italic">
                            {control.reason || 'Turned off by owner'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Operational</span>
                        )}
                      </td>

                      {/* Live Countdown */}
                      <td className="py-3.5 px-4 text-center">
                        {isMaint && countdownStr ? (
                          <div className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg">
                            <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                              {countdownStr}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isMaint ? (
                            <>
                              <button
                                onClick={() => handleActivate(control.uuid)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                title="Complete maintenance and activate feature"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleExtend(control.uuid, 30)}
                                className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                                title="Extend maintenance by +30 minutes"
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => handleExtend(control.uuid, 60)}
                                className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                                title="Extend maintenance by +1 hour"
                              >
                                +1h
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenMaintenanceModal(control)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                              >
                                Maintenance
                              </button>
                              {control.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleDisable(control.uuid)}
                                  className="px-2 py-1 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                >
                                  Disable
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(control.uuid)}
                                  className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                >
                                  Activate
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(control.uuid)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete rule"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Start Maintenance */}
      {isMaintenanceModalOpen && selectedControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Start Maintenance: {selectedControl.name}
              </h3>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Feature Key
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedControl.feature_key}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Maintenance Type
                </label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BUG_FIX">BUG FIX</option>
                  <option value="CODE_UPDATE">CODE UPDATE</option>
                  <option value="SOFTWARE_UPDATE">SOFTWARE UPDATE</option>
                  <option value="DATABASE_UPDATE">DATABASE UPDATE</option>
                  <option value="SECURITY_UPDATE">SECURITY UPDATE</option>
                  <option value="SERVER_MAINTENANCE">SERVER MAINTENANCE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Maintenance Reason (Shown on screen)
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Fixing product loading error and tuning database cache..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={72}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showCountdown"
                  checked={showCountdown}
                  onChange={(e) => setShowCountdown(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="showCountdown" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Display live countdown clock (HH : MM : SS) on user screen
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? 'Starting...' : 'Start Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Feature Control */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Register Feature Control
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Preset / Feature Key
                </label>
                <select
                  value={newKey}
                  onChange={(e) => {
                    const found = STANDARD_FEATURE_KEYS.find((k) => k.key === e.target.value);
                    setNewKey(e.target.value);
                    if (found) {
                      setNewName(found.name);
                      setNewService(found.service);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2"
                >
                  {STANDARD_FEATURE_KEYS.map((k) => (
                    <option key={k.key} value={k.key}>
                      {k.key} — ({k.name})
                    </option>
                  ))}
                  <option value="custom">Custom Key...</option>
                </select>

                {newKey === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="e.g. inventory.batch_edit"
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Feature Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Backend Service
                </label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional notes or documentation for this control..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Register Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
