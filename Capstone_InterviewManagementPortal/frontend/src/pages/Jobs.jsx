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

export default function Jobs({ token, user }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyJob);
  const [originalForm, setOriginalForm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState(emptyJobFilters);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const debouncedName = useDebouncedValue(filters.name);
  const debouncedLocation = useDebouncedValue(filters.location);
  const debouncedExperience = useDebouncedValue(filters.experience);

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

  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, filters.employment_type, debouncedLocation, debouncedExperience]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function changeFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function closeForm() {
    setForm(emptyJob);
    setOriginalForm(null);
    setEditingId('');
    setShowForm(false);
  }

  async function submit(e) {
    e.preventDefault();
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
      <div className="page-head">
        <h1>Jobs</h1>
        {user?.role === 'HR' && (
          <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
            {showForm ? 'Close' : <><Plus size={18} />Add Job</>}
          </button>
        )}
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      <JobFilters filters={filters} onChange={changeFilter} onClear={() => setFilters(emptyJobFilters)} />
      {user?.role === 'HR' && showForm && <JobForm form={form} editingId={editingId} onChange={change} onSubmit={submit} />}
      <JobsTable jobs={jobs} user={user} onEdit={editJob} />
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
    </section>
  );
}
