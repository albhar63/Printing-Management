import React, { useState, useEffect } from 'react';
// استيراد الأيقونات من مكتبة Lucide
import { 
  User, 
  Phone, 
  Building, 
  Mail, 
  Settings, 
  Layers, 
  Scissors, 
  Calendar, 
  FileText, 
  CreditCard, 
  Calculator, 
  Save, 
  Check 
} from 'lucide-react';
// استيراد الدوال والخامات المساعدة
import { 
  PRODUCT_TYPES, 
  PAPER_TYPES, 
  FINISH_TYPES, 
  PRIORITY_MAP, 
  PAYMENT_METHOD_MAP, 
  calculateEstimate, 
  formatCurrency, 
  generateOrderId 
} from '../utils/helpers';

/**
 * مكون نموذج استقبال العملاء الجدد وحساب أسعار المطبوعات تلقائياً
 * @param onOrderCreated - دالة يتم استدعاؤها لحفظ وتمرير الطلب الجديد المنشأ لقاعدة البيانات
 */
export default function OrderForm({ onOrderCreated }) {
  // --- 1. حالات بيانات العميل ---
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  // --- 2. حالات تفاصيل الطباعة والبريف ---
  const [product, setProduct] = useState('business_cards');
  const [quantity, setQuantity] = useState(100);
  const [paperType, setPaperType] = useState('coated_350g');
  const [finish, setFinish] = useState('none');
  const [dimensions, setDimensions] = useState('9x5 cm');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [designer, setDesigner] = useState('خالد عمر');

  // --- 3. حالات تفاصيل التسعير والماليات ---
  const [pricing, setPricing] = useState({
    basePrice: 0,
    extras: 0,
    tax: 0,
    total: 0,
    discount: 0,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    paymentMethod: 'cash'
  });

  const [discountInput, setDiscountInput] = useState(0); // قيمة الخصم المدخلة يدوياً
  const [paidInput, setPaidInput] = useState(0); // العربون أو المبلغ المدفوع مقدماً
  const [isSuccess, setIsSuccess] = useState(false); // حالة إظهار بانر النجاح
  const [uploadedFiles, setUploadedFiles] = useState([]); // ملفات مرفوعة من العميل

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- 4. تحديث وحساب التكاليف والضريبة بشكل تلقائي وفوري ---
  // يتم تشغيل هذا الخطاف (Effect) كلما تغير أي متغير يؤثر على الحسابات المالية للطباعة
  useEffect(() => {
    // استدعاء دالة الحساب المساعد لحساب سعر الإنتاج والإضافات
    const estimate = calculateEstimate(product, quantity, paperType, finish, dimensions);
    
    const discount = parseFloat(discountInput) || 0;
    const paid = parseFloat(paidInput) || 0;
    
    // حساب المجموع الخاضع للضريبة بعد الخصم المباشر
    const subtotal = estimate.basePrice + estimate.extras - discount;
    const tax = Math.round(Math.max(0, subtotal) * 0.15 * 100) / 100; // ضريبة 15%
    const total = Math.round((Math.max(0, subtotal) + tax) * 100) / 100; // الإجمالي النهائي

    // تحديد حالة الفاتورة المبدئية بناءً على العربون المدفوع
    let paymentStatus = 'unpaid';
    if (paid >= total && total > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially_paid';
    }

    setPricing(prev => ({
      ...prev,
      basePrice: estimate.basePrice,
      extras: estimate.extras,
      tax: tax,
      total: total,
      discount: discount,
      paidAmount: paid,
      paymentStatus: paymentStatus
    }));

  }, [product, quantity, paperType, finish, dimensions, discountInput, paidInput]);

  // --- 5. خطاف لضبط موعد التسليم الافتراضي تلقائياً (بعد 3 أيام من اليوم) ---
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  // --- 6. دالة لمعالجة وتعديل الأبعاد الافتراضية والكميات تلقائياً عند تغيير نوع المنتج ---
  // تسهل هذه الخطوة على موظف الاستقبال إدخال القيم بسرعة دون إعادة كتابة كل التفاصيل
  const handleProductChange = (e) => {
    const p = e.target.value;
    setProduct(p);
    
    if (p === 'business_cards') {
      setDimensions('9x5 cm');
      setPaperType('coated_350g');
      setQuantity(500);
    } else if (p === 'flyers') {
      setDimensions('A5');
      setPaperType('coated_150g');
      setQuantity(1000);
    } else if (p === 'rollups') {
      setDimensions('200x85 cm');
      setPaperType('banner_material');
      setQuantity(1);
    } else if (p === 'banners') {
      setDimensions('300x400 cm');
      setPaperType('flex_banner');
      setQuantity(1);
    } else {
      setDimensions('');
      setPaperType('custom');
      setQuantity(100);
    }
  };

  // --- 7. دالة إرسال وحفظ النموذج وإنشاء الطلب ---
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setUploadedFiles([]);
      return;
    }

    const preparedFiles = await Promise.all(files.map(async (file) => ({
      id: 'file_' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      url: await readFileAsDataUrl(file)
    })));

    setUploadedFiles(preparedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('فضلاً أدخل اسم العميل ورقم الجوال كحد أدنى.');
      return;
    }

    // بناء الكائن النهائي للطلب الجديد
    const newOrder = {
      id: generateOrderId(), // رقم طلب فريد
      client: {
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        company: clientCompany
      },
      brief: {
        product,
        quantity: parseInt(quantity) || 1,
        paperType,
        finish,
        notes,
        files: uploadedFiles,
        dimensions,
        priority,
        dueDate
      },
      pricing: {
        ...pricing,
        // إذا لم يدفع العميل شيئاً يتم تجاهل طريقة الدفع
        paymentMethod: pricing.paidAmount > 0 ? pricing.paymentMethod : 'none'
      },
      stage: 'intake', // يبدأ الطلب من مرحلة الاستقبال وأخذ البريف
      designer,
      designDrafts: [],
      comments: []
    };

    // تمرير الطلب للدالة الرئيسية للحفظ والتوجيه
    onOrderCreated(newOrder);
   
  
    fetch("https://congregationally-uncut-emmett.ngrok-free.dev/webhook/printflow-pro/orders/webhook/order", {
      method: "POST",
      headers: {
       "Content-Type": "application/json"
    },
     body: JSON.stringify(newOrder)
    })
      .then(res => res.json())
      .then(data => {
     console.log("تم إرسال الطلب إلى n8n:", data);
   })
    .catch(err => {
     console.error("خطأ أثناء الإرسال:", err);
     });



    // تفعيل رسالة النجاح وتفريغ الحقول استعداداً لاستقبال طلب آخر
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientCompany('');
      setNotes('');
      setDiscountInput(0);
      setPaidInput(0);
      setUploadedFiles([]);
    }, 2000);
  };

  return (
    <div className="form-wrapper">
      <header className="form-header-bar">
        <h1>استقبال عميل جديد وتسجيل طلب</h1>
        <p className="subtitle">قم بتسجيل مواصفات البريف، وحساب التكلفة تلقائياً، وإرسال الطلب للمصممين</p>
      </header>

      {/* بنر إشعار النجاح */}
      {isSuccess && (
        <div className="success-banner">
          <Check size={20} />
          <span>تم تسجيل الطلب وحساب الفاتورة بنجاح وتحويله لخط الإنتاج!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="intake-form">
        
        {/* القسم الأول: بيانات العميل */}
        <section className="form-section glass-panel">
          <h2 className="section-title">1. بيانات العميل الأساسية</h2>
          <div className="form-grid-columns">
            <div className="form-group">
              <label className="form-label">اسم العميل *</label>
              <div className="input-with-icon">
                <User size={16} />
                <input 
                  type="text" 
                  className="form-control" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="الاسم الثلاثي للعميل"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">رقم الجوال *</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input 
                  type="tel" 
                  className="form-control" 
                  value={clientPhone} 
                  onChange={(e) => setClientPhone(e.target.value)} 
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">الشركة / المؤسسة</label>
              <div className="input-with-icon">
                <Building size={16} />
                <input 
                  type="text" 
                  className="form-control" 
                  value={clientCompany} 
                  onChange={(e) => setClientCompany(e.target.value)} 
                  placeholder="اسم جهة العمل إن وجد"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input 
                  type="email" 
                  className="form-control" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                  placeholder="example@domain.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* القسم الثاني: مواصفات الطباعة والبريف */}
        <section className="form-section glass-panel">
          <h2 className="section-title">2. مواصفات الطباعة وتفاصيل البريف</h2>
          <div className="form-grid-columns">
            
            {/* نوع المنتج */}
            <div className="form-group">
              <label className="form-label">المنتج المراد طباعته</label>
              <div className="input-with-icon">
                <Settings size={16} />
                <select className="form-control" value={product} onChange={handleProductChange}>
                  {Object.entries(PRODUCT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* الكمية */}
            <div className="form-group">
              <label className="form-label">الكمية المطلوبة</label>
              <div className="input-with-icon">
                <Calculator size={16} />
                <input 
                  type="number" 
                  className="form-control" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* الخامة */}
            <div className="form-group">
              <label className="form-label">نوع الورق / الخامة</label>
              <div className="input-with-icon">
                <Layers size={16} />
                <select className="form-control" value={paperType} onChange={(e) => setPaperType(e.target.value)}>
                  {Object.entries(PAPER_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* التشطيب */}
            <div className="form-group">
              <label className="form-label">نوع السلوفان / اللمسة الفنية</label>
              <div className="input-with-icon">
                <Scissors size={16} />
                <select className="form-control" value={finish} onChange={(e) => setFinish(e.target.value)}>
                  {Object.entries(FINISH_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* المقاس */}
            <div className="form-group">
              <label className="form-label">المقاس والأبعاد</label>
              <div className="input-with-icon">
                <Settings size={16} />
                <input 
                  type="text" 
                  className="form-control" 
                  value={dimensions} 
                  onChange={(e) => setDimensions(e.target.value)} 
                  placeholder="مثال: 9x5 سم أو A5"
                />
              </div>
            </div>

            {/* موعد التسليم */}
            <div className="form-group">
              <label className="form-label">تاريخ التسليم المطلوب</label>
              <div className="input-with-icon">
                <Calendar size={16} />
                <input 
                  type="date" 
                  className="form-control" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* الأولوية */}
            <div className="form-group">
              <label className="form-label">أهمية الطلب (الأولوية)</label>
              <div className="input-with-icon">
                <Layers size={16} />
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* المصمم المسؤول */}
            <div className="form-group">
              <label className="form-label">المصمم المسؤول عن الطلب</label>
              <div className="input-with-icon">
                <User size={16} />
                <select className="form-control" value={designer} onChange={(e) => setDesigner(e.target.value)}>
                  <option value="خالد عمر">خالد عمر</option>
                  <option value="سحر أحمد">سحر أحمد</option>
                  <option value="أنس الحربي">أنس الحربي</option>
                </select>
              </div>
            </div>
          </div>

          {/* صندوق البريف والملاحظات */}
          <div className="form-group full-width-field">
            <label className="form-label">البريف ووصف متطلبات التصميم (الملاحظات)</label>
            <div className="input-with-icon align-items-start">
              <FileText size={16} className="textarea-icon" />
              <textarea 
                className="form-control textarea-field" 
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب هنا كافة تفاصيل بريف العميل، الألوان المطلوبة، النصوص، والملحوظات الفنية..."
              ></textarea>
                {/* زر رفع ملفات البريف */}
                <div className="form-group full-width-field">
                  <label className="form-label">ملفات البريف (PDF، صور، ...)</label>
                  <input type="file" className="form-control" multiple accept="application/pdf,image/*,*/*" onChange={handleFileChange} />
                  {uploadedFiles.length > 0 && (
                    <ul className="file-list">
                      {uploadedFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>
          </div>
        </section>

        {/* القسم الثالث: الحسابات والمالية */}
        <section className="form-section glass-panel pricing-section">
          <h2 className="section-title">3. التسعير والدفع المبدئي</h2>
          <div className="pricing-grid">
            <div className="pricing-calculators">
              {/* إدخال الخصم المباشر */}
              <div className="form-group">
                <label className="form-label">قيمة الخصم إن وجد (ريال)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={discountInput} 
                  onChange={(e) => setDiscountInput(e.target.value)} 
                  min="0"
                />
              </div>

              {/* العربون */}
              <div className="form-group">
                <label className="form-label">المبلغ المدفوع مقدماً (ريال)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={paidInput} 
                  onChange={(e) => setPaidInput(e.target.value)} 
                  min="0"
                />
              </div>

              {/* وسيلة الدفع */}
              <div className="form-group">
                <label className="form-label">طريقة الدفع</label>
                <div className="input-with-icon">
                  <CreditCard size={16} />
                  <select 
                    className="form-control" 
                    value={pricing.paymentMethod}
                    onChange={(e) => setPricing(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    {Object.entries(PAYMENT_METHOD_MAP).filter(([k]) => k !== 'none').map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* تفصيل تكاليف الفاتورة الحالية */}
            <div className="pricing-receipt glass-panel">
              <h3 className="receipt-title">ملخص التكاليف التقديرية</h3>
              <div className="receipt-row">
                <span>الطباعة والإنتاج الأساسي:</span>
                <span className="value-bold">{formatCurrency(pricing.basePrice)}</span>
              </div>
              <div className="receipt-row">
                <span>اللمسات الفنية وسلفان:</span>
                <span>{formatCurrency(pricing.extras)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="receipt-row text-danger">
                  <span>الخصم الممنوح:</span>
                  <span>- {formatCurrency(pricing.discount)}</span>
                </div>
              )}
              <hr className="receipt-divider" />
              <div className="receipt-row">
                <span>الخاضع للضريبة:</span>
                <span>{formatCurrency(Math.max(0, pricing.basePrice + pricing.extras - pricing.discount))}</span>
              </div>
              <div className="receipt-row">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{formatCurrency(pricing.tax)}</span>
              </div>
              <div className="receipt-row total-row">
                <span>الإجمالي النهائي شامل الضريبة:</span>
                <span className="total-amount">{formatCurrency(pricing.total)}</span>
              </div>
              <div className="receipt-row status-row">
                <span>حالة الفاتورة المبدئية:</span>
                <span className={`badge ${
                  pricing.paymentStatus === 'paid' ? 'badge-success' : 
                  pricing.paymentStatus === 'partially_paid' ? 'badge-design' : 'badge-danger'
                }`}>
                  {pricing.paymentStatus === 'paid' ? 'مدفوعة بالكامل' : 
                   pricing.paymentStatus === 'partially_paid' ? 'مدفوعة جزئياً' : 'غير مدفوعة'}
                </span>
              </div>
            </div>
          </div>

          {/* زر التقديم */}
          <div className="form-submit-row">
            <button type="submit" className="btn btn-primary btn-submit hover-scale">
              <Save size={18} />
              حفظ الطلب وإرساله لخط التصميم
            </button>
          </div>
        </section>
      </form>

      <style>{`
        .form-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-header-bar {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .success-banner {
          background-color: var(--success-bg);
          color: var(--success-color);
          border: 1px solid var(--success-border);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .intake-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          border-bottom: 2px solid var(--bg-primary);
          padding-bottom: 0.5rem;
        }

        .form-grid-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-right: 2.25rem;
          width: 100%;
        }

        .full-width-field {
          grid-column: 1 / -1;
          margin-top: 1rem;
        }

        .align-items-start {
          align-items: flex-start;
        }

        .textarea-icon {
          top: 14px;
        }

        .textarea-field {
          resize: vertical;
          min-height: 100px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        .pricing-calculators {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pricing-receipt {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .receipt-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .value-bold {
          font-weight: 600;
          color: var(--text-primary);
        }

        .receipt-divider {
          border: 0;
          border-top: 1px dashed var(--border-color);
          margin: 0.25rem 0;
        }

        .total-row {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          padding: 0.5rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin: 0.25rem 0;
        }

        .total-amount {
          color: var(--primary-color);
          font-size: 1.15rem;
        }

        .status-row {
          align-items: center;
          padding-top: 0.25rem;
        }

        .form-submit-row {
          display: flex;
          justify-content: flex-end;
        }

        .btn-submit {
          padding: 0.85rem 2rem;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
