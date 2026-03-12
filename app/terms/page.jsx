import Navbar from '@/components/Navbar';
import Link from 'next/link';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiryuu.online';

export const metadata = {
  title: `Terms of Service - ${process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu'}`,
  description: `Syarat dan Ketentuan Layanan ${process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu'} — aturan penggunaan layanan yang wajib kamu pahami.`,
};

function Section({ number, title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-none w-7 h-7 rounded-lg bg-accent-red/20 border border-accent-red/30 text-accent-red text-xs font-bold flex items-center justify-center mt-0.5">
          {number}
        </span>
        <h2 className="text-base font-bold text-text-primary leading-snug">{title}</h2>
      </div>
      <div className="pl-10 text-text-secondary text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-14 pb-safe max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="pt-8 pb-6 border-b border-border mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-bg-elevated border border-border rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent-red">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-text-primary tracking-widest">TERMS OF SERVICE</h1>
          </div>
          <p className="text-text-muted text-xs ml-12">
            Terakhir diperbarui: 8 Maret 2026 · {SITE_URL}
          </p>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          Dengan mengakses dan menggunakan <strong className="text-text-primary">{SITE_NAME}</strong> ({SITE_URL}), kamu setuju untuk terikat oleh Syarat dan Ketentuan Layanan ini serta{' '}
          <Link href="/privacy-policy" className="text-accent-red hover:underline">Kebijakan Privasi</Link> kami.
          Jika kamu tidak setuju, mohon untuk tidak menggunakan layanan ini.
        </p>

        <Section number="1" title="Penerimaan Syarat">
          <p>
            Penggunaan layanan ini berarti kamu telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku. Kami berhak mengubah ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
          </p>
        </Section>

        <Section number="2" title="Penggunaan Layanan">
          <p>Layanan ini disediakan hanya untuk keperluan hiburan pribadi. Kamu setuju untuk <strong className="text-text-primary">tidak</strong>:</p>
          <ul className="list-none space-y-1.5 mt-2">
            {[
              'Menggunakan layanan ini untuk tujuan ilegal atau melanggar hukum yang berlaku',
              'Mencoba mengganggu kinerja server, keamanan, atau infrastruktur website',
              'Mengumpulkan atau mengekstrak data dari website secara otomatis (scraping) tanpa izin',
              'Membuat banyak akun palsu untuk menyalahgunakan sistem atau melakukan spam',
              'Mendistribusikan konten yang bersifat berbahaya, merusak, atau melanggar hak cipta',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section number="3" title="Akun Pengguna">
          <p>
            Kamu bertanggung jawab penuh atas keamanan akun dan kata sandi kamu. Jangan pernah membagikan informasi login kepada siapa pun.
          </p>
          <p>
            Kami berhak <strong className="text-text-primary">menangguhkan atau menghapus</strong> akun yang terbukti melanggar aturan penggunaan layanan tanpa pemberitahuan sebelumnya.
          </p>
        </Section>

        <Section number="4" title="Konten & Hak Cipta">
          <p>
            {SITE_NAME} adalah agregator konten yang mengumpulkan informasi dari sumber-sumber yang tersedia di internet. Kami tidak mengklaim kepemilikan atas konten manga, manhwa, atau manhua yang ditampilkan.
          </p>
          <p>
            Jika kamu adalah pemilik hak cipta dan merasa konten kamu ditampilkan tanpa izin, silakan hubungi kami untuk penghapusan segera.
          </p>
        </Section>

        <Section number="5" title="Iklan">
          <p>
            Layanan ini menggunakan <strong className="text-text-primary">Google AdSense</strong> untuk menampilkan iklan guna mendukung operasional website. Dengan menggunakan layanan ini, kamu menyetujui tampilan iklan tersebut.
          </p>
        </Section>

        <Section number="6" title="Penafian (Disclaimer)">
          <p>
            Layanan disediakan <em>"sebagaimana adanya"</em> tanpa jaminan apa pun, baik tersurat maupun tersirat. Kami tidak menjamin bahwa website akan selalu tersedia, bebas dari gangguan teknis, atau error.
          </p>
          <p>
            Kami tidak bertanggung jawab atas kerugian apa pun yang timbul dari penggunaan layanan ini.
          </p>
        </Section>

        <Section number="7" title="Perubahan Ketentuan">
          <p>
            Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini dengan tanggal pembaruan terbaru. Penggunaan layanan setelah perubahan dianggap sebagai persetujuanmu.
          </p>
        </Section>

        <Section number="8" title="Kontak">
          <p>
            Untuk pertanyaan atau laporan terkait ketentuan layanan, silakan hubungi kami di:
          </p>
          <a
            href="mailto:support-kiryuu@googlegroups.com"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-bg-elevated border border-border rounded-xl text-accent-red text-sm font-semibold hover:border-accent-red transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            support-kiryuu@googlegroups.com
          </a>
        </Section>

        <div className="border-t border-border pt-6 mt-4 flex items-center justify-between">
          <Link href="/privacy-policy" className="text-xs text-text-muted hover:text-accent-red transition-colors">
            ← Privacy Policy
          </Link>
          <Link href="/" className="text-xs text-text-muted hover:text-accent-red transition-colors">
            Kembali ke Beranda →
          </Link>
        </div>

        <div className="h-6" />
      </main>
    </div>
  );
}