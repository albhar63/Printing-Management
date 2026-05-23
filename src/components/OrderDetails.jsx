import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  Send, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { 
  PRODUCT_TYPES, 
  PAPER_TYPES, 
  FINISH_TYPES, 
  PAYMENT_STATUS_MAP, 
  PRIORITY_MAP, 
  formatCurrency, 
  formatDateTime 
} from '../utils/helpers';

export default function OrderDetails({ order, onClose, onAddComment, onUploadDraft, onEvaluateDraft }) {
  const [commentInput, setCommentInput] = useState('');
  const [draftUrlInput, setDraftUrlInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  // الخيارات المقترحة لنماذج التصاميم السريعة لتجربة المستخدم
  const MOCK_MOCKUPS = [
    { name: 'تصميم بطاقات كلاسيك', url: 'https://images.unsplash.com/photo-1541462608141-2f682d68c94a?auto=format&fit=crop&q=80&w=600' },
    { name: 'هوية بصرية كاملة', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600' },
    { name: 'فلاير إعلاني فلات', url: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=600' },
    { name: 'لوحة بنر خارجية عريضة', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=600' }
  ];

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(order.id, 'الإدارة / المشرف', commentInput.trim());
    setCommentInput('');
  };

  const handleUploadDraft = (url) => {
    const targetUrl = url || draftUrlInput;
    if (!targetUrl.trim()) return;
    onUploadDraft(order.id, targetUrl.trim());
    setDraftUrlInput('');
  };

  const handleEvaluate = (draftId, status) => {
    if (status === 'rejected' && !feedbackInput.trim()) {
      alert('يرجى كتابة ملاحظات التعديل المطلوبة عند رفض التصميم.');
      return;
    }
    onEvaluateDraft(order.id, draftId, status, status === 'approved' ? 'معتمد للطباعة' : feedbackInput.trim());
    setFeedbackInput('');
    setSelectedDraftId(null);
  };

  const priorityMeta = PRIORITY_MAP[order.brief.priority] || { name: 'عادية', badgeColor: 'badge-design' };
  const payStatusMeta = PAYMENT_STATUS_MAP[order.pricing.paymentStatus] || { name: 'غير محدد', color: '' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* الهيدر */}
        <div className="modal-header">
          <div className="header-titles">
            <span className="order-details-id">{order.id}</span>
            <h2>تفاصيل ومتابعة الطلب والتصميم</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* جسم المودال */}
        <div className="modal-body">
          <div className="details-grid-layout">
            
            {/* الجزء الأيمن: البيانات والبريف */}
            <div className="details-right-col">
              {/* بيانات العميل */}
              <div className="detail-section-card">
                <h3 className="sub-section-title">بيانات العميل</h3>
                <div className="client-data-list">
                  <div className="client-data-item">
                    <User size={16} />
                    <span><strong>الاسم:</strong> {order.client.name}</span>
                  </div>
                  <div className="client-data-item">
                    <Phone size={16} />
                    <span><strong>الجوال:</strong> {order.client.phone}</span>
                  </div>
                  {order.client.company && (
                    <div className="client-data-item">
                      <Building size={16} />
                      <span><strong>الشركة:</strong> {order.client.company}</span>
                    </div>
                  )}
                  {order.client.email && (
                    <div className="client-data-item">
                      <Mail size={16} />
                      <span><strong>البريد:</strong> {order.client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات الطباعة */}
              <div className="detail-section-card">
                <h3 className="sub-section-title">مواصفات الطباعة المطلوبة</h3>
                <div className="specs-grid-display">
                  <div className="spec-display-item">
                    <span className="spec-label">المنتج:</span>
                    <span className="spec-value">{PRODUCT_TYPES[order.brief.product]?.name}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">الكمية:</span>
                    <span className="spec-value">{order.brief.quantity} حبة</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">الخامة:</span>
                    <span className="spec-value">{PAPER_TYPES[order.brief.paperType]?.name}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">اللمسة:</span>
                    <span className="spec-value">{FINISH_TYPES[order.brief.finish]?.name}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">الأبعاد:</span>
                    <span className="spec-value">{order.brief.dimensions || 'متروك للمصمم'}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">الأولوية:</span>
                    <span className={`badge ${priorityMeta.badgeColor}`}>{priorityMeta.name}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">المصمم:</span>
                    <span className="spec-value">{order.designer || 'لم يعين'}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">موعد التسليم:</span>
                    <span className="spec-value date-due-text">
                      <Calendar size={12} />
                      {order.brief.dueDate}
                    </span>
                  </div>
                </div>
                {order.brief.notes && (
                  <div className="notes-box-display">
                    <strong>البريف وملاحظات التصميم:</strong>
                    <p>{order.brief.notes}</p>
                  </div>
                )}

                {order.brief.files?.length > 0 && (
                  <div className="brief-files-section">
                    <h3 className="sub-section-title">ملفات العميل المرفقة بالبريف</h3>
                    <div className="brief-files-grid">
                      {order.brief.files.map((file) => (
                        <div key={file.id} className="brief-file-card glass-panel">
                          {file.type?.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="brief-file-thumb" />
                          ) : (
                            <div className="brief-file-icon">📎</div>
                          )}
                          <div className="brief-file-details">
                            <span className="file-name">{file.name}</span>
                            <div className="file-actions">
                              <a href={file.url} download={file.name} className="btn btn-secondary btn-sm">
                                تحميل الملف
                              </a>
                              <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-link btn-sm">
                                فتح
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* تفاصيل الحسابات */}
              <div className="detail-section-card">
                <h3 className="sub-section-title">الحسابات والمالية</h3>
                <div className="specs-grid-display pricing-specs">
                  <div className="spec-display-item">
                    <span className="spec-label">التكلفة الإجمالية:</span>
                    <span className="spec-value">{formatCurrency(order.pricing.total)}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">المدفوع مقدماً:</span>
                    <span className="spec-value text-emerald">{formatCurrency(order.pricing.paidAmount)}</span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">المتبقي المطلوب:</span>
                    <span className={`spec-value ${order.pricing.total - order.pricing.paidAmount > 0 ? 'text-danger' : 'text-emerald'}`}>
                      {formatCurrency(order.pricing.total - order.pricing.paidAmount)}
                    </span>
                  </div>
                  <div className="spec-display-item">
                    <span className="spec-label">حالة الدفع:</span>
                    <span className={`badge ${payStatusMeta.color}`}>{payStatusMeta.name}</span>
                  </div>
                </div>
              </div>

              {/* سجل الحركة والمتابعة التاريخية للطلب */}
              <div className="detail-section-card">
                <h3 className="sub-section-title">تاريخ وسجل التتبع للطلب</h3>
                <div className="timeline-trail">
                  {order.logs?.map((log, idx) => (
                    <div key={idx} className="timeline-trail-item">
                      <div className="timeline-icon-dot"></div>
                      <div className="timeline-trail-content">
                        <span className="timeline-trail-time">{formatDateTime(log.time)}</span>
                        <p className="timeline-trail-text">{log.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* الجزء الأيسر: مساحة المصمم والتصميم والتعليقات والتعديل */}
            <div className="details-left-col">
              
              {/* مساحة المصمم ورفع المسودات */}
              <div className="detail-section-card designer-section-card">
                <h3 className="sub-section-title">نماذج التصاميم والمسودات المرفوعة</h3>
                
                {/* رفع تصميم جديد */}
                <div className="upload-draft-form">
                  <label className="form-label font-bold">رفع مسودة تصميم جديدة (من قبل المصمم):</label>
                  <div className="draft-quick-upload">
                    <div className="form-group mb-0 flex-1">
                      <input 
                        type="text" 
                        placeholder="أدخل رابط صورة التصميم أو حدد مسودة سريعة"
                        value={draftUrlInput}
                        onChange={(e) => setDraftUrlInput(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleUploadDraft()}>
                      <Upload size={16} />
                      رفع النموذج
                    </button>
                  </div>

                  {/* اقتراحات تصاميم للتسهيل */}
                  <div className="quick-draft-suggestions">
                    <span className="text-muted">نماذج سريعة للتجربة:</span>
                    <div className="suggestions-list">
                      {MOCK_MOCKUPS.map((mockup, idx) => (
                        <button 
                          key={idx} 
                          className="suggestion-tag-btn"
                          onClick={() => handleUploadDraft(mockup.url)}
                          title="اضغط لرفع هذا التصميم كمحاكاة للتجربة"
                        >
                          {mockup.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* قائمة مسودات التصميم المرفوعة */}
                <div className="drafts-history-list">
                  {order.designDrafts?.length === 0 ? (
                    <div className="empty-drafts-state">
                      <HelpCircle size={24} />
                      <span>لا توجد تصاميم مرفوعة لهذا الطلب بعد. بانتظار عمل المصمم.</span>
                    </div>
                  ) : (
                    [...order.designDrafts].reverse().map((draft) => (
                      <div key={draft.id} className="draft-version-card glass-panel">
                        <div className="draft-version-header">
                          <span className="draft-v-tag">مسودة الإصدار رقم ({draft.version})</span>
                          <span className={`badge ${
                            draft.status === 'approved' ? 'badge-success' :
                            draft.status === 'rejected' ? 'badge-danger' : 'badge-design'
                          }`}>
                            {draft.status === 'approved' ? 'معتمد للطباعة' :
                             draft.status === 'rejected' ? 'مرفوض للتعديل' : 'بانتظار المراجعة'}
                          </span>
                        </div>
                        
                        <div className="draft-image-container">
                          <img src={draft.url} alt={`مسودة ${draft.version}`} className="draft-preview-img" />
                        </div>

                        {draft.feedback && (
                          <div className="draft-feedback-bubble">
                            <strong>ملاحظات المراجعة:</strong>
                            <p>{draft.feedback}</p>
                          </div>
                        )}

                        {/* أزرار اعتماد أو طلب تعديل */}
                        {draft.status === 'pending' && (
                          <div className="draft-evaluate-actions">
                            {selectedDraftId === draft.id ? (
                              <div className="rejection-form">
                                <textarea 
                                  className="form-control" 
                                  rows="2"
                                  placeholder="اكتب ملاحظات التعديل المطلوبة بدقة للمصمم..."
                                  value={feedbackInput}
                                  onChange={(e) => setFeedbackInput(e.target.value)}
                                ></textarea>
                                <div className="rejection-actions">
                                  <button className="btn btn-danger btn-sm" onClick={() => handleEvaluate(draft.id, 'rejected')}>
                                    <Send size={12} /> تأكيد الرفض والإرسال
                                  </button>
                                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDraftId(null)}>
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button className="btn btn-success flex-1" onClick={() => handleEvaluate(draft.id, 'approved')}>
                                  <CheckCircle size={16} /> اعتماد التصميم للطباعة
                                </button>
                                <button className="btn btn-danger flex-1" onClick={() => setSelectedDraftId(draft.id)}>
                                  <XCircle size={16} /> طلب تعديل (تعديلات)
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* قسم المحادثة والملاحظات المتبادلة بين الإدارة والمصمم والعميل */}
              <div className="detail-section-card">
                <h3 className="sub-section-title">لوحة التعليقات وملاحظات العميل والتعديلات</h3>
                
                <div className="chat-comments-thread">
                  {order.comments?.length === 0 ? (
                    <div className="empty-chat-state">
                      <MessageSquare size={20} />
                      <span>لا توجد تعليقات حتى الآن. اكتب تعليقاً بالأسفل.</span>
                    </div>
                  ) : (
                    order.comments.map((comment) => (
                      <div key={comment.id} className="chat-comment-bubble">
                        <div className="chat-comment-meta">
                          <span className="comment-sender">{comment.sender}</span>
                          <span className="comment-time">{formatDateTime(comment.time)}</span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendComment} className="chat-comment-input-form">
                  <input 
                    type="text" 
                    placeholder="اكتب تعديل، ملاحظة، أو تعليق هنا..." 
                    className="form-control"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-icon-only">
                    <Send size={18} />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

      </div>

      <style>{`
        .header-titles {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .order-details-id {
          background-color: var(--primary-glow);
          color: var(--primary-color);
          font-weight: 800;
          font-size: 1.1rem;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(79, 70, 229, 0.2);
        }

        .btn-close-modal {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }

        .btn-close-modal:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .details-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .details-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .detail-section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .designer-section-card {
          border-top: 4px solid var(--info-color);
        }

        .sub-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 2px solid var(--bg-primary);
          padding-bottom: 0.5rem;
        }

        .client-data-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .client-data-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .client-data-item svg {
          color: var(--text-muted);
        }

        .specs-grid-display {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .pricing-specs {
          grid-template-columns: repeat(2, 1fr);
        }

        .spec-display-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.85rem;
        }

        .spec-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .spec-value {
          color: var(--text-primary);
          font-weight: 700;
        }

        .date-due-text {
          color: var(--warning-color);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .notes-box-display {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: var(--bg-primary);
          border-right: 3px solid var(--primary-color);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .notes-box-display p {
          margin-top: 0.25rem;
          color: var(--text-secondary);
        }

        .timeline-trail {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          padding-right: 1.25rem;
          margin-top: 0.5rem;
        }

        .timeline-trail::before {
          content: '';
          position: absolute;
          top: 5px;
          right: 4px;
          bottom: 5px;
          width: 2px;
          background-color: var(--border-color);
        }

        .timeline-trail-item {
          position: relative;
          display: flex;
          gap: 1rem;
        }

        .timeline-icon-dot {
          position: absolute;
          right: -1.25rem;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary-color);
          border: 2px solid var(--bg-secondary);
          z-index: 2;
        }

        .timeline-trail-content {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.8rem;
        }

        .timeline-trail-time {
          color: var(--text-muted);
          font-weight: 600;
        }

        .timeline-trail-text {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .draft-quick-upload {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .quick-draft-suggestions {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .suggestion-tag-btn {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-family);
          transition: var(--transition-fast);
        }

        .suggestion-tag-btn:hover {
          background-color: var(--primary-glow);
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .drafts-history-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .empty-drafts-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem 0;
          color: var(--text-muted);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .draft-version-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .draft-version-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .draft-v-tag {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .draft-image-container {
          width: 100%;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          max-height: 250px;
        }

        .draft-preview-img {
          max-width: 100%;
          max-height: 250px;
          object-fit: contain;
        }

        .brief-files-section {
          margin-top: 1rem;
        }

        .brief-files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.9rem;
          margin-top: 0.75rem;
        }

        .brief-file-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
        }

        .brief-file-thumb {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .brief-file-icon {
          font-size: 3rem;
          display: grid;
          place-items: center;
          height: 140px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          border: 1px dashed var(--border-color);
        }

        .brief-file-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-name {
          font-weight: 700;
          color: var(--text-primary);
          word-break: break-word;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 0.45rem 0.8rem;
          font-size: 0.8rem;
        }

        .draft-feedback-bubble {
          background-color: var(--bg-tertiary);
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 0.8rem;
          border-right: 3px solid var(--danger-color);
        }

        .draft-feedback-bubble p {
          color: var(--text-secondary);
          margin-top: 0.15rem;
        }

        .draft-evaluate-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .rejection-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rejection-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .chat-comments-thread {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 250px;
          overflow-y: auto;
          padding: 0.5rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .empty-chat-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .chat-comment-bubble {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
        }

        .chat-comment-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .comment-sender {
          color: var(--primary-color);
        }

        .comment-time {
          color: var(--text-muted);
        }

        .comment-text {
          color: var(--text-primary);
          line-height: 1.4;
        }

        .chat-comment-input-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .chat-comment-input-form .form-control {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
