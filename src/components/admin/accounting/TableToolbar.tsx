import { useState } from 'react';
import { Search, Download, Printer, Copy, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface Props {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  onPrint?: () => void;
  helpText?: string;
  helpTextEn?: string;
  tableId?: string;
}

export default function TableToolbar({
  searchValue, onSearchChange, searchPlaceholder = 'بحث...',
  onExportCSV, onPrint, helpText, helpTextEn, tableId,
}: Props) {
  const handleCopy = () => {
    const el = tableId ? document.getElementById(tableId) : document.querySelector('table');
    if (!el) return;
    const rows = el.querySelectorAll('tr');
    let text = '';
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      const line = Array.from(cells).map(c => (c as HTMLElement).innerText.trim()).join('\t');
      text += line + '\n';
    });
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ البيانات إلى الحافظة');
  };

  const handlePrint = () => {
    if (onPrint) { onPrint(); return; }
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pr-10 bg-white"
        />
      </div>
      <div className="flex gap-1">
        {onExportCSV && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onExportCSV}><Download className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent><p>تصدير Excel / Export CSV</p></TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent><p>طباعة / Print</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent><p>نسخ للحافظة / Copy</p></TooltipContent>
        </Tooltip>
        {helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon"><HelpCircle className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{helpText}</p>
              {helpTextEn && <p className="text-xs text-muted-foreground mt-1" dir="ltr">{helpTextEn}</p>}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function exportToCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const BOM = '\uFEFF';
  let csv = BOM + headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(c => `"${c}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  toast.success('تم تحميل الملف بنجاح');
}
