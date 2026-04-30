import { useState } from 'react';
import type { User } from '../App';
import { ArrowLeft, Play } from 'lucide-react';

export default function UserInputForm({ onSubmit, onBack }: { onSubmit: (u: User) => void, onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone });
  };

  return (
    <div className="w-full h-full max-w-2xl p-6 sm:p-10 md:p-16 flex flex-col justify-center mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">Participant Details</h2>
        <p className="text-slate-600 text-lg sm:text-xl">Please provide your details to personalize your quiz experience.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div>
          <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Full Name</label>
          <input 
            id="name"
            required
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-lg"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Email Address</label>
          <input 
            id="email"
            required
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-lg"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Phone Number</label>
          <input 
            id="phone"
            required
            type="tel" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-lg"
            placeholder="(555) 555-5555"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-10">
          <button 
            type="button"
            onClick={onBack}
            className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-lg"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button 
            type="submit"
            className="w-full sm:w-2/3 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-indigo-200 text-lg"
          >
            Start Quiz <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </form>
    </div>
  );
}
