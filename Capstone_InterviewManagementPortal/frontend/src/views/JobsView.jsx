import { useCallback, useEffect, useState } from "react";
import { apiService } from "../services/api";
import { isRecruiterRole } from "../utils/helpers";
import { PAGE_SIZE } from "../constants";
import Modal from "../components/Modal";
import { Plus, Briefcase, MapPin } from "lucide-react";

// Initial state for the Create Job form — extracted so we can reset easily
const EMPTY_FORM = {
  title: "",
  jobDetails: "",
  jobRole: "",
  requiredSkills: "",
  experienceRequired: "",
  employmentType: "Full Time",
  location: "",
};

export default function JobsView({ token, user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // hasMore tracks whether the next page button should be enabled
  const [hasMore, setHasMore] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const isRecruiter = isRecruiterRole(user.role);

  const fetchJobs = useCallback(
    async (pageNumber) => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getJobs(token, pageNumber);
        setJobs(data);
        // If we got a full page, there might be more; otherwise we're at the end
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        setError(err.message || "Failed to load job listings.");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchJobs(page);
  }, [fetchJobs, page]);

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setIsModalOpen(true);
  }

  async function handleCreateJob(e) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);

    try {
      await apiService.createJob(token, {
        title: form.title,
        job_details: form.jobDetails,
        job_role: form.jobRole,
        required_skills: form.requiredSkills,
        experience_required: form.experienceRequired,
        employment_type: form.employmentType,
        location: form.location,
      });
      setIsModalOpen(false);
      fetchJobs(page);
    } catch (err) {
      setSubmitError(err.message || "Failed to create job opening.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
            Active Job Postings
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Manage job profiles and requirements for new applications.
          </p>
        </div>
        {isRecruiter && (
          <button className="btn btn-primary" onClick={openModal}>
            <Plus size={18} />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && jobs.length === 0 ? (
        <div className="empty-state">Loading job openings...</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <Briefcase
            size={40}
            style={{ color: "var(--text-secondary)", marginBottom: "12px" }}
          />
          <p>No job postings found. Click "Post New Job" to list one.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Role Type</th>
                  <th>Employment Type</th>
                  <th>Experience Required</th>
                  <th>Location</th>
                  <th>Required Skills</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--primary-color)",
                        }}
                      >
                        {job.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                          maxWidth: "280px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={job.job_details}
                      >
                        {job.job_details}
                      </div>
                    </td>
                    <td>{job.job_role}</td>
                    <td>
                      <span
                        className={`badge ${job.employment_type === "Full Time" ? "badge-completed" : "badge-scheduled"}`}
                      >
                        {job.employment_type}
                      </span>
                    </td>
                    <td>{job.experience_required}</td>
                    <td>
                      <div
                        className="flex-gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={job.required_skills}
                    >
                      {job.required_skills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-between" style={{ marginTop: "20px" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              Page {page}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Job Opening"
      >
        {submitError && <div className="alert alert-danger">{submitError}</div>}

        <form onSubmit={handleCreateJob}>
          <div className="form-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              name="title"
              type="text"
              className="form-control"
              value={form.title}
              onChange={handleFieldChange}
              placeholder="e.g. Senior Java Developer"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="job-role">Functional Role</label>
              <input
                id="job-role"
                name="jobRole"
                type="text"
                className="form-control"
                value={form.jobRole}
                onChange={handleFieldChange}
                placeholder="e.g. Backend Engineer"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="employment-type">Employment Type</label>
              <select
                id="employment-type"
                name="employmentType"
                className="form-control"
                value={form.employmentType}
                onChange={handleFieldChange}
                required
              >
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-req">Experience Required</label>
              <input
                id="exp-req"
                name="experienceRequired"
                type="text"
                className="form-control"
                value={form.experienceRequired}
                onChange={handleFieldChange}
                placeholder="e.g. 3 years or 2-4 years"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Job Location</label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-control"
                value={form.location}
                onChange={handleFieldChange}
                placeholder="e.g. Remote / San Jose, CA"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Required Skills</label>
            <input
              id="skills"
              name="requiredSkills"
              type="text"
              className="form-control"
              value={form.requiredSkills}
              onChange={handleFieldChange}
              placeholder="e.g. Java, Spring Boot, AWS"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="details">Job Description / Details</label>
            <textarea
              id="details"
              name="jobDetails"
              className="form-control"
              rows={4}
              value={form.jobDetails}
              onChange={handleFieldChange}
              placeholder="Provide a brief summary of the responsibilities and daily tasks."
              required
            />
          </div>

          <div
            className="modal-footer"
            style={{ padding: "16px 0 0 0", borderTop: "none" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
