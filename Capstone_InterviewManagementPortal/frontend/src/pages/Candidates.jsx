import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { formatTimestamp } from '../utils/dateFormat.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';
import { Plus } from 'lucide-react';

const empty = {
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  current_company: '',
  total_experience: '',
  applied_job_id: ''
};

const STATUS_OPTIONS = [
  'PROFILE_CREATED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'SELECTED',
  'REJECTED'
];

const NAME_PATTERN = '[A-Za-z ]+';
const MOBILE_PATTERN = '[0-9\\s-]{7,12}';
const EXPERIENCE_PATTERN = '(\\d+(\\.\\d+)?(\\s*-\\s*\\d+(\\.\\d+)?)?\\s*(year|years|month|months)|\\d+\\s*(year|years)\\s+\\d+\\s*(month|months))';

function validateCandidateForm(form, resume, editingId) {
  const labels = {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    mobile: 'Mobile',
    current_company: 'Current company',
    total_experience: 'Total experience',
    applied_job_id: 'Applied job'
  };

  const missing = Object.entries(labels)
    .filter(([key]) => !String(form[key] ?? '').trim())
    .map(([, label]) => label);

  if (missing.length) {
    return `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`;
  }

  if (!editingId && !resume) return 'Resume is required';
  if (!editingId && resume?.type !== 'application/pdf') return 'Resume must be a PDF file';

  return '';
}

function normalizeCandidate(candidate) {
  return Object.fromEntries(
    Object.entries(empty).map(([key]) => [key, String(candidate[key] ?? '').trim()])
  );
}

function candidatesAreEqual(first, second) {
  return JSON.stringify(normalizeCandidate(first)) === JSON.stringify(normalizeCandidate(second));
}

export default function Candidates({ token, user }) {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(empty);
  const [originalForm, setOriginalForm] = useState(null);
  const [resume, setResume] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', status: '', applied_job_id: '' });
  const [history, setHistory] = useState([]);
  const [historyName, setHistoryName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const debouncedName = useDebouncedValue(filters.name);
  const debouncedEmail = useDebouncedValue(filters.email);

  function load(nextPage = page) {
    setLoading(true);
    apiService.getCandidates(token, nextPage, pagination.limit, {
      name: debouncedName,
      email: debouncedEmail,
      status: filters.status,
      applied_job_id: filters.applied_job_id
    }).then(response => {
      setCandidates(response.data);
      setPage(response.page);
      setPagination(paginationFrom(response));
    }).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, debouncedEmail, filters.status, filters.applied_job_id]);

  useEffect(() => {
    apiService.getJobs(token, 1, 100).then(response => setJobs(response.data)).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }, [token]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function changeFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function clearFilters() {
    setFilters({ name: '', email: '', status: '', applied_job_id: '' });
  }

  async function submit(e) {
    e.preventDefault();
    const validationError = validateCandidateForm(form, resume, editingId);
    if (validationError) {
      setMessageType('error');
      setMessage(validationError);
      return;
    }

    if (editingId && originalForm && candidatesAreEqual(form, originalForm)) {
      setMessageType('info');
      setMessage('No changes to update');
      return;
    }

    try {
      if (editingId) {
        await apiService.updateCandidate(token, editingId, form);
      } else {
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        data.append('resume', resume);
        await apiService.createCandidate(token, data);
      }
      setForm(empty);
      setOriginalForm(null);
      setResume(null);
      setEditingId('');
      setShowForm(false);
      setMessageType('success');
      setMessage(editingId ? 'Candidate updated' : 'Candidate created');
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  async function changeStatus(id, status) {
    try {
      await apiService.updateCandidateStatus(token, id, status);
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  async function openResume(id) {
    window.open(await apiService.downloadResume(token, id), '_blank');
  }

  async function showHistory(candidate) {
    try {
      const response = await apiService.getCandidateHistory(token, candidate.id);
      setHistory(response.data);
      setHistoryName(`${candidate.first_name} ${candidate.last_name}`);
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  function editCandidate(candidate) {
    const nextForm = {
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
      mobile: candidate.mobile,
      current_company: candidate.current_company,
      total_experience: candidate.total_experience,
      applied_job_id: candidate.applied_job_id
    };

    setForm(nextForm);
    setOriginalForm(nextForm);
    setResume(null);
    setEditingId(candidate.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(empty);
    setOriginalForm(null);
    setResume(null);
    setEditingId('');
    setShowForm(false);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Candidates</h1>

        {user?.role === 'HR' && (
          <button
            className="add-btn"
            onClick={showForm ? closeForm : () => setShowForm(true)}
          >
            {showForm ? (
              'Close'
            ) : (
              <>
                <Plus size={18} />
                Add Candidate
              </>
            )}
          </button>
        )}
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      <div className="filters">
        <input
          name="name"
          placeholder="Search by candidate name"
          value={filters.name}
          onChange={changeFilter}
        />
        <input
          name="email"
          placeholder="Search by email"
          value={filters.email}
          onChange={changeFilter}
        />
        <select name="applied_job_id" value={filters.applied_job_id} onChange={changeFilter}>
          <option value="">All jobs</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={changeFilter}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="button" onClick={clearFilters}>Clear filters</button>
      </div>
      {user?.role === 'HR' && showForm && (
        <form onSubmit={submit} className="form">
          <input name="first_name" placeholder="First name" value={form.first_name} onChange={change} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" />
          <input name="last_name" placeholder="Last name" value={form.last_name} onChange={change} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required pattern="[A-Za-z0-9]+(\.[A-Za-z0-9]+)*@.+" title="Use a valid email. The local part can contain letters, numbers, and dots only" />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={change} required inputMode="numeric" pattern={MOBILE_PATTERN} title="Enter 7 to 10 digits. Spaces and hyphens are allowed" />
          <input name="current_company" placeholder="Current company" value={form.current_company} onChange={change} required />
          <input name="total_experience" placeholder="2 years" value={form.total_experience} onChange={change} required pattern={EXPERIENCE_PATTERN} title='Use formats like "3 years", "6 months", or "2 years 3 months"' />
          <select name="applied_job_id" value={form.applied_job_id} onChange={change} required>
            <option value="">Select applied job</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {!editingId && <input type="file" accept="application/pdf" required onChange={e => setResume(e.target.files[0])} />}
          <button>{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
        </form>
      )}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Job</th><th>Mobile</th><th>Current Company</th><th>Total Experience</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {candidates.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                No candidates available. Please create a new candidate.
              </td>
            </tr>
          ) : (
            candidates.map(c => (
              <tr key={c.id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.email}</td>
                <td>{c.job_title || c.applied_job_id}</td>
                <td>{c.mobile}</td>
                <td>{c.current_company}</td>
                <td>{c.total_experience}</td>
                <td>{c.status}</td>
                <td>
                  <div className="actions">
                    <select
                      onChange={e => changeStatus(c.id, e.target.value)}
                      defaultValue=""
                      disabled={['PROFILE_CREATED', 'INTERVIEW_SCHEDULED'].includes(c.status)}
                      title={
                        c.status === 'PROFILE_CREATED'
                          ? 'Schedule an interview to move this candidate forward'
                          :
                          c.status === 'INTERVIEW_SCHEDULED'
                            ? 'Available after interview feedback is submitted'
                            : 'Change status'
                      }
                    >
                      <option value="" disabled>
                        {
                          c.status === 'PROFILE_CREATED'
                            ? 'Schedule interview'
                            : c.status === 'INTERVIEW_SCHEDULED'
                              ? 'Awaiting feedback'
                              : 'Status'
                        }
                      </option>
                      <option>INTERVIEW_COMPLETED</option>
                      <option>SELECTED</option>
                      <option>REJECTED</option>
                    </select>
                    <button type="button" onClick={() => openResume(c.id)}>
                      Resume
                    </button>
                    <button type="button" onClick={() => showHistory(c)}>
                      History
                    </button>
                    {user?.role === 'HR' && (
                      <button type="button" onClick={() => editCandidate(c)}>
                        Edit
                      </button>
                    )}
                  </div>
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
      {historyName && (
        <div className="box">
          <div className="page-head">
            <h2>{historyName} History</h2>
            <button className="add-btn" onClick={() => setHistoryName('')}>Close</button>
          </div>
          <table>
            <thead><tr><th>Status</th><th>Updated By</th><th>Time</th></tr></thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td>{item.status}</td>
                  <td>{item.updated_by}</td>
                  <td>{formatTimestamp(item.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
