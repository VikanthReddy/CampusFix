const fs = require('fs');

let content = fs.readFileSync('client/src/pages/StudentDashboard.jsx', 'utf-8');

const stateInjection = 
    const [feedbackForm, setFeedbackForm] = useState({ rating: 5, feedback: '' });
    const [feedbackComplaintId, setFeedbackComplaintId] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleFeedbackSubmit = async (e, complaintId) => {
        e.preventDefault();
        setFeedbackLoading(true);
        try {
            const res = await api.post('/complaints/' + complaintId + '/feedback', feedbackForm);
            setComplaints(complaints.map(c => c.id === complaintId ? res.data : c));
            setFeedbackComplaintId(null);
            setFeedbackForm({ rating: 5, feedback: '' });
        } catch (err) {
            alert(err.response?.data || 'Failed to submit feedback');
        } finally {
            setFeedbackLoading(false);
        }
    };
;

content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + stateInjection);

const uiInjection = 
                                                    {complaint.status === 'RESOLVED' && (
                                                        <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                                            {complaint.rating ? (
                                                                <div>
                                                                    <strong>Your Rating: </strong> {complaint.rating} / 5 <br/>
                                                                    <strong>Your Feedback: </strong> {complaint.feedback}
                                                                </div>
                                                            ) : (
                                                                feedbackComplaintId === complaint.id ? (
                                                                    <form onSubmit={(e) => handleFeedbackSubmit(e, complaint.id)}>
                                                                        <label>Rating (1-5):</label>
                                                                        <input type="number" min="1" max="5" value={feedbackForm.rating} onChange={(e) => setFeedbackForm({...feedbackForm, rating: e.target.value})} style={{marginLeft: '10px', width: '50px'}} required/>
                                                                        <br/>
                                                                        <textarea placeholder="Write your feedback..." value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({...feedbackForm, feedback: e.target.value})} style={{width: '100%', marginTop: '5px'}} required></textarea>
                                                                        <br/>
                                                                        <button type="submit" disabled={feedbackLoading} style={{marginTop: '5px'}}>Submit</button>
                                                                        <button type="button" onClick={() => setFeedbackComplaintId(null)} style={{marginTop: '5px', marginLeft: '5px', background: '#ccc'}}>Cancel</button>
                                                                    </form>
                                                                ) : (
                                                                    <button onClick={() => setFeedbackComplaintId(complaint.id)} style={{background: '#28a745', padding: '5px 10px', fontSize: '12px', marginTop: '10px', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px'}}>Provide Feedback</button>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
;

content = content.replace('<div className="complaint-status">', uiInjection + '\n                                          <div className="complaint-status">');

fs.writeFileSync('client/src/pages/StudentDashboard.jsx', content);
console.log('Updated StudentDashboard');
