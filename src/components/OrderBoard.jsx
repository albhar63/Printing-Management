import React, { useState } from 'react';
// استيراد الأيقونات من مكتبة Lucide
import { 
  Search, 
  Filter, 
  ArrowLeftRight, 
  Eye, 
  FileText, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
// استيراد خرائط الحالات والمنتجات
import { STAGE_MAP, PRIORITY_MAP, PRODUCT_TYPES, PAYMENT_STATUS_MAP } from '../utils/helpers';

/**
 * لوحة تتبع سير العمل التفاعلية (Kanban Board)
 * @param orders - قائمة الطلبات الحالية
 * @param updateOrderStage - دالة لتحديث مرحلة الطلب عند السحب والإفلات
 * @param setSelectedOrderId - دالة لتعيين طلب معين لمعاينته بالتفاصيل
 * @param setShowInvoiceOrderId - دالة لعرض الفاتورة وإجراء عمليات الدفع
 */
export default function OrderBoard({ orders, updateOrderStage, setSelectedOrderId, setShowInvoiceOrderId }) {
  // حالات البحث والفلاتر
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  
  // تتبع الطلب الذي يتم سحبه حالياً والمرحلة التي يتم المرور فوقها
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // تعريف أعمدة لوحة كانبان الخمسة التي تلخص دورة حياة الطلب بالكامل
  const columns = [
    { id: 'intake', name: 'الاستقبال والبريف', icon: '📝' },
    { id: 'design', name: 'التصميم والتعديل', icon: '🎨' },
    { id: 'printing', name: 'الطباعة والتشغيل', icon: '🖨️' },
    { id: 'billing', name: 'الفوترة والدفع', icon: '💵' },
    { id: 'completed', name: 'التسليم والانتهاء', icon: '📦' },
  ];

  // فلترة وتصفية الطلبات بناءً على نص البحث والأولوية ونوع المنتج
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.client.company && order.client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter ? order.brief.priority === priorityFilter : true;
    const matchesProduct = productFilter ? order.brief.product === productFilter : true;

    return matchesSearch && matchesPriority && matchesProduct;
  });

  // تجميع وتوزيع الطلبات المصفاة داخل الأعمدة الخاصة بها
  const getOrdersByStage = (stageId) => {
    return filteredOrders.filter(order => order.stage === stageId);
  };

  // ----------------------------------------------------
  // دوال السحب والإفلات باستخدام HTML5 Drag and Drop API
  // ----------------------------------------------------

  // 1. عند بدء سحب البطاقة
  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId); // حفظ المعرف لنقله
    e.currentTarget.classList.add('dragging');
  };

  // 2. عند إتمام عملية السحب أو إفلاتها في مكان فارغ
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  // 3. عند المرور بالبطاقة فوق عمود معين
  const handleDragOver = (e, columnId) => {
    e.preventDefault(); // ضروري للسماح بالإفلات
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId); // تمييز العمود الذي يمر فوقه
    }
  };

  // 4. عند مغادرة العمود أثناء السحب
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  // 5. عند إفلات البطاقة داخل العمود المستهدف
  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) {
      updateOrderStage(orderId, targetStage); // تحديث مرحلة الطلب وحفظها في التخزين
    }
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <div>
          <h1>خط الإنتاج والـ Kanban</h1>
          <p className="subtitle">اسحب وأسقط المطبوعات والطلبات لتغيير حالة وتتبع مسار الإنتاج</p>
        </div>
      </header>

      {/* شريط أدوات البحث والتصفية للتحكم بالطلبات المعروضة */}
      <section className="filter-bar glass-panel">
        {/* صندوق البحث بالنص */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="البحث برقم الطلب، اسم العميل أو الشركة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* فلاتر القوائم المنسدلة */}
        <div className="filters-selectors">
          {/* فلتر الأولوية */}
          <div className="filter-item">
            <Filter size={16} />
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">جميع الأولويات</option>
              {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          {/* فلتر نوع المنتج */}
          <div className="filter-item">
            <Filter size={16} />
            <select 
              value={productFilter} 
              onChange={(e) => setProductFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">جميع المنتجات</option>
              {Object.entries(PRODUCT_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* منطقة أعمدة كانبان */}
      <section className="kanban-board">
        {columns.map((column) => {
          const isOver = dragOverColumn === column.id;
          const stageOrders = getOrdersByStage(column.id);

          return (
            <div 
              key={column.id} 
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* رأس العمود وعدد الطلبات بداخله */}
              <div className="column-header">
                <span className="column-title">
                  <span className="column-emoji">{column.icon}</span>
                  {column.name}
                </span>
                <span className="column-count">{stageOrders.length}</span>
              </div>

              {/* بطاقات الطلبات داخل العمود */}
              <div className="column-cards">
                {stageOrders.length === 0 ? (
                  <div className="empty-column-placeholder">
                    اسحب الطلبات إلى هنا
                  </div>
                ) : (
                  stageOrders.map((order) => {
                    const priority = PRIORITY_MAP[order.brief.priority] || { name: 'عادية', color: 'priority-low', badgeColor: 'badge-design' };
                    const product = PRODUCT_TYPES[order.brief.product]?.name || 'طلب خاص';
                    const payStatus = PAYMENT_STATUS_MAP[order.pricing.paymentStatus] || { name: 'غير معروف', color: '' };

                    return (
                      <div 
                        key={order.id} 
                        // بطاقة قابلة للسحب
                        className={`order-card ${priority.color}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* معلومات رأس البطاقة: كود الطلب وأولويته */}
                        <div className="card-header">
                          <span className="card-id">{order.id}</span>
                          <span className={`badge ${priority.badgeColor} badge-sm`}>{priority.name}</span>
                        </div>
                        
                        {/* بيانات العميل */}
                        <div className="card-client-info">
                          <span className="card-client-name">{order.client.name}</span>
                          {order.client.company && (
                            <span className="card-company-name">{order.client.company}</span>
                          )}
                        </div>

                        {/* تفاصيل المنتج واختصار الملاحظات */}
                        <div className="card-body">
                          <div className="product-desc-tag">
                            <strong>{product}</strong>
                            <span>الكمية: {order.brief.quantity}</span>
                          </div>
                          {order.brief.notes && (
                            <p className="brief-notes-excerpt">
                              {order.brief.notes.length > 60 ? order.brief.notes.substring(0, 57) + '...' : order.brief.notes}
                            </p>
                          )}
                        </div>

                        {/* تذييل البطاقة: حالة الدفع وأزرار الإجراء السريع */}
                        <div className="card-footer">
                          <span className={`badge ${payStatus.color} badge-xs`}>{payStatus.name}</span>
                          <div className="card-actions">
                            {/* زر فتح الملاحظات والتصاميم */}
                            <button 
                              className="card-action-btn bg-blue-glow"
                              title="عرض التفاصيل والتصميم"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <Eye size={14} />
                            </button>
                            {/* زر عرض الفاتورة والتحصيل */}
                            <button 
                              className="card-action-btn bg-gold-glow"
                              title="الفاتورة الضريبية"
                              onClick={() => setShowInvoiceOrderId(order.id)}
                            >
                              <FileText size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* الأنماط الخاصة بالمكون */}
      <style>{`
        .board-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .board-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
        }

        @media (max-width: 900px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
        }

        .search-box {
          display: flex;
          align-items: center;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.25rem 0.75rem;
          flex: 1;
        }

        .search-icon {
          color: var(--text-muted);
          margin-left: 0.5rem;
        }

        .search-input {
          border: none;
          background: none;
          outline: none;
          padding: 0.5rem 0;
          color: var(--text-primary);
          font-family: var(--font-family);
          width: 100%;
          font-size: 0.95rem;
        }

        .filters-selectors {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .filters-selectors {
            flex-direction: column;
          }
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .filter-select {
          border: none;
          background: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .column-emoji {
          margin-left: 0.25rem;
        }

        .empty-column-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
        }

        .dragging {
          opacity: 0.4;
          transform: scale(0.98);
        }

        .card-client-info {
          display: flex;
          flex-direction: column;
        }

        .card-client-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-company-name {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .product-desc-tag {
          background-color: var(--bg-tertiary);
          border-radius: 4px;
          padding: 0.35rem 0.5rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .brief-notes-excerpt {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .card-actions {
          display: flex;
          gap: 0.35rem;
        }

        .card-action-btn {
          border: none;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .bg-blue-glow {
          background-color: var(--primary-glow);
          color: var(--primary-color);
        }

        .bg-blue-glow:hover {
          background-color: var(--primary-color);
          color: white;
        }

        .bg-gold-glow {
          background-color: var(--warning-bg);
          color: var(--warning-color);
        }

        .bg-gold-glow:hover {
          background-color: var(--warning-color);
          color: white;
        }

        .badge-xs {
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
        }

        .badge-sm {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
        }
      `}</style>
    </div>
  );
}
