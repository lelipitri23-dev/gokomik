'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

const PACKAGES = [
  { id: '7days', title: 'Paket 7 Hari', rp: 'Rp 5.000', usd: '0.30', benefits: ['Akses Semua Konten', 'Tanpa Iklan'] },
  { id: '30days', title: 'Paket 30 Hari', rp: 'Rp 15.000', usd: '1.00', benefits: ['Akses Semua Konten', 'Tanpa Iklan', 'Badge Profil Khusus'] },
  { id: '1year', title: 'Paket 1 Tahun', rp: 'Rp 50.000', usd: '3.20', benefits: ['Semua Benefit Sebelumnya', 'Background Profil Animasi'] },
  { id: 'lifetime', title: 'Paket Lifetime', rp: 'Rp 100.000', usd: '6.40', benefits: ['Semua Benefit Sebelumnya', 'Permanen Seumur Hidup'] },
];

export default function PremiumSubscribe() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

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

          window.location.reload();
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
    <div className="bg-bg-card border border-border rounded-2xl p-5 mb-8">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="text-center mb-6">
        <h2 className="font-display text-xl text-white tracking-widest mb-1">UPGRADE <span className="text-accent-red">PREMIUM</span></h2>
        <p className="text-text-muted text-xs">Akses semua fitur tanpa batas. Tanpa iklan & benefit profil eksklusif.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPkg(pkg)}
            className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedPkg.id === pkg.id
              ? 'bg-accent-red/10 border-accent-red shadow-[0_0_15px_rgba(229,57,53,0.2)]'
              : 'bg-bg-elevated border-border hover:border-text-secondary'
            }`}
          >
            {pkg.id === '1year' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                Paling Laris
              </div>
            )}
            <h3 className="text-white font-bold text-sm mb-1">{pkg.title}</h3>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-lg font-black text-white">{pkg.rp}</span>
              <span className="text-text-muted text-[10px] mb-1 font-semibold">/ {pkg.usd} USD</span>
            </div>

            <ul className="space-y-1 mb-4">
              {pkg.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[10px] text-text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-green-500 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className={`mt-auto w-full py-1.5 rounded-lg text-center text-[11px] font-bold transition-colors ${
              selectedPkg.id === pkg.id
              ? 'bg-accent-red text-white'
              : 'bg-bg-card text-text-secondary border border-border'
            }`}>
              {selectedPkg.id === pkg.id ? 'Terpilih' : 'Pilih'}
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="bg-bg-elevated rounded-xl p-4 text-center">
        <p className="text-text-muted text-[11px] mb-4">
          Tagihan Anda: <span className="text-white font-bold">${selectedPkg.usd} USD</span> via PayPal.
        </p>

        <div className="min-h-[100px] flex items-center justify-center">
          {!isScriptLoaded ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] text-text-muted">Memuat PayPal...</span>
            </div>
          ) : (
            <div id="paypal-button-container" className="w-full max-w-[250px] mx-auto z-0 relative"></div>
          )}
        </div>
      </div>
    </div>
  );
}
