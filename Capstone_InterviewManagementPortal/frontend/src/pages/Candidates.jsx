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

/**
 * Candidates management component.
 * Manages states and backend interactions for listing, filtering, creating, 
 * updating, downloading resumes, and tracking history for candidate profiles.
 */
export default function Candidates({ token, user }) {
  // Candidate list and page navigation states
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);

  // Available job listings for dropdown selectors
  const [jobs, setJobs] = useState([]);

  // Candidate creation/editing form states
  const [form, setForm] = useState(emptyCandidate);
  const [originalForm, setOriginalForm] = useState(null); // Used to verify if form contents changed
  const [resume, setResume] = useState(null); // File object for resume uploads
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Filtering states and history display logs
  const [filters, setFilters] = useState(emptyCandidateFilters);
  const [history, setHistory] = useState([]);
  const [historyName, setHistoryName] = useState(''); // Current candidate name selected for history details

  // Notification alert messages
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  // Debounced filter values to optimize backend query request frequency
  const debouncedName = useDebouncedValue(filters.name);
  const debouncedEmail = useDebouncedValue(filters.email);

  /**
   * Fetches candidate listings from the backend based on filters and page selection.
   */
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

  // Load and refresh lists when auth tokens, pagination pages, or search filters change
  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, debouncedEmail, filters.status, filters.applied_job_id]);

  // Load the complete list of jobs once on mount for dropdown inputs
  useEffect(() => {
    apiService.getJobs(token, 1, 100).then(response => setJobs(response.data)).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }, [token]);

  /**
   * Event handler for form input field changes.
   */
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Event handler for candidate query filter input changes.
   */
  function changeFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  /**
   * Clears form states and hides the creation/editing form view.
   */
  function closeForm() {
    setForm(emptyCandidate);
    setOriginalForm(null);
    setResume(null);
    setEditingId('');
    setShowForm(false);
    setMessage('');
  }

  /**
   * Handles form submit for creating or updating a candidate profile.
   */
  async function submit(e) {
    e.preventDefault();
    const validationError = validateCandidateForm(form, resume, editingId);
    if (validationError) {
      setMessageType('error');
      setMessage(validationError);
      return;
    }

    // Do not submit API call if no changes were made to edit form
    if (editingId && originalForm && candidatesAreEqual(form, originalForm)) {
      setMessageType('info');
      setMessage('No changes to update');
      return;
    }

    try {
      if (editingId) {
        // Edit candidate (uses JSON payload since resume updates are handled separately)
        await apiService.updateCandidate(token, editingId, form);
      } else {
        // Create candidate (requires multipart/form-data for file upload)
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

  /**
   * Updates candidate lifecycle status (e.g. Applied -> Interviewing).
   */
  async function changeStatus(id, status) {
    try {
      await apiService.updateCandidateStatus(token, id, status);
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  /**
   * Requests resume blob from API and opens it in a new window tab.
   */
  async function openResume(id) {
    window.open(await apiService.downloadResume(token, id), '_blank');
  }

  /**
   * Loads candidate history/audit logs and opens history detail panel.
   */
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

  /**
   * Populates the form inputs with details of a candidate to enable update mode.
   */
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
      {/* Page Header section */}
      <div className="page-head">
        <h1>Candidates</h1>
        {user?.role === 'HR' && (
          <button className={`add-btn ${showForm ? 'close-mode' : ''}`} onClick={showForm ? closeForm : () => setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Add Candidate</>}
          </button>
        )}
      </div>

      {/* Global alert feedback messages */}
      {!showForm && (
        <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      )}
      {loading && <p>Loading...</p>}

      {/* Candidate filtering inputs */}
      <CandidateFilters filters={filters} jobs={jobs} onChange={changeFilter} onClear={() => setFilters(emptyCandidateFilters)} />

      {/* Add / Edit candidate forms (available to HR only) */}
      {user?.role === 'HR' && showForm && (
        <CandidateForm 
          form={form} 
          jobs={jobs} 
          editingId={editingId} 
          onChange={change} 
          onResumeChange={e => setResume(e.target.files[0])} 
          onSubmit={submit} 
          message={message} 
          messageType={messageType} 
          onClose={() => setMessage('')} 
        />
      )}

      {/* Primary candidates details table */}
      <CandidatesTable candidates={candidates} user={user} onStatusChange={changeStatus} onOpenResume={openResume} onShowHistory={showHistory} onEdit={editCandidate} />

      {/* Pagination navigation footer */}
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />

      {/* Sidebar/Modal tracking history logs for a candidate */}
      {historyName && (
        <CandidateHistory historyName={historyName} history={history} onClose={() => setHistoryName('')} />
      )}
    </section>
  );
}
