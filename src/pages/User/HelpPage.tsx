import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';

interface HelpPageProps {
  whatsappSupport?: string;
}

export const HelpPage: React.FC<HelpPageProps> = ({
  whatsappSupport = '6281234567890',
}) => {
  const faqs = [
    {
      q: 'Kenapa saya tidak perlu mendaftar akun atau login?',
      a: 'MisiKu menggunakan sesi browser anonim yang aman. Kamu cukup mengisi nama dan nomor WhatsApp satu kali saat pertama kali mengambil misi. Tidak perlu mengingat password atau verifikasi email!',
    },
    {
      q: 'Bagaimana cara menerima pembayaran reward?',
      a: 'Setelah semua bukti diperiksa dan disetujui oleh admin, kamu akan dihubungi melalui nomor WhatsApp kamu untuk konfirmasi transfer e-wallet (DANA, GoPay, ShopeePay, atau Transfer Bank).',
    },
    {
      q: 'Berapa lama proses verifikasi bukti oleh admin?',
      a: 'Umumnya admin memeriksa bukti dalam waktu 1x24 jam kerja. Kamu bisa mengecek status secara berkala di halaman Aktivitas tanpa perlu login.',
    },
    {
      q: 'Apa yang harus dilakukan jika ada permintaan revisi (Perlu Perbaikan)?',
      a: 'Jika admin mendapati screenshot kurang jelas atau akun belum mem-follow dengan benar, kamu akan melihat tombol "Perbaiki Bukti" di halaman status. Cukup unggah ulang bukti yang diminta dan kirim ulang.',
    },
    {
      q: 'Tips agar bukti screenshot langsung disetujui:',
      a: 'Pastikan status "Mengikuti / Following" terlihat jelas, username Instagram kamu cocok dengan yang diisi, dan jangan crop bagian penting dari layar.',
    },
  ];

  return (
    <div id="user-help-page" className="pb-24 pt-2">
      <div className="px-4 mb-4">
        <h1 className="text-lg font-bold text-zinc-900">
          Pusat Bantuan & Tanya Jawab
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Informasi seputar cara kerja misi, verifikasi bukti, dan pencairan hadiah.
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Support CTA Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Butuh Bantuan Langsung?
            </h2>
            <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
              Hubungi layanan admin MisiKu melalui WhatsApp resmi untuk pertanyaan seputar misi dan reward.
            </p>
            <a
              href={`https://wa.me/${whatsappSupport}?text=Halo%20Admin%20MisiKu%2C%20saya%20butuh%20bantuan`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Chat WhatsApp Admin</span>
            </a>
          </div>
        </div>

        {/* FAQs list */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider px-1">
            Pertanyaan yang Sering Diajukan
          </h2>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs"
            >
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 mb-1.5 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

