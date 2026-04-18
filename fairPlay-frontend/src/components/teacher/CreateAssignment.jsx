import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Calendar, CheckCircle2, ChevronDown, Plus, Trash2, Clock } from 'lucide-react';
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
    maxScore: '100',
    durationMinutes: '60'
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
        durationMinutes: formData.durationMinutes,
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
        className="max-w-md mx-auto mt-20 bg-card border border-green-500/20 rounded-2xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Published!</h2>
        <p className="text-muted-foreground text-sm mb-6">Your {questions.length} question variation(s) have been securely saved and pushed to section {formData.targetSection}.</p>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
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
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileCode className="w-6 h-6 text-primary" />
          </div>
          Draft Randomize Assessment
        </h2>
        <p className="text-muted-foreground mt-2">Create multiple variations of a coding assessment to prevent cheating. The system will randomly assign one to each student.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Global Assignment Data */}
          <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-4">
            <h3 className="text-foreground font-bold uppercase tracking-wider text-[10px] mb-4">1. Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Assignment Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Build a Navigation Bar"
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Target Section</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full bg-background border border-border rounded-xl py-3 pl-4 pr-10 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none [&>option]:text-foreground bg-no-repeat shadow-sm"
                    value={formData.targetSection}
                    onChange={(e) => setFormData({...formData, targetSection: e.target.value})}
                  >
                    <option value="" disabled>Select a mapped class...</option>
                    {availableSections.length === 0 && <option disabled>No sections available. Contact Admin.</option>}
                    {availableSections.map(section => (
                      <option key={section.id} value={section.name}>{section.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Due Date & Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Difficulty</label>
                <select 
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
                <input 
                  type="text" 
                  placeholder="e.g., React"
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Duration (Minutes)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input 
                    required
                    type="number" 
                    min="1"
                    placeholder="e.g., 60"
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                Assignment Description
                <span className="text-primary font-mono text-xs">{formData.maxScore} PTS</span>
              </label>
              <textarea 
                rows="3" 
                placeholder="Briefly describe the context of this assessment for the student dashboard..."
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
              
              <div className="mt-2 text-right">
                <input 
                  type="range" min="10" max="1000" step="10"
                  className="w-48 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Question Variations Data */}
          <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-foreground font-bold uppercase tracking-wider text-[10px]">2. Question Variations</h3>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{questions.length} / 5 Created</span>
             </div>

             {/* Variation Tabs */}
             <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                      activeQuestionIndex === idx 
                        ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' 
                        : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Variation {idx + 1}
                    {questions.length > 1 && (
                      <Trash2 
                        className="w-3 h-3 text-muted-foreground hover:text-red-500 transition-colors" 
                        onClick={(e) => handleRemoveQuestion(idx, e)}
                      />
                    )}
                  </button>
                ))}
                
                {questions.length < 5 && (
                   <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Variation
                  </button>
                )}
             </div>

             {/* Active Question Form */}
             <div className="p-5 border border-border rounded-xl bg-muted/10 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Instructions for Variation {activeQuestionIndex + 1}</label>
                  <textarea 
                    required
                    rows="4" 
                    placeholder={`e.g., Build a specific React component that does X...`}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y shadow-sm"
                    value={currentQuestion.prompt}
                    onChange={(e) => updateCurrentQuestion('prompt', e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">Boilerplate Code <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-wider ml-1">(Optional)</span></label>
                  </div>
                  <textarea 
                    rows="6" 
                    placeholder="Provide starting JSX..."
                    className="w-full bg-muted/30 border border-border rounded-xl py-4 px-4 text-primary text-sm font-mono placeholder:text-muted-foreground/30 placeholder:font-sans focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y"
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
              className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mr-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
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
