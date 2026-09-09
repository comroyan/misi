import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

import firebaseConfigRaw from '../../firebase-applet-config.json';
import {
  Mission,
  MissionCategory,
  Participation,
  Submission,
  PaymentRecord,
  Banner,
  PlatformSettings,
  AuditLog,
  StepAnswer,
} from '../types';
import {
  generatePublicToken,
  generateSubmissionCode,
  generateUUID,
} from '../utils/tokens';
import { maskPhoneNumber } from '../utils/formatters';
import {
  INITIAL_MISSIONS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
} from '../data/seed';

// Initialize Firebase
const firebaseConfig = {
  apiKey: firebaseConfigRaw.apiKey,
  authDomain: firebaseConfigRaw.authDomain,
  projectId: firebaseConfigRaw.projectId,
  storageBucket: firebaseConfigRaw.storageBucket,
  messagingSenderId: firebaseConfigRaw.messagingSenderId,
  appId: firebaseConfigRaw.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use databaseId from config if provided
export const db: Firestore = getFirestore(
  app,
  firebaseConfigRaw.firestoreDatabaseId || '(default)'
);

export const storage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

// In-memory / LocalStorage cache for high reliability and instant preview
const LOCAL_MISSIONS_KEY = 'misiku_local_missions';
const LOCAL_PARTICIPATIONS_KEY = 'misiku_local_participations';
const LOCAL_SUBMISSIONS_KEY = 'misiku_local_submissions';
const LOCAL_PAYMENTS_KEY = 'misiku_local_payments';
const LOCAL_SETTINGS_KEY = 'misiku_local_settings';
const LOCAL_BANNERS_KEY = 'misiku_local_banners';
const LOCAL_AUDIT_KEY = 'misiku_local_audit';
const LOCAL_ADMIN_AUTH_KEY = 'misiku_admin_credentials';

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache data locally', e);
  }
}

// ----------------------------------------------------------------------
// MISSIONS REPOSITORY
// ----------------------------------------------------------------------

export async function getMissions(categoryFilter?: string): Promise<Mission[]> {
  try {
    const missionsCol = collection(db, 'missions');
    const q = categoryFilter
      ? query(missionsCol, where('categoryId', '==', categoryFilter))
      : missionsCol;
    const snap = await getDocs(q);

    if (!snap.empty) {
      const list: Mission[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Mission));
      // sync local cache
      setLocalData(LOCAL_MISSIONS_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn('Firestore getMissions notice:', err);
  }

  // Fallback to local storage or initial seed
  const cached = getLocalData<Mission[]>(LOCAL_MISSIONS_KEY, INITIAL_MISSIONS);
  if (categoryFilter) {
    return cached.filter((m) => m.categoryId === categoryFilter);
  }
  return cached;
}

export async function getMissionBySlug(slug: string): Promise<Mission | null> {
  try {
    const missionsCol = collection(db, 'missions');
    const q = query(missionsCol, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as Mission;
    }
  } catch (err) {
    console.warn('Firestore getMissionBySlug notice:', err);
  }

  const cached = getLocalData<Mission[]>(LOCAL_MISSIONS_KEY, INITIAL_MISSIONS);
  return cached.find((m) => m.slug === slug || m.id === slug) || null;
}

export async function getMissionById(id: string): Promise<Mission | null> {
  try {
    const dRef = doc(db, 'missions', id);
    const snap = await getDoc(dRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Mission;
    }
  } catch (err) {
    console.warn('Firestore getMissionById notice:', err);
  }

  const cached = getLocalData<Mission[]>(LOCAL_MISSIONS_KEY, INITIAL_MISSIONS);
  return cached.find((m) => m.id === id) || null;
}

export async function saveMission(
  mission: Mission,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  try {
    const dRef = doc(db, 'missions', mission.id);
    await setDoc(dRef, mission);
  } catch (err) {
    console.warn('Firestore saveMission notice:', err);
  }

  // Update local cache
  const cached = getLocalData<Mission[]>(LOCAL_MISSIONS_KEY, INITIAL_MISSIONS);
  const idx = cached.findIndex((m) => m.id === mission.id);
  if (idx >= 0) {
    cached[idx] = mission;
  } else {
    cached.unshift(mission);
  }
  setLocalData(LOCAL_MISSIONS_KEY, cached);
  await addAuditLog('SAVE_MISSION', 'MISSION', mission.id, `Misi disimpan: ${mission.title}`, adminEmail);
}

export async function deleteMission(
  id: string,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  try {
    const dRef = doc(db, 'missions', id);
    await setDoc(dRef, { status: 'ARCHIVED' }, { merge: true });
  } catch (err) {
    console.warn('Firestore deleteMission notice:', err);
  }

  const cached = getLocalData<Mission[]>(LOCAL_MISSIONS_KEY, INITIAL_MISSIONS);
  const updated = cached.filter((m) => m.id !== id);
  setLocalData(LOCAL_MISSIONS_KEY, updated);
  await addAuditLog('DELETE_MISSION', 'MISSION', id, `Misi dihapus / diarsipkan`, adminEmail);
}

// ----------------------------------------------------------------------
// PARTICIPATIONS & SUBMISSIONS
// ----------------------------------------------------------------------

export async function saveParticipation(participation: Participation): Promise<void> {
  try {
    const pRef = doc(db, 'participations', participation.id);
    await setDoc(pRef, participation);
  } catch (err) {
    console.warn('Firestore saveParticipation notice:', err);
  }

  // Update local cache
  const cached = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  const idx = cached.findIndex((p) => p.id === participation.id);
  if (idx >= 0) {
    cached[idx] = participation;
  } else {
    cached.unshift(participation);
  }
  setLocalData(LOCAL_PARTICIPATIONS_KEY, cached);
}

export async function getParticipationByPublicToken(
  token: string
): Promise<Participation | null> {
  try {
    const pCol = collection(db, 'participations');
    const q = query(pCol, where('publicToken', '==', token), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as Participation;
    }
  } catch (err) {
    console.warn('Firestore getParticipationByPublicToken notice:', err);
  }

  const cached = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  return (
    cached.find((p) => p.publicToken === token || p.id === token || p.submissionCode === token) ||
    null
  );
}

export async function getParticipationsByVisitor(visitorId: string): Promise<Participation[]> {
  try {
    const pCol = collection(db, 'participations');
    const q = query(pCol, where('visitorId', '==', visitorId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: Participation[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Participation));
      return list;
    }
  } catch (err) {
    console.warn('Firestore getParticipationsByVisitor notice:', err);
  }

  const cached = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  return cached.filter((p) => p.visitorId === visitorId);
}

export async function submitParticipationFinal(
  submission: Submission,
  participation: Participation
): Promise<void> {
  try {
    // 1. Save submission document
    const sRef = doc(db, 'submissions', submission.id);
    await setDoc(sRef, submission);

    // 2. Update participation
    const pRef = doc(db, 'participations', participation.id);
    await setDoc(pRef, participation);
  } catch (err) {
    console.warn('Firestore submitParticipationFinal notice:', err);
  }

  // Update local caches
  const cachedSubmissions = getLocalData<Submission[]>(LOCAL_SUBMISSIONS_KEY, []);
  cachedSubmissions.unshift(submission);
  setLocalData(LOCAL_SUBMISSIONS_KEY, cachedSubmissions);

  const cachedParticipations = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  const pIdx = cachedParticipations.findIndex((p) => p.id === participation.id);
  if (pIdx >= 0) {
    cachedParticipations[pIdx] = participation;
  } else {
    cachedParticipations.unshift(participation);
  }
  setLocalData(LOCAL_PARTICIPATIONS_KEY, cachedParticipations);

  // Trigger WhatsApp Admin notification (safely, won't fail submission if offline)
  try {
    fetch('/api/whatsapp/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionCode: submission.submissionCode,
        missionTitle: submission.missionTitle,
        participantName: submission.participantName,
        participantPhone: submission.participantPhone,
        rewardAmount: submission.rewardAmount,
        totalSteps: Object.keys(submission.answers).length,
        submissionId: submission.id,
      }),
    }).catch((e) => console.log('WhatsApp notification background trigger logged', e));
  } catch {
    // Ignore network error on notification
  }
}

export async function getAllSubmissions(): Promise<Submission[]> {
  try {
    const sCol = collection(db, 'submissions');
    const snap = await getDocs(sCol);
    if (!snap.empty) {
      const list: Submission[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Submission));
      setLocalData(LOCAL_SUBMISSIONS_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn('Firestore getAllSubmissions notice:', err);
  }

  return getLocalData<Submission[]>(LOCAL_SUBMISSIONS_KEY, []);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  try {
    const sRef = doc(db, 'submissions', id);
    const snap = await getDoc(sRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Submission;
    }
  } catch (err) {
    console.warn('Firestore getSubmissionById notice:', err);
  }

  const cached = getLocalData<Submission[]>(LOCAL_SUBMISSIONS_KEY, []);
  return cached.find((s) => s.id === id || s.submissionCode === id) || null;
}

export async function updateSubmissionReview(
  submissionId: string,
  updates: Partial<Submission>,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  try {
    const sRef = doc(db, 'submissions', submissionId);
    await updateDoc(sRef, {
      ...updates,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminEmail,
    });
  } catch (err) {
    console.warn('Firestore updateSubmissionReview notice:', err);
  }

  // Update local cache
  const cachedSubmissions = getLocalData<Submission[]>(LOCAL_SUBMISSIONS_KEY, []);
  const sIdx = cachedSubmissions.findIndex((s) => s.id === submissionId);
  if (sIdx >= 0) {
    const updatedSub = {
      ...cachedSubmissions[sIdx],
      ...updates,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminEmail,
    };
    cachedSubmissions[sIdx] = updatedSub;
    setLocalData(LOCAL_SUBMISSIONS_KEY, cachedSubmissions);

    // Also sync corresponding participation
    const cachedParticipations = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
    const pIdx = cachedParticipations.findIndex(
      (p) => p.id === updatedSub.participationId || p.publicToken === updatedSub.publicToken
    );
    if (pIdx >= 0) {
      cachedParticipations[pIdx] = {
        ...cachedParticipations[pIdx],
        status: updatedSub.status,
        revisionStepId: updatedSub.revisionStepId,
        revisionReason: updatedSub.revisionReason,
      };
      setLocalData(LOCAL_PARTICIPATIONS_KEY, cachedParticipations);
    }

    // If APPROVED, auto-create Payment Record
    if (updates.status === 'APPROVED') {
      const payment: PaymentRecord = {
        id: 'pay_' + updatedSub.id,
        submissionId: updatedSub.id,
        submissionCode: updatedSub.submissionCode,
        participantName: updatedSub.participantName,
        participantPhone: updatedSub.participantPhone,
        participantPhoneMasked: updatedSub.participantPhoneMasked,
        rewardAmount: updatedSub.rewardAmount,
        method: (updatedSub.paymentMethod as any) || 'DANA',
        accountNumber: updatedSub.paymentAccount || updatedSub.participantPhone,
        accountName: updatedSub.participantName,
        status: 'UNPAID',
        createdAt: new Date().toISOString(),
      };
      await savePaymentRecord(payment);
    }
  }
}

// ----------------------------------------------------------------------
// PAYMENTS
// ----------------------------------------------------------------------

export async function getPayments(): Promise<PaymentRecord[]> {
  try {
    const pCol = collection(db, 'payments');
    const snap = await getDocs(pCol);
    if (!snap.empty) {
      const list: PaymentRecord[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as PaymentRecord));
      setLocalData(LOCAL_PAYMENTS_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn('Firestore getPayments notice:', err);
  }

  return getLocalData<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
}

export async function savePaymentRecord(payment: PaymentRecord): Promise<void> {
  try {
    const pRef = doc(db, 'payments', payment.id);
    await setDoc(pRef, payment);
  } catch (err) {
    console.warn('Firestore savePaymentRecord notice:', err);
  }

  const cached = getLocalData<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = cached.findIndex((p) => p.id === payment.id);
  if (idx >= 0) {
    cached[idx] = payment;
  } else {
    cached.unshift(payment);
  }
  setLocalData(LOCAL_PAYMENTS_KEY, cached);
}

// ----------------------------------------------------------------------
// BANNERS & SETTINGS
// ----------------------------------------------------------------------

export async function getBanners(): Promise<Banner[]> {
  try {
    const bCol = collection(db, 'banners');
    const snap = await getDocs(bCol);
    if (!snap.empty) {
      const list: Banner[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Banner));
      return list.filter((b) => b.active);
    }
  } catch (err) {
    console.warn('Firestore getBanners notice:', err);
  }

  const cached = getLocalData<Banner[]>(LOCAL_BANNERS_KEY, INITIAL_BANNERS);
  return cached.filter((b) => b.active);
}

export async function getSettings(): Promise<PlatformSettings> {
  try {
    const sRef = doc(db, 'settings', 'general');
    const snap = await getDoc(sRef);
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
  } catch (err) {
    console.warn('Firestore getSettings notice:', err);
  }

  return getLocalData<PlatformSettings>(LOCAL_SETTINGS_KEY, INITIAL_SETTINGS);
}

export async function saveSettings(settings: PlatformSettings): Promise<void> {
  try {
    const sRef = doc(db, 'settings', 'general');
    await setDoc(sRef, settings);
  } catch (err) {
    console.warn('Firestore saveSettings notice:', err);
  }
  setLocalData(LOCAL_SETTINGS_KEY, settings);
}

// ----------------------------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------------------------

export async function addAuditLog(
  action: string,
  targetType: AuditLog['targetType'],
  targetId: string,
  details: string,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  const log: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    adminEmail,
    action,
    targetType,
    targetId,
    timestamp: new Date().toISOString(),
    details,
  };

  try {
    const lRef = doc(db, 'auditLogs', log.id);
    await setDoc(lRef, log);
  } catch (err) {
    console.warn('Firestore addAuditLog notice:', err);
  }

  const cached = getLocalData<AuditLog[]>(LOCAL_AUDIT_KEY, []);
  cached.unshift(log);
  setLocalData(LOCAL_AUDIT_KEY, cached.slice(0, 100));
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const lCol = collection(db, 'auditLogs');
    const snap = await getDocs(lCol);
    if (!snap.empty) {
      const list: AuditLog[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as AuditLog));
      return list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    }
  } catch (err) {
    console.warn('Firestore getAuditLogs notice:', err);
  }

  return getLocalData<AuditLog[]>(LOCAL_AUDIT_KEY, []);
}

// ----------------------------------------------------------------------
// ADMIN AUTHENTICATION & PASSWORD MANAGEMENT
// ----------------------------------------------------------------------

export interface AdminAuthData {
  email: string;
  password: string;
  updatedAt: string;
}

const DEFAULT_ADMIN_AUTH: AdminAuthData = {
  email: 'admin@misiku.id',
  password: 'admin123456',
  updatedAt: new Date().toISOString(),
};

export async function getAdminAuthData(): Promise<AdminAuthData> {
  try {
    const aRef = doc(db, 'settings', 'admin_auth');
    const snap = await getDoc(aRef);
    if (snap.exists()) {
      const data = snap.data() as AdminAuthData;
      setLocalData(LOCAL_ADMIN_AUTH_KEY, data);
      return data;
    }
  } catch (err) {
    console.warn('Firestore getAdminAuthData notice:', err);
  }
  return getLocalData<AdminAuthData>(LOCAL_ADMIN_AUTH_KEY, DEFAULT_ADMIN_AUTH);
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  const current = await getAdminAuthData();
  const inputEmail = email.trim().toLowerCase();
  const validEmail = current.email.trim().toLowerCase();

  if (inputEmail !== validEmail) {
    return { success: false, message: 'Email admin tidak terdaftar.' };
  }

  if (password !== current.password) {
    return { success: false, message: 'Password admin salah. Silakan coba lagi.' };
  }

  return { success: true };
}

export async function updateAdminPassword(
  oldPassword: string,
  newPassword: string,
  adminEmail = 'admin@misiku.id'
): Promise<{ success: boolean; message: string }> {
  const current = await getAdminAuthData();

  if (oldPassword !== current.password) {
    return { success: false, message: 'Password saat ini (lama) tidak sesuai.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, message: 'Password baru minimal harus 6 karakter.' };
  }

  if (newPassword === current.password) {
    return { success: false, message: 'Password baru tidak boleh sama dengan password lama.' };
  }

  const updated: AdminAuthData = {
    email: current.email,
    password: newPassword.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const aRef = doc(db, 'settings', 'admin_auth');
    await setDoc(aRef, updated);
  } catch (err) {
    console.warn('Firestore updateAdminPassword notice:', err);
  }

  setLocalData(LOCAL_ADMIN_AUTH_KEY, updated);
  await addAuditLog(
    'UPDATE_ADMIN_PASSWORD',
    'SETTINGS',
    'admin_auth',
    'Password akun admin berhasil diubah',
    adminEmail
  );
  return { success: true, message: 'Password admin berhasil diubah!' };
}

// ----------------------------------------------------------------------
// STORAGE FILE UPLOAD
// ----------------------------------------------------------------------

export async function uploadProofFile(
  file: Blob | File,
  missionId: string,
  participationId: string,
  randomId: string
): Promise<string> {
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `mission-proofs/${missionId}/${participationId}/${randomId}.${ext}`;
  const fileRef = ref(storage, storagePath);

  try {
    const snap = await uploadBytes(fileRef, file, {
      contentType: file.type || 'image/webp',
    });
    const url = await getDownloadURL(snap.ref);
    return url;
  } catch (err) {
    console.warn('Firebase Storage direct upload notice (using secure data URL fallback):', err);
    // Graceful fallback to data URL or object URL for instant UI preview and demonstration
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// ----------------------------------------------------------------------
// HIGH LEVEL WORKFLOW HELPERS
// ----------------------------------------------------------------------

export async function getCategories(): Promise<MissionCategory[]> {
  return INITIAL_CATEGORIES;
}

export const getPlatformSettings = getSettings;

export async function savePlatformSettings(
  settings: PlatformSettings,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  await saveSettings(settings);
  await addAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'general', 'Pengaturan platform diperbarui', adminEmail);
}

export const getMyParticipations = getParticipationsByVisitor;

export const getAllPayments = getPayments;

export async function saveBanners(banners: Banner[], adminEmail = 'admin@misiku.id'): Promise<void> {
  setLocalData(LOCAL_BANNERS_KEY, banners);
  try {
    for (const b of banners) {
      await setDoc(doc(db, 'banners', b.id), b);
    }
  } catch (err) {
    console.warn('Firestore saveBanners notice:', err);
  }
  await addAuditLog('UPDATE_BANNERS', 'BANNER', 'homepage', 'Banner promosi diperbarui', adminEmail);
}

export async function startMissionParticipation(
  missionId: string,
  visitorId: string,
  participantName: string,
  participantPhone: string
): Promise<Participation> {
  const mission = await getMissionById(missionId);
  if (!mission) throw new Error('Misi tidak ditemukan');

  const now = new Date().toISOString();
  const publicToken = generatePublicToken();
  const submissionCode = generateSubmissionCode();
  const phoneMasked = maskPhoneNumber(participantPhone);

  const expiresAt = new Date(Date.now() + (mission.reservationMinutes || 30) * 60000).toISOString();

  const participation: Participation = {
    id: 'p_' + generateUUID().substring(0, 10),
    missionId: mission.id,
    missionTitle: mission.title,
    brandName: mission.brandName,
    rewardAmount: mission.rewardAmount,
    visitorId,
    participantName,
    participantPhone,
    participantPhoneMasked: phoneMasked,
    status: 'IN_PROGRESS',
    publicToken,
    submissionCode,
    startedAt: now,
    expiresAt,
    stepsSnapshot: mission.steps,
    answers: {},
  };

  await saveParticipation(participation);

  // Increment taken slots on mission
  mission.takenSlots = Math.min(mission.maxSlots, (mission.takenSlots || 0) + 1);
  await saveMission(mission);

  return participation;
}

export async function submitMissionProof(
  participationId: string,
  answers: Record<string, StepAnswer>
): Promise<Participation> {
  const cachedParticipations = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  let part = cachedParticipations.find((p) => p.id === participationId);
  if (!part) {
    const fromFs = await getParticipationByPublicToken(participationId);
    if (fromFs) part = fromFs;
  }
  if (!part) throw new Error('Partisipasi tidak ditemukan');

  const now = new Date().toISOString();
  part.answers = answers;
  part.status = 'UNDER_REVIEW';
  part.submittedAt = now;

  const mission = await getMissionById(part.missionId);

  const submission: Submission = {
    id: 's_' + generateUUID().substring(0, 10),
    participationId: part.id,
    missionId: part.missionId,
    missionTitle: part.missionTitle,
    brandName: part.brandName || mission?.brandName || 'Misi Brand',
    rewardAmount: part.rewardAmount,
    visitorId: part.visitorId,
    participantName: part.participantName,
    participantPhone: part.participantPhone,
    participantPhoneMasked: part.participantPhoneMasked,
    submissionCode: part.submissionCode || generateSubmissionCode(),
    publicToken: part.publicToken,
    status: 'UNDER_REVIEW',
    submittedAt: now,
    stepsSnapshot: part.stepsSnapshot || mission?.steps || [],
    answers,
  };

  await submitParticipationFinal(submission, part);
  return part;
}

export async function resubmitMissionProof(
  participationId: string,
  answers: Record<string, StepAnswer>,
  revisionStepId?: string
): Promise<Participation> {
  const cachedParticipations = getLocalData<Participation[]>(LOCAL_PARTICIPATIONS_KEY, []);
  const part = cachedParticipations.find((p) => p.id === participationId);
  if (!part) throw new Error('Partisipasi tidak ditemukan');

  const now = new Date().toISOString();
  part.answers = { ...part.answers, ...answers };
  part.status = 'UNDER_REVIEW';
  part.submittedAt = now;
  part.revisionStepId = undefined;
  part.revisionReason = undefined;

  await saveParticipation(part);

  // Also update existing submission
  const submissions = await getAllSubmissions();
  const sub = submissions.find(
    (s) => s.participationId === participationId || s.publicToken === part.publicToken
  );
  if (sub) {
    await updateSubmissionReview(sub.id, {
      status: 'UNDER_REVIEW',
      answers: part.answers,
      revisionStepId: undefined,
      revisionReason: undefined,
      submittedAt: now,
    });
  }

  return part;
}

export async function approveSubmission(
  submissionId: string,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  await updateSubmissionReview(submissionId, { status: 'APPROVED' }, adminEmail);
  await addAuditLog('APPROVE_SUBMISSION', 'SUBMISSION', submissionId, 'Submission disetujui', adminEmail);
}

export async function rejectSubmission(
  submissionId: string,
  reason: string,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  await updateSubmissionReview(
    submissionId,
    { status: 'REJECTED', revisionReason: reason },
    adminEmail
  );
  await addAuditLog('REJECT_SUBMISSION', 'SUBMISSION', submissionId, `Submission ditolak: ${reason}`, adminEmail);
}

export async function requestSubmissionRevision(
  submissionId: string,
  stepId: string,
  reason: string,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  await updateSubmissionReview(
    submissionId,
    {
      status: 'REVISION_REQUIRED',
      revisionStepId: stepId,
      revisionReason: reason,
    },
    adminEmail
  );
  await addAuditLog(
    'REQUEST_REVISION',
    'SUBMISSION',
    submissionId,
    `Revisi diminta untuk langkah ${stepId}: ${reason}`,
    adminEmail
  );
}

export async function updatePaymentRecord(
  paymentId: string,
  updates: Partial<PaymentRecord>,
  adminEmail = 'admin@misiku.id'
): Promise<void> {
  const payments = await getPayments();
  const p = payments.find((item) => item.id === paymentId);
  if (p) {
    const updated = { ...p, ...updates };
    await savePaymentRecord(updated);

    // If marked as PAID, also update submission and participation
    if (updates.status === 'PAID') {
      const sub = await getSubmissionById(p.submissionId);
      if (sub) {
        await updateSubmissionReview(sub.id, { status: 'PAID' }, adminEmail);
      }
    }

    await addAuditLog(
      'UPDATE_PAYMENT',
      'PAYMENT',
      paymentId,
      `Status pembayaran diubah ke ${updates.status || 'UPDATED'}`,
      adminEmail
    );
  }
}

