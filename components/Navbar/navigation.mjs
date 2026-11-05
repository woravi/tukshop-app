// UI visibility only; API and page authorization remain server-side.
export function staffNavigation(user) {
  const role = user?.role;
  if (role === 'kitchen') return [{ href: '/kitchen', label: 'หน้าครัว' }];
  if (role !== 'owner' && role !== 'manager') return [];
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/create', label: 'เพิ่มสินค้า' },
    { href: '/orders', label: 'คำสั่งซื้อสินค้า' },
    { href: '/products', label: 'จัดการสินค้า / รุ่นย่อย' },
    { href: '/admin/categories', label: 'จัดการหมวดหมู่' },
    { href: '/admin/food', label: 'จัดการร้านอาหาร' },
    { href: '/admin/food/settings', label: 'ตั้งค่าร้านอาหาร' },
    { href: '/kitchen', label: 'หน้าครัว' },
  ];
  if (role === 'owner') links.push({ href: '/admin/users', label: 'จัดการผู้ใช้และสิทธิ์' });
  return links;
}
