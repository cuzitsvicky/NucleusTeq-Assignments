import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';

const empty = {
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  current_company: '',
  total_experience: '',
  applied_job_id: ''
};

export default function Candidates({ token }) {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(empty);
  const [resume, setResume] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState({ name: '' });
  const [history, setHistory] = useState([]);
  const [historyName, setHistoryName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const debouncedName = useDebouncedValue(filters.name);

  function load(nextPage = page) {
    setLoading(true);
    apiService.getCandidates(token, nextPage, pagination.limit, {
      name: debouncedName
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
  }, [token, debouncedName]);

  useEffect(() => {
    apiService.getJobs(token, 1, 100).then(response => setJobs(response.data)).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }, [token]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
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
    setForm({
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
      mobile: candidate.mobile,
      current_company: candidate.current_company,
      total_experience: candidate.total_experience,
      applied_job_id: candidate.applied_job_id
    });
    setResume(null);
    setEditingId(candidate.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(empty);
    setResume(null);
    setEditingId('');
    setShowForm(false);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Candidates</h1>
        <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
          {showForm ? 'Close' : 'Add Candidate'}
        </button>
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      <div className="filters">
        <input
          placeholder="Search by candidate name"
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
      </div>
      {showForm && (
        <form onSubmit={submit} className="form">
          <input name="first_name" placeholder="First name" value={form.first_name} onChange={change} />
          <input name="last_name" placeholder="Last name" value={form.last_name} onChange={change} />
          <input name="email" placeholder="Email" value={form.email} onChange={change} />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={change} />
          <input name="current_company" placeholder="Current company" value={form.current_company} onChange={change} />
          <input name="total_experience" placeholder="2 years" value={form.total_experience} onChange={change} />
          <select name="applied_job_id" value={form.applied_job_id} onChange={change}>
            <option value="">Select applied job</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {!editingId && <input type="file" accept="application/pdf" onChange={e => setResume(e.target.files[0])} />}
          <button>{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
        </form>
      )}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Job</th><th>Mobile</th><th>Current Company</th><th>Total Experience</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {candidates.map(c => (
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
                  <select onChange={e => changeStatus(c.id, e.target.value)} defaultValue="">
                    <option value="" disabled>Status</option>
                    <option>INTERVIEW_SCHEDULED</option><option>INTERVIEW_COMPLETED</option>
                    <option>SELECTED</option><option>REJECTED</option>
                  </select>
                  <button type="button" onClick={() => openResume(c.id)}>Resume</button>
                  <button type="button" onClick={() => showHistory(c)}>History</button>
                  <button type="button" onClick={() => editCandidate(c)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
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
                  <td>{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
