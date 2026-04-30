import { useState } from 'react';
import { getQuizConfig, saveQuizConfig } from '../types/quiz';
import type { QuizConfig, Question } from '../types/quiz';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function AdminQuizEditor() {
  const [config, setConfig] = useState<QuizConfig>(getQuizConfig());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveQuizConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateQuestion = (index: number, updated: Partial<Question>) => {
    const newQuestions = [...config.questions];
    newQuestions[index] = { ...newQuestions[index], ...updated } as Question;
    setConfig({ ...config, questions: newQuestions });
  };

  const addQuestion = () => {
    const newId = Date.now().toString();
    const newQuestion: Question = {
      id: newId,
      type: 'single_mcq',
      question: 'New Question',
      options: ['Option 1', 'Option 2'],
      answer: 0
    };
    setConfig({ ...config, questions: [...config.questions, newQuestion] });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...config.questions];
    newQuestions.splice(index, 1);
    setConfig({ ...config, questions: newQuestions });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Edit Quiz Configuration</h2>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Quiz'}
        </button>
      </div>

      <div className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
          <input 
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
          <textarea 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 min-h-[100px]"
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
          />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Questions</h3>
      <div className="space-y-6">
        {config.questions.map((q, qIndex) => (
          <div key={q.id} className="p-4 border border-slate-200 rounded-xl relative bg-slate-50">
            <button
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-4 mb-4 pr-8">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Question {qIndex + 1}</label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white disabled:opacity-50"
                  value={q.type}
                  disabled
                >
                  <option value="single_mcq">Single MCQ</option>
                  <option value="multiple_mcq">Multiple MCQ</option>
                  <option value="text">Text / Fill in blank</option>
                  <option value="match">Match</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">To change type, delete and add new.</p>
              </div>
            </div>

            {/* Options configuration inside */}
            {(q.type === 'single_mcq' || q.type === 'multiple_mcq') && (
              <div className="space-y-2 mt-4 bg-white p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Options</label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <input
                      type={q.type === 'single_mcq' ? 'radio' : 'checkbox'}
                      name={`correct-${q.id}`}
                      checked={q.type === 'single_mcq' ? q.answer === oIndex : (q.answer as number[]).includes(oIndex)}
                      onChange={(e) => {
                        if (q.type === 'single_mcq') {
                          updateQuestion(qIndex, { answer: oIndex });
                        } else {
                          const ansArr = q.answer as number[];
                          if (e.target.checked) updateQuestion(qIndex, { answer: [...ansArr, oIndex] });
                          else updateQuestion(qIndex, { answer: ansArr.filter(a => a !== oIndex) });
                        }
                      }}
                    />
                    <input
                      className="flex-1 px-3 py-1 border border-slate-300 rounded-md text-sm"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oIndex] = e.target.value;
                        updateQuestion(qIndex, { options: newOpts });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {q.type === 'text' && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={q.answer}
                  onChange={(e) => updateQuestion(qIndex, { answer: e.target.value })}
                />
              </div>
            )}

            {q.type === 'match' && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
                <p className="text-sm text-slate-600 mb-2 font-medium">To edit match questions, please use raw JSON configuration or delete and recreate with simple MCQ for now.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium py-4 rounded-xl transition-all"
      >
        <Plus className="w-5 h-5" />
        Add New MCQ Question
      </button>

    </div>
  );
}