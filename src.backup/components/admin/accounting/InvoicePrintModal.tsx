import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface PrintInvoice {
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  client_phone?: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  notes?: string | null;
  items: InvoiceItem[];
}

interface Props {
  invoice: PrintInvoice | null;
  onClose: () => void;
}

const statusMap: Record<string, string> = {
  draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة', cancelled: 'ملغاة',
};

export default function InvoicePrintModal({ invoice, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1a1a1a; background: #fff; }
          .invoice-wrapper { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #D4AF37; }
          .logo-area h1 { font-size: 28px; font-weight: 900; color: #D4AF37; letter-spacing: 1px; }
          .logo-area p { font-size: 12px; color: #666; margin-top: 4px; }
          .invoice-meta { text-align: left; }
          .invoice-meta .invoice-title { font-size: 22px; font-weight: bold; color: #1a1a1a; }
          .invoice-meta p { font-size: 13px; color: #555; margin-top: 4px; }
          .client-section { background: #f9f7f0; border-right: 4px solid #D4AF37; padding: 16px 20px; margin-bottom: 28px; border-radius: 0 8px 8px 0; }
          .client-section h3 { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 6px; }
          .client-section p { font-size: 15px; font-weight: 600; }
          .client-section span { font-size: 13px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #D4AF37; color: white; }
          thead th { padding: 12px 14px; text-align: right; font-size: 13px; font-weight: 600; }
          tbody tr { border-bottom: 1px solid #eee; }
          tbody tr:nth-child(even) { background: #fafafa; }
          tbody td { padding: 11px 14px; font-size: 13px; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
          .totals-box { width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; border-bottom: 1px solid #eee; }
          .totals-row.grand { font-size: 16px; font-weight: bold; border-top: 2px solid #D4AF37; border-bottom: none; padding-top: 12px; color: #D4AF37; }
          .footer { text-align: center; padding-top: 24px; border-top: 1px solid #eee; color: #aaa; font-size: 11px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #e8f5e9; color: #2e7d32; }
          .notes-section { background: #fffbf0; border: 1px solid #ffe082; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
          .notes-section h4 { font-size: 12px; color: #888; margin-bottom: 4px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>معاينة الفاتورة - {invoice.invoice_number}</DialogTitle>
            <Button onClick={handlePrint} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white gap-2">
              <Printer className="h-4 w-4" /> طباعة / PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Preview */}
        <div ref={printRef} className="invoice-wrapper bg-white p-8 rounded-lg border">
          {/* Header */}
          <div className="header flex justify-between items-start mb-8 pb-6 border-b-4 border-[#D4AF37]">
            <div className="logo-area">
              <h1 className="text-3xl font-black text-[#D4AF37] tracking-wide">THE VIEW AVENUE</h1>
              <p className="text-sm text-gray-500 mt-1">ذا فيو أفينيو - أبحر الشمالية، جدة</p>
              <p className="text-xs text-gray-400">المملكة العربية السعودية</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-800">فاتورة ضريبية</p>
              <p className="text-sm text-gray-600 mt-1">رقم الفاتورة: <strong>{invoice.invoice_number}</strong></p>
              <p className="text-sm text-gray-600">التاريخ: <strong>{invoice.invoice_date}</strong></p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                {statusMap[invoice.status] || invoice.status}
              </span>
            </div>
          </div>

          {/* Client */}
          <div className="client-section bg-amber-50 border-r-4 border-[#D4AF37] p-4 mb-6 rounded-l-lg">
            <h3 className="text-xs text-gray-500 uppercase mb-1">فاتورة إلى</h3>
            <p className="text-base font-bold text-gray-800">{invoice.client_name}</p>
            {invoice.client_phone && <p className="text-sm text-gray-500 mt-1">📞 {invoice.client_phone}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr className="bg-[#D4AF37] text-white">
                <th className="p-3 text-right font-semibold">#</th>
                <th className="p-3 text-right font-semibold">الوصف</th>
                <th className="p-3 text-center font-semibold">الكمية</th>
                <th className="p-3 text-center font-semibold">سعر الوحدة</th>
                <th className="p-3 text-center font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3 font-medium">{item.description}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-center">{Number(item.unit_price).toLocaleString()} ر.س</td>
                  <td className="p-3 text-center font-semibold">{Number(item.total).toLocaleString()} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">المبلغ قبل الضريبة:</span>
                <span className="font-medium">{Number(invoice.subtotal).toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
                <span className="font-medium text-orange-600">{Number(invoice.tax_amount).toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-[#D4AF37]">
                <span className="font-bold text-base">الإجمالي شامل الضريبة:</span>
                <span className="font-bold text-base text-[#D4AF37]">{Number(invoice.total).toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <h4 className="text-xs text-gray-500 mb-1">ملاحظات:</h4>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 text-xs text-gray-400">
            <p>شكراً لتعاملكم مع The View Avenue</p>
            <p className="mt-1">هذه فاتورة ضريبية رسمية | المملكة العربية السعودية</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
