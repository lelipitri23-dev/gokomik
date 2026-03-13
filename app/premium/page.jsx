'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const PACKAGES = [
  { id: '7days', title: 'Paket 7 Hari', rp: 'Rp 5.000', usd: '0.30', benefits: ['Akses Semua Konten', 'Tanpa Iklan'] },
  { id: '30days', title: 'Paket 30 Hari', rp: 'Rp 15.000', usd: '1.00', benefits: ['Akses Semua Konten', 'Tanpa Iklan', 'Badge Profil Khusus'] },
  { id: '1year', title: 'Paket 1 Tahun', rp: 'Rp 50.000', usd: '3.20', benefits: ['Semua Benefit Sebelumnya', 'Background Profil Animasi'] },
  { id: 'lifetime', title: 'Paket Lifetime', rp: 'Rp 100.000', usd: '6.40', benefits: ['Semua Benefit Sebelumnya', 'Permanen Seumur Hidup'] },
];

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {

    if (isScriptLoaded && window.paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description: `Premium ${selectedPkg.title} - ${user?.uid}`,
              amount: {
                value: selectedPkg.usd
              },
              custom_id: user?.uid
            }]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          console.log('Pesanan Berhasil:', order);
          alert('Pembayaran Berhasil! Terima kasih telah berlangganan.');

          router.push(`/user/${user?.uid}`);
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          alert('Terjadi kesalahan pada pembayaran PayPal.');
        }
      }).render('#paypal-button-container');
    }
  }, [isScriptLoaded, selectedPkg, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Navbar />

      {}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
        onLoad={() => setIsScriptLoaded(true)}
      />

      <main className="pt-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl text-white tracking-widest mb-3">KOMIKCAST <span className="text-accent-red">PREMIUM</span></h1>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Dukung kami dengan berlangganan Premium. Nikmati pengalaman membaca tanpa iklan dan fitur eksklusif profil!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                selectedPkg.id === pkg.id
                ? 'bg-accent-red/10 border-accent-red scale-[1.02] shadow-[0_0_20px_rgba(229,57,53,0.3)]'
                : 'bg-bg-card border-border hover:border-text-secondary hover:bg-bg-elevated'
              }`}
            >
              {pkg.id === '1year' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-[10px] font-black px-3 py-1 rounded-full tracking-wider uppercase">
                  Paling Laris
                </div>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{pkg.title}</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-2xl font-black text-white">{pkg.rp}</span>
                <span className="text-text-muted text-xs mb-1 font-semibold">/ {pkg.usd} USD</span>
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className={`mt-auto w-full py-2.5 rounded-xl text-center text-sm font-bold transition-colors ${
                selectedPkg.id === pkg.id
                ? 'bg-accent-red text-white'
                : 'bg-bg-elevated text-text-secondary border border-border'
              }`}>
                {selectedPkg.id === pkg.id ? 'Terpilih' : 'Pilih Paket'}
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="bg-bg-card border border-border rounded-2xl p-6 max-w-md mx-auto text-center">
          <h2 className="text-white font-bold text-lg mb-2">Checkout</h2>
          <p className="text-text-muted text-xs mb-6 px-4">
            Total tagihan Anda adalah <span className="text-white font-bold">${selectedPkg.usd} USD</span> untuk {selectedPkg.title}. Pembayaran akan diproses dengan aman melalui PayPal.
          </p>

          <div className="min-h-[150px] flex items-center justify-center">
            {!isScriptLoaded ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-text-muted">Memuat PayPal...</span>
              </div>
            ) : (
              <div id="paypal-button-container" className="w-full z-0 relative"></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
