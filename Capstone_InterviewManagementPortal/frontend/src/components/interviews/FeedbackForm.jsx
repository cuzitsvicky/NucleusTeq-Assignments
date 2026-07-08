export default function FeedbackForm({ activeId, user, feedback, onChange, onSubmit, onClose }) {
  if (!activeId || user?.role !== 'Interviewer') return null;

  return (
    <div className="box">
      <div className="page-head">
        <h3>Feedback</h3>
        <button type="button" className="add-btn" onClick={onClose}>Close</button>
      </div>
      <form onSubmit={onSubmit} className="form small">
        <label>Technical Rating<input name="technical_rating" type="number" min="1" max="5" step="1" value={feedback.technical_rating} onChange={onChange} required /></label>
        <label>Communication Rating<input name="communication_rating" type="number" min="1" max="5" step="1" value={feedback.communication_rating} onChange={onChange} required /></label>
        <label>Problem Solving Rating<input name="problem_solving_rating" type="number" min="1" max="5" step="1" value={feedback.problem_solving_rating} onChange={onChange} required /></label>
        <label>Tech Areas Covered<input name="tech_areas_covered" value={feedback.tech_areas_covered} onChange={onChange} required /></label>
        <label>Comments<textarea name="comments" value={feedback.comments} onChange={onChange} required /></label>
        <label>Recommendation<select name="recommendation" value={feedback.recommendation} onChange={onChange} required><option>NEXT_ROUND</option><option>SELECT</option><option>REJECT</option></select></label>
        <button>Submit Feedback</button>
      </form>
    </div>
  );
}
