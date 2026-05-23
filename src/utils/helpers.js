// ========================================================
// ملف المساعد والعمليات الحسابية والترجمات - PrintFlow Pro
// ========================================================

/**
 * أنواع المنتجات المتاحة للتسعير المباشر وأسعارها الافتراضية
 * name: الاسم باللغة العربية
 * basePricePerUnit: السعر الأساسي للوحدة بالريال
 * minQty: الحد الأدنى للكمية الممكن طلبها
 */
export const PRODUCT_TYPES = {
  business_cards: { name: 'كروت شخصية', basePricePerUnit: 0.5, minQty: 100 },
  flyers: { name: 'فلاير / بروشور', basePricePerUnit: 0.8, minQty: 100 },
  rollups: { name: 'رول اب', basePricePerUnit: 120.0, minQty: 1 },
  banners: { name: 'بنر / فليكس (متر مربع)', basePricePerUnit: 45.0, minQty: 1 },
  custom: { name: 'طلب خاص / مواصفات خاصة', basePricePerUnit: 0, minQty: 1 }
};

/**
 * خامات الورق والمواد ونسب الضرب في التسعيرة
 * multiplier: معامل الضرب (لزيادة أو إنقاص السعر حسب جودة الخامة)
 */
export const PAPER_TYPES = {
  coated_350g: { name: 'كوتد 350 جرام فاخر', multiplier: 1.0 },
  coated_300g: { name: 'كوتد 300 جرام', multiplier: 0.95 },
  coated_150g: { name: 'كوتد 150 جرام خفيف', multiplier: 0.8 },
  flex_banner: { name: 'بنر فليكس مرن', multiplier: 1.0 },
  banner_material: { name: 'ورق رول اب معتم', multiplier: 1.0 },
  custom: { name: 'نوع آخر / خاص', multiplier: 1.0 }
};

/**
 * اللمسات الفنية والتغطية (التشطيب) وقيمتها المضافة للقطعة
 * price: السعر الإضافي لكل قطعة بالريال
 */
export const FINISH_TYPES = {
  none: { name: 'بدون سلفان', price: 0 },
  matte_lamination: { name: 'سلفان مطفي (Matte)', price: 0.1 },
  glossy_lamination: { name: 'سلفان لامع (Glossy)', price: 0.1 },
  uv_spot: { name: 'يو في بقعي (UV Spot)', price: 0.25 },
  gold_foil: { name: 'بصمة ذهبية (Gold Foil)', price: 0.35 }
};

/**
 * ترجمات مراحل خط الإنتاج وتنسيق ألوان الشارات الخاصة بها في لوحة كانبان
 */
export const STAGE_MAP = {
  intake: { name: 'الاستقبال والبريف', color: 'badge-pending' },
  design: { name: 'التصميم والتعديل', color: 'badge-design' },
  printing: { name: 'الطباعة والتشغيل', color: 'badge-print' },
  billing: { name: 'الفوترة والدفع', color: 'badge-pending' },
  completed: { name: 'التسليم والانتهاء', color: 'badge-success' }
};

/**
 * شارات ألوان حالات الدفع للفواتير
 */
export const PAYMENT_STATUS_MAP = {
  paid: { name: 'مدفوع بالكامل', color: 'badge-success' },
  partially_paid: { name: 'مدفوع جزئياً', color: 'badge-design' },
  unpaid: { name: 'غير مدفوع', color: 'badge-danger' }
};

/**
 * مصفوفة ترجمة الأولوية وألوان الخطوط الجانبية للبطاقات
 */
export const PRIORITY_MAP = {
  high: { name: 'عالية جداً', color: 'priority-high', badgeColor: 'badge-danger' },
  medium: { name: 'متوسطة', color: 'priority-medium', badgeColor: 'badge-pending' },
  low: { name: 'عادية', color: 'priority-low', badgeColor: 'badge-design' }
};

/**
 * طرق الدفع المعرفة باللغة العربية
 */
export const PAYMENT_METHOD_MAP = {
  cash: 'نقدي',
  mada: 'مدى (Mada)',
  credit_card: 'بطاقة ائتمانية',
  bank_transfer: 'تحويل بنكي',
  none: 'غير محدد'
};

/**
 * حاسبة تقدير التكلفة للمطبوعات بشكل ديناميكي
 * @param product - نوع المطبوعة (business_cards, flyers, etc.)
 * @param quantity - الكمية المطلوبة
 * @param paperType - الخامة أو الورق المستخدم
 * @param finish - اللمسة الفنية (سلوفان أو بصمة)
 * @param dimensions - الأبعاد (تستخدم لحساب الأمتار المربعة للبنرات)
 * @returns {object} - الإجمالي، المجموع الفرعي، الضريبة
 */
export function calculateEstimate(product, quantity, paperType, finish, dimensions) {
  const parsedQty = parseInt(quantity) || 0;
  
  // إذا لم يختر منتجاً أو كانت الكمية صفرية
  if (!product || product === 'custom' || parsedQty <= 0) {
    return {
      basePrice: 0,
      extras: 0,
      tax: 0,
      total: 0
    };
  }

  const prodMeta = PRODUCT_TYPES[product];
  const paperMeta = PAPER_TYPES[paperType] || { multiplier: 1 };
  const finishMeta = FINISH_TYPES[finish] || { price: 0 };

  let basePrice = 0;
  let extras = 0;

  // طريقة خاصة لحساب البنرات (اللوحات الخارجية) بالمتر المربع
  if (product === 'banners' && dimensions) {
    // استخلاص العرض والارتفاع من النص المكتوب (مثلاً: 300x400)
    const parts = dimensions.toLowerCase().replace(/[^0-9x]/g, '').split('x');
    if (parts.length === 2) {
      const widthM = parseFloat(parts[0]) / 100; // تحويل العرض لمتر
      const heightM = parseFloat(parts[1]) / 100; // تحويل الارتفاع لمتر
      const sqMeters = widthM * heightM; // المساحة بالمتر المربع
      basePrice = sqMeters * prodMeta.basePricePerUnit * parsedQty;
    } else {
      // مقاس افتراضي احترازي في حال لم يدخل المقاس بشكل صحيح
      basePrice = 12 * prodMeta.basePricePerUnit * parsedQty; 
    }
  } else {
    // الحساب المباشر لباقي المنتجات بالقطعة
    basePrice = prodMeta.basePricePerUnit * parsedQty * paperMeta.multiplier;
  }

  // حساب قيمة اللمسات الإضافية كالسلوفان والبصمة للكرت أو الفلاير
  if (product === 'business_cards' || product === 'flyers') {
    extras = finishMeta.price * parsedQty;
  } else if (finishMeta.price > 0) {
    // للمنتجات الأخرى يتم حسابها كنسبة مئوية مضافة
    extras = finishMeta.price * basePrice;
  }

  const subtotal = basePrice + extras;
  const tax = Math.round(subtotal * 0.15 * 100) / 100; // ضريبة القيمة المضافة 15%
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    extras: Math.round(extras * 100) / 100,
    tax,
    total
  };
}

/**
 * تنسيق المبالغ المالية بالريال السعودي
 * @param amount - المبلغ الرقمي
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0.00 ر.س';
  return parseFloat(amount).toFixed(2) + ' ر.س';
}

/**
 * تنسيق التاريخ للغة العربية بشكل رسمي ومبسط
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * تنسيق التاريخ والوقت بالساعات والدقائق للتعليقات واللوجز
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * توليد رقم طلب عشوائي يبدأ برمز PF (رمز المطبعة)
 */
export function generateOrderId() {
  const min = 1000;
  const max = 9999;
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return `PF-${num}`;
}
