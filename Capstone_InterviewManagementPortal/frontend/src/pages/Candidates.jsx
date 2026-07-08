import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import CandidateFilters from '../components/candidates/CandidateFilters.jsx';
import CandidateForm from '../components/candidates/CandidateForm.jsx';
import CandidateHistory from '../components/candidates/CandidateHistory.jsx';
import CandidatesTable from '../components/candidates/CandidatesTable.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { candidatesAreEqual, emptyCandidate, emptyCandidateFilters, validateCandidateForm } from '../utils/candidateHelpers.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';

export default function Candidates({ token, user }) {
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyCandidate);
  const [originalForm, setOriginalForm] = useState(null);
  const [resume, setResume] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState(emptyCandidateFilters);
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

  function closeForm() {
    setForm(emptyCandidate);
    setOriginalForm(null);
    setResume(null);
    setEditingId('');
    setShowForm(false);
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
      closeForm();
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

  return (
    <section>
      <div className="page-head">
        <h1>Candidates</h1>
        {user?.role === 'HR' && (
          <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Add Candidate</>}
          </button>
        )}
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      <CandidateFilters filters={filters} jobs={jobs} onChange={changeFilter} onClear={() => setFilters(emptyCandidateFilters)} />
      {user?.role === 'HR' && showForm && (
        <CandidateForm form={form} jobs={jobs} editingId={editingId} onChange={change} onResumeChange={e => setResume(e.target.files[0])} onSubmit={submit} />
      )}
      <CandidatesTable candidates={candidates} user={user} onStatusChange={changeStatus} onOpenResume={openResume} onShowHistory={showHistory} onEdit={editCandidate} />
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
      <CandidateHistory historyName={historyName} history={history} onClose={() => setHistoryName('')} />
    </section>
  );
}
