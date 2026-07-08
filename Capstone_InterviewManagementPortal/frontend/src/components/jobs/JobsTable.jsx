export default function JobsTable({ jobs, user, onEdit }) {
  return (
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
                    <button type="button" onClick={() => onEdit(job)}>Edit</button>
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
  );
}
