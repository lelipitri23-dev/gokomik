import UserList from '@/components/UserList';

export const metadata = {
  title: 'Pengguna — Komikcast',
  description: 'Lihat daftar pengguna yang terdaftar di Komikcast dan koleksi komik mereka.',
};

export default function UsersPage() {
  return <UserList />;
}
