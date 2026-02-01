/**
 * Owner Admin List Page
 * View all admins with their performance metrics
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerApiService } from '../../services/owner/ownerApi';
import type { AdminList } from '../../services/owner/ownerApi';
import './OwnerAdminList.css';

const OwnerAdminList: React.FC = () => {
  const navigate = useNavigate();
  const [adminList, setAdminList] = useState<AdminList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = async () => {
    try {
      setLoading(true);
      const data = await ownerApiService.getAdminList(searchQuery || undefined);
      setAdminList(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load admin list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminList();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !adminList) {
    return (
      <div className="owner-admin-list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-admin-list">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/owner/dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <h1>👥 Admin Management</h1>
            <p>View and manage all platform admins</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
        </form>
        
        <button onClick={fetchAdminList} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Admin Cards */}
      {adminList && adminList.results.length > 0 ? (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-value">{adminList.count}</div>
              <div className="stat-label">Total Admins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {adminList.results.filter(a => a.is_active).length}
              </div>
              <div className="stat-label">Active Admins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {adminList.results.reduce((sum, a) => sum + a.statistics.product_count, 0)}
              </div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {adminList.results.reduce((sum, a) => sum + a.statistics.completed_orders, 0)}
              </div>
              <div className="stat-label">Completed Orders</div>
            </div>
          </div>

          <div className="admins-grid">
            {adminList.results.map((admin) => (
              <div key={admin.id} className={`admin-card ${!admin.is_active ? 'inactive' : ''}`}>
                <div className="admin-header">
                  <div className="admin-avatar">
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-info">
                    <h3>{admin.username}</h3>
                    <p className="admin-email">{admin.email}</p>
                    <p className="admin-phone">{admin.phone_number}</p>
                  </div>
                  <div className="admin-status">
                    {admin.is_active ? (
                      <span className="badge badge-success">✅ Active</span>
                    ) : (
                      <span className="badge badge-error">❌ Inactive</span>
                    )}
                  </div>
                </div>

                <div className="admin-stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon">📦</div>
                    <div>
                      <div className="stat-number">{admin.statistics.product_count}</div>
                      <div className="stat-text">Products</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">🛒</div>
                    <div>
                      <div className="stat-number">{admin.statistics.total_orders}</div>
                      <div className="stat-text">Total Orders</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">✅</div>
                    <div>
                      <div className="stat-number">{admin.statistics.completed_orders}</div>
                      <div className="stat-text">Completed</div>
                    </div>
                  </div>
                </div>

                <div className="admin-revenue">
                  <div className="revenue-item">
                    <span className="revenue-label">Total Revenue</span>
                    <span className="revenue-value total">
                      {formatCurrency(admin.statistics.total_revenue)}
                    </span>
                  </div>
                  
                  <div className="revenue-item">
                    <span className="revenue-label">Platform Commission</span>
                    <span className="revenue-value commission">
                      {formatCurrency(admin.statistics.platform_commission_paid)}
                    </span>
                  </div>
                  
                  <div className="revenue-item">
                    <span className="revenue-label">Admin Earnings (98%)</span>
                    <span className="revenue-value earnings">
                      {formatCurrency(admin.statistics.admin_earnings)}
                    </span>
                  </div>
                </div>

                <div className="admin-footer">
                  <span className="joined-date">
                    Joined: {formatDate(admin.date_joined)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Admins Found</h3>
          <p>
            {searchQuery
              ? 'No admins match your search criteria'
              : 'No admins registered on the platform yet'}
          </p>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); fetchAdminList(); }} className="btn btn-primary">
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerAdminList;
