# 🎨 TaskNest Frontend (Next.js)

فرانت‌اند مدرن و حرفه‌ای برای سیستم مدیریت وظایف با Next.js 15 و Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ امکانات

- 🔐 صفحه ورود و ثبت‌نام با اعتبارسنجی کامل
- ✅ مدیریت وظایف (ایجاد، ویرایش، حذف)
- 📝 زیر وظایف با تیک زدن
- 🎯 اولویت‌بندی (کم، متوسط، زیاد)
- 📊 آمار زنده (کل، در انتظار، در حال انجام، تکمیل شده)
- 🔍 جستجو و فیلتر زنده (بدون رفرش)
- 🎨 تم تاریک (Dark Mode) با افکت Glassmorphism
- 📱 کاملاً ریسپانسیو (موبایل، تبلت، دسکتاپ)
- 🔔 پیام‌های Toast برای اعلان‌ها
- 🛡️ محافظت از مسیرها با JWT Token

---

## 🛠 تکنولوژی‌ها

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Axios (HTTP Client)
- React Hot Toast (Notifications)
- Lucide React (Icons)
- JS-Cookie (Token Management)

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- NPM

### مراحل نصب

```bash
git clone https://github.com/fatijeyran1395-ux/tasknest-frontend.git
cd tasknest-frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
