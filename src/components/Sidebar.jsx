import React from 'react';
// استيراد الأيقونات اللازمة من مكتبة lucide-react لتسهيل فهم الوظائف بصرياً
import { 
  LayoutDashboard, 
  KanbanSquare, 
  PlusCircle, 
  Printer, 
  Moon, 
  Sun, 
  PrinterCheck
} from 'lucide-react';

/**
 * مكون القائمة الجانبية (Sidebar)
 * @param activeTab - التبويب النشط حالياً في التطبيق
 * @param setActiveTab - دالة لتغيير التبويب النشط
 * @param darkMode - حالة الوضع الداكن (true/false)
 * @param toggleDarkMode - دالة لتبديل وضع الألوان
 */
export default function Sidebar({ activeTab, setActiveTab, darkMode, toggleDarkMode }) {
  // مصفوفة تحتوي على عناصر القائمة الجانبية لتسهيل معالجتها وعرضها بشكل ديناميكي
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'board', label: 'خط الإنتاج والـ Kanban', icon: KanbanSquare },
    { id: 'new-order', label: 'استقبال عميل جديد', icon: PlusCircle },
    { id: 'printing-queue', label: 'خطوط وعمال الطباعة', icon: Printer },
  ];

  return (
    <aside className="sidebar-container">
      {/* قسم الهوية التجارية للمطبعة */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          {/* أيقونة المطبعة الذكية مع حركة دوران بطيئة */}
          <PrinterCheck size={28} className="brand-icon" />
        </div>
        <div className="brand-info">
          <span className="brand-name">PrintFlow Pro</span>
          <span className="brand-tagline">إدارة المطابع الذكية</span>
        </div>
      </div>

      {/* قائمة التنقل الرئيسية */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              // تطبيق فئة active إذا كان التبويب هو النشط حالياً
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} className="menu-item-icon" />
              <span className="menu-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* تذييل القائمة الجانبية وزر تبديل السمات */}
      <div className="sidebar-footer">
        {/* زر تبديل وضع الإضاءة (داكن / مضيء) */}
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? (
            <>
              <Sun size={20} />
              <span>الوضع المضيء</span>
            </>
          ) : (
            <>
              <Moon size={20} />
              <span>الوضع الداكن</span>
            </>
          )}
        </button>
        <div className="footer-credits">
          <span>الإصدار v1.0.0</span>
        </div>
      </div>

      {/* أنماط CSS مخصصة ومضمنة للقائمة الجانبية لتأكيد التصميم الفاخر والتجاوب */}
      <style>{`
        .sidebar-container {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
          padding: 1.5rem 1rem;
          transition: var(--transition-normal);
        }

        /* تحويل القائمة الجانبية إلى شريط سفلي متجاوب عند التصفح من الجوال */
        @media (max-width: 1024px) {
          .sidebar-container {
            width: 100%;
            height: 60px;
            top: auto;
            bottom: 0;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0 1rem;
            border-left: none;
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
          }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding: 0.5rem;
        }

        @media (max-width: 1024px) {
          .sidebar-brand {
            margin-bottom: 0;
            padding: 0;
          }
        }

        .brand-logo {
          background: var(--primary-color);
          color: white;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        /* دوران بطيء يعطي واجهة حية وتفاعلية */
        .brand-icon {
          animation: spin-slow 12s linear infinite;
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1024px) {
          .brand-tagline, .brand-info {
            display: none;
          }
        }

        .brand-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .sidebar-menu {
            flex-direction: row;
            gap: 0.25rem;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
          }
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          text-align: right;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .menu-item {
            padding: 0.5rem 0.75rem;
            flex-direction: column;
            gap: 0.15rem;
            font-size: 0.7rem;
            align-items: center;
            justify-content: center;
            width: auto;
          }
        }

        .menu-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .menu-item.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .menu-item-icon {
          transition: transform 0.2s ease;
        }

        .menu-item:hover .menu-item-icon {
          transform: scale(1.1);
        }

        @media (max-width: 1024px) {
          .menu-item:hover .menu-item-icon {
            transform: none;
          }
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 1024px) {
          .sidebar-footer {
            flex-direction: row;
            align-items: center;
            border-top: none;
            padding-top: 0;
            gap: 0.5rem;
          }
          .footer-credits {
            display: none;
          }
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        @media (max-width: 1024px) {
          .theme-toggle {
            padding: 0.4rem;
            font-size: 0;
          }
        }

        .theme-toggle:hover {
          background: var(--border-color);
        }

        .footer-credits {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          font-weight: 500;
        }
      `}</style>
    </aside>
  );
}
