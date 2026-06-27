import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { login } from '../services/api.js';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
  }
  return <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[.9fr_1.1fr]"><div className="reveal-up rounded-lg bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-950/20"><span className="grid h-12 w-12 place-items-center rounded-md bg-white text-brand-700"><ShieldCheck size={22}/></span><h1 className="mt-5 text-4xl font-semibold">Staff Login</h1><p className="mt-4 leading-7 text-zinc-300">Secure access for reception, restaurant, gym, night club, accounting, management, and administrators.</p></div><form onSubmit={submit} className="glass-panel reveal-up-delay-1 grid content-start gap-4 rounded-lg p-5"><input className="rounded-md border border-zinc-300 bg-white p-3 outline-none focus:-translate-y-0.5 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/><input className="rounded-md border border-zinc-300 bg-white p-3 outline-none focus:-translate-y-0.5 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-950" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/><button className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-3 font-medium text-white shadow-lg shadow-brand-700/20 hover:-translate-y-0.5 hover:bg-brand-500"><LogIn size={18}/> Login</button>{error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}<p className="text-sm text-zinc-500">Forgot/reset and email verification endpoints are available in the API.</p></form></section>;
}

