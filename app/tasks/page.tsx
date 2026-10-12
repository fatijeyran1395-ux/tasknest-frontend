'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    Plus, Search, LogOut, CheckCircle2, Clock, Loader2,
    ListTodo, Trash2, Pencil, X
} from 'lucide-react';

interface Subtask {
    id: number;
    title: string;
    is_completed: boolean;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
    created_at: string;
    subtasks: Subtask[];
}

interface Stats {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
}

export default function TasksPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'completed',  // ← پیش‌فرض: تکمیل شده
        due_date: '',
        subtasks: [''],
    });

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // ===== چک احراز هویت =====
    useEffect(() => {
        const token = Cookies.get('token');
        const userData = Cookies.get('user');
        if (!token) {
            router.push('/login');
            return;
        }
        if (userData) setUser(JSON.parse(userData));
        fetchTasks();
        fetchStats();
    }, []);

    // ===== دریافت وظایف =====
    const fetchTasks = async () => {
        try {
            const params: any = {};
            if (search) params.search = search;
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterPriority !== 'all') params.priority = filterPriority;
            const { data } = await api.get('/tasks', { params });
            setTasks(data.data.data);
        } catch (error) {
            toast.error('خطا در دریافت وظایف');
        } finally {
            setLoading(false);
        }
    };

    // ===== دریافت آمار =====
    const fetchStats = async () => {
        try {
            const { data } = await api.get('/tasks/stats');
            setStats(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    // ===== فیلتر زنده =====
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => fetchTasks(), 300);
            return () => clearTimeout(timer);
        }
    }, [search, filterStatus, filterPriority]);

    // ===== ذخیره =====
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                subtasks: form.subtasks.filter((s) => s.trim() !== ''),
            };
            if (editingId) {
                await api.put(`/tasks/${editingId}`, payload);
                toast.success('وظیفه ویرایش شد');
            } else {
                await api.post('/tasks', payload);
                toast.success('وظیفه ایجاد شد');
            }
            resetForm();
            fetchTasks();
            fetchStats();
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach((msg: any) => toast.error(msg));
            } else {
                toast.error('خطا در ذخیره');
            }
        } finally {
            setSaving(false);
        }
    };

    // ===== ویرایش =====
    const handleEdit = (task: Task) => {
        setEditingId(task.id);
        setForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date || '',
            subtasks: task.subtasks.length > 0 ? task.subtasks.map((s) => s.title) : [''],
        });
    };

    // ===== حذف =====
    const handleDelete = async (id: number) => {
        if (!confirm('آیا از حذف مطمئن هستید؟')) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('وظیفه حذف شد');
            fetchTasks();
            fetchStats();
        } catch (error) {
            toast.error('خطا در حذف');
        }
    };

    // ===== تغییر وضعیت =====
    const handleToggleStatus = async (id: number) => {
        try {
            await api.patch(`/tasks/${id}/toggle-status`);
            fetchTasks();
            fetchStats();
        } catch (error) {
            toast.error('خطا');
        }
    };

    // ===== تغییر وضعیت زیر وظیفه =====
    const handleToggleSubtask = async (subtaskId: number) => {
        try {
            await api.patch(`/subtasks/${subtaskId}/toggle`);
            fetchTasks();
        } catch (error) {
            toast.error('خطا');
        }
    };

    // ===== خروج =====
    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/login');
    };

    // ===== ریست فرم =====
    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            priority: 'medium',
            status: 'completed',  // ← برگرد به پیش‌فرض
            due_date: '',
            subtasks: [''],
        });
        setEditingId(null);
    };

    // ===== زیر وظایف =====
    const addSubtaskField = () => setForm({ ...form, subtasks: [...form.subtasks, ''] });

    const removeSubtaskField = (index: number) => {
        const newSubtasks = form.subtasks.filter((_, i) => i !== index);
        setForm({ ...form, subtasks: newSubtasks.length > 0 ? newSubtasks : [''] });
    };

    const updateSubtask = (index: number, value: string) => {
        const newSubtasks = [...form.subtasks];
        newSubtasks[index] = value;
        setForm({ ...form, subtasks: newSubtasks });
    };

    // ===== استایل‌ها =====
    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'low': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'زیاد';
            case 'medium': return 'متوسط';
            case 'low': return 'کم';
            default: return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 border-green-500';
            case 'in_progress': return 'bg-blue-500 border-blue-500';
            default: return 'border-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* ===== هدر ===== */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <ListTodo className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black bg-gradient-to-l from-brand-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                                مدیریت وظایف
                            </h1>
                            <p className="text-gray-400 text-sm">خوش آمدی، {user?.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                            className="w-12 h-12 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-center hover:border-red-500 transition"
                            title="خروج">
                        <LogOut className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* ===== آمار ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-brand-500 transition">
                        <div className="text-3xl font-black text-brand-400">{stats.total}</div>
                        <div className="text-gray-400 text-sm mt-1">کل وظایف</div>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-yellow-500 transition">
                        <div className="text-3xl font-black text-yellow-400">{stats.pending}</div>
                        <div className="text-gray-400 text-sm mt-1">در انتظار</div>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-blue-500 transition">
                        <div className="text-3xl font-black text-blue-400">{stats.in_progress}</div>
                        <div className="text-gray-400 text-sm mt-1">در حال انجام</div>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-green-500 transition">
                        <div className="text-3xl font-black text-green-400">{stats.completed}</div>
                        <div className="text-gray-400 text-sm mt-1">تکمیل شده</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== فرم ===== */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-5 text-white flex items-center gap-2">
                                {editingId ? <><Pencil className="w-5 h-5" /> ویرایش وظیفه</> : <><Plus className="w-5 h-5" /> افزودن وظیفه جدید</>}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">عنوان *</label>
                                    <input type="text" required value={form.title}
                                           onChange={(e) => setForm({ ...form, title: e.target.value })}
                                           className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none transition"
                                           placeholder="مثلاً: طراحی صفحه اصلی" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">توضیحات</label>
                                    <textarea value={form.description}
                                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                                              rows={3}
                                              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none transition"
                                              placeholder="توضیحات اختیاری..." />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">اولویت *</label>
                                    <select value={form.priority}
                                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none transition">
                                        <option value="low">🟢 کم</option>
                                        <option value="medium">🟡 متوسط</option>
                                        <option value="high">🔴 زیاد</option>
                                    </select>
                                </div>

                                {/* ===== فیلد وضعیت (جدید) ===== */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">وضعیت *</label>
                                    <select value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none transition">
                                        <option value="pending">⏳ در انتظار</option>
                                        <option value="in_progress">🔄 در حال انجام</option>
                                        <option value="completed">✅ تکمیل شده</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">تاریخ سررسید</label>
                                    <input type="date" value={form.due_date}
                                           onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                           className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none transition" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">زیر وظایف</label>
                                    {form.subtasks.map((subtask, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input type="text" value={subtask}
                                                   onChange={(e) => updateSubtask(index, e.target.value)}
                                                   className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                                                   placeholder="عنوان زیر وظیفه..." />
                                            <button type="button" onClick={() => removeSubtaskField(index)}
                                                    className="text-red-400 hover:text-red-300 px-2">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addSubtaskField}
                                            className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> افزودن زیر وظیفه
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button type="submit" disabled={saving}
                                            className="flex-1 bg-gradient-to-l from-brand-500 to-blue-600 text-white font-bold py-2.5 rounded-lg hover:shadow-lg hover:shadow-brand-500/30 transition disabled:opacity-50">
                                        {saving ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'افزودن وظیفه')}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={resetForm}
                                                className="bg-gray-700 text-white px-4 rounded-lg hover:bg-gray-600 transition">
                                            لغو
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ===== لیست ===== */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" value={search}
                                           onChange={(e) => setSearch(e.target.value)}
                                           className="w-full bg-gray-950 border border-gray-700 rounded-lg pr-9 pl-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                                           placeholder="جستجو..." />
                                </div>
                                <select value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none">
                                    <option value="all">همه وضعیت‌ها</option>
                                    <option value="pending">در انتظار</option>
                                    <option value="in_progress">در حال انجام</option>
                                    <option value="completed">تکمیل شده</option>
                                </select>
                                <select value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none">
                                    <option value="all">همه اولویت‌ها</option>
                                    <option value="low">کم</option>
                                    <option value="medium">متوسط</option>
                                    <option value="high">زیاد</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="bg-gray-900/60 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
                                    <ListTodo className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-400">هنوز وظیفه‌ای ثبت نشده است.</p>
                                    <p className="text-gray-500 text-sm mt-2">از فرم سمت راست، اولین وظیفه‌تان را اضافه کنید.</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div key={task.id}
                                         className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-brand-500/50 transition group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <button onClick={() => handleToggleStatus(task.id)}
                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${getStatusColor(task.status)}`}>
                                                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                        {task.status === 'in_progress' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </button>
                                                    <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                        {task.title}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPriorityStyle(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                              {new Date(task.created_at).toLocaleDateString('fa-IR')}
                          </span>
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                              📅 سررسید: {new Date(task.due_date).toLocaleDateString('fa-IR')}
                            </span>
                                                    )}
                                                </div>
                                                {task.subtasks.length > 0 && (
                                                    <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                                                        {task.subtasks.map((subtask) => (
                                                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                                                <button onClick={() => handleToggleSubtask(subtask.id)}
                                                                        className={`w-4 h-4 rounded border flex items-center justify-center ${subtask.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                                                    {subtask.is_completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                                </button>
                                                                <span className={subtask.is_completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                                  {subtask.title}
                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => handleEdit(task)}
                                                        className="text-brand-400 hover:text-brand-300 p-2 transition" title="ویرایش">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(task.id)}
                                                        className="text-red-400 hover:text-red-300 p-2 transition" title="حذف">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}