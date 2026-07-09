import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';
import { Plus } from 'lucide-react';

const emptyJob = {
  title: '',
  job_details: '',
  job_role: '',
  required_skills: '',
  experience_required: '',
  employment_type: 'Full Time',
  location: ''
};

const emptyFilters = {
  name: '',
  employment_type: '',
  location: '',
  experience: ''
};

const EXPERIENCE_PATTERN = '(\\d+(\\.\\d+)?(\\s*-\\s*\\d+(\\.\\d+)?)?\\s*(year|years|month|months)|\\d+\\s*(year|years)\\s+\\d+\\s*(month|months))';

function normalizeJob(job) {
  return Object.fromEntries(
    Object.entries(emptyJob).map(([key]) => [key, String(job[key] ?? '').trim()])
  );
}

function jobsAreEqual(first, second) {
  return JSON.stringify(normalizeJob(first)) === JSON.stringify(normalizeJob(second));
}

export default function Jobs({ token, user }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyJob);
  const [originalForm, setOriginalForm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
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
  }, [
    token,
    debouncedName,
    filters.employment_type,
    debouncedLocation,
    debouncedExperience
  ]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function changeFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function clearFilters() {
    setFilters(emptyFilters);
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
      setForm(emptyJob);
      setOriginalForm(null);
      setShowForm(false);
      setEditingId('');
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

  function closeForm() {
    setForm(emptyJob);
    setOriginalForm(null);
    setEditingId('');
    setShowForm(false);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Jobs</h1>
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
                Add Job
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
          placeholder="Search by job name"
          value={filters.name}
          onChange={changeFilter}
        />
        <select
          name="employment_type"
          value={filters.employment_type}
          onChange={changeFilter}
        >
          <option value="">All job types</option>
          <option>Full Time</option>
          <option>Internship</option>
        </select>
        <input
          name="location"
          placeholder="Filter by location"
          value={filters.location}
          onChange={changeFilter}
        />
        <input
          name="experience"
          placeholder="Filter by experience"
          value={filters.experience}
          onChange={changeFilter}
        />
        <button type="button" onClick={clearFilters}>Clear filters</button>
      </div>
      {user?.role === 'HR' && showForm && (
        <form onSubmit={submit} className="form">
          <input name="title" placeholder="Title" value={form.title} onChange={change} required maxLength="150" />
          <input name="job_role" placeholder="Job role" value={form.job_role} onChange={change} required />
          <input name="required_skills" placeholder="Required skills" value={form.required_skills} onChange={change} required />
          <input name="experience_required" placeholder="2 years" value={form.experience_required} onChange={change} required pattern={EXPERIENCE_PATTERN} title='Use formats like "2 years", "2-4 years", "6 months", or "2 years 3 months"' />
          <select name="employment_type" value={form.employment_type} onChange={change} required>
            <option>Full Time</option>
            <option>Internship</option>
          </select>
          <input name="location" placeholder="Location" value={form.location} onChange={change} required />
          <textarea name="job_details" placeholder="Job details" value={form.job_details} onChange={change} required />
          <button>{editingId ? 'Update Job' : 'Create Job'}</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Details</th><th>Role</th><th>Skills</th>
            <th>Experience</th><th>Type</th><th>Location</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                No jobs available. Please create a new job.
              </td>
            </tr>
          ) : (
            jobs.map(job => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.job_details}</td>
                <td>{job.job_role}</td>
                <td>{job.required_skills}</td>
                <td>{job.experience_required}</td>
                <td>{job.employment_type}</td>
                <td>{job.location}</td>
                <td>
                  {user?.role === 'HR' ? (
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => editJob(job)}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    '-'
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
    </section>
  );
}
