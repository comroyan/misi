import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Mission, MissionStep, Participation, StepAnswer } from '../../types';
import { processScreenshot, formatBytes } from '../../utils/image';
import { uploadProofFile, saveParticipation } from '../../lib/firebase';
import { generateUUID } from '../../utils/tokens';

interface MissionPlayerProps {
  mission: Mission;
  participation: Participation;
  onFinishSteps: (updatedParticipation: Participation) => void;
  onExit: () => void;
  targetStepId?: string; // If coming from a revision request
}

export const MissionPlayer: React.FC<MissionPlayerProps> = ({
  mission,
  participation,
  onFinishSteps,
  onExit,
  targetStepId,
}) => {
  const steps = mission.steps;
  const totalSteps = steps.length;

  // Initialize step index based on targetStepId or current progress
  const initialIndex = targetStepId
    ? Math.max(0, steps.findIndex((s) => s.id === targetStepId))
    : Math.min(participation.currentStepIndex || 0, totalSteps - 1);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>(
    participation.answers || {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentStep: MissionStep = steps[currentIndex];
  const currentAnswer = answers[currentStep?.id];

  // Auto-clear error on step change
  useEffect(() => {
    setErrorMessage(null);
  }, [currentIndex]);

  // Persist step answer update
  const updateAnswer = async (
    stepId: string,
    updates: Partial<StepAnswer>,
    autoCompleted = true
  ) => {
    setSaveStatus('saving');
    const existing = answers[stepId] || {
      stepId,
      type: currentStep.type,
      completed: false,
      updatedAt: new Date().toISOString(),
    };

    const updatedAnswer: StepAnswer = {
      ...existing,
      ...updates,
      completed: autoCompleted,
      updatedAt: new Date().toISOString(),
    };

    const newAnswers = {
      ...answers,
      [stepId]: updatedAnswer,
    };
    setAnswers(newAnswers);

    // Calculate completed steps count
    const completedCount = (Object.values(newAnswers) as StepAnswer[]).filter((a) => a.completed).length;

    const updatedParticipation: Participation = {
      ...participation,
      currentStepIndex: currentIndex,
      completedSteps: completedCount,
      answers: newAnswers,
      status: 'IN_PROGRESS',
    };

    await saveParticipation(updatedParticipation);
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  // Handle image upload with local compression and Firebase Storage
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Client-side compression
      const processed = await processScreenshot(file, 1440, 0.85);

      // 2. Upload to Firebase Storage
      const randomFileId = generateUUID();
      const downloadUrl = await uploadProofFile(
        processed.blob,
        mission.id,
        participation.id,
        randomFileId
      );

      // 3. Save to participation answers
      await updateAnswer(currentStep.id, {
        files: [downloadUrl],
        textValue: `File: ${file.name} (${formatBytes(processed.compressedSize)})`,
      });
    } catch (err: any) {
      console.error('Upload proof error:', err);
      setErrorMessage(err.message || 'Gambar belum berhasil diunggah. Coba lagi.');
    } finally {
      setIsUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleDeleteProof = async () => {
    await updateAnswer(
      currentStep.id,
      {
        files: [],
        textValue: '',
      },
      false
    );
  };

  // Determine if current step is satisfied to advance
  const isCurrentStepValid = (): boolean => {
    if (!currentStep.required) return true;
    if (!currentAnswer || !currentAnswer.completed) return false;

    switch (currentStep.type) {
      case 'IMAGE_UPLOAD':
      case 'MULTIPLE_IMAGES':
        return !!(currentAnswer.files && currentAnswer.files.length > 0);
      case 'TEXT':
      case 'TEXTAREA':
      case 'USERNAME':
      case 'LINK':
      case 'NUMBER':
        return !!(currentAnswer.textValue && currentAnswer.textValue.trim().length > 0);
      case 'CHECKBOX':
      case 'CONFIRMATION':
      case 'EXTERNAL_LINK':
      case 'INSTRUCTION':
        return currentAnswer.completed === true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      setErrorMessage('Lengkapi langkah ini terlebih dahulu sebelum melanjutkan.');
      return;
    }

    if (currentIndex < totalSteps - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All steps reached
      const completedCount = (Object.values(answers) as StepAnswer[]).filter((a) => a.completed).length;
      const updatedParticipation: Participation = {
        ...participation,
        answers,
        completedSteps: completedCount,
        currentStepIndex: currentIndex,
      };
      onFinishSteps(updatedParticipation);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onExit();
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / totalSteps) * 100);

  return (
    <div id="mission-player-container" className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Top Header: Mission Name & Step Progress */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center max-w-[200px] sm:max-w-[280px]">
            <p className="text-xs font-semibold text-zinc-900 truncate">
              {mission.title}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium">
              Langkah {currentIndex + 1} dari {totalSteps}
            </p>
          </div>

          {/* Auto-save micro status */}
          <div className="w-9 flex items-center justify-end">
            {saveStatus === 'saving' && (
              <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
            )}
            {saveStatus === 'saved' && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            )}
          </div>
        </div>

        {/* Thin clean progress bar */}
        <div className="w-full bg-zinc-100 h-1">
          <div
            className="bg-emerald-600 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 flex flex-col">
        {/* Step Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Langkah {currentIndex + 1}
            </span>
            {currentStep.required ? (
              <span className="text-[11px] text-zinc-400 font-medium">Wajib</span>
            ) : (
              <span className="text-[11px] text-zinc-400 font-medium">Opsional</span>
            )}
          </div>

          <h1 className="text-lg font-bold text-zinc-900 leading-snug mb-2">
            {currentStep.title}
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line mb-5">
            {currentStep.description}
          </p>

          {/* DYNAMIC STEP CONTROLS */}
          {/* 1. EXTERNAL LINK */}
          {currentStep.type === 'EXTERNAL_LINK' && (
            <div className="space-y-4 pt-2">
              <a
                href={currentStep.externalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  updateAnswer(currentStep.id, {
                    textValue: 'Sudah mengunjungi tautan luar',
                  });
                }}
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>{currentStep.ctaText || 'Buka Tautan'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentAnswer?.completed || false}
                  onChange={(e) => {
                    updateAnswer(
                      currentStep.id,
                      { textValue: 'Sudah mengunjungi tautan luar' },
                      e.target.checked
                    );
                  }}
                  className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-700 font-medium">
                  Saya sudah membuka tautan di atas
                </span>
              </label>
            </div>
          )}

          {/* 2. IMAGE UPLOAD */}
          {(currentStep.type === 'IMAGE_UPLOAD' || currentStep.type === 'MULTIPLE_IMAGES') && (
            <div className="space-y-3 pt-1">
              {currentAnswer?.files && currentAnswer.files.length > 0 ? (
                /* Preview State */
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 p-3">
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 bg-black/5 max-h-72 flex items-center justify-center">
                    <img
                      src={currentAnswer.files[0]}
                      alt="Bukti Screenshot"
                      className="max-h-72 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 text-xs">
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Bukti gambar tersimpan
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ganti</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleDeleteProof}
                        className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Bukti"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <label className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-50/50 hover:bg-emerald-50/20 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-semibold text-zinc-700">
                        Mengompres & mengunggah bukti...
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        Menjaga tulisan screenshot tetap tajam
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-700 mb-3">
                        <Upload className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 mb-1">
                        Pilih Screenshot Bukti
                      </p>
                      <p className="text-xs text-zinc-600 max-w-xs">
                        Klik untuk mengambil foto atau memilih dari galeri HP kamu (Maks {currentStep.maxFileSizeMb || 5}MB)
                      </p>
                    </>
                  )}
                </label>
              )}
            </div>
          )}

          {/* 3. TEXT / USERNAME / LINK / NUMBER */}
          {(currentStep.type === 'TEXT' ||
            currentStep.type === 'USERNAME' ||
            currentStep.type === 'LINK' ||
            currentStep.type === 'NUMBER') && (
            <div className="pt-2">
              <input
                type={currentStep.type === 'NUMBER' ? 'number' : 'text'}
                value={currentAnswer?.textValue || ''}
                placeholder={currentStep.placeholder || 'Tulis jawaban kamu di sini...'}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAnswer(currentStep.id, { textValue: val }, val.trim().length > 0);
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
          )}

          {/* 4. TEXTAREA */}
          {currentStep.type === 'TEXTAREA' && (
            <div className="pt-2">
              <textarea
                rows={4}
                value={currentAnswer?.textValue || ''}
                placeholder={currentStep.placeholder || 'Tulis jawaban lengkap di sini...'}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAnswer(currentStep.id, { textValue: val }, val.trim().length > 0);
                }}
                className="w-full p-3.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
              />
            </div>
          )}

          {/* 5. CHECKBOX & CONFIRMATION */}
          {(currentStep.type === 'CHECKBOX' || currentStep.type === 'CONFIRMATION') && (
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentAnswer?.completed || false}
                  onChange={(e) => {
                    updateAnswer(
                      currentStep.id,
                      { textValue: 'Telah dikonfirmasi pengguna' },
                      e.target.checked
                    );
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-700 font-medium leading-relaxed select-none">
                  Saya sudah menyelesaikan tugas langkah ini sesuai instruksi.
                </span>
              </label>
            </div>
          )}

          {/* 6. INSTRUCTION ONLY */}
          {currentStep.type === 'INSTRUCTION' && (
            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentAnswer?.completed || false}
                  onChange={(e) => {
                    updateAnswer(
                      currentStep.id,
                      { textValue: 'Instruksi dipahami' },
                      e.target.checked
                    );
                  }}
                  className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-700 font-medium">
                  Saya sudah membaca dan memahami instruksi ini
                </span>
              </label>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Small Auto-Save Helper Notice */}
        <div className="flex items-center justify-between text-[11px] text-zinc-600 px-1 mb-6">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            Progress otomatis tersimpan
          </span>
          {saveStatus === 'saved' && (
            <span className="text-emerald-700 font-medium animate-in fade-in">
              Tersimpan di perangkat
            </span>
          )}
        </div>

        {/* Bottom Actions Sticky Container */}
        <div className="mt-auto pt-4 pb-6 flex items-center gap-3">
          {currentIndex > 0 && (
            <button
              id="btn-step-prev"
              type="button"
              onClick={handleBack}
              className="h-12 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-sm transition-colors"
            >
              Sebelumnya
            </button>
          )}

          <button
            id="btn-step-next"
            type="button"
            onClick={handleNext}
            disabled={isUploading}
            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            {currentIndex === totalSteps - 1 ? (
              <span>Selesai & Kirim Misi</span>
            ) : (
              <span>Lanjut ke Langkah {currentIndex + 2}</span>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
