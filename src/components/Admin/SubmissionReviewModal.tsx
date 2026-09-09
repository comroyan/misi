import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Shield,
  Eye,
  Maximize2,
} from 'lucide-react';
import { Submission, MissionStep } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface SubmissionReviewModalProps {
  submission: Submission;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (submissionId: string) => Promise<void>;
  onReject: (submissionId: string, reason: string) => Promise<void>;
  onRequestRevision: (
    submissionId: string,
    stepId: string,
    reason: string
  ) => Promise<void>;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestRevision,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'idle' | 'approve' | 'reject' | 'revision'>('idle');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionStepId, setRevisionStepId] = useState(
    submission.stepsSnapshot?.[0]?.id || ''
  );
  const [revisionReason, setRevisionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(submission.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Mohon masukkan alasan penolakan.');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(submission.id, rejectionReason.trim());
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevision = async () => {
    if (!revisionReason.trim()) {
      alert('Mohon masukkan alasan dan panduan perbaikan yang jelas.');
      return;
    }
    setIsProcessing(true);
    try {
      await onRequestRevision(submission.id, revisionStepId, revisionReason.trim());
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="submission-review-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-md border border-zinc-300">
                {submission.submissionCode}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  submission.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : submission.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : submission.status === 'REVISION_REQUIRED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {submission.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 mt-1">
              {submission.missionTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Proofs & Answers */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Daftar Bukti Pengerjaan
            </h3>

            {submission.stepsSnapshot && submission.stepsSnapshot.length > 0 ? (
              submission.stepsSnapshot.map((step, idx) => {
                const answer = submission.answers[step.id];
                return (
                  <div
                    key={step.id}
                    className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/40"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-zinc-200 text-zinc-800 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900">
                          {step.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium uppercase">
                        {step.type}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 mb-3">{step.description}</p>

                    {/* Screenshot preview */}
                    {answer?.files && answer.files.length > 0 ? (
                      <div className="space-y-2">
                        <div className="relative group rounded-xl overflow-hidden border border-zinc-300 bg-black/5 max-h-80 flex items-center justify-center">
                          <img
                            src={answer.files[0]}
                            alt={`Bukti langkah ${idx + 1}`}
                            className="max-h-80 w-auto object-contain cursor-pointer"
                            onClick={() => setSelectedImage(answer.files![0])}
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImage(answer.files![0])}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 text-white text-[11px] font-medium flex items-center gap-1 shadow-xs transition-opacity"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Perbesar Foto</span>
                          </button>
                        </div>
                      </div>
                    ) : answer?.textValue ? (
                      <div className="bg-white border border-zinc-200 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-zinc-800">
                          {answer.textValue}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        Tidak ada isian teks / bukti otomatis tercatat.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-500">
                Snapshot langkah tidak ditemukan untuk submission ini.
              </p>
            )}
          </div>

          {/* Right Column: User Info & Actions */}
          <div className="space-y-5 lg:border-l lg:border-zinc-200 lg:pl-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                Informasi Pengirim
              </h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nama</span>
                  <span className="font-semibold text-zinc-900">
                    {submission.participantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp</span>
                  <span className="font-medium text-zinc-800">
                    {submission.participantPhoneMasked}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reward</span>
                  <span className="font-bold text-emerald-600">
                    {formatRupiah(submission.rewardAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dikirim</span>
                  <span className="text-zinc-700">
                    {formatDateIndonesian(submission.submittedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action State: Decision choices */}
            {actionType === 'idle' && (
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Tindakan Verifikasi
                </h3>

                <button
                  id="btn-admin-approve"
                  type="button"
                  onClick={() => setActionType('approve')}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Setujui Submission</span>
                </button>

                <button
                  id="btn-admin-revision"
                  type="button"
                  onClick={() => setActionType('revision')}
                  className="w-full h-11 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Minta Perbaikan Bukti</span>
                </button>

                <button
                  id="btn-admin-reject"
                  type="button"
                  onClick={() => setActionType('reject')}
                  className="w-full h-11 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Tolak Submission</span>
                </button>
              </div>
            )}

            {/* ACTION: APPROVE CONFIRM */}
            {actionType === 'approve' && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900">
                  Konfirmasi Setujui
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Apakah kamu yakin bukti ini valid? Status akan menjadi APPROVED dan
                  pencatatan pembayaran sebesar{' '}
                  <strong>{formatRupiah(submission.rewardAmount)}</strong> akan dibuat.
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmApprove}
                    className="flex-1 h-9 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Menyimpan...' : 'Ya, Setujui'}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => setActionType('idle')}
                    className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: REVISION */}
            {actionType === 'revision' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                <h4 className="text-xs font-bold text-amber-900">
                  Minta Perbaikan Bukti
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                    Pilih Langkah yang Bermasalah
                  </label>
                  <select
                    value={revisionStepId}
                    onChange={(e) => setRevisionStepId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-amber-300 bg-white text-xs text-zinc-900"
                  >
                    {submission.stepsSnapshot?.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        Langkah {idx + 1}: {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                    Alasan & Petunjuk Perbaikan (Wajib)
                  </label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Contoh: Screenshot belum memperlihatkan status Following akun..."
                    className="w-full p-2 rounded-lg border border-amber-300 bg-white text-xs text-zinc-900 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmRevision}
                    className="flex-1 h-9 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => setActionType('idle')}
                    className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* ACTION: REJECT */}
            {actionType === 'reject' && (
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-3">
                <h4 className="text-xs font-bold text-rose-900">
                  Tolak Submission
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                    Alasan Penolakan (Wajib)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Contoh: Bukti screenshot diambil dari internet / akun palsu..."
                    className="w-full p-2 rounded-lg border border-rose-300 bg-white text-xs text-zinc-900 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmReject}
                    className="flex-1 h-9 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Menyimpan...' : 'Tolak Permanen'}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => setActionType('idle')}
                    className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Large Image Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={selectedImage}
            alt="Zoom Bukti"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};
