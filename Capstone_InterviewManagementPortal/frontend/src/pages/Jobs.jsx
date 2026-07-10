import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import JobFilters from '../components/jobs/JobFilters.jsx';
import JobForm from '../components/jobs/JobForm.jsx';
import JobsTable from '../components/jobs/JobsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { emptyJob, emptyJobFilters, jobsAreEqual } from '../utils/jobHelpers.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';

/**
 * Jobs management page component.
 * Allows HR users to create, modify, and search jobs,
 * while allowing other authenticated roles to view available jobs.
 */
export default function Jobs({ token, user }) {
  // Main job list and pagination states
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);

  // Form inputs and unmodified backups (to track unsaved changes)
  const [form, setForm] = useState(emptyJob);
  const [originalForm, setOriginalForm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(''); // ID of the job listing currently being edited

  // Search filter options state
  const [filters, setFilters] = useState(emptyJobFilters);

  // Alerts feedback messaging states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  // Debounce search filters to minimize heavy API calls on rapid keyboard inputs
  const debouncedName = useDebouncedValue(filters.name);
  const debouncedLocation = useDebouncedValue(filters.location);
  const debouncedExperience = useDebouncedValue(filters.experience);

  /**
   * Fetches job listings from the backend based on query filters and page details.
   */
  function load(nextPage = page) {
    setLoading(true);
    apiService.getJobs(token, nextPage, pagination.limit, {
      name: debouncedName,
      employment_type: filters.employment_type,
      location: debouncedLocation,
      experience: debouncedExperience
    }).then(response => {
      setJobs(response.data);
      setPage(response.page);
      setPagination(paginationFrom(response));
    }).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  // Refresh data whenever search filters or pagination settings change
  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, filters.employment_type, debouncedLocation, debouncedExperience]);

  /**
   * Event handler for form input changes.
   */
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Event handler for search filter input changes.
   */
  function changeFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  /**
   * Clears form states and hides the creation/editing form view.
   */
  function closeForm() {
    setForm(emptyJob);
    setOriginalForm(null);
    setEditingId('');
    setShowForm(false);
  }

  /**
   * Handles form submit for creating or updating a job posting.
   */
  async function submit(e) {
    e.preventDefault();
    
    // Prevent submissions if no field values were modified in edit mode
    if (editingId && originalForm && jobsAreEqual(form, originalForm)) {
      setMessageType('info');
      setMessage('No changes to update');
      return;
    }

    try {
      if (editingId) await apiService.updateJob(token, editingId, form);
      else await apiService.createJob(token, form);
      closeForm();
      setMessageType('success');
      setMessage(editingId ? 'Job updated' : 'Job created');
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  /**
   * Populates the form inputs with details of a job to enable update mode.
   */
  function editJob(job) {
    const nextForm = {
      title: job.title,
      job_details: job.job_details,
      job_role: job.job_role,
      required_skills: job.required_skills,
      experience_required: job.experience_required,
      employment_type: job.employment_type,
      location: job.location
    };

    setForm(nextForm);
    setOriginalForm(nextForm);
    setEditingId(job.id);
    setShowForm(true);
  }

  return (
    <section>
      {/* Page Header */}
      <div className="page-head">
        <h1>Jobs</h1>
        {user?.role === 'HR' && (
          <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Add Job</>}
          </button>
        )}
      </div>

      {/* Global alert feedback messages */}
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}

      {/* Search filters options bar */}
      <JobFilters filters={filters} onChange={changeFilter} onClear={() => setFilters(emptyJobFilters)} />

      {/* Creation/Editing form (available to HR only) */}
      {user?.role === 'HR' && showForm && (
        <JobForm form={form} editingId={editingId} onChange={change} onSubmit={submit} />
      )}

      {/* Primary job details table */}
      <JobsTable jobs={jobs} user={user} onEdit={editJob} />

      {/* Pagination control footer */}
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
    </section>
  );
}
