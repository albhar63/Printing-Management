import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderBoard from './components/OrderBoard';
import OrderForm from './components/OrderForm';
import PrintQueue from './components/PrintQueue';
import OrderDetails from './components/OrderDetails';
import InvoiceModal from './components/InvoiceModal';
import { db } from './utils/db';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showInvoiceOrderId, setShowInvoiceOrderId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // تحميل البيانات المبدئية والوضع الداكن عند الإقلاع
  useEffect(() => {
    // تحميل الطلبات
    const loadedOrders = db.getOrders();
    setOrders(loadedOrders);

    // تحميل الوضع الداكن
    const savedTheme = localStorage.getItem('printflow_dark_mode');
    const isDark = savedTheme === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // تبديل الوضع الداكن/المضيء وحفظه
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('printflow_dark_mode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // معالجة تسجيل طلب جديد
  const handleOrderCreated = (newOrder) => {
    const added = db.addOrder(newOrder);
    setOrders(prev => [added, ...prev]);
    setActiveTab('board'); // الانتقال التلقائي للوحة كانبان لمتابعة الطلب
  };

  // معالجة نقل الطلب بين المراحل (مثلاً بالسحب والإفلات)
  const handleUpdateOrderStage = (orderId, newStage) => {
    const updated = db.updateOrder(orderId, { stage: newStage });
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
  };

  // تحديث بيانات الطلب بشكل عام
  const handleUpdateOrder = (orderId, updatedFields) => {
    const updated = db.updateOrder(orderId, updatedFields);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
  };

  // معالجة إضافة تعليق
  const handleAddComment = (orderId, sender, text) => {
    const comment = db.addComment(orderId, sender, text);
    if (comment) {
      // تحديث البيانات بالواجهة مباشرة
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            comments: [...(o.comments || []), comment]
          };
        }
        return o;
      }));
    }
  };

  // معالجة رفع مسودة تصميم جديدة
  const handleUploadDraft = (orderId, url) => {
    const draft = db.addDesignDraft(orderId, url);
    if (draft) {
      // إعادة تحميل الطلبات لتحديث الحالات وتواريخ المتابعة (اللوجز)
      setOrders(db.getOrders());
    }
  };

  // معالجة تقييم مسودة التصميم (قبول/اعتماد أو رفض وتعديل)
  const handleEvaluateDraft = (orderId, draftId, status, feedback) => {
    const updatedOrder = db.evaluateDraft(orderId, draftId, status, feedback);
    if (updatedOrder) {
      setOrders(db.getOrders());
    }
  };

  // معالجة دفع الفاتورة
  const handlePayInvoice = (orderId, amount, paymentMethod) => {
    const updatedOrder = db.payInvoice(orderId, amount, paymentMethod);
    if (updatedOrder) {
      setOrders(db.getOrders());
    }
  };

  // جلب الكائن المفتوح حالياً بالتفاصيل أو الفاتورة
  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const invoiceOrder = orders.find(o => o.id === showInvoiceOrderId);

  // اختيار المحتوى الأساسي بناءً على التبويب النشط
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            orders={orders} 
            setActiveTab={setActiveTab} 
            setSelectedOrderId={setSelectedOrderId} 
          />
        );
      case 'board':
        return (
          <OrderBoard 
            orders={orders} 
            updateOrderStage={handleUpdateOrderStage} 
            setSelectedOrderId={setSelectedOrderId}
            setShowInvoiceOrderId={setShowInvoiceOrderId}
          />
        );
      case 'new-order':
        return (
          <OrderForm 
            onOrderCreated={handleOrderCreated} 
          />
        );
      case 'printing-queue':
        return (
          <PrintQueue 
            orders={orders} 
            updateOrderStage={handleUpdateOrderStage}
            updateOrder={handleUpdateOrder}
          />
        );
      default:
        return <div className="p-8">المحتوى غير موجود.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* القائمة الجانبية للتنقل (تخفى بالطباعة أوتوماتيكياً في CSS) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      {/* المحتوى الرئيسي */}
      <main className="main-content">
        {renderTabContent()}
      </main>

      {/* مودال تفاصيل الطلب والتصميم والملاحظات */}
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onAddComment={handleAddComment}
          onUploadDraft={handleUploadDraft}
          onEvaluateDraft={handleEvaluateDraft}
        />
      )}

      {/* مودال الفاتورة والتحصيل المالي والدفع */}
      {invoiceOrder && (
        <InvoiceModal 
          order={invoiceOrder}
          onClose={() => setShowInvoiceOrderId(null)}
          onPayInvoice={handlePayInvoice}
          updateOrderStage={handleUpdateOrderStage}
        />
      )}
    </div>
  );
}
