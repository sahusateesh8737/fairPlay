import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Calendar, CheckCircle2, ChevronDown, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const CreateAssignment = ({ setActiveTab }) => {
  const [availableSections, setAvailableSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sections`);
        setAvailableSections(res.data.data);
      } catch (err) {
        console.error("Failed to fetch sections", err);
      }
    };
    fetchSections();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    targetSection: '',
    dueDate: '',
    description: '',
    difficulty: 'Medium',
    language: 'JavaScript',
    maxScore: '100'
  });
  
  const [questions, setQuestions] = useState([
    { id: 1, prompt: '', boilerplate: '' }
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const handleAddQuestion = () => {
    if (questions.length >= 5) return; // Cap at 5 variations
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, { id: newId, prompt: '', boilerplate: '' }]);
    setActiveQuestionIndex(questions.length);
  };

  const handleRemoveQuestion = (indexToRemove, e) => {
    e.stopPropagation();
    if (questions.length <= 1) return; // Must have at least 1 question
    const updated = questions.filter((_, idx) => idx !== indexToRemove);
    setQuestions(updated);
    // Adjust active index if necessary
    if (activeQuestionIndex >= indexToRemove) {
      setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
    }
  };

  const currentQuestion = questions[activeQuestionIndex];

  const updateCurrentQuestion = (field, value) => {
    const updated = [...questions];
    updated[activeQuestionIndex] = { ...updated[activeQuestionIndex], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalidQuestion = questions.find(q => !q.prompt.trim());
    if (invalidQuestion) {
      alert("Please ensure all question variations have a prompt.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        sectionName: formData.targetSection,
        dueDate: formData.dueDate,
        description: formData.description,
        difficulty: formData.difficulty,
        language: formData.language,
        maxScore: formData.maxScore,
        questions: questions.map(q => ({
          prompt: q.prompt,
          boilerplate: q.boilerplate
        }))
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`, payload);
      setShowSuccess(true);
      setTimeout(() => setActiveTab('assignments'), 2000);
    } catch (err) {
      console.error("Publishing failed", err);
      alert("Failed to publish assessment. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-20 bg-[#0a0a0c] border border-green-500/20 rounded-2xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Assessment Published!</h2>
        <p className="text-gray-400 text-sm mb-6">Your {questions.length} question variation(s) have been securely saved and pushed to section {formData.targetSection}.</p>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="h-full bg-green-500"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileCode className="w-6 h-6 text-blue-400" />
          </div>
          Draft Randomize Assessment
        </h2>
        <p className="text-gray-400 mt-2">Create multiple variations of a coding assessment to prevent cheating. The system will randomly assign one to each student.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0c] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Global Assignment Data */}
          <div className="p-5 border border-gray-800 rounded-xl bg-gray-900/20 space-y-4">
            <h3 className="text-white font-medium uppercase tracking-wider text-xs mb-4">1. Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assignment Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Build a Navigation Bar"
                  className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Section</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none [&>option]:text-black"
                    value={formData.targetSection}
                    onChange={(e) => setFormData({...formData, targetSection: e.target.value})}
                  >
                    <option value="" disabled>Select a mapped class...</option>
                    {availableSections.length === 0 && <option disabled>No sections available. Contact Admin.</option>}
                    {availableSections.map(section => (
                      <option key={section.id} value={section.name}>{section.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date & Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select 
                  className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 [&>option]:text-black"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <input 
                  type="text" 
                  placeholder="e.g., React"
                  className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-bold text-gray-300 mb-2">
                Assignment Description
                <span className="text-blue-400 font-mono text-xs">{formData.maxScore} PTS</span>
              </label>
              <textarea 
                rows="3" 
                placeholder="Briefly describe the context of this assessment for the student dashboard..."
                className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
              
              <div className="mt-2 text-right">
                <input 
                  type="range" min="10" max="1000" step="10"
                  className="w-48 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Question Variations Data */}
          <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium uppercase tracking-wider text-xs">2. Question Variations</h3>
                <span className="text-xs text-gray-500">{questions.length} / 5 Created</span>
             </div>

             {/* Variation Tabs */}
             <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      activeQuestionIndex === idx 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                        : 'bg-gray-800/30 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    Variation {idx + 1}
                    {questions.length > 1 && (
                      <Trash2 
                        className="w-3 h-3 text-gray-500 hover:text-red-400" 
                        onClick={(e) => handleRemoveQuestion(idx, e)}
                      />
                    )}
                  </button>
                ))}
                
                {questions.length < 5 && (
                   <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Variation
                  </button>
                )}
             </div>

             {/* Active Question Form */}
             <div className="p-5 border border-gray-800/80 rounded-xl bg-[#111115] space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instructions for Variation {activeQuestionIndex + 1}</label>
                  <textarea 
                    required
                    rows="4" 
                    placeholder={`e.g., Build a specific React component that does X...`}
                    className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-y"
                    value={currentQuestion.prompt}
                    onChange={(e) => updateCurrentQuestion('prompt', e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-300">Boilerplate Code <span className="text-gray-600 text-xs font-normal">(Optional)</span></label>
                  </div>
                  <textarea 
                    rows="6" 
                    placeholder="Provide starting JSX..."
                    className="w-full bg-[#070709] border border-gray-800 rounded-xl py-4 px-4 text-blue-300 text-sm font-mono placeholder:text-gray-700 placeholder:font-sans focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-y"
                    value={currentQuestion.boilerplate}
                    onChange={(e) => updateCurrentQuestion('boilerplate', e.target.value)}
                  ></textarea>
                </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors mr-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAssignment;
