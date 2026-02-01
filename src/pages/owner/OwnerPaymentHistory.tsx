/**
 * Owner Payment History Page
 * Shows all platform commission transactions
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerApiService } from '../../services/owner/ownerApi';
import type { PaymentHistory } from '../../services/owner/ownerApi';
import './OwnerPaymentHistory.css';

const OwnerPaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, [statusFilter, currentPage]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const data = await ownerApiService.getPaymentHistory({
        status: statusFilter || undefined,
        page: currentPage,
      });
      setPayments(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      completed: { label: '✅ Completed', class: 'badge-success' },
      pending: { label: '⏳ Pending', class: 'badge-warning' },
      failed: { label: '❌ Failed', class: 'badge-error' },
    };
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, class: 'badge-default' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading && !payments) {
    return (
      <div className="owner-payment-history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-payment-history">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div>
            <button onClick={() => navigate('/owner/dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <h1>💰 Payment History</h1>
            <p>Platform commission transactions</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <button onClick={fetchPaymentHistory} className="btn btn-primary">
          🔄 Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Payments Table */}
      {payments && payments.results.length > 0 ? (
        <>
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Settlement ID</th>
                  <th>Order ID</th>
                  <th>Admin</th>
                  <th>Order Total</th>
                  <th>Commission (2%)</th>
                  <th>Admin Settlement</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.results.map((payment) => (
                  <tr key={payment.id}>
                    <td><strong>#{payment.id}</strong></td>
                    <td>#{payment.order_id}</td>
                    <td>
                      <div className="admin-info">
                        <strong>{payment.admin.username}</strong>
                        <span className="admin-email">{payment.admin.email}</span>
                      </div>
                    </td>
                    <td className="amount">{formatCurrency(payment.order_total)}</td>
                    <td className="commission">{formatCurrency(payment.platform_commission)}</td>
                    <td className="settlement">{formatCurrency(payment.admin_settlement)}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{formatDate(payment.settlement_date)}</td>
                    <td>
                      <code>{payment.transaction_id}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(payments.previous || payments.next) && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!payments.previous || loading}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
              <span className="page-info">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!payments.next || loading}
                className="btn btn-secondary"
              >
                Next →
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-cards">
              <div className="summary-card">
                <span className="summary-label">Total Transactions</span>
                <span className="summary-value">{payments.count}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Total Commission Earned</span>
                <span className="summary-value commission">
                  {formatCurrency(
                    payments.results.reduce((sum, p) => sum + p.platform_commission, 0)
                  )}
                </span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Total Settled to Admins</span>
                <span className="summary-value settlement">
                  {formatCurrency(
                    payments.results.reduce((sum, p) => sum + p.admin_settlement, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Payment History</h3>
          <p>No commission transactions found</p>
        </div>
      )}
    </div>
  );
};

export default OwnerPaymentHistory;
