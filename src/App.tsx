import React, { useState, useEffect } from 'react';
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
} from './types';
import {
  getMissions,
  getCategories,
  getBanners,
  getPlatformSettings,
  savePlatformSettings,
  getMyParticipations,
  startMissionParticipation,
  submitMissionProof,
  resubmitMissionProof,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
  requestSubmissionRevision,
  getAllPayments,
  updatePaymentRecord,
  getAuditLogs,
  saveMission,
  deleteMission,
  saveBanners,
} from './lib/firebase';
import { getVisitorSession, saveVisitorIdentity } from './utils/visitor';
import { TopHeader } from './components/Navigation/TopHeader';
import { BottomNav, UserNavTab } from './components/Navigation/BottomNav';
import { StartMissionModal } from './components/Mission/StartMissionModal';
import { SubmitConfirmModal } from './components/Mission/SubmitConfirmModal';
import { MissionPlayer } from './components/Mission/MissionPlayer';
import { HomePage } from './pages/User/HomePage';
import { MissionsPage } from './pages/User/MissionsPage';
import { MissionDetailPage } from './pages/User/MissionDetailPage';
import { StatusPage } from './pages/User/StatusPage';
import { ActivityPage } from './pages/User/ActivityPage';
import { HelpPage } from './pages/User/HelpPage';

// Admin Components
import { AdminHeader } from './components/Admin/AdminHeader';
import { AdminSidebar, AdminTab } from './components/Admin/AdminSidebar';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/Admin/AdminOverviewPage';
import { AdminMissionsPage } from './pages/Admin/AdminMissionsPage';
import { AdminMissionEditPage } from './pages/Admin/AdminMissionEditPage';
import { AdminSubmissionsPage } from './pages/Admin/AdminSubmissionsPage';
import { AdminPaymentsPage } from './pages/Admin/AdminPaymentsPage';
import { AdminBannersPage } from './pages/Admin/AdminBannersPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';
import { AdminAuditPage } from './pages/Admin/AdminAuditPage';
import { SubmissionReviewModal } from './components/Admin/SubmissionReviewModal';
import { PaymentModal } from './components/Admin/PaymentModal';

export default function App() {
  // Global Data State
  const [missions, setMissions] = useState<Mission[]>([]);
  const [categories, setCategories] = useState<MissionCategory[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'MisiKu',
    whatsappNotificationNumber: '6281234567890',
    whatsappSupportNumber: '6281234567890',
    maintenanceMode: false,
  });
  const [myParticipations, setMyParticipations] = useState<Participation[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // User Navigation State
  const [currentNavTab, setCurrentNavTab] = useState<UserNavTab>('home');
  const [userView, setUserView] = useState<
    'home' | 'missions' | 'mission_detail' | 'mission_player' | 'status' | 'activity' | 'help'
  >('home');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeParticipation, setActiveParticipation] = useState<Participation | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals State for User
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, StepAnswer>>({});
  const [revisionStepId, setRevisionStepId] = useState<string | null>(null);

  // Admin Navigation State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@misiku.id');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [managingPayment, setManagingPayment] = useState<PaymentRecord | null>(null);

  // Load initial data
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash.includes('admin') || window.location.pathname.startsWith('/admin')) {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    const savedAdmin = sessionStorage.getItem('misiku_admin_auth');
    if (savedAdmin) {
      setIsAdminLoggedIn(true);
      setAdminEmail(savedAdmin);
    }

    refreshAllData();

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  const refreshAllData = async () => {
    try {
      const [mList, cList, bList, setts] = await Promise.all([
        getMissions(),
        getCategories(),
        getBanners(),
        getPlatformSettings(),
      ]);
      setMissions(mList);
      setCategories(cList);
      setBanners(bList);
      setSettings(setts);

      // Visitor participations
      const session = getVisitorSession();
      const parts = await getMyParticipations(session.visitorId);
      setMyParticipations(parts);

      // Admin data
      const [subs, pays, logs] = await Promise.all([
        getAllSubmissions(),
        getAllPayments(),
        getAuditLogs(),
      ]);
      setSubmissions(subs);
      setPayments(pays);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Switch User Tabs
  const handleSelectNavTab = (tab: UserNavTab) => {
    setCurrentNavTab(tab);
    if (tab === 'home') setUserView('home');
    else if (tab === 'missions') setUserView('missions');
    else if (tab === 'activity') setUserView('activity');
    else if (tab === 'help') setUserView('help');
  };

  // User Mission Selection
  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
    setUserView('mission_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger Start Mission Flow
  const handleStartMissionClick = (mission: Mission) => {
    setSelectedMission(mission);
    setIsStartModalOpen(true);
  };

  // Confirm Start in Modal
  const handleConfirmStartMission = async (name: string, phone: string) => {
    if (!selectedMission) return;
    const session = getVisitorSession();
    saveVisitorIdentity(name, phone);

    const participation = await startMissionParticipation(
      selectedMission.id,
      session.visitorId,
      name,
      phone
    );

    setActiveParticipation(participation);
    setIsStartModalOpen(false);
    setUserView('mission_player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshAllData();
  };

  // Complete Steps in MissionPlayer
  const handleCompleteSteps = (answers: Record<string, StepAnswer>) => {
    setPendingAnswers(answers);
    setIsSubmitModalOpen(true);
  };

  // Final Submit Proofs
  const handleConfirmSubmitProof = async () => {
    if (!activeParticipation) return;

    if (revisionStepId) {
      // It was a revision submission!
      const updated = await resubmitMissionProof(
        activeParticipation.id,
        pendingAnswers,
        revisionStepId
      );
      setActiveParticipation(updated);
      setRevisionStepId(null);
    } else {
      // First submission
      const updated = await submitMissionProof(
        activeParticipation.id,
        pendingAnswers
      );
      setActiveParticipation(updated);
    }

    setIsSubmitModalOpen(false);
    setUserView('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshAllData();
  };

  // User opens status from activity
  const handleSelectParticipation = (part: Participation) => {
    setActiveParticipation(part);
    setUserView('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User starts revision from status page
  const handleStartRevision = (participation: Participation, stepId: string) => {
    const mission = missions.find((m) => m.id === participation.missionId);
    if (mission) {
      setSelectedMission(mission);
      setActiveParticipation(participation);
      setRevisionStepId(stepId);
      setUserView('mission_player');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Actions
  const handleAdminApprove = async (submissionId: string) => {
    await approveSubmission(submissionId, adminEmail);
    refreshAllData();
  };

  const handleAdminReject = async (submissionId: string, reason: string) => {
    await rejectSubmission(submissionId, reason, adminEmail);
    refreshAllData();
  };

  const handleAdminRevision = async (
    submissionId: string,
    stepId: string,
    reason: string
  ) => {
    await requestSubmissionRevision(submissionId, stepId, reason, adminEmail);
    refreshAllData();
  };

  const handleSavePayment = async (
    paymentId: string,
    updates: Partial<PaymentRecord>
  ) => {
    await updatePaymentRecord(paymentId, updates, adminEmail);
    refreshAllData();
  };

  const handleQuickMarkPaid = async (paymentId: string) => {
    await updatePaymentRecord(paymentId, { status: 'PAID' }, adminEmail);
    refreshAllData();
  };

  const handleSaveMission = async (mission: Mission) => {
    await saveMission(mission, adminEmail);
    setIsCreatingMission(false);
    setEditingMission(null);
    refreshAllData();
  };

  const handleDeleteMission = async (missionId: string) => {
    if (confirm('Apakah kamu yakin ingin menghapus misi ini?')) {
      await deleteMission(missionId, adminEmail);
      refreshAllData();
    }
  };

  const handleToggleMissionStatus = async (mission: Mission) => {
    const newStatus = mission.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    await saveMission({ ...mission, status: newStatus }, adminEmail);
    refreshAllData();
  };

  const handleDuplicateMission = async (mission: Mission) => {
    const copy: Mission = {
      ...mission,
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      title: `${mission.title} (Salinan)`,
      slug: `${mission.slug}-salinan`,
      status: 'PAUSED',
      takenSlots: 0,
      completedSlots: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveMission(copy, adminEmail);
    refreshAllData();
  };

  // Switch to Admin
  const handleEnterAdmin = () => {
    setIsAdminMode(true);
    window.location.hash = 'admin';
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    window.location.hash = '';
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('misiku_admin_auth');
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    window.location.hash = '';
  };

  // Pending counts for sidebar badges
  const pendingReviewCount = submissions.filter(
    (s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED'
  ).length;
  const unpaidCount = payments.filter((p) => p.status === 'UNPAID').length;

  // -------------------------------------------------------------
  // RENDER: ADMIN VIEW
  // -------------------------------------------------------------
  if (isAdminMode) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onLoginSuccess={(email) => {
            setIsAdminLoggedIn(true);
            setAdminEmail(email);
          }}
          onBackToApp={handleExitAdmin}
        />
      );
    }

    return (
      <div id="misiku-admin-app" className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
        <AdminHeader
          adminEmail={adminEmail}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleAdminLogout}
        />

        <div className="flex-1 flex">
          <AdminSidebar
            currentTab={adminTab}
            onSelectTab={(tab) => {
              setAdminTab(tab);
              setIsCreatingMission(false);
              setEditingMission(null);
            }}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            pendingReviewsCount={pendingReviewCount}
            unpaidPaymentsCount={unpaidCount}
          />

          <main className="flex-1 overflow-y-auto min-w-0">
            {/* Mission Editor View */}
            {isCreatingMission || editingMission ? (
              <AdminMissionEditPage
                initialMission={editingMission}
                categories={categories}
                onSave={handleSaveMission}
                onCancel={() => {
                  setIsCreatingMission(false);
                  setEditingMission(null);
                }}
              />
            ) : adminTab === 'overview' ? (
              <AdminOverviewPage
                missions={missions}
                submissions={submissions}
                payments={payments}
                auditLogs={auditLogs}
                onOpenSubmissions={() => setAdminTab('submissions')}
                onOpenMissions={() => setAdminTab('missions')}
                onOpenPayments={() => setAdminTab('payments')}
                onCreateMission={() => setIsCreatingMission(true)}
                onReviewSubmission={(sub) => setReviewingSubmission(sub)}
              />
            ) : adminTab === 'missions' ? (
              <AdminMissionsPage
                missions={missions}
                onCreateMission={() => setIsCreatingMission(true)}
                onEditMission={(m) => setEditingMission(m)}
                onToggleStatus={handleToggleMissionStatus}
                onDuplicateMission={handleDuplicateMission}
                onDeleteMission={handleDeleteMission}
              />
            ) : adminTab === 'submissions' ? (
              <AdminSubmissionsPage
                submissions={submissions}
                onReviewSubmission={(sub) => setReviewingSubmission(sub)}
              />
            ) : adminTab === 'payments' ? (
              <AdminPaymentsPage
                payments={payments}
                onOpenPaymentModal={(p) => setManagingPayment(p)}
                onQuickMarkPaid={handleQuickMarkPaid}
              />
            ) : adminTab === 'banners' ? (
              <AdminBannersPage
                banners={banners}
                onSaveBanners={async (updated) => {
                  await saveBanners(updated, adminEmail);
                  setBanners(updated);
                }}
              />
            ) : adminTab === 'settings' ? (
              <AdminSettingsPage
                settings={settings}
                onSaveSettings={async (updated) => {
                  await savePlatformSettings(updated, adminEmail);
                  setSettings(updated);
                }}
              />
            ) : (
              <AdminAuditPage auditLogs={auditLogs} />
            )}
          </main>
        </div>

        {/* Admin Submission Review Modal */}
        {reviewingSubmission && (
          <SubmissionReviewModal
            submission={reviewingSubmission}
            isOpen={true}
            onClose={() => setReviewingSubmission(null)}
            onApprove={handleAdminApprove}
            onReject={handleAdminReject}
            onRequestRevision={handleAdminRevision}
          />
        )}

        {/* Admin Payment Modal */}
        {managingPayment && (
          <PaymentModal
            payment={managingPayment}
            isOpen={true}
            onClose={() => setManagingPayment(null)}
            onSave={handleSavePayment}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: USER / VISITOR VIEW (Mobile-First Shell)
  // -------------------------------------------------------------
  return (
    <div id="misiku-user-app" className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
      <TopHeader
        platformName={settings.platformName}
        onHelpClick={() => {
          setCurrentNavTab('help');
          setUserView('help');
        }}
      />

      {/* Main Content Area (Max width 640px for mobile-first comfort) */}
      <main className="flex-1 w-full max-w-xl mx-auto">
        {userView === 'home' && (
          <HomePage
            missions={missions}
            categories={categories}
            banners={banners}
            onSelectMission={handleSelectMission}
            onExploreMore={() => {
              setCurrentNavTab('missions');
              setUserView('missions');
            }}
            onFilterCategory={(catId) => {
              setSelectedCategoryFilter(catId);
              setCurrentNavTab('missions');
              setUserView('missions');
            }}
          />
        )}

        {userView === 'missions' && (
          <MissionsPage
            missions={missions}
            categories={categories}
            initialCategory={selectedCategoryFilter}
            onSelectMission={handleSelectMission}
          />
        )}

        {userView === 'mission_detail' && selectedMission && (
          <MissionDetailPage
            mission={selectedMission}
            onBack={() => setUserView('home')}
            onStartMission={handleStartMissionClick}
          />
        )}

        {userView === 'mission_player' && selectedMission && activeParticipation && (
          <MissionPlayer
            mission={selectedMission}
            participation={activeParticipation}
            onClose={() => setUserView('mission_detail')}
            onComplete={handleCompleteSteps}
            activeRevisionStepId={revisionStepId || undefined}
          />
        )}

        {userView === 'status' && activeParticipation && (
          <StatusPage
            participation={activeParticipation}
            onBackToHome={() => {
              setUserView('home');
              setCurrentNavTab('home');
            }}
            onStartRevision={handleStartRevision}
          />
        )}

        {userView === 'activity' && (
          <ActivityPage
            participations={myParticipations}
            onSelectParticipation={handleSelectParticipation}
            onExploreMissions={() => {
              setCurrentNavTab('missions');
              setUserView('missions');
            }}
          />
        )}

        {userView === 'help' && (
          <HelpPage
            whatsappSupport={settings.whatsappSupportNumber}
          />
        )}
      </main>

      {/* Bottom Nav Bar (Hidden when user is inside step runner or viewing mission detail) */}
      {userView !== 'mission_player' && userView !== 'mission_detail' && (
        <BottomNav
          activeTab={currentNavTab}
          onSelectTab={handleSelectNavTab}
          activityCount={myParticipations.length}
        />
      )}

      {/* Start Mission Modal (Visitor name + phone) */}
      {selectedMission && (
        <StartMissionModal
          mission={selectedMission}
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          onConfirmStart={handleConfirmStartMission}
        />
      )}

      {/* Submit Confirmation Modal */}
      {selectedMission && activeParticipation && (
        <SubmitConfirmModal
          mission={selectedMission}
          participation={activeParticipation}
          answers={pendingAnswers}
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onConfirmSubmit={handleConfirmSubmitProof}
        />
      )}
    </div>
  );
}
