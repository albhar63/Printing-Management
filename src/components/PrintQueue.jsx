import React, { useState } from 'react';
import { Printer, CheckCircle, ExternalLink, Calendar, AlertTriangle, Layers, Scissors, Info } from 'lucide-react';
import { PRODUCT_TYPES, PAPER_TYPES, FINISH_TYPES, PRIORITY_MAP, STAGE_MAP } from '../utils/helpers';

export default function PrintQueue({ orders, updateOrderStage, updateOrder }) {
  // تصفية الطلبات في مرحلة الطباعة فقط
  const printOrders = orders.filter(o => o.stage === 'printing');
  
  // تتبع الطلبات التي بدأ العمال طباعتها فعلياً (تخزين محلي للعملية الحالية)
  const [activePrintingIds, setActivePrintingIds] = useState({});

  const handleStartPrinting = (orderId, e) => {
    e.stopPropagation();
    setActivePrintingIds(prev => ({ ...prev, [orderId]: true }));
    
    // إضافة لوج
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updatedLogs = [...(order.logs || [])];
      updatedLogs.push({
        stage: 'printing',
        time: new Date().toISOString(),
        note: 'بدأ فني الطباعة بتشغيل الماكينات لإنتاج الطلب'
      });
      updateOrder(orderId, { logs: updatedLogs });
    }
  };

  const handleFinishPrinting = (orderId, e) => {
    e.stopPropagation();
    setActivePrintingIds(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
    
    // نقل الطلب للمرحلة التالية: الفوترة والتحصيل (billing)
    updateOrderStage(orderId, 'billing');
  };

  return (
    <div className="print-queue-wrapper">
      <header className="queue-header">
        <div>
          <h1>مساحة عمل فنيي وعمال الطباعة</h1>
          <p className="subtitle">عرض الطلبات المعتمدة للتصميم وجاهزة للإنتاج الفوري على الماكينات</p>
        </div>
      </header>

      {printOrders.length === 0 ? (
        <div className="empty-queue-panel glass-panel">
          <Printer size={48} className="empty-queue-icon animate-pulse" />
          <h2>لا توجد طلبات طباعة نشطة حالياً</h2>
          <p className="text-muted">عند اعتماد أي تصميم من لوحة التحكم، سيظهر تلقائياً هنا لعمال الطباعة.</p>
        </div>
      ) : (
        <section className="print-cards-grid">
          {printOrders.map((order) => {
            const priority = PRIORITY_MAP[order.brief.priority] || { name: 'عادية', color: 'priority-low' };
            const product = PRODUCT_TYPES[order.brief.product]?.name || 'طلب خاص';
            const paper = PAPER_TYPES[order.brief.paperType]?.name || 'خامة خاصة';
            const finish = FINISH_TYPES[order.brief.finish]?.name || 'بدون سلفان';
            
            // جلب رابط التصميم المعتمد الأخير للطباعة
            const approvedDraft = order.designDrafts?.find(d => d.status === 'approved') || order.designDrafts?.[order.designDrafts.length - 1];
            const isPrinting = activePrintingIds[order.id];

            return (
              <div key={order.id} className={`print-queue-card glass-panel ${isPrinting ? 'border-printing-active' : ''}`}>
                <div className="queue-card-header">
                  <div className="card-top-info">
                    <span className="queue-order-id">{order.id}</span>
                    <span className={`badge ${
                      order.brief.priority === 'high' ? 'badge-danger' : 
                      order.brief.priority === 'medium' ? 'badge-pending' : 'badge-design'
                    }`}>
                      أولوية: {priority.name}
                    </span>
                  </div>
                  <span className="queue-due-date">
                    <Calendar size={14} />
                    مطلوب للتسليم: {order.brief.dueDate}
                  </span>
                </div>

                <div className="queue-card-body">
                  <div className="queue-client-block">
                    <strong>اسم العميل / الشركة:</strong>
                    <span>{order.client.name} {order.client.company ? `(${order.client.company})` : ''}</span>
                  </div>

                  <div className="queue-specs-table">
                    <div className="spec-row">
                      <span className="spec-row-label">المنتج:</span>
                      <strong className="spec-row-value text-indigo">{product}</strong>
                    </div>
                    <div className="spec-row">
                      <span className="spec-row-label">الكمية:</span>
                      <strong className="spec-row-value">{order.brief.quantity} حبة</strong>
                    </div>
                    <div className="spec-row">
                      <span className="spec-row-label">الخامة والورق:</span>
                      <span className="spec-row-value">{paper}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-row-label">المقاس / الأبعاد:</span>
                      <span className="spec-row-value font-mono">{order.brief.dimensions || 'غير محدد'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-row-label">التشطيب الفني:</span>
                      <span className="spec-row-value">{finish}</span>
                    </div>
                  </div>

                  {order.brief.notes && (
                    <div className="queue-notes-bubble">
                      <Info size={14} />
                      <p><strong>ملاحظات هامة:</strong> {order.brief.notes}</p>
                    </div>
                  )}

                  {/* معاينة التصميم للعمال */}
                  {approvedDraft ? (
                    <div className="queue-design-preview">
                      <span className="preview-label">ملف التصميم المعتمد للطباعة:</span>
                      <div className="preview-img-box">
                        <img src={approvedDraft.url} alt="التصميم المعتمد" className="queue-approved-img" />
                        <a href={approvedDraft.url} target="_blank" rel="noreferrer" className="open-large-link" title="افتح الملف بجودته الكاملة للطباعة">
                          <ExternalLink size={14} /> فتح الملف الأصلي
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="queue-no-design-error">
                      <AlertTriangle size={16} />
                      <span>تحذير: لا يوجد ملف تصميم معتمد مرفق! يرجى مراجعة الإدارة.</span>
                    </div>
                  )}
                </div>

                <div className="queue-card-actions">
                  {!isPrinting ? (
                    <button className="btn btn-primary w-full" onClick={(e) => handleStartPrinting(order.id, e)}>
                      <Printer size={16} />
                      بدء الطباعة والتشغيل الآن
                    </button>
                  ) : (
                    <div className="printing-in-progress-block">
                      <div className="printing-spinner-row">
                        <div className="printer-spinning-icon">⚙️</div>
                        <span>جاري الطباعة والإنتاج حالياً...</span>
                      </div>
                      <button className="btn btn-success w-full" onClick={(e) => handleFinishPrinting(order.id, e)}>
                        <CheckCircle size={16} />
                        تم الانتهاء! تحويل للفوترة والتسليم
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <style>{`
        .print-queue-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .queue-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .empty-queue-panel {
          text-align: center;
          padding: 4rem 2rem;
          background-color: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .empty-queue-icon {
          color: var(--text-muted);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .print-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .print-queue-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: var(--transition-normal);
        }

        .border-printing-active {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 12px var(--primary-glow) !important;
        }

        .queue-card-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .queue-order-id {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 800;
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .queue-due-date {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--warning-color);
          font-weight: 700;
        }

        .queue-card-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }

        .queue-client-block {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .queue-specs-table {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .spec-row-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .spec-row-value {
          color: var(--text-primary);
          font-weight: 700;
        }

        .text-indigo {
          color: var(--primary-color) !important;
        }

        .queue-notes-bubble {
          background-color: var(--warning-bg);
          border: 1px solid var(--warning-border);
          color: var(--text-primary);
          padding: 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .queue-notes-bubble p {
          line-height: 1.4;
        }

        .queue-design-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .preview-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .preview-img-box {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-primary);
        }

        .queue-approved-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .open-large-link {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(15, 23, 42, 0.75);
          color: white;
          text-align: center;
          padding: 0.35rem;
          font-size: 0.75rem;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .open-large-link:hover {
          background-color: var(--primary-color);
        }

        .queue-no-design-error {
          background-color: var(--danger-bg);
          border: 1px solid var(--danger-border);
          color: var(--danger-color);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }

        .printing-in-progress-block {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .printing-spinner-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .printer-spinning-icon {
          animation: spin 2s linear infinite;
          font-size: 1.1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
