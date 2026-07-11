import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import FeedbackDetails from '../components/interviews/FeedbackDetails.jsx';
import FeedbackForm from '../components/interviews/FeedbackForm.jsx';
import InterviewsTable from '../components/interviews/InterviewsTable.jsx';
import InterviewScheduleForm from '../components/interviews/InterviewScheduleForm.jsx';
import Pagination from '../components/Pagination.jsx';
import { canSubmitFeedback, emptyFeedback, emptyInterview } from '../utils/interviewHelpers.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';

/**
 * Interviews management container page.
 * Manages states and actions for scheduling interviews, editing schedules, 
 * submitting evaluation feedback (Interviewers only), and viewing feedback details.
 */
export default function Interviews({ token, user }) {
  // Main interview logs list and pagination state
  const [interviews, setInterviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);

  // Lists of options needed for scheduling forms
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);

  // Form states for scheduling & feedback
  const [form, setForm] = useState(emptyInterview);
  const [feedback, setFeedback] = useState(emptyFeedback);
  const [activeId, setActiveId] = useState(''); // ID of the interview currently being graded

  // Modal display states for existing feedback details
  const [viewFeedback, setViewFeedback] = useState(null);
  const [viewFeedbackTitle, setViewFeedbackTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(''); // ID of the interview schedule being updated

  // Alerts feedback messaging states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  // Prevent selecting dates in the past when scheduling interviews
  const minInterviewDate = new Date().toISOString().slice(0, 10);

  /**
   * Fetches interviews list with pagination.
   */
  function load(nextPage = page) {
    setLoading(true);
    apiService.getInterviews(token, nextPage, pagination.limit).then(response => {
      setInterviews(response.data);
      setPage(response.page);
      setPagination(paginationFrom(response));
    }).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  // Load interviews log list on mount or auth token updates
  useEffect(load, [token]);

  // Load selection details (candidates & active interviewers list) for Admin and HR users only
  useEffect(() => {
    if (user?.role === 'Interviewer') return;

    apiService.getCandidates(token, 1, 100).then(response => setCandidates(response.data)).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
    apiService.getActiveInterviewers(token, 1, 100).then(response => setInterviewers(response.data)).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }, [token, user?.role]);

  /**
   * Event handler for scheduling form text and option changes.
   */
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Event handler that autofills job title and job ID when a candidate is chosen.
   */
  function candidateChange(e) {
    const candidate = candidates.find(item => item.id === e.target.value);
    setForm({
      ...form,
      candidate_id: candidate?.id || '',
      job_id: candidate?.applied_job_id || '',
      job_title: candidate?.job_title || ''
    });
  }

  /**
   * Resets and hides the scheduling form.
   */
  function closeForm() {
    setEditingId('');
    setForm(emptyInterview);
    setShowForm(false);
  }

  /**
   * Event handler for feedback form rating values and textual feedback.
   */
  function feedbackChange(e) {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFeedback({ ...feedback, [e.target.name]: value });
  }

  /**
   * Submits scheduled or updated interview details to backend.
   */
  async function schedule(e) {
    e.preventDefault();
    const isEditing = Boolean(editingId);
    // Limit request body keys when modifying an existing schedule
    const updateData = {
      interview_date: form.interview_date,
      interview_time: form.interview_time,
      focus_areas: form.focus_areas
    };

    try {
      if (isEditing) await apiService.updateInterview(token, editingId, updateData);
      else await apiService.scheduleInterview(token, form);
      closeForm();
      setMessageType('success');
      setMessage(isEditing ? 'Interview updated' : 'Interview scheduled');
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  /**
   * Submits candidate feedback to the backend (Interviewer authorization required).
   */
  async function submitFeedback(e) {
    e.preventDefault();
    if (user?.role !== 'Interviewer') {
      setActiveId('');
      setMessageType('error');
      setMessage('Only interviewers can add feedback');
      return;
    }

    try {
      await apiService.submitFeedback(token, activeId, feedback);
      setFeedback(emptyFeedback);
      setActiveId('');
      setMessageType('success');
      setMessage('Feedback submitted');
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  /**
   * Opens the feedback details view model for a scheduled interview.
   */
  function openFeedback(item) {
    setActiveId('');
    setViewFeedback(item.feedback);
    setViewFeedbackTitle(`${item.candidate_name} - ${item.job_title}`);
  }

  /**
   * Closes the feedback details view model.
   */
  function closeFeedback() {
    setViewFeedback(null);
    setViewFeedbackTitle('');
  }

  /**
   * Initializes evaluation mode by opening the feedback submission form
   * once the scheduled time has arrived.
   */
  function startFeedback(item) {
    if (!canSubmitFeedback(item)) {
      setMessageType('error');
      setMessage('Feedback can only be submitted after the scheduled interview time');
      return;
    }

    closeFeedback();
    setActiveId(item.id);
  }

  /**
   * Populates form and enables update mode for a scheduled interview.
   */
  function editInterview(item) {
    closeFeedback();
    closeFeedbackForm();
    setForm({
      candidate_id: item.candidate_id,
      job_id: item.job_id,
      job_title: item.job_title,
      interview_date: item.interview_date,
      interview_time: item.interview_time,
      interviewer_email: item.interviewer_email,
      focus_areas: item.focus_areas
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  /**
   * Hides the evaluation form and resets grading criteria state.
   */
  function closeFeedbackForm() {
    setActiveId('');
    setFeedback(emptyFeedback);
  }

  /**
   * Retrieves resume blob and triggers a browser window download.
   */
  async function openResume(candidateId) {
    try {
      window.open(await apiService.downloadResume(token, candidateId), '_blank');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  return (
    <section>
      {/* Page Header */}
      <div className="page-head">
        <h1>Interviews</h1>
        {user?.role === 'HR' && (
          <button className={`add-btn ${showForm ? 'close-mode' : ''}`} onClick={() => showForm ? closeForm() : setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Schedule Interview</>}
          </button>
        )}
      </div>

      {/* Dynamic system notifications */}
      {!showForm && !activeId && (
        <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      )}
      {loading && <p>Loading...</p>}

      {/* Scheduling form (visible to HR when scheduling or rescheduling) */}
      {user?.role !== 'Interviewer' && showForm && (
        <InterviewScheduleForm 
          form={form} 
          candidates={candidates} 
          interviewers={interviewers} 
          minInterviewDate={minInterviewDate} 
          isEditing={Boolean(editingId)} 
          onCandidateChange={candidateChange} 
          onChange={change} 
          onSubmit={schedule} 
          message={message} 
          messageType={messageType} 
          onClose={() => setMessage('')} 
        />
      )}

      {/* Scheduled interviews listings table */}
      <InterviewsTable interviews={interviews} user={user} onViewFeedback={openFeedback} onStartFeedback={startFeedback} onOpenResume={openResume} onEdit={editInterview} />

      {/* Pagination control footer */}
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />

      {/* Detailed Modal/Panel displaying submitted candidate feedback */}
      <FeedbackDetails feedback={viewFeedback} title={viewFeedbackTitle} onClose={closeFeedback} />

      {/* Feedback entry form modal/panel */}
      <FeedbackForm 
        activeId={activeId} 
        user={user} 
        feedback={feedback} 
        onChange={feedbackChange} 
        onSubmit={submitFeedback} 
        onClose={closeFeedbackForm} 
        message={message} 
        messageType={messageType} 
        onCloseMessage={() => setMessage('')} 
      />
    </section>
  );
}
