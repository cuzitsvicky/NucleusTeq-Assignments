import Modal from './Modal';
import { getStatusBadgeClass, formatTimestamp } from '../utils/helpers';
import { Download, FileText } from 'lucide-react';

//  1. Create Candidate Modal 

export function CreateCandidateModal({
  isOpen, onClose,
  form, onChange, jobs,
  resumeFile, onResumeChange,
  error, loading,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Candidate Profile">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <CandidateFormFields form={form} onChange={onChange} jobs={jobs} disabled={loading} />

        <div className="form-group">
          <label htmlFor="resume-file">Resume Upload (PDF Only, Max 5MB)</label>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,application/pdf"
            className="form-control"
            onChange={(e) => onResumeChange(e.target.files[0])}
            required
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || jobs.length === 0}>
            {loading ? 'Registering...' : 'Register Candidate'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

//  2. Edit Candidate Modal 

export function EditCandidateModal({
  isOpen, onClose,
  form, onChange, jobs,
  error, loading,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Candidate Profile">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <CandidateFormFields form={form} onChange={onChange} jobs={jobs} disabled={loading} />

        <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || jobs.length === 0}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

//  3. Candidate Detail Modal 

export function CandidateDetailModal({
  isOpen, onClose,
  candidate,
  isRecruiter,
  statusError, statusUpdateLoading,
  onStatusChange,
  onPreviewResume,
  onDownloadResume,
  previewLoading,
}) {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate Profile Details">
      {statusError && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{statusError}</div>
      )}

      {/* Profile fields grid */}
      <div className="detail-grid">
        <DetailItem label="Full Name"        value={`${candidate.first_name} ${candidate.last_name}`} />
        <div className="detail-item">
          <label>Current Status</label>
          <div style={{ marginTop: '4px' }}>
            <span className={`badge ${getStatusBadgeClass(candidate.status)}`}>
              {candidate.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <DetailItem label="Email Address"    value={candidate.email} />
        <DetailItem label="Mobile Number"    value={candidate.mobile} />
        <DetailItem label="Current Company"  value={candidate.current_company} />
        <DetailItem label="Total Experience" value={candidate.total_experience} />
        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
          <label>Applying For Job</label>
          <p style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.95rem', marginTop: '4px' }}>
            {candidate.job_title || 'Unknown Position'}
          </p>
        </div>
      </div>

      {/* Resume row */}
      <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
          Resume Attachment
        </h4>
        {candidate.resume_id ? (
          <div className="flex-between" style={{ padding: '8px 12px', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
            <div className="flex-gap-2">
              <FileText size={16} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                {candidate.resume_filename || 'candidate_resume.pdf'}
              </span>
            </div>
            <div className="flex-gap-2">
              <button
                className="btn btn-secondary btn-sm flex-gap-2"
                onClick={() => onPreviewResume(candidate.id)}
                disabled={previewLoading}
              >
                <FileText size={14} />
                <span>{previewLoading ? 'Loading...' : 'Preview Resume'}</span>
              </button>
              <button
                className="btn btn-secondary btn-sm flex-gap-2"
                onClick={() => onDownloadResume(candidate.id, candidate.resume_filename)}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'red' }}>No resume uploaded.</p>
        )}
      </div>

      {/* Status dropdown — HR / Admin only */}
      {isRecruiter && (
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '6px' }}>
          <label
            htmlFor="status-select"
            style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}
          >
            Update Selection Status
          </label>
          <select
            id="status-select"
            className="form-control"
            value={candidate.status}
            onChange={(e) => onStatusChange(candidate.id, e.target.value)}
            disabled={statusUpdateLoading}
          >
            <option value="PROFILE_CREATED">Profile Created</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      )}

      <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
        <button className="btn btn-primary" onClick={onClose}>Close Details</button>
      </div>
    </Modal>
  );
}

//  4. Status History Modal 

export function StatusHistoryModal({
  isOpen, onClose,
  candidate,
  historyList, historyLoading,
}) {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate Status History Log">
      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '4px' }}>
        Timeline for {candidate.first_name} {candidate.last_name}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
        Shows historical state transitions, timestamps, and authorised handlers.
      </p>

      {historyLoading ? (
        <div className="empty-state">Loading status timeline...</div>
      ) : historyList.length === 0 ? (
        <div className="empty-state">No status logs recorded.</div>
      ) : (
        <ul className="history-timeline">
          {historyList.map((log) => (
            <li key={log.id} className="history-item">
              <div className="history-status">
                <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                  {log.status.replace('_', ' ')}
                </span>
              </div>
              <div className="history-meta" style={{ marginTop: '4px' }}>
                Changed by: <strong>{log.updated_by}</strong> on {formatTimestamp(log.timestamp)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

//  5. Resume Preview Modal 

export function ResumePreviewModal({ isOpen, onClose, previewUrl }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resume Preview" size="large">
      {previewUrl ? (
        <div style={{ width: '100%', height: '70vh' }}>
          {/*
            The PDF blob URL is rendered inside an iframe.
            The browser's built-in PDF viewer handles the display.
          */}
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: '4px' }}
            title="Resume PDF Preview"
          />
        </div>
      ) : (
        <div className="empty-state">Loading resume content...</div>
      )}

      <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none', marginTop: '12px' }}>
        <button className="btn btn-primary" onClick={onClose}>Close Preview</button>
      </div>
    </Modal>
  );
}

//  Shared form and display sub-components 

export function CandidateFormFields({ form, onChange, jobs, disabled }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first-name">First Name</label>
          <input id="first-name" type="text" className="form-control"
            value={form.firstName} placeholder="e.g. John"
            onChange={(e) => onChange('firstName', e.target.value)}
            required disabled={disabled} />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last Name</label>
          <input id="last-name" type="text" className="form-control"
            value={form.lastName} placeholder="e.g. Doe"
            onChange={(e) => onChange('lastName', e.target.value)}
            required disabled={disabled} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cand-email">Email Address</label>
          <input id="cand-email" type="email" className="form-control"
            value={form.email} placeholder="e.g. johndoe@gmail.com"
            onChange={(e) => onChange('email', e.target.value)}
            required disabled={disabled} />
        </div>
        <div className="form-group">
          <label htmlFor="cand-mobile">Mobile Number</label>
          <input id="cand-mobile" type="text" className="form-control"
            value={form.mobile} placeholder="e.g. 1234567890"
            onChange={(e) => onChange('mobile', e.target.value)}
            required disabled={disabled} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Current Company</label>
          <input id="company" type="text" className="form-control"
            value={form.currentCompany} placeholder="e.g. Acme Corp"
            onChange={(e) => onChange('currentCompany', e.target.value)}
            required disabled={disabled} />
        </div>
        <div className="form-group">
          <label htmlFor="experience">Total Experience</label>
          <input id="experience" type="text" className="form-control"
            value={form.totalExperience} placeholder="e.g. 3 years"
            onChange={(e) => onChange('totalExperience', e.target.value)}
            required disabled={disabled} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="applied-job">Applying For Position</label>
        {jobs.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'red' }}>
            No jobs posted yet. Please create a job first.
          </p>
        ) : (
          <select id="applied-job" className="form-control"
            value={form.appliedJobId}
            onChange={(e) => onChange('appliedJobId', e.target.value)}
            required disabled={disabled}>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
            ))}
          </select>
        )}
      </div>
    </>
  );
}

/** Simple read-only label + value pair used in the detail modal grid */
function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <label>{label}</label>
      <p style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>
        {value}
      </p>
    </div>
  );
}