export default function FeedbackDetails({ feedback, title, onClose }) {
  if (!feedback) return null;

  return (
    <div className="box">
      <div className="page-head">
        <h2>Feedback</h2>
        <button className="add-btn" type="button" onClick={onClose}>Close</button>
      </div>
      <p><b>Interview:</b> {title}</p>
      <p><b>Interviewer:</b> {feedback.interviewer_email}</p>
      <p><b>Technical Rating:</b> {feedback.technical_rating}</p>
      <p><b>Communication Rating:</b> {feedback.communication_rating}</p>
      <p><b>Problem Solving Rating:</b> {feedback.problem_solving_rating}</p>
      <p><b>Tech Areas Covered:</b> {feedback.tech_areas_covered}</p>
      <p><b>Recommendation:</b> {feedback.recommendation}</p>
      <p><b>Comments:</b> {feedback.comments}</p>
    </div>
  );
}
