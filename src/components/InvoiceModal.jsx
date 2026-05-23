import React, { useState } from 'react';
import { X, Printer, CheckCircle, CreditCard, DollarSign, Award, ChevronDown } from 'lucide-react';
import { 
  PRODUCT_TYPES, 
  PAPER_TYPES, 
  FINISH_TYPES, 
  PAYMENT_STATUS_MAP, 
  PAYMENT_METHOD_MAP, 
  formatCurrency, 
  formatDate 
} from '../utils/helpers';

export default function InvoiceModal({ order, onClose, onPayInvoice, updateOrderStage }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mada');
  const [isSuccessPayment, setIsSuccessPayment] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('فضلاً أدخل مبلغ دفع صحيح.');
      return;
    }

    const remaining = order.pricing.total - order.pricing.paidAmount;
    if (amount > remaining) {
      alert(`المبلغ المدخل (${amount} ر.س) أكبر من المبلغ المتبقي (${remaining} ر.س).`);
      return;
    }

    onPayInvoice(order.id, amount, paymentMethod);
    setPaymentAmount('');
    
    setIsSuccessPayment(true);
    setTimeout(() => setIsSuccessPayment(false), 2500);
  };

  const handleCompleteOrder = () => {
    updateOrderStage(order.id, 'completed');
  };

  const handlePrint = () => {
    window.print();
  };

  const remainingBalance = order.pricing.total - order.pricing.paidAmount;
  const payStatus = PAYMENT_STATUS_MAP[order.pricing.paymentStatus] || { name: 'غير معروف', color: '' };
  const productMeta = PRODUCT_TYPES[order.brief.product] || { name: 'طلب خاص' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel invoice-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* هيدر المودال - لا يظهر عند الطباعة */}
        <div className="modal-header no-print">
          <h2>الفاتورة الضريبية للطلب: {order.id}</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              طباعة الفاتورة
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* جسم الفاتورة (الجزء القابل للطباعة) */}
        <div className="modal-body invoice-print-container">
          
          {/* ترويسة الفاتورة */}
          <header className="invoice-header">
            <div className="invoice-shop-branding">
              <div className="invoice-logo">🖨️</div>
              <div className="invoice-shop-info">
                <span className="shop-name-ar">مؤسسة مطبعة برنت فلو برو للطباعة</span>
                <span className="shop-vat-number">الرقم الضريبي: 300123456700003</span>
                <span className="shop-address">المملكة العربية السعودية، الرياض</span>
              </div>
            </div>

            <div className="invoice-meta-info">
              <span className="invoice-title">فاتورة ضريبية مبسطة</span>
              <div className="meta-info-grid">
                <div className="meta-cell">
                  <strong>رقم الفاتورة:</strong>
                  <span>INV-{order.id.replace('PF-', '')}</span>
                </div>
                <div className="meta-cell">
                  <strong>التاريخ:</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="meta-cell">
                  <strong>رقم الطلب:</strong>
                  <span>{order.id}</span>
                </div>
              </div>
            </div>
          </header>

          <hr className="invoice-divider" />

          {/* بيانات العميل بالفاتورة */}
          <section className="invoice-client-section">
            <h3 className="invoice-sec-title">العميل</h3>
            <div className="invoice-client-details">
              <div className="client-meta-box">
                <strong>الاسم:</strong> <span>{order.client.name}</span>
              </div>
              <div className="client-meta-box">
                <strong>رقم الجوال:</strong> <span>{order.client.phone}</span>
              </div>
              {order.client.company && (
                <div className="client-meta-box">
                  <strong>الشركة:</strong> <span>{order.client.company}</span>
                </div>
              )}
              {order.client.email && (
                <div className="client-meta-box">
                  <strong>البريد:</strong> <span>{order.client.email}</span>
                </div>
              )}
            </div>
          </section>

          {/* جدول بنود الفاتورة */}
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>الوصف والبيان</th>
                <th>المواصفات الفنية</th>
                <th>الكمية</th>
                <th>سعر الوحدة الأساسي</th>
                <th>الإجمالي الخاضع للضريبة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{productMeta.name}</strong>
                  <p className="item-secondary-notes">طباعة وإنتاج فني مخصص للطلب {order.id}</p>
                </td>
                <td className="font-small">
                  <span>الخامة: {PAPER_TYPES[order.brief.paperType]?.name}</span>
                  <br />
                  <span>اللمسة الفنية: {FINISH_TYPES[order.brief.finish]?.name}</span>
                  <br />
                  <span>المقاس: {order.brief.dimensions || 'حسب التصميم'}</span>
                </td>
                <td>{order.brief.quantity}</td>
                <td>
                  {order.brief.product === 'custom' || order.brief.product === 'banners'
                    ? formatCurrency(order.pricing.basePrice / order.brief.quantity)
                    : formatCurrency(PRODUCT_TYPES[order.brief.product]?.basePricePerUnit)}
                </td>
                <td>{formatCurrency(order.pricing.basePrice + order.pricing.extras)}</td>
              </tr>
            </tbody>
          </table>

          {/* خلاصة التكاليف والضريبة المضافة */}
          <footer className="invoice-footer-section">
            
            {/* باركود التوثيق (موقعه يسار باللغة العربية) */}
            <div className="invoice-qr-code-block">
              {/* محاكاة لرمز الـ QR الضريبي لهيئة الزكاة والضريبة والجمارك */}
              <div className="qr-box">
                <svg viewBox="0 0 100 100" className="qr-svg">
                  <path d="M10 10h20v20H10zm5 5v10h10V15zM40 10h10v10H40zm20 0h20v20H60zm5 5v10h10V15zM10 40h10v10H10zm20 40h10v10H30zm20-20h20v20H50zm5 5v10h10V55zM10 60h20v20H10zm5 5v10h10V65zm70-25h10v10H80zm0 20h10v10H80zm-20 20h10v10H60z" fill="currentColor"/>
                </svg>
              </div>
              <span className="qr-hint">فاتورة موثقة إلكترونياً</span>
            </div>

            {/* تفاصيل المجموع والضريبة المضافة */}
            <div className="invoice-totals-block">
              <div className="totals-row">
                <span>المجموع الفرعي:</span>
                <span>{formatCurrency(order.pricing.basePrice + order.pricing.extras)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="totals-row discount-row text-danger">
                  <span>الخصم الممنوح:</span>
                  <span>- {formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>المبلغ الخاضع للضريبة (بعد الخصم):</span>
                <span>{formatCurrency(Math.max(0, order.pricing.basePrice + order.pricing.extras - order.pricing.discount))}</span>
              </div>
              <div className="totals-row">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{formatCurrency(order.pricing.tax)}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span>الإجمالي النهائي شامل الضريبة:</span>
                <span className="grand-total-val">{formatCurrency(order.pricing.total)}</span>
              </div>
              
              <hr className="totals-divider" />

              <div className="totals-row">
                <span>إجمالي المبلغ المدفوع:</span>
                <span className="text-emerald">{formatCurrency(order.pricing.paidAmount)}</span>
              </div>
              <div className="totals-row">
                <span>المبلغ المتبقي للتحصيل:</span>
                <span className={remainingBalance > 0 ? 'text-danger font-bold' : 'text-emerald'}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
              <div className="totals-row align-center">
                <span>حالة الفاتورة والتحصيل:</span>
                <span className={`badge ${payStatusMeta.color}`}>{payStatusMeta.name}</span>
              </div>
            </div>
          </footer>

        </div>

        {/* لوحة تسجيل العمليات المالية والتحصيل - لا تظهر بالطباعة */}
        {remainingBalance > 0 && (
          <section className="payment-action-panel no-print">
            <h3 className="panel-title">
              <CreditCard size={18} />
              تسجيل عملية تحصيل ودفع جديدة
            </h3>
            
            {isSuccessPayment && (
              <div className="payment-success-msg">
                <CheckCircle size={16} />
                <span>تم تسجيل الدفعة بنجاح وتحديث الفاتورة!</span>
              </div>
            )}

            <form onSubmit={handlePay} className="payment-form-inline">
              <div className="form-group flex-1 mb-0">
                <label className="form-label sr-only">المبلغ المدفوع (ريال)</label>
                <div className="payment-input-container">
                  <input 
                    type="number" 
                    className="form-control w-full"
                    placeholder={`أدخل المبلغ المدفوع (المتبقي: ${remainingBalance} ريال)`}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={remainingBalance}
                    min="1"
                    required
                  />
                  <span className="currency-label">SAR</span>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label sr-only">طريقة الدفع</label>
                <select 
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="mada">مدى (Mada)</option>
                  <option value="cash">نقدي</option>
                  <option value="credit_card">بطاقة ائتمانية</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success">
                تسجيل السداد
              </button>
            </form>
          </section>
        )}

        {/* خطوة تسليم الأوردر وإنهاء الدورة - لا تظهر بالطباعة */}
        {order.stage === 'billing' && remainingBalance === 0 && (
          <div className="complete-order-panel no-print">
            <Award size={20} className="complete-award-icon" />
            <div className="complete-info-text">
              <strong>الفاتورة مدفوعة بالكامل!</strong>
              <p>يمكنك الآن تسليم العميل مطبوعاته ونقل الطلب لحالة "الانتهاء والتسليم".</p>
            </div>
            <button className="btn btn-primary" onClick={handleCompleteOrder}>
              إكمال وتسليم الطلب للعميل
            </button>
          </div>
        )}

      </div>

      <style>{`
        .invoice-modal-container {
          max-width: 900px;
        }

        .no-print {
          display: flex;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        @media (max-width: 600px) {
          .invoice-header {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .invoice-shop-branding {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .invoice-logo {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .invoice-shop-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .shop-name-ar {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .shop-vat-number, .shop-address {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .invoice-meta-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        @media (max-width: 600px) {
          .invoice-meta-info {
            align-items: flex-start;
            width: 100%;
          }
        }

        .invoice-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--primary-color);
        }

        .meta-info-grid {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
        }

        .meta-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        @media (max-width: 600px) {
          .meta-cell {
            align-items: flex-start;
          }
        }

        .meta-cell strong {
          color: var(--text-muted);
        }

        .meta-cell span {
          font-weight: 700;
          color: var(--text-primary);
        }

        .invoice-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 1.25rem 0;
        }

        .invoice-client-section {
          margin-bottom: 1.25rem;
        }

        .invoice-sec-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .invoice-client-details {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .client-meta-box {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .client-meta-box strong {
          color: var(--text-muted);
        }

        .client-meta-box span {
          color: var(--text-primary);
          font-weight: 700;
        }

        .invoice-items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .invoice-items-table th, .invoice-items-table td {
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          text-align: right;
        }

        .invoice-items-table th {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 700;
        }

        .item-secondary-notes {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
          font-weight: 500;
        }

        .font-small {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .invoice-footer-section {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 600px) {
          .invoice-footer-section {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        .invoice-qr-code-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          max-width: 160px;
        }

        .qr-box {
          width: 100px;
          height: 100px;
          color: var(--text-primary);
        }

        .qr-svg {
          width: 100%;
          height: 100%;
        }

        .qr-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .invoice-totals-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .totals-row.grand-total-row {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.5rem 0;
          margin: 0.25rem 0;
        }

        .grand-total-val {
          color: var(--primary-color);
          font-size: 1.25rem;
        }

        .totals-divider {
          border: 0;
          border-top: 1px dashed var(--border-color);
          margin: 0.25rem 0;
        }

        .payment-action-panel {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .panel-title {
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .payment-success-msg {
          background-color: var(--success-bg);
          color: var(--success-color);
          border: 1px solid var(--success-border);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideDown 0.3s ease-out;
        }

        .payment-form-inline {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        @media (max-width: 600px) {
          .payment-form-inline {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .payment-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-label {
          position: absolute;
          left: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .payment-input-container .form-control {
          padding-left: 2.5rem;
        }

        .complete-order-panel {
          background-color: var(--success-bg);
          border: 1px solid var(--success-border);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        @media (max-width: 600px) {
          .complete-order-panel {
            flex-direction: column;
            text-align: center;
          }
        }

        .complete-award-icon {
          color: var(--success-color);
          flex-shrink: 0;
        }

        .complete-info-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.9rem;
        }

        .complete-info-text strong {
          color: var(--success-color);
        }

        .complete-info-text p {
          color: var(--text-secondary);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* تنسيقات الطباعة */
        @media print {
          .no-print, .modal-header, .payment-action-panel, .complete-order-panel {
            display: none !important;
          }
          .invoice-print-container {
            display: block !important;
            padding: 2cm !important;
          }
          .invoice-divider {
            border-top-color: #000000 !important;
          }
          .invoice-items-table th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
