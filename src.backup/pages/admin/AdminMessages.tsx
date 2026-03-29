import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Eye, Search, MessageSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  send_method: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMessages(data as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (msg: ContactMessage) => {
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    }
    setSelectedMessage(msg);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "تم حذف الرسالة" });
  };

  const handleReply = (email: string, subject: string) => {
    window.open(`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`, "_blank");
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filtered = messages.filter((m) => {
    const matchesSearch = !search || m.name.includes(search) || m.email.includes(search) || m.subject.includes(search);
    const matchesMethod = filterMethod === "all" || m.send_method === filterMethod;
    const matchesRead = filterRead === "all" || (filterRead === "unread" ? !m.is_read : m.is_read);
    return matchesSearch && matchesMethod && matchesRead;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#D4AF37]" />
            الرسائل والاستفسارات / Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} جديدة</Badge>
            )}
            إجمالي {messages.length} رسالة
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث بالاسم أو البريد أو الموضوع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">كل الطرق</option>
          <option value="whatsapp">واتساب</option>
          <option value="system">النظام</option>
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">الكل</option>
          <option value="unread">غير مقروءة</option>
          <option value="read">مقروءة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الموضوع</TableHead>
              <TableHead className="text-right">الطريقة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">لا توجد رسائل</TableCell></TableRow>
            ) : (
              filtered.map((msg) => (
                <TableRow key={msg.id} className={!msg.is_read ? "bg-blue-50/50 font-medium" : ""}>
                  <TableCell>
                    {msg.is_read ? (
                      <Badge variant="secondary" className="text-xs">مقروءة</Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-xs">جديدة</Badge>
                    )}
                  </TableCell>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell dir="ltr" className="text-left">{msg.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={msg.send_method === "whatsapp" ? "border-green-500 text-green-600" : "border-blue-500 text-blue-600"}>
                      {msg.send_method === "whatsapp" ? "💬 واتساب" : "📥 النظام"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(msg.created_at), "yyyy/MM/dd HH:mm", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(msg)} title="عرض الرسالة">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReply(msg.email, msg.subject)} title="رد بالبريد">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" title="حذف">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف هذه الرسالة؟</AlertDialogTitle>
                            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(msg.id)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
              تفاصيل الرسالة
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">الاسم:</span><p className="font-medium">{selectedMessage.name}</p></div>
                <div><span className="text-gray-500">البريد:</span><p className="font-medium" dir="ltr">{selectedMessage.email}</p></div>
                <div><span className="text-gray-500">الطريقة:</span><p>{selectedMessage.send_method === "whatsapp" ? "💬 واتساب" : "📥 النظام"}</p></div>
                <div><span className="text-gray-500">التاريخ:</span><p>{format(new Date(selectedMessage.created_at), "yyyy/MM/dd HH:mm")}</p></div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">الموضوع:</span>
                <p className="font-semibold text-lg">{selectedMessage.subject}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-gray-500 text-sm">الرسالة:</span>
                <p className="mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <Button onClick={() => handleReply(selectedMessage.email, selectedMessage.subject)} className="w-full">
                <Mail className="h-4 w-4 ml-2" /> الرد بالبريد الإلكتروني
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
