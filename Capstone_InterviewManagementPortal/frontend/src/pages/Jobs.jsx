import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';

const emptyJob = {
  title: '',
  job_details: '',
  job_role: '',
  required_skills: '',
  experience_required: '',
  employment_type: 'Full Time',
  location: ''
};

export default function Jobs({ token }) {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  function load() {
    apiService.getJobs(token).then(setJobs).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }

  useEffect(load, [token]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editingId) await apiService.updateJob(token, editingId, form);
      else await apiService.createJob(token, form);
      setForm(emptyJob);
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
    setForm({
      title: job.title,
      job_details: job.job_details,
      job_role: job.job_role,
      required_skills: job.required_skills,
      experience_required: job.experience_required,
      employment_type: job.employment_type,
      location: job.location
    });
    setEditingId(job.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyJob);
    setEditingId('');
    setShowForm(false);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Jobs</h1>
        <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
          {showForm ? 'Close' : 'Add Job'}
        </button>
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {showForm && (
        <form onSubmit={submit} className="form">
          <input name="title" placeholder="Title" value={form.title} onChange={change} />
          <input name="job_role" placeholder="Job role" value={form.job_role} onChange={change} />
          <input name="required_skills" placeholder="Required skills" value={form.required_skills} onChange={change} />
          <input name="experience_required" placeholder="2 years" value={form.experience_required} onChange={change} />
          <select name="employment_type" value={form.employment_type} onChange={change}>
            <option>Full Time</option>
            <option>Internship</option>
          </select>
          <input name="location" placeholder="Location" value={form.location} onChange={change} />
          <textarea name="job_details" placeholder="Job details" value={form.job_details} onChange={change} />
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
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.job_details}</td>
              <td>{job.job_role}</td>
              <td>{job.required_skills}</td>
              <td>{job.experience_required}</td>
              <td>{job.employment_type}</td>
              <td>{job.location}</td>
              <td>
                <div className="actions">
                  <button type="button" onClick={() => editJob(job)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
