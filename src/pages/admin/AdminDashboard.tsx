import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Building2,
  Activity,
  AlertCircle,
  Filter,
  ShoppingBag,
  Package,
  DollarSign,
  LogIn,
} from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface PlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  recentActivityCount: number;
}

interface PlatformActivityStats {
  dau: number;
  wau: number;
  mau: number;
  avg_session_minutes: number;
  trend: { date: string; users: number }[];
}

interface BusinessOption {
  id: string;
  business_name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActivityLog = any;

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    recentActivityCount: 0,
  });
  const [activityStats, setActivityStats] = useState<PlatformActivityStats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('ALL');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

  // Initial load of global stats and business list
  useEffect(() => {
    const fetchGlobalStats = async () => {
      setIsLoading(true);
      try {
        const [
          { count: usersCount },
          { count: businessesCount },
          { count: activityCount },
          { data: bizList },
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('businesses').select('id', { count: 'exact', head: true }),
          supabase
            .from('audit_logs')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
          supabase.from('businesses').select('id, business_name').order('business_name'),
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalBusinesses: businessesCount || 0,
          recentActivityCount: activityCount || 0,
        });

        if (bizList) {
          setBusinesses(bizList);
        }
      } catch (err) {
        console.error('Error fetching global stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  // Filtered load of activity analytics and logs
  useEffect(() => {
    const fetchFilteredActivity = async () => {
      setIsActivityLoading(true);
      try {
        const p_business_id = selectedBusinessId === 'ALL' ? null : selectedBusinessId;

        // Build view query
        let logsQuery = supabase
          .from('admin_activity_logs_view')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (selectedBusinessId !== 'ALL') {
          logsQuery = logsQuery.eq('business_id', selectedBusinessId);
        }

        if (selectedActivityType !== 'ALL') {
          logsQuery = logsQuery.eq('action', selectedActivityType);
        }

        const [{ data: activityData }, { data: logsData, error: logsError }] = await Promise.all([
          supabase.rpc('get_platform_activity_stats', { p_business_id }),
          logsQuery,
        ]);

        if (activityData) {
          setActivityStats(activityData);
        }

        if (logsError) {
          console.error('Error fetching logs view (ensure SQL view is created):', logsError);
        } else if (logsData) {
          setRecentLogs(logsData);
        }
      } catch (err) {
        console.error('Error fetching filtered activities:', err);
      } finally {
        setIsActivityLoading(false);
      }
    };

    fetchFilteredActivity();
  }, [selectedBusinessId, selectedActivityType]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'record_sale':
        return {
          label: 'Sale Recorded',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          icon: <ShoppingBag size={14} />,
        };
      case 'create_product':
        return {
          label: 'Product Added',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#3B82F6',
          icon: <Package size={14} />,
        };
      case 'update_product':
        return {
          label: 'Product Updated',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#3B82F6',
          icon: <Package size={14} />,
        };
      case 'record_expense':
        return {
          label: 'Expense Recorded',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          icon: <DollarSign size={14} />,
        };
      case 'app_open':
        return {
          label: 'App Opened',
          bg: 'rgba(139, 92, 246, 0.15)',
          color: '#8B5CF6',
          icon: <LogIn size={14} />,
        };
      default:
        return {
          label: action || 'Activity',
          bg: 'rgba(107, 114, 128, 0.15)',
          color: '#6B7280',
          icon: <Activity size={14} />,
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: 'var(--text-main)' }}>
          Platform Overview
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          High-level metrics for the BizTrack platform.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <KPICard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={20} />}
          trendPercentage={0}
          trendLabel="All time"
          neutralTrend={true}
        />
        <KPICard
          title="Total Businesses"
          value={stats.totalBusinesses.toLocaleString()}
          icon={<Building2 size={20} />}
          trendPercentage={0}
          trendLabel="All time"
          neutralTrend={true}
        />
        <KPICard
          title="Total Events (24h)"
          value={stats.recentActivityCount.toLocaleString()}
          icon={<Activity size={20} />}
          trendPercentage={0}
          trendLabel="Across platform"
          neutralTrend={true}
        />
      </div>

      {/* FILTER CONTROLS FOR ACTIVITY & ANALYTICS */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-main)',
            fontWeight: 600,
          }}
        >
          <Filter size={18} color="var(--primary-color)" />
          <span>Filter Engagement & Activities:</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              By Business:
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Businesses (Platform Wide)</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.business_name || `Unnamed (${b.id.substring(0, 8)})`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Activity Type:
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Activity Types</option>
              <option value="app_open">App Opens</option>
              <option value="record_sale">Sales Recorded</option>
              <option value="create_product">Inventory (Add Product)</option>
              <option value="update_product">Inventory (Update Product)</option>
              <option value="record_expense">Expenses Recorded</option>
            </select>
          </div>
        </div>
      </div>

      {isActivityLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <>
          {activityStats && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                Engagement & Usage{' '}
                {selectedBusinessId !== 'ALL' ? `for Selected Business` : '(Last 30 Days)'}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    Daily Active Users (DAU)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {activityStats.dau}
                  </div>
                </div>
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    Monthly Active Users (MAU)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {activityStats.mau}
                  </div>
                </div>
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    Average Session Length
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {activityStats.avg_session_minutes} min
                  </div>
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: '20px',
                  background: 'var(--surface-color)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  DAU Trend (Last 30 Days)
                </div>
                <ActivityChart data={activityStats.trend || []} />
              </div>
            </div>
          )}

          <div
            className="card"
            style={{
              padding: '24px',
              background: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                Recent Platform Activity
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing up to 30 recent events
              </span>
            </div>

            {recentLogs.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {recentLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        padding: '14px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            padding: '10px',
                            background: badge.bg,
                            color: badge.color,
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {badge.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.color}40`,
                              }}
                            >
                              {badge.label}
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                              }}
                            >
                              {log.business_name ? `🏢 ${log.business_name}` : 'Unassigned / HQ'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Performed by{' '}
                            <strong style={{ color: 'var(--text-main)' }}>
                              {log.user_email || log.user_name || 'System User'}
                            </strong>
                            {log.metadata?.product_name &&
                              ` on item: "${log.metadata.product_name}"`}
                            {log.metadata?.method && ` via ${log.metadata.method}`}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(log.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                  padding: '24px 0',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={18} color="var(--text-muted)" />
                <span>
                  No activities match your current filter selection. (Make sure you applied the
                  latest SQL migration!)
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
