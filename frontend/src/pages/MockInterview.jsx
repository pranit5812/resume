import React, { useState } from 'react';
import { Brain, MessageSquare, Play, CheckCircle, ChevronRight, BarChart } from 'lucide-react';
import api from '../services/api';

const MockInterview = () => {
  const [role, setRole] = useState('Frontend Developer');
  const [interviewState, setInterviewState] = useState('setup');
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = ["Frontend Developer", "Backend Developer", "Data Scientist", "AI Engineer", "HR"];

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interview/generate-questions', { role });
      setInterviewData(res.data);
      setInterviewState('ongoing');
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, { 
      question_id: interviewData.questions[currentQuestionIndex].id, 
      answer: currentAnswer 
    }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitInterview(newAnswers);
    }
  };

  const submitInterview = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await api.post('/interview/submit-answers', {
        interview_id: interviewData.interview_id,
        answers: finalAnswers
      });
      setResults(res.data);
      setInterviewState('results');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-white/10 p-3 rounded-xl border border-white/15">
          <Brain className="w-8 h-8 text-purple-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#ffffff]">AI Mock Interview</h1>
          <p className="text-[#ffffff]/50">Practice role-specific questions and get real-time feedback.</p>
        </div>
      </div>

      {interviewState === 'setup' && (
        <div className="glass-panel p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[#ffffff]">Select Interview Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            {roles.map(r => (
              <div 
                key={r}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  role === r 
                    ? 'bg-purple-500/20 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/8'
                }`}
                onClick={() => setRole(r)}
              >
                <div className="font-semibold text-[#ffffff]">{r}</div>
                <div className="text-xs text-[#ffffff]/40 mt-1">3 Technical Questions</div>
              </div>
            ))}
          </div>
          <button 
            className="btn-primary px-8 py-3 text-base flex items-center justify-center gap-2 mx-auto"
            onClick={startInterview}
            disabled={loading}
          >
            {loading ? 'Preparing...' : <><Play className="w-5 h-5 fill-current" /> Start Interview</>}
          </button>
        </div>
      )}

      {interviewState === 'ongoing' && interviewData && (
        <div className="glass-panel p-8 border-l-4 border-l-purple-400/60">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-medium text-purple-300 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
              Question {currentQuestionIndex + 1} of {interviewData.questions.length}
            </span>
            <span className="text-sm text-[#ffffff]/40">Role: {role}</span>
          </div>

          <h2 className="text-2xl font-semibold mb-8 leading-relaxed text-[#ffffff]">
            {interviewData.questions[currentQuestionIndex].question}
          </h2>

          <div className="space-y-4">
            <textarea 
              className="input-field min-h-[200px] text-base leading-relaxed p-5"
              placeholder="Type your answer here as if you were speaking to the interviewer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            ></textarea>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-[#ffffff]/40 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Tip: Be specific and use the STAR method.
              </div>
              <button 
                className="btn-primary flex items-center gap-2"
                onClick={handleNextQuestion}
                disabled={currentAnswer.trim().length < 10 || loading}
              >
                {loading ? 'Submitting...' : currentQuestionIndex === interviewData.questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {interviewState === 'results' && results && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Overall Score" value={results.overall_score} color="text-purple-300" />
            <StatCard title="Confidence" value={results.avg_confidence} color="text-blue-300" />
            <StatCard title="Technical" value={results.avg_technical} color="text-emerald-300" />
            <StatCard title="Communication" value={results.avg_communication} color="text-amber-300" />
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-[#ffffff]">
              <BarChart className="w-6 h-6 text-purple-300" /> Detailed Feedback
            </h3>
            {results.detailed_feedback.map((item, idx) => (
              <div key={idx} className="glass-panel p-6 border-l-4 border-l-purple-400/50">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[#ffffff] mb-2">Q: {item.question}</h4>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-[#ffffff]/60 text-sm">
                    <span className="font-semibold text-[#ffffff]/40 block mb-1">Your Answer:</span>
                    {item.answer}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xs text-[#ffffff]/40">Score</div>
                    <div className="font-bold text-lg text-purple-300">{item.evaluation.score}%</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xs text-[#ffffff]/40">Technical</div>
                    <div className="font-bold text-lg text-emerald-300">{item.evaluation.technical}%</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xs text-[#ffffff]/40">Comm.</div>
                    <div className="font-bold text-lg text-amber-300">{item.evaluation.communication}%</div>
                  </div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-400/20 text-[#ffffff]/70 p-4 rounded-xl flex gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                  <p>{item.evaluation.feedback}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button 
              className="btn-primary"
              onClick={() => setInterviewState('setup')}
            >
              Start New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="glass-panel p-6 text-center">
    <div className="text-[#ffffff]/40 text-sm mb-2">{title}</div>
    <div className={`text-4xl font-extrabold ${color}`}>{value}%</div>
  </div>
);

export default MockInterview;
