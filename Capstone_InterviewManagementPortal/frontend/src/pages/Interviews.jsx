import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import { formatDateTime } from '../utils/dateFormat.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';
import { Plus } from 'lucide-react';


const emptyInterview = {
  candidate_id: '',
  job_id: '',
  job_title: '',
  interview_date: '',
  interview_time: '',
  interviewer_email: '',
  focus_areas: ''
};

const emptyFeedback = {
  technical_rating: 1,
  communication_rating: 1,
  problem_solving_rating: 1,
  tech_areas_covered: '',
  comments: '',
  recommendation: 'NEXT_ROUND'
};

function getScheduledAt(item) {
  const scheduledAt = new Date(`${item.interview_date}T${item.interview_time || '00:00'}`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

function canSubmitFeedback(item) {
  const scheduledAt = getScheduledAt(item);
  return !scheduledAt || new Date() >= scheduledAt;
}

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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

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

  function feedbackChange(e) {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFeedback({ ...feedback, [e.target.name]: value });
  }

  async function schedule(e) {
    e.preventDefault();
    try {
      await apiService.scheduleInterview(token, form);
      setForm(emptyInterview);
      setShowForm(false);
      setMessageType('success');
      setMessage('Interview scheduled');
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

  return (
    <section>
      <div className="page-head">
        <h1>Interviews</h1>
        {user?.role !== 'Interviewer' && (
          <button
            className="add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              'Close'
            ) : (
              <>
                <Plus size={18} />
                Add Interview
              </>
            )}
          </button>
        )}
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      {user?.role !== 'Interviewer' && showForm && (
        <form onSubmit={schedule} className="form">
          <select name="candidate_id" value={form.candidate_id} onChange={candidateChange}>
            <option value="">Select candidate email</option>
            {candidates.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.email}
              </option>
            ))}
          </select>
          <input name="job_title" placeholder="Job title" value={form.job_title} readOnly />
          <input name="interview_date" type="date" value={form.interview_date} onChange={change} />
          <input name="interview_time" type="time" value={form.interview_time} onChange={change} />
          <select name="interviewer_email" value={form.interviewer_email} onChange={change}>
            <option value="">Select interviewer email</option>
            {interviewers.map(interviewer => (
              <option key={interviewer.id} value={interviewer.email}>
                {interviewer.email}
              </option>
            ))}
          </select>
          <input name="focus_areas" placeholder="Focus areas" value={form.focus_areas} onChange={change} />
          <button>Schedule Interview</button>
        </form>
      )}
      <table>
        <thead><tr><th>Candidate</th><th>Job</th><th>Date</th><th>Interviewer</th><th>Status</th><th>Feedback</th></tr></thead>
        <tbody>
          {interviews.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No interviews scheduled
              </td>
            </tr>
          ) : (
            interviews.map(item => (
              <tr key={item.id}>
                <td>{item.candidate_name}</td>
                <td>{item.job_title}</td>
                <td>{formatDateTime(item.interview_date, item.interview_time)}</td>
                <td>{item.interviewer_email}</td>
                <td>{item.status}</td>
                <td>
                  {item.feedback ? (
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => openFeedback(item)}
                      >
                        View
                      </button>
                    </div>
                  ) : user?.role === 'Interviewer' ? (
                    <div className="actions">
                      <button
                        type="button"
                        disabled={!canSubmitFeedback(item)}
                        title={!canSubmitFeedback(item) ? 'Available after scheduled time' : ''}
                        onClick={() => startFeedback(item)}
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    'Pending'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination
        pagination={pagination}
        loading={loading}
        onPageChange={load}
      />
      {viewFeedback && (
        <div className="box">
          <div className="page-head">
            <h2>Feedback</h2>
            <button className="add-btn" type="button" onClick={closeFeedback}>Close</button>
          </div>
          <p><b>Interview:</b> {viewFeedbackTitle}</p>
          <p><b>Interviewer:</b> {viewFeedback.interviewer_email}</p>
          <p><b>Technical Rating:</b> {viewFeedback.technical_rating}</p>
          <p><b>Communication Rating:</b> {viewFeedback.communication_rating}</p>
          <p><b>Problem Solving Rating:</b> {viewFeedback.problem_solving_rating}</p>
          <p><b>Tech Areas Covered:</b> {viewFeedback.tech_areas_covered}</p>
          <p><b>Recommendation:</b> {viewFeedback.recommendation}</p>
          <p><b>Comments:</b> {viewFeedback.comments}</p>
        </div>
      )}
      {activeId && user?.role === 'Interviewer' && (
        <div className="box">
          <div className="page-head">
            <h3>Feedback</h3>
            <button
              type="button"
              className="add-btn"
              onClick={() => {
                setActiveId('');
                setFeedback(emptyFeedback);
              }}
            >
              Close
            </button>
          </div>

          <form onSubmit={submitFeedback} className="form small">
            <label>
              Technical Rating
              <input name="technical_rating" type="number" min="1" max="5" value={feedback.technical_rating} onChange={feedbackChange} />
            </label>
            <label>
              Communication Rating
              <input name="communication_rating" type="number" min="1" max="5" value={feedback.communication_rating} onChange={feedbackChange} />
            </label>
            <label>
              Problem Solving Rating
              <input name="problem_solving_rating" type="number" min="1" max="5" value={feedback.problem_solving_rating} onChange={feedbackChange} />
            </label>
            <label>
              Tech Areas Covered
              <input name="tech_areas_covered" value={feedback.tech_areas_covered} onChange={feedbackChange} />
            </label>
            <label>
              Comments
              <textarea name="comments" value={feedback.comments} onChange={feedbackChange} />
            </label>
            <label>
              Recommendation
              <select name="recommendation" value={feedback.recommendation} onChange={feedbackChange}>
                <option>NEXT_ROUND</option><option>SELECT</option><option>REJECT</option>
              </select>
            </label>
            <button>Submit Feedback</button>
          </form>
        </div>
      )}
    </section>
  );
}
