import { authorizeRoles } from '@/lib/server-access';
import CategoryManager from '@/components/CategoryManager';
export default async function Page({searchParams}){const access=await authorizeRoles(['owner','manager']);if(access.status!==200)return <main className="p-8"><h1>ไม่มีสิทธิ์เข้าถึง ({access.status})</h1><a href="/login">เข้าสู่ระบบ</a></main>;return <main className="max-w-4xl mx-auto p-8 space-y-6"><nav><a href="/dashboard">Dashboard</a> · <a href="/admin/categories">หมวดหมู่</a> · <a href="/admin/variants">รุ่นย่อย</a></nav><CategoryManager/></main>;}
