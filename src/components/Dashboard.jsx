import React from 'react';
// استيراد الأيقونات المساعدة من مكتبة lucide-react لوصف العناصر المالية وحالات الطلب
import { 
  FileText, 
  Paintbrush, 
  Printer, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Clock 
} from 'lucide-react';
// استيراد أدوات التنسيق والخرائط من ملف المساعد helpers
import { formatCurrency, STAGE_MAP, PAYMENT_STATUS_MAP, PRODUCT_TYPES } from '../utils/helpers';

/**
 * لوحة التحكم الرئيسية والمؤشرات الإحصائية العامة
 * @param orders - مصفوفة الطلبات المسترجعة من المخزن المحلي
 * @param setActiveTab - دالة للتنقل بين التبويبات بالصفحة الرئيسية
 * @param setSelectedOrderId - دالة لفتح المودال المنبثق لتفاصيل طلب محدد
 */
export default function Dashboard({ orders, setActiveTab, setSelectedOrderId }) {
  
  // 1. حساب أعداد الطلبات حسب حالتها الإنتاجية
  const activeOrders = orders.filter(o => o.stage !== 'completed'); // الطلبات غير المنتهية
  const designCount = orders.filter(o => o.stage === 'design').length; // الطلبات في مرحلة التصميم
  const printingCount = orders.filter(o => o.stage === 'printing').length; // الطلبات في مرحلة الطباعة
  const completedCount = orders.filter(o => o.stage === 'completed').length; // الطلبات المكتملة كلياً

  // 2. العمليات الحسابية والمالية
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing.total || 0), 0); // إجمالي قيمة الفواتير
  const totalPaid = orders.reduce((sum, o) => sum + (o.pricing.paidAmount || 0), 0); // إجمالي المبالغ المستلمة
  const totalUnpaid = totalRevenue - totalPaid; // الديون أو المبالغ المتبقية للتحصيل

  // 3. ترتيب وجلب آخر 4 طلبات تم تسجيلها بالنظام لعرضها كنشاط أخير
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // 4. إحصاء وتوزيع المنتجات الأكثر طلباً في المطبعة
  const productStats = {};
  orders.forEach(o => {
    const prod = o.brief.product;
    productStats[prod] = (productStats[prod] || 0) + 1;
  });

  // صياغة بيانات المنتجات وحساب النسبة المئوية لكل منتج من إجمالي الطلبات
  const productData = Object.entries(PRODUCT_TYPES).map(([key, value]) => ({
    key,
    name: value.name,
    count: productStats[key] || 0,
    percentage: orders.length > 0 ? Math.round(((productStats[key] || 0) / orders.length) * 100) : 0
  })).sort((a, b) => b.count - a.count); // الترتيب من الأكثر طلباً للأقل

  // دالة لمعاينة الطلب عند الضغط عليه بالنشاط الأخير
  const handleViewOrder = (id) => {
    setSelectedOrderId(id);
  };

  return (
    <div className="dashboard-wrapper">
      {/* هيدر الصفحة التاريخية */}
      <header className="dashboard-header">
        <div>
          <h1>لوحة الإحصائيات العامة</h1>
          <p className="subtitle">نظرة عامة على أداء ومبيعات وحالات إنتاج المطبعة اليوم</p>
        </div>
        <div className="header-date">
          <Clock size={16} />
          {/* عرض اليوم والتاريخ باللغة العربية بشكل جميل ومحدد */}
          <span>اليوم: {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* بطاقات الإحصائيات العلوية لحالات الإنتاج */}
      <section className="stats-grid">
        {/* بطاقة الطلبات النشطة */}
        <div className="stat-card glass-panel border-indigo">
          <div className="stat-icon bg-indigo">
            <FileText size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">الطلبات النشطة</span>
            <span className="stat-value">{activeOrders.length}</span>
            <span className="stat-subtext">إجمالي الطلبات المستلمة: {orders.length}</span>
          </div>
        </div>

        {/* بطاقة طلبات مرحلة التصميم والتعديل */}
        <div className="stat-card glass-panel border-cyan">
          <div className="stat-icon bg-cyan">
            <Paintbrush size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">قيد التصميم والتعديل</span>
            <span className="stat-value">{designCount}</span>
            <span className="stat-subtext">تنتظر مراجعة العميل أو المصمم</span>
          </div>
        </div>

        {/* بطاقة طلبات مرحلة الطباعة والإنتاج */}
        <div className="stat-card glass-panel border-violet">
          <div className="stat-icon bg-violet">
            <Printer size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">قيد التشغيل والطباعة</span>
            <span className="stat-value">{printingCount}</span>
            <span className="stat-subtext">ملفات معتمدة وجاهزة للإنتاج</span>
          </div>
        </div>

        {/* بطاقة الطلبات المكتملة */}
        <div className="stat-card glass-panel border-emerald">
          <div className="stat-icon bg-emerald">
            <CheckCircle size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">طلبات مكتملة ومسلمة</span>
            <span className="stat-value">{completedCount}</span>
            {/* حساب نسبة الإنجاز الإجمالية لمطبعة */}
            <span className="stat-subtext">معدل الإنجاز: {orders.length > 0 ? Math.round((completedCount/orders.length)*100) : 0}%</span>
          </div>
        </div>
      </section>

      {/* إحصائيات المبيعات والتحصيل المالي */}
      <section className="revenue-section stats-grid">
        {/* إجمالي المبيعات والمدفوع */}
        <div className="stat-card glass-panel revenue-card">
          <div className="stat-icon bg-emerald">
            <TrendingUp size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">إجمالي المبيعات (الفواتير)</span>
            <span className="stat-value text-emerald">{formatCurrency(totalRevenue)}</span>
            <div className="revenue-breakdown">
              <span className="paid-tag">المدفوع منها: {formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>

        {/* المبالغ غير المحصلة (الديون المتبقية بذمة العملاء) */}
        <div className="stat-card glass-panel revenue-card">
          <div className="stat-icon bg-amber">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">المبالغ غير المحصلة (المتبقية)</span>
            <span className="stat-value text-amber">{formatCurrency(totalUnpaid)}</span>
            <div className="revenue-breakdown">
              <span className="unpaid-tag">تحتاج لمتابعة الدفع والتحصيل</span>
            </div>
          </div>
        </div>
      </section>

      {/* محتوى الشاشة السفلي */}
      <div className="dashboard-content-grid">
        {/* المطبوعات الأكثر طلباً مع شريط تقدم رسومي */}
        <div className="dashboard-card glass-panel">
          <h2 className="card-sec-title">نسبة المطبوعات الأكثر طلباً</h2>
          <div className="product-share-list">
            {productData.map((prod) => (
              <div key={prod.key} className="product-share-item">
                <div className="product-share-info">
                  <span className="product-name">{prod.name}</span>
                  <span className="product-count">{prod.count} طلب ({prod.percentage}%)</span>
                </div>
                <div className="progress-track">
                  {/* تحريك شريط التقدم ديناميكياً حسب النسبة المئوية للمنتج */}
                  <div 
                    className="progress-bar" 
                    style={{ width: `${prod.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قائمة آخر الطلبات المستلمة */}
        <div className="dashboard-card glass-panel">
          <h2 className="card-sec-title">الطلبات الأخيرة المستلمة</h2>
          <div className="recent-orders-list">
            {recentOrders.length === 0 ? (
              <div className="empty-state">لا توجد طلبات مسجلة حالياً.</div>
            ) : (
              recentOrders.map((order) => {
                const stage = STAGE_MAP[order.stage] || { name: order.stage, color: '' };
                const payStatus = PAYMENT_STATUS_MAP[order.pricing.paymentStatus] || { name: order.pricing.paymentStatus, color: '' };
                return (
                  <div key={order.id} className="recent-order-item" onClick={() => handleViewOrder(order.id)}>
                    <div className="order-main-info">
                      <span className="order-id-badge">{order.id}</span>
                      <div className="order-detail-text">
                        <span className="order-client-name">{order.client.name}</span>
                        <span className="order-product-desc">
                          {PRODUCT_TYPES[order.brief.product]?.name} ({order.brief.quantity} حبة)
                        </span>
                      </div>
                    </div>
                    {/* شارات الحالة وحالة السداد */}
                    <div className="order-status-badges">
                      <span className={`badge ${stage.color}`}>{stage.name}</span>
                      <span className={`badge ${payStatus.color}`}>{payStatus.name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* زر سريع يقود إلى خط المتابعة كانبان */}
          <button className="btn btn-secondary w-full" onClick={() => setActiveTab('board')}>
            عرض جميع الطلبات في لوحة Kanban
          </button>
        </div>
      </div>

      {styleStyleCode}
    </div>
  );
}

// عزل كود الـ CSS المخصص لزيادة ترتيب ونظافة المكون الأساسي
const styleStyleCode = (
  <style>{`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.25rem;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .header-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--bg-secondary);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border-right: 4px solid transparent;
    }

    .stat-card.border-indigo { border-right-color: var(--primary-color); }
    .stat-card.border-cyan { border-right-color: var(--info-color); }
    .stat-card.border-violet { border-right-color: #8b5cf6; }
    .stat-card.border-emerald { border-right-color: var(--success-color); }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .bg-indigo { background-color: var(--primary-color); }
    .bg-cyan { background-color: var(--info-color); }
    .bg-violet { background-color: #8b5cf6; }
    .bg-emerald { background-color: var(--success-color); }
    .bg-amber { background-color: var(--warning-color); }

    .stat-data {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .stat-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .text-emerald { color: var(--success-color) !important; }
    .text-amber { color: var(--warning-color) !important; }

    .stat-subtext {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .revenue-section {
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }

    .revenue-card {
      padding: 1.75rem;
    }

    .revenue-breakdown {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .paid-tag {
      color: var(--success-color);
      background-color: var(--success-bg);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .unpaid-tag {
      color: var(--warning-color);
      background-color: var(--warning-bg);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .dashboard-content-grid {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .dashboard-content-grid {
        grid-template-columns: 1fr;
      }
    }

    .dashboard-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-sec-title {
      font-size: 1.1rem;
      font-weight: 700;
      border-bottom: 2px solid var(--bg-primary);
      padding-bottom: 0.75rem;
    }

    .product-share-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .product-share-item {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .product-share-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .product-name {
      color: var(--text-primary);
    }

    .product-count {
      color: var(--text-secondary);
    }

    .progress-track {
      height: 8px;
      background-color: var(--bg-tertiary);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--info-color));
      border-radius: 9999px;
      transition: width 1s ease-out;
    }

    .recent-orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .recent-order-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .recent-order-item:hover {
      background-color: var(--bg-tertiary);
      border-color: var(--text-muted);
      transform: translateX(-4px);
    }

    .order-main-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .order-id-badge {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    .order-detail-text {
      display: flex;
      flex-direction: column;
    }

    .order-client-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .order-product-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .order-status-badges {
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-muted);
      font-weight: 500;
    }

    .w-full {
      width: 100%;
    }
  `}</style>
);
