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

export default function Interviews({ token, user }) {
  const [interviews, setInterviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [form, setForm] = useState(emptyInterview);
  const [feedback, setFeedback] = useState(emptyFeedback);
  const [activeId, setActiveId] = useState('');
  const [viewFeedback, setViewFeedback] = useState(null);
  const [viewFeedbackTitle, setViewFeedbackTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const minInterviewDate = new Date().toISOString().slice(0, 10);

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

  useEffect(load, [token]);

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

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function candidateChange(e) {
    const candidate = candidates.find(item => item.id === e.target.value);
    setForm({
      ...form,
      candidate_id: candidate?.id || '',
      job_id: candidate?.applied_job_id || '',
      job_title: candidate?.job_title || ''
    });
  }

  function closeForm() {
    setEditingId('');
    setForm(emptyInterview);
    setShowForm(false);
  }

  function feedbackChange(e) {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFeedback({ ...feedback, [e.target.name]: value });
  }

  async function schedule(e) {
    e.preventDefault();
    const isEditing = Boolean(editingId);
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

  function openFeedback(item) {
    setActiveId('');
    setViewFeedback(item.feedback);
    setViewFeedbackTitle(`${item.candidate_name} - ${item.job_title}`);
  }

  function closeFeedback() {
    setViewFeedback(null);
    setViewFeedbackTitle('');
  }

  function startFeedback(item) {
    if (!canSubmitFeedback(item)) {
      setMessageType('error');
      setMessage('Feedback can only be submitted after the scheduled interview time');
      return;
    }

    closeFeedback();
    setActiveId(item.id);
  }

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

  function closeFeedbackForm() {
    setActiveId('');
    setFeedback(emptyFeedback);
  }

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
      <div className="page-head">
        <h1>Interviews</h1>
        {user?.role === 'HR' && (
          <button className="add-btn" onClick={() => showForm ? closeForm() : setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Schedule Interview</>}
          </button>
        )}
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      {user?.role !== 'Interviewer' && showForm && (
        <InterviewScheduleForm form={form} candidates={candidates} interviewers={interviewers} minInterviewDate={minInterviewDate} isEditing={Boolean(editingId)} onCandidateChange={candidateChange} onChange={change} onSubmit={schedule} />
      )}
      <InterviewsTable interviews={interviews} user={user} onViewFeedback={openFeedback} onStartFeedback={startFeedback} onOpenResume={openResume} onEdit={editInterview} />
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
      <FeedbackDetails feedback={viewFeedback} title={viewFeedbackTitle} onClose={closeFeedback} />
      <FeedbackForm activeId={activeId} user={user} feedback={feedback} onChange={feedbackChange} onSubmit={submitFeedback} onClose={closeFeedbackForm} />
    </section>
  );
}
