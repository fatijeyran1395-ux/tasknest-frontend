'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/register', form);
            Cookies.set('token', data.token, { expires: 7 });
            Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
            toast.success('ثبت‌نام با موفقیت انجام شد!');
            router.push('/tasks');
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach((msg: any) => toast.error(msg));
            } else {
                toast.error('خطا در ثبت‌نام');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 shadow-lg shadow-brand-500/30 mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-l from-brand-400 to-blue-400 bg-clip-text text-transparent">
                        ثبت‌نام در TaskNest
                    </h1>
                    <p className="text-gray-400 mt-2">یک حساب کاربری جدید بسازید</p>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">نام کامل</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pr-10 pl-3 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
                                    placeholder="محسن"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">ایمیل</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pr-10 pl-3 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">رمز عبور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pr-10 pl-3 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
                                    placeholder="حداقل ۸ کاراکتر"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">تکرار رمز عبور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={form.password_confirmation}
                                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pr-10 pl-3 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-l from-brand-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-brand-500/30 transition disabled:opacity-50 mt-2"
                        >
                            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        حساب کاربری دارید؟{' '}
                        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-bold">
                            وارد شوید
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}