import { isRecruiterRole, getStatusBadgeClass } from '../utils/helpers';
import useCandidates from '../hooks/useCandidates';
import {
  CreateCandidateModal,
  EditCandidateModal,
  CandidateDetailModal,
  StatusHistoryModal,
  ResumePreviewModal,
} from '../components/CandidateModals';
import { Plus, User, Mail, Phone, History } from 'lucide-react';

export default function CandidatesView({ token, user }) {
  // All state and handlers come from the custom hook
  const cv = useCandidates(token);

  const isRecruiter = isRecruiterRole(user.role);

  return (
    <div>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Candidate Profiles</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track applicants, status changes, history transitions, and resumes.
          </p>
        </div>
        {isRecruiter && (
          <button className="btn btn-primary" onClick={cv.openCreateModal}>
            <Plus size={18} />
            <span>Add Candidate</span>
          </button>
        )}
      </div>

      {cv.error && <div className="alert alert-danger">{cv.error}</div>}

      {/* ── Candidate Table ──────────────────────────────────────────── */}
      {cv.loading && cv.candidates.length === 0 ? (
        <div className="empty-state">Loading candidate listings...</div>
      ) : cv.candidates.length === 0 ? (
        <div className="empty-state card">
          <User size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <p>No candidates found. Click "Add Candidate" to register one.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Contact Info</th>
                  <th>Applied Position</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cv.candidates.map((cand) => (
                  <tr key={cand.id}>

                    {/* Name + company */}
                    <td>
                      <div style={{ fontWeight: '600' }}>
                        {cand.first_name} {cand.last_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {cand.current_company}
                      </div>
                    </td>

                    {/* Email + mobile */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                        <div className="flex-gap-2">
                          <Mail size={12} style={{ color: 'var(--text-secondary)' }} />
                          {cand.email}
                        </div>
                        <div className="flex-gap-2">
                          <Phone size={12} style={{ color: 'var(--text-secondary)' }} />
                          {cand.mobile}
                        </div>
                      </div>
                    </td>

                    {/* Job title */}
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {cand.job_title || 'Unknown Position'}
                      </span>
                    </td>

                    <td>{cand.total_experience}</td>

                    {/* Status badge */}
                    <td>
                      <span className={`badge ${getStatusBadgeClass(cand.status)}`}>
                        {cand.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Row action buttons */}
                    <td>
                      <div className="flex-gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            cv.setSelectedCandidate(cand);
                            cv.setStatusError(null);
                            cv.setIsDetailOpen(true);
                          }}
                        >
                          View Details
                        </button>

                        {isRecruiter && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => cv.openEditModal(cand)}
                          >
                            Edit
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          title="Status History"
                          onClick={() => cv.openHistoryModal(cand)}
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex-between" style={{ marginTop: '20px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={cv.page === 1}
              onClick={() => cv.setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Page {cv.page}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!cv.hasMore}
              onClick={() => cv.setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}

      <CreateCandidateModal
        isOpen={cv.isCreateOpen}
        onClose={() => cv.setIsCreateOpen(false)}
        form={cv.createForm}
        onChange={(field, value) => cv.setCreateForm((f) => ({ ...f, [field]: value }))}
        jobs={cv.jobs}
        resumeFile={cv.resumeFile}
        onResumeChange={cv.setResumeFile}
        error={cv.createError}
        loading={cv.createLoading}
        onSubmit={cv.handleCreateCandidate}
      />

      <EditCandidateModal
        isOpen={cv.isEditOpen}
        onClose={() => cv.setIsEditOpen(false)}
        form={cv.editForm}
        onChange={(field, value) => cv.setEditForm((f) => ({ ...f, [field]: value }))}
        jobs={cv.jobs}
        error={cv.editError}
        loading={cv.editLoading}
        onSubmit={cv.handleEditCandidate}
      />

      <CandidateDetailModal
        isOpen={cv.isDetailOpen}
        onClose={() => cv.setIsDetailOpen(false)}
        candidate={cv.selectedCandidate}
        isRecruiter={isRecruiter}
        statusError={cv.statusError}
        statusUpdateLoading={cv.statusUpdateLoading}
        onStatusChange={cv.handleUpdateStatus}
        onPreviewResume={cv.openPreviewModal}
        onDownloadResume={cv.handleDownloadResume}
        previewLoading={cv.previewLoading}
      />

      <StatusHistoryModal
        isOpen={cv.isHistoryOpen}
        onClose={() => cv.setIsHistoryOpen(false)}
        candidate={cv.selectedCandidate}
        historyList={cv.historyList}
        historyLoading={cv.historyLoading}
      />

      <ResumePreviewModal
        isOpen={cv.isPreviewOpen}
        onClose={cv.closePreviewModal}
        previewUrl={cv.previewUrl}
      />

    </div>
  );
}