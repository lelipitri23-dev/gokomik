import UserList from '@/components/UserList';

export const metadata = {
  title: 'Pengguna — Kiryuu',
  description: 'Lihat daftar pengguna yang terdaftar di Kiryuu dan koleksi komik mereka.',
};

export default function UsersPage() {
  return <UserList />;
}
