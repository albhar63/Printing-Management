// ========================================================
// محرك إدارة البيانات والتخزين المحلي - PrintFlow Pro
// ========================================================

const LOCAL_STORAGE_KEY = 'printflow_orders';

// البيانات الافتراضية المبدئية للنظام لتوضيح عمل دورة الطلب بالكامل
const DEFAULT_ORDERS = [
  {
    id: 'PF-101',
    client: {
      name: 'أحمد محمود',
      phone: '0501234567',
      email: 'ahmed@company.com',
      company: 'مؤسسة التقنية للمقاولات'
    },
    brief: {
      product: 'business_cards',
      quantity: 500,
      paperType: 'coated_350g',
      finish: 'matte_lamination',
      notes: 'كروت شخصية فاخرة مطفية للمدراء، الشعار باللون الذهبي ونريد التصميم كلاسيكي وأنيق.',
      dimensions: '9x5 cm',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // تاريخ التسليم بعد يومين من اليوم
    },
    pricing: {
      basePrice: 250,
      extras: 50,
      tax: 45,
      total: 345,
      discount: 0,
      paidAmount: 150, // دفع دفعة مقدمة
      paymentStatus: 'partially_paid', // حالة الدفع: مدفوع جزئياً
      paymentMethod: 'credit_card'
    },
    stage: 'design', // المرحلة الحالية: مرحلة التصميم والتعديل
    designer: 'خالد عمر',
    designDrafts: [
      {
        id: 'draft-1',
        version: 1,
        url: 'https://images.unsplash.com/photo-1541462608141-2f682d68c94a?auto=format&fit=crop&q=80&w=600',
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected', // تم الرفض من قبل العميل
        feedback: 'الشعار يحتاج لتكبير بنسبة 10%، وتغيير الخط ليكون باللون الأبيض بدلاً من الرمادي.'
      },
      {
        id: 'draft-2',
        version: 2,
        url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
        uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'pending', // معلق بانتظار الاعتماد
        feedback: ''
      }
    ],
    comments: [
      {
        id: 'c1',
        sender: 'أحمد محمود (العميل)',
        text: 'هل يمكن عمل زوايا دائرية للكروت؟',
        time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c2',
        sender: 'خالد عمر (المصمم)',
        text: 'نعم بالتأكيد، قمت بتعديل القالب في المسودة الثانية وجعل الحواف مستديرة.',
        time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    logs: [
      { stage: 'intake', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'تم استقبال العميل وتسجيل الطلب والبريف' },
      { stage: 'design', time: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), note: 'تم إرسال الطلب للمصمم خالد عمر' }
    ]
  },
  {
    id: 'PF-102',
    client: {
      name: 'سارة العتيبي',
      phone: '0559876543',
      email: 'sara@fashion-boutique.com',
      company: 'بوتيك الأزياء الأنيقة'
    },
    brief: {
      product: 'flyers',
      quantity: 1000,
      paperType: 'coated_150g',
      finish: 'glossy_lamination',
      notes: 'فلايرات إعلانية لعروض الصيف، نحتاج ألوان زاهية ومنعشة، مع توضيح نسب الخصومات.',
      dimensions: 'A5',
      priority: 'medium',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    pricing: {
      basePrice: 800,
      extras: 100,
      tax: 135,
      total: 1035,
      discount: 50,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      paymentMethod: 'none'
    },
    stage: 'intake', // في مرحلة الاستقبال وأخذ البريف
    designer: 'سحر أحمد',
    designDrafts: [],
    comments: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    logs: [
      { stage: 'intake', time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), note: 'تم استقبال العميل وتسجيل الطلب والبريف وحساب التسعيرة' }
    ]
  },
  {
    id: 'PF-103',
    client: {
      name: 'محمد القحطاني',
      phone: '0533221100',
      email: 'm.qahtani@foodway.sa',
      company: 'سلسلة مطاعم فود واي'
    },
    brief: {
      product: 'rollups',
      quantity: 3,
      paperType: 'banner_material',
      finish: 'none',
      notes: 'رول اب لعرض قائمة الوجبات الجديدة عند مدخل الفروع. التصميم تم توفيره من العميل، للطباعة والقص فقط.',
      dimensions: '200x85 cm',
      priority: 'high',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    pricing: {
      basePrice: 360,
      extras: 0,
      tax: 54,
      total: 414,
      discount: 0,
      paidAmount: 414,
      paymentStatus: 'paid', // مدفوع بالكامل
      paymentMethod: 'bank_transfer'
    },
    stage: 'printing', // في مرحلة الطباعة والإنتاج الفعلي
    designer: 'خالد عمر',
    designDrafts: [
      {
        id: 'draft-1',
        version: 1,
        url: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=600',
        uploadedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        status: 'approved', // تم الاعتماد بنجاح
        feedback: 'تم اعتماد التصميم للطباعة المباشرة'
      }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    logs: [
      { stage: 'intake', time: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString(), note: 'تسجيل الطلب بملف العميل المرفق' },
      { stage: 'design', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'اعتماد التصميم مباشرة من العميل' },
      { stage: 'printing', time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), note: 'إرسال الطلب لقسم المطبوعات للبدء بالطباعة والقص' }
    ]
  },
  {
    id: 'PF-104',
    client: {
      name: 'عبدالرحمن الشهري',
      phone: '0544556677',
      email: 'a.shehri@eventmaker.sa',
      company: 'مؤسسة صناع الحدث لتنظيم المعارض'
    },
    brief: {
      product: 'banners',
      quantity: 2,
      paperType: 'flex_banner',
      finish: 'none',
      notes: 'لوحات إعلانية خارجية مقاس 3*4 متر للمهرجان السنوي. نحتاج حلقات معدنية على الحواف لسهولة الربط والتعليق.',
      dimensions: '300x400 cm',
      priority: 'medium',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    pricing: {
      basePrice: 1080,
      extras: 100,
      tax: 177,
      total: 1357,
      discount: 100,
      paidAmount: 1357,
      paymentStatus: 'paid',
      paymentMethod: 'mada'
    },
    stage: 'completed', // مكتمل ومسلم للعميل
    designer: 'سحر أحمد',
    designDrafts: [
      {
        id: 'draft-1',
        version: 1,
        url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=600',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        feedback: 'معتمد للطباعة'
      }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    logs: [
      { stage: 'intake', time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'استقبال العميل وتثبيت المواصفات والمساحات' },
      { stage: 'design', time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), note: 'اعتماد مسودة لوحة المهرجان من العميل' },
      { stage: 'printing', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: 'إرسال الملفات للطباعة على ماكينة الفليكس وتثبيت الحلقات' },
      { stage: 'billing', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'تحصيل كامل المبلغ 1357 ريال وإصدار الفاتورة الضريبية' },
      { stage: 'completed', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'استلم العميل البنرات وتم انتهاء الطلب بنجاح' }
    ]
  }
];

export const db = {
  /**
   * استرجاع جميع الطلبات من LocalStorage
   * إذا لم توجد طلبات سابقة، يتم حفظ وعرض البيانات الافتراضية
   */
  getOrders() {
    const orders = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!orders) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(orders);
  },

  /**
   * حفظ قائمة الطلبات الحالية في LocalStorage
   */
  saveOrders(orders) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  },

  /**
   * إضافة طلب جديد مع إدراج سجل حركة أولي للتتبع التاريخي
   */
  addOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      ...order,
      createdAt: new Date().toISOString(),
      logs: [
        {
          stage: order.stage || 'intake',
          time: new Date().toISOString(),
          note: 'تم إنشاء الطلب واستقبال العميل وحساب الفاتورة المبدئية'
        }
      ]
    };
    orders.unshift(newOrder); // إضافته في مقدمة مصفوفة الطلبات
    this.saveOrders(orders);
    return newOrder;
  },

  /**
   * تحديث حقول طلب معين وإدراج سجل تتبع تلقائي في حال تغيرت المرحلة الإنتاجية
   */
  updateOrder(id, updatedFields) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      const order = orders[index];
      
      // الكشف التلقائي عن تغير مرحلة الطلب لإضافتها للسجل
      const logs = [...(order.logs || [])];
      if (updatedFields.stage && updatedFields.stage !== order.stage) {
        let note = `تم نقل الطلب إلى مرحلة `;
        switch(updatedFields.stage) {
          case 'intake': note += 'الاستقبال والبريف'; break;
          case 'design': note += 'التصميم والتعديل'; break;
          case 'printing': note += 'الطباعة والتشغيل'; break;
          case 'billing': note += 'الفوترة والدفع'; break;
          case 'completed': note += 'التسليم والانتهاء'; break;
          default: note += updatedFields.stage;
        }
        logs.push({
          stage: updatedFields.stage,
          time: new Date().toISOString(),
          note: note
        });
      }

      orders[index] = {
        ...order,
        ...updatedFields,
        logs: logs
      };
      this.saveOrders(orders);
      return orders[index];
    }
    return null;
  },

  /**
   * حذف طلب نهائياً من النظام
   */
  deleteOrder(id) {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    this.saveOrders(filtered);
    return true;
  },

  /**
   * إضافة تعليق جديد في قسم المحادثة والملاحظات للطلب
   */
  addComment(orderId, sender, text) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      const comment = {
        id: 'c_' + Math.random().toString(36).substr(2, 9),
        sender,
        text,
        time: new Date().toISOString()
      };
      orders[index].comments = orders[index].comments ? [...orders[index].comments, comment] : [comment];
      this.saveOrders(orders);
      return comment;
    }
    return null;
  },

  /**
   * رفع مسودة تصميم جديدة من قبل المصمم مع إضافة لوج حركة
   */
  addDesignDraft(orderId, url) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      const currentDrafts = orders[index].designDrafts || [];
      const newDraft = {
        id: 'draft_' + Math.random().toString(36).substr(2, 9),
        version: currentDrafts.length + 1,
        url: url,
        uploadedAt: new Date().toISOString(),
        status: 'pending', // بانتظار التقييم
        feedback: ''
      };
      orders[index].designDrafts = [...currentDrafts, newDraft];
      
      // تدوين الحدث في التاريخ
      orders[index].logs.push({
        stage: 'design',
        time: new Date().toISOString(),
        note: `تم رفع نموذج التصميم رقم (${newDraft.version}) من قبل المصمم`
      });

      this.saveOrders(orders);
      return newDraft;
    }
    return null;
  },

  /**
   * تقييم مسودة التصميم بالقبول أو الرفض مع الملاحظات
   * في حال الاعتماد، يتم تحويل الطلب تلقائياً لعمال الطباعة
   */
  evaluateDraft(orderId, draftId, status, feedback) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      const drafts = orders[index].designDrafts.map(d => {
        if (d.id === draftId) {
          return { ...d, status, feedback };
        }
        return d;
      });
      orders[index].designDrafts = drafts;

      // تدوين الاعتماد أو الرفض
      const draft = drafts.find(d => d.id === draftId);
      orders[index].logs.push({
        stage: 'design',
        time: new Date().toISOString(),
        note: `تم ${status === 'approved' ? 'اعتماد' : 'رفض مع طلب تعديل'} مسودة التصميم رقم (${draft?.version})`
      });

      // إذا اعتمد العميل التصميم، ينتقل الطلب تلقائياً لقسم المطبوعات للتشغيل الفوري
      if (status === 'approved') {
        orders[index].stage = 'printing';
        orders[index].logs.push({
          stage: 'printing',
          time: new Date().toISOString(),
          note: 'تم إرسال الطلب تلقائياً لقسم الطباعة بعد اعتماد التصميم النهائي'
        });
      }

      this.saveOrders(orders);
      return orders[index];
    }
    return null;
  },

  /**
   * تسجيل عملية دفع وتحصيل مالي للفاتورة مع تدوينها بالسجل
   */
  payInvoice(orderId, amount, paymentMethod) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      const pricing = { ...orders[index].pricing };
      pricing.paidAmount = parseFloat(pricing.paidAmount || 0) + parseFloat(amount);
      pricing.paymentMethod = paymentMethod;
      
      // تحديث حالة السداد بناءً على المبلغ المدفوع
      if (pricing.paidAmount >= pricing.total) {
        pricing.paymentStatus = 'paid';
      } else if (pricing.paidAmount > 0) {
        pricing.paymentStatus = 'partially_paid';
      } else {
        pricing.paymentStatus = 'unpaid';
      }

      orders[index].pricing = pricing;

      // تسجيل العملية المالية تاريخياً
      orders[index].logs.push({
        stage: 'billing',
        time: new Date().toISOString(),
        note: `تم دفع مبلغ بقيمة ${amount} ريال بواسطة ${paymentMethod}. المجموع المدفوع: ${pricing.paidAmount} ريال`
      });

      this.saveOrders(orders);
      return orders[index];
    }
    return null;
  }
};
