import React from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Image as ImageIcon,
  ExternalLink,
  Type,
  CheckSquare,
  FileText,
  AtSign,
  Hash,
} from 'lucide-react';
import { MissionStep, StepType } from '../../types';
import { generateUUID } from '../../utils/tokens';

interface MissionBuilderProps {
  steps: MissionStep[];
  onChangeSteps: (steps: MissionStep[]) => void;
}

const STEP_TYPE_OPTIONS: { type: StepType; label: string; icon: any }[] = [
  { type: 'IMAGE_UPLOAD', label: 'Upload Screenshot (1 Foto)', icon: ImageIcon },
  { type: 'EXTERNAL_LINK', label: 'Tautan Luar / Buka Link', icon: ExternalLink },
  { type: 'USERNAME', label: 'Input Username Medsos', icon: AtSign },
  { type: 'TEXT', label: 'Teks Singkat', icon: Type },
  { type: 'TEXTAREA', label: 'Teks Panjang / Ulasan', icon: FileText },
  { type: 'NUMBER', label: 'Input Angka', icon: Hash },
  { type: 'CHECKBOX', label: 'Centang Persetujuan', icon: CheckSquare },
  { type: 'CONFIRMATION', label: 'Konfirmasi Selesai', icon: CheckSquare },
  { type: 'INSTRUCTION', label: 'Instruksi / Catatan Saja', icon: FileText },
];

export const MissionBuilder: React.FC<MissionBuilderProps> = ({
  steps,
  onChangeSteps,
}) => {
  const handleAddStep = () => {
    const newStep: MissionStep = {
      id: 'step_' + generateUUID().substring(0, 8),
      order: steps.length + 1,
      type: 'IMAGE_UPLOAD',
      title: 'Langkah Baru',
      description: 'Jelaskan apa yang harus dilakukan pengguna pada langkah ini.',
      required: true,
      maxFileSizeMb: 5,
    };
    onChangeSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, updates: Partial<MissionStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...updates };
    onChangeSteps(updated);
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Misi harus memiliki minimal 1 langkah.');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== index);
    onChangeSteps(updated.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleDuplicateStep = (index: number) => {
    const target = steps[index];
    const copy: MissionStep = {
      ...target,
      id: 'step_' + generateUUID().substring(0, 8),
      title: `${target.title} (Salinan)`,
      order: index + 2,
    };
    const updated = [...steps.slice(0, index + 1), copy, ...steps.slice(index + 1)];
    onChangeSteps(updated.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeSteps(updated.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  return (
    <div id="visual-mission-builder" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">
            Langkah-Langkah Misi ({steps.length})
          </h3>
          <p className="text-xs text-zinc-600">
            Atur instruksi dan jenis bukti yang wajib dikirimkan oleh pengguna.
          </p>
        </div>

        <button
          id="btn-add-mission-step"
          type="button"
          onClick={handleAddStep}
          className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Langkah</span>
        </button>
      </div>

      {steps.map((step, idx) => {
        return (
          <div
            key={step.id}
            id={`builder-step-${step.id}`}
            className="bg-zinc-50/70 border border-zinc-200 rounded-2xl p-4 transition-all"
          >
            {/* Step Header Row */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-200/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-zinc-800">
                  Langkah {idx + 1}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveStep(idx, 'up')}
                  disabled={idx === 0}
                  className="w-7 h-7 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 flex items-center justify-center"
                  title="Pindah ke Atas"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveStep(idx, 'down')}
                  disabled={idx === steps.length - 1}
                  className="w-7 h-7 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 flex items-center justify-center"
                  title="Pindah ke Bawah"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateStep(idx)}
                  className="w-7 h-7 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 flex items-center justify-center"
                  title="Duplikat Langkah"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStep(idx)}
                  className="w-7 h-7 rounded-lg border border-zinc-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                  title="Hapus Langkah"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Jenis Langkah / Bukti
                  </label>
                  <select
                    value={step.type}
                    onChange={(e) =>
                      handleUpdateStep(idx, { type: e.target.value as StepType })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {STEP_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Kewajiban Langkah
                  </label>
                  <div className="flex items-center h-10 px-3 rounded-xl border border-zinc-300 bg-white">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={step.required}
                        onChange={(e) =>
                          handleUpdateStep(idx, { required: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                      />
                      <span>Wajib dikerjakan oleh pengguna</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Judul Langkah
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                  placeholder="Contoh: Follow Akun & Upload Screenshot"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Instruksi Detail
                </label>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) => handleUpdateStep(idx, { description: e.target.value })}
                  placeholder="Jelaskan secara spesifik apa yang harus dilakukan..."
                  className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
                />
              </div>

              {/* Conditional options for External Link */}
              {step.type === 'EXTERNAL_LINK' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      URL Tautan (https://...)
                    </label>
                    <input
                      type="url"
                      value={step.externalUrl || ''}
                      onChange={(e) => handleUpdateStep(idx, { externalUrl: e.target.value })}
                      placeholder="https://instagram.com/akun"
                      className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Teks Tombol CTA
                    </label>
                    <input
                      type="text"
                      value={step.ctaText || ''}
                      onChange={(e) => handleUpdateStep(idx, { ctaText: e.target.value })}
                      placeholder="Buka Akun Instagram"
                      className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
                    />
                  </div>
                </div>
              )}

              {/* Conditional placeholder for Text/Username/Link */}
              {(step.type === 'TEXT' ||
                step.type === 'USERNAME' ||
                step.type === 'LINK' ||
                step.type === 'NUMBER' ||
                step.type === 'TEXTAREA') && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Placeholder Kotak Input
                  </label>
                  <input
                    type="text"
                    value={step.placeholder || ''}
                    onChange={(e) => handleUpdateStep(idx, { placeholder: e.target.value })}
                    placeholder="Contoh: @username_kamu"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
