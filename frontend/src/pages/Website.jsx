import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BedDouble, Dumbbell, Mail, MapPin, Martini, Phone, Soup,
  UsersRound, Star, ChevronRight, ChevronLeft, SlidersHorizontal, Check, X,
  Calendar, Wifi, Tv, Coffee, Bath, Wind, Info as InfoIcon, Users, CheckCircle, Tag,
  Briefcase, Heart, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { facilities, faqs, roomTypes } from '../data/content.js';
import { api } from '../services/api.js';

const stats = [
  ['48+', 'Luxury Rooms & Suites'],
  ['5', 'Revenue Centers'],
  ['24/7', 'Exceptional Service'],
  ['100%', 'Integrated Management']
];

const icons = { Restaurant: Soup, 'Gym/Fitness Center': Dumbbell, 'Night Club': Martini, 'Meeting Rooms': UsersRound };

// Framer Motion Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const imageZoom = {
  hidden: { scale: 1.05, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
};

function Counter({ value }) {
  const [count, setCount] = useState(0);
  const numericVal = parseInt(value);
  const suffix = value ? value.replace(String(numericVal), '') : '';

  useEffect(() => {
    if (isNaN(numericVal)) {
      setCount(value);
      return;
    }
    let start = 0;
    const end = numericVal;
    const duration = 1500;
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericVal, value]);

  return <>{count}{suffix}</>;
}

export function Home() {
  const navigate = useNavigate();

  // Search Widget State
  const [homeCheckIn, setHomeCheckIn] = useState('');
  const [homeCheckOut, setHomeCheckOut] = useState('');
  const [homeGuests, setHomeGuests] = useState('2');
  const [homeRoomType, setHomeRoomType] = useState('All');

  const handleHomeSearch = (e) => {
    e.preventDefault();
    localStorage.setItem('sticky_checkIn', homeCheckIn);
    localStorage.setItem('sticky_checkOut', homeCheckOut);
    localStorage.setItem('sticky_guests', homeGuests);
    localStorage.setItem('sticky_roomType', homeRoomType);
    navigate('/booking');
  };

  return (
    <>
    <section className="hero-image min-h-[95vh] bg-cover bg-center px-4 text-white flex flex-col justify-center pt-28 pb-40 md:pt-36 md:pb-48 relative">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div 
          className="max-w-4xl"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">
            <Star size={16} className="text-brand-500 fill-brand-500"/>
            Bambis, Addis Ababa
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-heading text-6xl font-light leading-[1.1] tracking-tight md:text-[5.5rem] lg:text-[7rem]">
            Vora Addis <br/>
            <span className="font-semibold text-brand-400">Hotel.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-8 max-w-xl text-lg font-light leading-relaxed text-zinc-300 md:text-xl">
            A transcendent hotel experience combining luxury accommodation, world-class dining, elite fitness, and vibrant nightlife in a seamlessly integrated operation.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <Link to="/booking" className="group flex h-14 items-center gap-3 bg-brand-500 px-8 text-sm font-semibold uppercase tracking-widest text-ink-950 transition-all hover:bg-brand-400 hover:pr-6">
              Book Your Stay <ArrowRight size={18} className="transition-transform group-hover:translate-x-2"/>
            </Link>
            <Link to="/rooms" className="flex h-14 items-center border border-white/30 px-8 text-sm font-semibold uppercase tracking-widest backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/60">
              Discover Rooms
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating Stats */}
      <div className="absolute -bottom-16 left-0 w-full px-4 z-20">
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8"
        >
          {stats.map(([value, label], i) => (
            <motion.div key={label} variants={fadeUp} className="glass-panel group rounded-sm p-6 text-center transition-all hover:-translate-y-2 hover:border-brand-500/50">
              <p className="font-heading text-4xl font-light text-brand-500 md:text-5xl">
                <Counter value={value} />
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
 
    <div className="h-24 md:h-32"></div>

    {/* Experiences Section */}
    <section className="mx-auto max-w-7xl px-4 py-20 md:py-32">
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
        className="mb-16 md:flex md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Discover</p>
          <h2 className="font-heading text-4xl font-light md:text-6xl">Unrivalled <span className="font-semibold">Experiences</span></h2>
        </div>
        <Link to="/about" className="mt-6 hidden items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-600 transition-colors hover:text-brand-500 md:flex dark:text-brand-400">
          More About Us <ArrowRight size={16}/>
        </Link>
      </motion.div>

      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {facilities.map((item, index) => {
          const Icon = icons[item.title] || BedDouble;
          const spanClass = index < 2 ? 'lg:col-span-2' : 'lg:col-span-2';
          
          return <motion.div key={item.title} variants={fadeUp} className={`group relative overflow-hidden rounded-sm bg-ink-900 ${spanClass}`}>
            <Link to={item.path} className="block h-full w-full">
              <img src={item.image} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-40"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-900/40 to-transparent"></div>
              
              <div className="relative flex h-full min-h-[320px] flex-col justify-end p-8 text-white md:min-h-[400px]">
                <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-2 group-hover:bg-brand-500 group-hover:border-brand-500">
                  <Icon size={20}/>
                </span>
                <h3 className="font-heading text-2xl font-medium tracking-wide md:text-3xl">{item.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">{item.text}</p>
              </div>
            </Link>
          </motion.div>;
        })}
      </motion.div>
    </section>

    {/* Featured Rooms Section Redesign */}
    <section className="px-4 py-20 bg-brand-50/5 dark:bg-ink-950/5">
      <div className="mx-auto max-w-7xl bg-[#0f172a] rounded-[20px] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-brand-500/5 rounded-full blur-3xl" />

        {/* Section Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-12 text-center relative z-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Accommodation</p>
          <h2 className="font-heading text-4xl font-light md:text-5xl">Our Signature <span className="font-semibold text-brand-400">Rooms</span></h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            Experience our handpicked selections designed with meticulous detail to exceed every luxury benchmark.
          </p>
        </motion.div>

        {/* Search Widget Above Rooms */}
        <div className="glass-panel border-zinc-800 bg-[#1e293b]/30 p-5 rounded-xl mb-14 relative z-20 max-w-5xl mx-auto">
          <form onSubmit={handleHomeSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Check-in</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={homeCheckIn}
                onChange={(e) => setHomeCheckIn(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-[#0f172a] p-2 text-xs outline-none focus:border-brand-500 text-white transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Check-out</label>
              <input
                type="date"
                min={homeCheckIn || new Date().toISOString().split('T')[0]}
                value={homeCheckOut}
                onChange={(e) => setHomeCheckOut(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-[#0f172a] p-2 text-xs outline-none focus:border-brand-500 text-white transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Guests</label>
              <select
                value={homeGuests}
                onChange={(e) => setHomeGuests(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-[#0f172a] p-2 text-xs outline-none focus:border-brand-500 text-white transition"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Room Type</label>
              <select
                value={homeRoomType}
                onChange={(e) => setHomeRoomType(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-[#0f172a] p-2 text-xs outline-none focus:border-brand-500 text-white transition"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Twin">Twin</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Executive">Executive</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold uppercase py-2.5 rounded text-xs tracking-wider transition shadow-lg shadow-brand-500/20"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Room Cards Grid */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 relative z-10"
        >
          {roomTypes.map((room) => {
            const isSuite = room.name === 'Suite';
            const gridClass = isSuite ? 'md:col-span-2 lg:col-span-3 lg:flex lg:flex-row lg:items-stretch lg:gap-8 bg-zinc-900/60 border border-brand-500/30' : 'bg-[#1e293b]/40 border border-zinc-800';

            return (
              <motion.article 
                key={room.name} 
                variants={fadeUp} 
                className={`group rounded-xl p-5 flex flex-col justify-between relative shadow transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(184,134,11,0.18)] ${gridClass}`}
              >
                {/* Image & Corner Price Badge */}
                <div className={`relative overflow-hidden rounded-lg ${isSuite ? 'lg:w-[50%] shrink-0 aspect-[16/10]' : 'w-full aspect-[16/10]'} mb-5 lg:mb-0`}>
                  <img 
                    src={room.image} 
                    className="h-full w-full object-cover brightness-[0.98] group-hover:brightness-105 group-hover:scale-105 transition-all duration-700 ease-out"
                    alt={room.name}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300" />
                  
                  {/* Price corner badge */}
                  <div className="absolute top-4 right-4 bg-brand-500 text-zinc-950 font-heading text-sm font-bold px-3 py-1.5 shadow shadow-black/40 rounded-sm">
                    ${room.price}/Night
                  </div>
                  
                  {isSuite && (
                    <span className="absolute top-4 left-4 bg-zinc-950/80 text-brand-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1 rounded border border-brand-500/20 backdrop-blur-sm">
                      🌟 Featured Suite — Popular
                    </span>
                  )}
                </div>

                {/* Details Column */}
                <div className={`flex-1 flex flex-col justify-between ${isSuite ? 'lg:pl-4 lg:py-2' : ''}`}>
                  <div>
                    {/* Stars and rating values */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-brand-400 text-sm">★★★★★</span>
                      <span className="text-xs font-bold text-zinc-200">{room.rating}</span>
                      <span className="text-[10px] text-zinc-400 font-light">({room.reviewsCount} reviews)</span>
                    </div>

                    <h3 className="font-heading text-[28px] font-medium tracking-wide text-white">{room.name}</h3>
                    <p className="mt-3 text-base text-zinc-300 font-light leading-relaxed">{room.details}</p>

                    {/* Room Attributes */}
                    <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 border-t border-zinc-800 pt-4 text-xs text-zinc-400 font-light">
                      <div className="flex items-center gap-2">
                        <span>🛏️</span>
                        <span>{room.bedType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{room.capacity} Guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📐</span>
                        <span>{room.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📶</span>
                        <span>Free Wi-Fi</span>
                      </div>
                    </div>
                  </div>

                  {/* Call to action buttons */}
                  <div className="mt-8 flex gap-3 pt-4 border-t border-zinc-800">
                    <Link 
                      to={`/rooms/${room.name.toLowerCase()}`}
                      className="flex-1 py-3 text-center border border-zinc-700 hover:border-zinc-500 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/rooms/${room.name.toLowerCase()}`}
                      className="flex-1 py-3 text-center bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold uppercase text-xs tracking-widest transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Guest Reviews Section Below Cards */}
        <div className="mt-20 border-t border-zinc-800 pt-14 max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Feedback</p>
            <h3 className="font-heading text-2xl font-light text-white mt-1">What Guests Say</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-[#1e293b]/30 border border-zinc-800 rounded-xl p-6">
              <span className="text-brand-400 text-sm">★★★★★</span>
              <p className="mt-3 text-sm italic text-zinc-300 font-light">"Excellent stay! The rooms were incredibly spacious and clean, and the service was absolutely top-notch."</p>
              <p className="mt-4 text-xs font-semibold text-zinc-400">— Sarah M., Verified Guest</p>
            </div>
            <div className="bg-[#1e293b]/30 border border-zinc-800 rounded-xl p-6">
              <span className="text-brand-400 text-sm">★★★★★</span>
              <p className="mt-3 text-sm italic text-zinc-300 font-light">"Very clean rooms! The gym facilities are best-in-class, and the integrated app ordering made room service instant."</p>
              <p className="mt-4 text-xs font-semibold text-zinc-400">— Daniel K., Verified Guest</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  </>
  );
}

export function About() { return <Info title="About Us" subtitle="The Vora Addis Legacy" image="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=2000&q=80" text="Vora Addis Hotel combines luxury hospitality, fine dining, exclusive wellness, nightlife, executive meetings, and seamless administration in one integrated operation located in Bambis, Addis Ababa. Our management system is meticulously designed to make front desk operations effortless, hold revenue centers accountable, and provide leadership with unprecedented real-time visibility."/>; }
export function Restaurant() { return <Info title="Restaurant" subtitle="Culinary Excellence" image="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=80" text="Manage sophisticated menu categories, seamless food orders, precise table reservations, and integrated billing for breakfast, lunch, dinner, drinks, and signature desserts."/>; }
export function Gym() { return <Info title="Gym / Wellness" subtitle="Peak Performance" image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2000&q=80" text="Register elite members, assign personal trainers, track attendance, monitor payment status, and offer unparalleled support through daily to yearly wellness plans."/>; }
export function NightClub() { return <Info title="Night Club" subtitle="Unforgettable Nights" image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80" text="Curate exclusive events, manage dynamic calendars, handle VIP reservations flawlessly, sell tiered tickets, and track venue revenue with precision."/>; }
export function MeetingRooms() { return <Info title="Meeting Rooms" subtitle="Executive Spaces" image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=80" text="Book premium meeting spaces, manage complex availability, optimize capacity, and handle state-of-the-art equipment reservations including projectors, PA systems, and ultra-fast Wi-Fi."/>; }

export function Rooms() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchCheckIn, setSearchCheckIn] = useState(localStorage.getItem('sticky_checkIn') || '');
  const [searchCheckOut, setSearchCheckOut] = useState(localStorage.getItem('sticky_checkOut') || '');
  const [searchGuests, setSearchGuests] = useState(localStorage.getItem('sticky_guests') || '');
  const [searchType, setSearchType] = useState('All');
  const [searchMaxPrice, setSearchMaxPrice] = useState(350);

  // Live status from SQLite backend
  const [dbRooms, setDbRooms] = useState([]);
  useEffect(() => {
    api.get('/hotel/public/rooms')
      .then(res => setDbRooms(res.data.data || []))
      .catch(() => {});
  }, []);

  const getLiveStatus = (roomName) => {
    const ofType = dbRooms.filter(r => r.type.toLowerCase() === roomName.toLowerCase());
    if (ofType.length === 0) return { text: '🟢 Available Today', color: 'text-green-700 bg-green-500/10 border-green-500/20' };
    const available = ofType.filter(r => r.status === 'Available');
    if (available.length === 0) {
      return { text: '🔴 Fully Booked', color: 'text-red-700 bg-red-500/10 border-red-500/20 dark:text-red-400' };
    } else if (available.length <= 2) {
      return { text: '🟡 Limited Rooms Left', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' };
    } else {
      return { text: '🟢 Available Today', color: 'text-green-700 bg-green-500/10 border-green-500/20 dark:text-green-400' };
    }
  };

  // Image carousels state
  const [sliderIndexes, setSliderIndexes] = useState({
    Single: 0,
    Twin: 0,
    Standard: 0,
    Deluxe: 0,
    Executive: 0,
    Suite: 0
  });

  const handlePrevImg = (roomName, imagesLength, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSliderIndexes(prev => ({
      ...prev,
      [roomName]: prev[roomName] === 0 ? imagesLength - 1 : prev[roomName] - 1
    }));
  };

  const handleNextImg = (roomName, imagesLength, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSliderIndexes(prev => ({
      ...prev,
      [roomName]: prev[roomName] === imagesLength - 1 ? 0 : prev[roomName] + 1
    }));
  };

  // Auto-loop: advance every room's carousel every 3 s
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndexes(prev => {
        const next = { ...prev };
        roomTypes.forEach(room => {
          const len = room.images?.length || 1;
          next[room.name] = ((prev[room.name] || 0) + 1) % len;
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Room Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleToggleCompare = (roomName) => {
    if (compareList.includes(roomName)) {
      setCompareList(prev => prev.filter(name => name !== roomName));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 rooms at a time.');
        return;
      }
      setCompareList(prev => [...prev, roomName]);
    }
  };

  // Quick Preview State
  const [previewRoom, setPreviewRoom] = useState(null);

  // Sticky Booking Bar visibility
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setStickyVisible(true);
      } else {
        setStickyVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = (roomName, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    localStorage.setItem('sticky_checkIn', searchCheckIn);
    localStorage.setItem('sticky_checkOut', searchCheckOut);
    localStorage.setItem('sticky_guests', searchGuests || '2');
    localStorage.setItem('sticky_roomType', roomName || 'All');
    navigate('/booking');
  };

  // Filter logic
  const filteredRooms = roomTypes.filter(room => {
    if (searchType !== 'All' && room.name.toLowerCase() !== searchType.toLowerCase()) return false;
    if (room.price > searchMaxPrice) return false;
    if (searchGuests && room.capacity < Number(searchGuests)) return false;
    return true;
  });

  return (
    <section className="pt-12 pb-24 relative bg-brand-50/10 dark:bg-ink-950/10">
      {/* Title */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mx-auto max-w-7xl px-4 text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Stay with us</p>
        <h1 className="mt-4 font-heading text-5xl font-light md:text-6xl text-zinc-900 dark:text-white">Rooms & Suites</h1>
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-light">
          Immerse yourself in unrivaled luxury and modern hospitality. Choose from our curated catalog of signature rooms tailored to meet every guest's needs.
        </p>
      </motion.div>

      {/* Search & Filter Section */}
      <div className="mx-auto max-w-7xl px-4 mb-16">
        <div className="glass-panel rounded-lg p-6 shadow-xl relative z-30">
          <div className="flex items-center gap-2 mb-4 text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">
            <SlidersHorizontal size={16} />
            <span>Search & Filter Rooms</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Check-in</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-2.5 text-xs outline-none focus:border-brand-500 text-zinc-800 dark:text-zinc-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Check-out</label>
              <input
                type="date"
                min={searchCheckIn || new Date().toISOString().split('T')[0]}
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-2.5 text-xs outline-none focus:border-brand-500 text-zinc-800 dark:text-zinc-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Guests</label>
              <select
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-2.5 text-xs outline-none focus:border-brand-500 text-zinc-800 dark:text-zinc-100 transition"
              >
                <option value="">Any Guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Room Type</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-2.5 text-xs outline-none focus:border-brand-500 text-zinc-800 dark:text-zinc-100 transition"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Twin">Twin</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Executive">Executive</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Max Price: ${searchMaxPrice}</label>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={searchMaxPrice}
                onChange={(e) => setSearchMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Room Cards list */}
      <div className="mx-auto max-w-7xl px-4 grid gap-16 lg:gap-24 mb-24">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => {
            const liveStatus = getLiveStatus(room.name);
            const activeSlide = sliderIndexes[room.name] || 0;
            const isCompared = compareList.includes(room.name);

            return (
              <motion.article
                key={room.name}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                className={`flex flex-col gap-8 md:items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
              >
                {/* Interactive Gallery Slider */}
                <div className="w-full md:w-1/2 overflow-hidden rounded-sm aspect-[4/3] shadow-2xl relative group bg-zinc-200 dark:bg-zinc-800">
                  <img
                    src={room.images[activeSlide]}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt={room.name}
                  />

                  {/* Left / Right Slider Arrows */}
                  <button
                    onClick={(e) => handlePrevImg(room.name, room.images.length, e)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/70 dark:bg-black/70 flex items-center justify-center text-zinc-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => handleNextImg(room.name, room.images.length, e)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/70 dark:bg-black/70 flex items-center justify-center text-zinc-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Slides indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {room.images.map((_, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setSliderIndexes(prev => ({ ...prev, [room.name]: idx })); }}
                        className={`h-2 w-2 rounded-full cursor-pointer transition ${idx === activeSlide ? 'bg-brand-500 scale-125' : 'bg-white/60'}`}
                      />
                    ))}
                  </div>

                  {/* Click to preview overlay */}
                  <div 
                    onClick={() => { setPreviewRoom(room); }}
                    className="absolute inset-0 bg-brand-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                  >
                    <button className="bg-white/90 text-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider dark:bg-ink-950 dark:text-white rounded-none">
                      Quick Preview
                    </button>
                  </div>
                </div>

                {/* Info and features Column */}
                <div className="w-full md:w-1/2 md:px-8">
                  {/* Status & Ratings */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${liveStatus.color}`}>
                      {liveStatus.text}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <div className="flex items-center text-amber-500 mr-1">
                        <Star size={14} className="fill-amber-500" />
                        <span className="font-bold ml-1">{room.rating}</span>
                      </div>
                      <span className="text-zinc-500">({room.reviewsCount} Reviews)</span>
                    </div>
                  </div>

                  <h2 className="font-heading text-3xl font-medium lg:text-4xl text-zinc-900 dark:text-white">{room.name}</h2>
                  <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-light">{room.details}</p>

                  {/* Bullet Amenities with Checkmark Icons */}
                  <div className="mt-6 grid grid-cols-2 gap-y-2 gap-x-4 border-t border-zinc-100 dark:border-zinc-900 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>{room.bedType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>Up to {room.capacity} Guests</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>Free High-speed Wi-Fi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>Air Conditioning</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>Smart TV Enabled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-brand-500" />
                      <span>Luxury Toiletries</span>
                    </div>
                  </div>

                  {/* Footer Compare + CTA */}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    {/* Compare Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => handleToggleCompare(room.name)}
                        className="h-4.5 w-4.5 rounded border-zinc-300 text-brand-500 focus:ring-brand-500/20"
                      />
                      <span>Compare Room</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <p className="text-zinc-400 text-left mr-2">
                        <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Starting From</span>
                        <span className="font-heading text-xl font-bold text-brand-500 dark:text-brand-400">${room.price}</span>
                        <span className="text-[10px] text-zinc-500">/ night</span>
                      </p>
                      
                      <div className="flex gap-2">
                        <Link 
                          to={`/rooms/${room.name.toLowerCase()}`}
                          className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition"
                        >
                          Details
                        </Link>
                        <button
                          onClick={(e) => handleBookNow(room.name, e)}
                          className="group flex items-center gap-1.5 bg-brand-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-brand-600 dark:text-ink-950 dark:hover:bg-brand-400"
                        >
                          Book Now <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        ) : (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-900">
            <InfoIcon size={40} className="mx-auto text-zinc-400 mb-4" />
            <h3 className="text-lg font-semibold">No matching rooms found</h3>
            <p className="text-sm text-zinc-500 mt-1">Try relaxing your search filters above.</p>
          </div>
        )}
      </div>

      {/* Special Offers Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Exclusive Deals</p>
          <h2 className="mt-3 font-heading text-3xl font-light md:text-4xl text-zinc-900 dark:text-white">Special Packages & Offers</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Tag size={20} />, title: 'Weekend Discount', desc: '15% Off base price room rates for stays checked in from Friday through Sunday. Late check-out included.', promo: '🎉 15% OFF' },
            { icon: <Heart size={20} />, title: 'Honeymoon Package', desc: 'Complimentary premium bottle of wine, customized chocolates, fresh room flowers, and late room check-out.', promo: '💑 COMPLIMENTARY' },
            { icon: <Smile size={20} />, title: 'Family Package', desc: 'Book multiple interconnected rooms with a kids-stay-free policy and complimentary hot breakfast buffets.', promo: '👨‍👩‍👧 KIDS FREE' },
            { icon: <Briefcase size={20} />, title: 'Business Traveler', desc: 'Complimentary high-speed premium Wi-Fi, express laundry services, study desk, and airport transfers.', promo: '🏢 BUSINESS VIP' },
          ].map((pkg) => (
            <div key={pkg.title} className="glass-panel p-6 rounded-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">{pkg.icon}</span>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded dark:bg-brand-950/40 dark:text-brand-300">{pkg.promo}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-white mb-2">{pkg.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{pkg.desc}</p>
              </div>
              <button 
                onClick={() => handleBookNow()}
                className="mt-6 w-full py-2 text-center text-xs font-semibold border border-brand-500/30 text-brand-600 hover:bg-brand-500 hover:text-white dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-ink-950 transition"
              >
                Apply Package
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-xl my-12">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Reviews</p>
          <h2 className="mt-3 font-heading text-3xl font-light md:text-4xl text-zinc-900 dark:text-white">Customer Testimonials</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: 'Sarah M.', text: 'Excellent service and exceptionally clean rooms. The staff at Vora Addis made me feel right at home. I will absolutely return!', rating: 5 },
            { name: 'Daniel K.', text: 'Best hotel experience in Addis Ababa. The executive room had high-speed Wi-Fi that was perfect for remote corporate business work.', rating: 5 },
            { name: 'Marcus T.', text: 'The dining experience was outstanding and the gym facilitates peak performance. Everything was perfectly integrated.', rating: 5 },
          ].map((t, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-md shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-zinc-600 dark:text-zinc-300 font-light">"{t.text}"</p>
              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-900 pt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-950 dark:text-white">— {t.name}</span>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} className="fill-amber-500" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotel Statistics Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { val: '150+', label: 'Luxury Rooms' },
            { val: '5000+', label: 'Happy Guests' },
            { val: '24/7', label: 'Dedicated Support' },
            { val: '10+', label: 'Years Experience' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 border border-zinc-100 dark:border-zinc-900 rounded bg-white dark:bg-zinc-900 shadow-sm hover:border-brand-500/40 transition">
              <p className="font-heading text-4xl font-light text-brand-500">{stat.val}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Bottom Booking Bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-ink-950/95 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-brand-500/20 backdrop-blur-md py-4 px-4"
          >
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-brand-500" />
                  <span>Check-in:</span>
                  <input
                    type="date"
                    value={searchCheckIn}
                    onChange={(e) => setSearchCheckIn(e.target.value)}
                    className="border-b border-zinc-300 dark:border-zinc-700 bg-transparent text-xs py-0.5 outline-none focus:border-brand-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Check-out:</span>
                  <input
                    type="date"
                    value={searchCheckOut}
                    onChange={(e) => setSearchCheckOut(e.target.value)}
                    className="border-b border-zinc-300 dark:border-zinc-700 bg-transparent text-xs py-0.5 outline-none focus:border-brand-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Guests:</span>
                  <select
                    value={searchGuests}
                    onChange={(e) => setSearchGuests(e.target.value)}
                    className="bg-transparent text-xs border-b border-zinc-300 dark:border-zinc-700 py-0.5 outline-none text-zinc-950 dark:text-white"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => handleBookNow()}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white dark:text-ink-950 dark:hover:bg-brand-400 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest shadow-md transition"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Room Comparison Drawer */}
      {compareList.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-20 left-4 z-40 bg-zinc-950 text-white rounded shadow-xl border border-brand-500 p-4 max-w-sm w-full mx-4 sm:mx-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><SlidersHorizontal size={12} className="text-brand-500" /> Compare Rooms ({compareList.length})</h4>
            <button onClick={() => setCompareList([])} className="text-zinc-400 hover:text-white"><X size={14} /></button>
          </div>
          <div className="flex gap-2 mb-3">
            {compareList.map(name => (
              <div key={name} className="flex-1 bg-zinc-900 rounded p-1.5 text-center text-[10px] relative font-semibold">
                <span className="block truncate">{name}</span>
                <button onClick={() => handleToggleCompare(name)} className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-white text-[8px]"><X size={8} /></button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowCompareModal(true)}
            className="w-full bg-brand-500 text-zinc-950 hover:bg-brand-400 py-2 text-center text-xs font-bold uppercase tracking-widest transition"
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Quick Preview Modal overlay */}
      {previewRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setPreviewRoom(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white h-8 w-8 rounded-full flex items-center justify-center transition"
            >
              <X size={16} />
            </button>
            <div className="relative aspect-[16/9] bg-zinc-200">
              <img src={previewRoom.image} className="w-full h-full object-cover" alt={previewRoom.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500 px-2 py-0.5 rounded">
                  {previewRoom.name} Room
                </span>
                <h3 className="text-3xl font-heading font-medium mt-1">{previewRoom.name}</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Star size={14} className="fill-amber-500" />
                  <span className="font-bold">{previewRoom.rating}</span>
                  <span className="text-zinc-500">({previewRoom.reviewsCount} reviews)</span>
                </div>
                <p className="font-heading text-lg font-bold text-brand-500">
                  ${previewRoom.price} <span className="text-xs font-normal text-zinc-500">/ Night</span>
                </p>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">{previewRoom.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {previewRoom.amenitiesList.map(a => (
                  <span key={a} className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 px-2 py-0.5">
                    {a}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPreviewRoom(null)}
                  className="flex-1 py-3 text-center border border-zinc-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const name = previewRoom.name;
                    setPreviewRoom(null);
                    handleBookNow(name);
                  }}
                  className="flex-2 py-3 bg-brand-500 hover:bg-brand-600 text-white dark:text-ink-950 dark:hover:bg-brand-400 text-xs font-bold uppercase tracking-widest transition"
                >
                  Book This Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Comparison Modal Table */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-heading font-medium flex items-center gap-2"><SlidersHorizontal size={18} className="text-brand-500" /> Side-by-Side Room Comparison</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-3 px-4 font-semibold text-zinc-500">Feature</th>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <th key={name} className="py-3 px-4 font-semibold text-zinc-900 dark:text-white text-center w-64">
                          <span className="block text-sm font-bold uppercase text-brand-600 dark:text-brand-400">{name}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Image</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4">
                          <img src={roomObj.image} className="h-24 w-full object-cover rounded shadow" alt={name} />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Price / Night</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4 text-center font-heading text-lg font-bold text-brand-500">
                          ${roomObj.price}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Capacity</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4 text-center text-zinc-800 dark:text-zinc-200 font-medium">
                          {roomObj.capacity} Guests
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Bed Type</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4 text-center text-zinc-800 dark:text-zinc-200 font-medium">
                          {roomObj.bedType}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Rating</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4 text-center text-zinc-800 dark:text-zinc-200">
                          <div className="flex justify-center items-center gap-1">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            <span className="font-bold">{roomObj.rating}</span>
                            <span className="text-zinc-500">({roomObj.reviewsCount})</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Live Availability</td>
                    {compareList.map(name => {
                      const liveStatus = getLiveStatus(name);
                      return (
                        <td key={name} className="py-3 px-4 text-center">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${liveStatus.color}`}>
                            {liveStatus.text.replace('Today', '')}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-500 font-medium">Premium Amenities</td>
                    {compareList.map(name => {
                      const roomObj = roomTypes.find(r => r.name === name);
                      return (
                        <td key={name} className="py-3 px-4 text-center">
                          <div className="flex flex-wrap justify-center gap-1 max-w-[180px] mx-auto">
                            {roomObj.amenitiesList.slice(0, 5).map(a => (
                              <span key={a} className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] text-zinc-600 dark:text-zinc-300">
                                {a}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-4 px-4"></td>
                    {compareList.map(name => (
                      <td key={name} className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            handleBookNow(name);
                          }}
                          className="w-full bg-brand-500 hover:bg-brand-600 text-white dark:text-ink-950 dark:hover:bg-brand-400 py-2.5 text-xs font-bold uppercase tracking-wider transition"
                        >
                          Book Now
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function Gallery() {
  const categories = ['All', 'Rooms', 'Restaurant', 'Gym', 'Night Club', 'Venue'];

  const galleryItems = [
    // Rooms
    { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Standard Room', span: 'row-span-2' },
    { src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Deluxe Room' },
    { src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Executive Room' },
    { src: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Presidential Suite', span: 'col-span-2' },
    { src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Room Interior' },
    { src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80', cat: 'Rooms', label: 'Bathroom' },
    // Restaurant
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80', cat: 'Restaurant', label: 'Fine Dining', span: 'col-span-2' },
    { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80', cat: 'Restaurant', label: 'Culinary Art' },
    { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', cat: 'Restaurant', label: 'Chef\'s Table', span: 'row-span-2' },
    { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', cat: 'Restaurant', label: 'Signature Dishes' },
    { src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80', cat: 'Restaurant', label: 'Cocktail Bar' },
    // Gym
    { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', cat: 'Gym', label: 'Fitness Center', span: 'row-span-2' },
    { src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80', cat: 'Gym', label: 'Equipment' },
    { src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80', cat: 'Gym', label: 'Training Zone' },
    { src: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80', cat: 'Gym', label: 'Wellness Spa', span: 'col-span-2' },
    // Night Club
    { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80', cat: 'Night Club', label: 'Club Floor', span: 'col-span-2' },
    { src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', cat: 'Night Club', label: 'VIP Lounge' },
    { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', cat: 'Night Club', label: 'DJ Booth', span: 'row-span-2' },
    { src: 'https://images.unsplash.com/photo-1536436435342-8ba5d62fcf8d?auto=format&fit=crop&w=1200&q=80', cat: 'Night Club', label: 'Light Show' },
    // Venue
    { src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80', cat: 'Venue', label: 'Conference Hall', span: 'col-span-2' },
    { src: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', cat: 'Venue', label: 'Hotel Exterior', span: 'row-span-2' },
    { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', cat: 'Venue', label: 'Lobby' },
    { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', cat: 'Venue', label: 'Meeting Room' },
  ];

  const [activeTab, setActiveTab] = useState('All');
  const [lightbox, setLightbox] = useState(null); // index into filtered array

  const filtered = activeTab === 'All' ? galleryItems : galleryItems.filter(i => i.cat === activeTab);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + filtered.length) % filtered.length);
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, filtered.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      {/* Header */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}
        className="text-center mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Visual Tour</p>
        <h1 className="mt-4 font-heading text-5xl font-light">Our Gallery</h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
          Explore every corner of Vora Addis — from opulent suites and fine dining to electrifying nights and elite wellness.
        </p>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveTab(cat); setLightbox(null); }}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full border transition-all duration-200 ${
              activeTab === cat
                ? 'bg-brand-500 border-brand-500 text-zinc-950 shadow-lg shadow-brand-500/30'
                : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-brand-400 hover:text-brand-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Masonry-style Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[220px]"
        >
          {filtered.map((item, idx) => (
            <motion.div
              key={item.src + activeTab}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              onClick={() => setLightbox(idx)}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${item.span || ''}`}
            >
              <img
                src={item.src}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-brand-400 text-[10px] uppercase tracking-widest font-bold">{item.cat}</p>
              </div>
              {/* Zoom icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-6-3v6m-3-3h6" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Image count */}
      <p className="text-center text-xs text-zinc-400 mt-8 font-light">
        Showing <span className="text-brand-500 font-semibold">{filtered.length}</span> photos
        {activeTab !== 'All' && <> in <span className="text-white font-semibold">{activeTab}</span></>}
      </p>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            {/* Prev button */}
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + filtered.length) % filtered.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center text-white transition z-10"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-16 rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={filtered[lightbox].src}
                alt={filtered[lightbox].label}
                className="w-full h-full object-cover max-h-[85vh]"
              />
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5">
                <p className="text-white font-semibold text-lg">{filtered[lightbox].label}</p>
                <p className="text-brand-400 text-xs uppercase tracking-widest font-bold mt-0.5">{filtered[lightbox].cat}</p>
              </div>
              {/* Counter */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {lightbox + 1} / {filtered.length}
              </div>
            </motion.div>

            {/* Next button */}
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % filtered.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center text-white transition z-10"
            >
              <ChevronRight size={22} />
            </button>

            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center text-white transition z-10"
            >
              <X size={18} />
            </button>

            {/* ESC hint */}
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-zinc-500 text-xs tracking-widest">
              ← → to navigate · ESC to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Contact() { 
  return <section className="mx-auto grid max-w-7xl gap-16 px-4 py-24 lg:grid-cols-2">
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="lg:pr-12">
      <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Reach Us</motion.p>
      <motion.h1 variants={fadeUp} className="mt-4 font-heading text-5xl font-light">Contact <span className="font-semibold">Vora Addis</span></motion.h1>
      <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">We are at your service. Contact our team for reservations, event planning, or any special requests.</motion.p>
      
      <motion.div variants={staggerContainer} className="mt-12 space-y-6">
        <motion.div variants={fadeUp} className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-ink-900"><MapPin size={20} className="text-brand-600 dark:text-brand-400"/></div>
          <div>
            <h4 className="font-heading font-medium">Address</h4>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">Bambis, Addis Ababa, Ethiopia</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-ink-900"><Phone size={20} className="text-brand-600 dark:text-brand-400"/></div>
          <div>
            <h4 className="font-heading font-medium">Phone</h4>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">+251 11 130 2923</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-ink-900"><Mail size={20} className="text-brand-600 dark:text-brand-400"/></div>
          <div>
            <h4 className="font-heading font-medium">Email</h4>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">reservations@voraaddis.example</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
    
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="relative">
      <div className="glass-panel relative z-10 rounded-sm p-8 md:p-10">
        <h3 className="font-heading text-2xl font-medium mb-6">Send a Message</h3>
        <form className="space-y-4">
          <input className="w-full border-b border-zinc-300 bg-transparent px-0 py-4 text-sm placeholder-zinc-500 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:text-white dark:focus:border-brand-400" placeholder="Your Full Name"/>
          <input className="w-full border-b border-zinc-300 bg-transparent px-0 py-4 text-sm placeholder-zinc-500 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:text-white dark:focus:border-brand-400" placeholder="Email Address"/>
          <textarea className="h-32 w-full resize-none border-b border-zinc-300 bg-transparent px-0 py-4 text-sm placeholder-zinc-500 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:text-white dark:focus:border-brand-400" placeholder="Your Message"/>
          <button className="mt-4 w-full bg-brand-900 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-brand-800 dark:bg-brand-500 dark:text-ink-950 dark:hover:bg-brand-400">Submit Request</button>
        </form>
      </div>
      <div className="absolute -bottom-6 -right-6 h-64 w-64 bg-brand-500/20 blur-3xl filter dark:bg-brand-500/10"></div>
    </motion.div>
  </section>; 
}

export function FAQ() { 
  return <section className="mx-auto max-w-3xl px-4 py-24">
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Support</p>
      <h1 className="mt-4 font-heading text-4xl font-light md:text-5xl">Frequently Asked Questions</h1>
    </motion.div>
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-4">
      {faqs.map(([q,a], index) => (
        <motion.details key={q} variants={fadeUp} className="group border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <summary className="flex cursor-pointer items-center justify-between font-heading text-lg font-medium outline-none list-none">
            {q}
            <span className="text-brand-500 transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{a}</p>
        </motion.details>
      ))}
    </motion.div>
  </section>; 
}

function Info({ title, subtitle, image, text }) { 
  return <section>
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={imageZoom} className="relative h-[60vh] min-h-[500px] w-full overflow-hidden origin-center">
      <img src={image} className="h-full w-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent"/>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="absolute bottom-0 left-0 w-full px-4 pb-16 pt-32 text-center text-white">
        <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">{subtitle}</motion.p>
        <motion.h1 variants={fadeUp} className="mt-4 font-heading text-5xl font-light md:text-7xl">{title}</motion.h1>
      </motion.div>
    </motion.div>
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="mx-auto max-w-3xl px-4 py-20 text-center">
      <motion.p variants={fadeUp} className="text-xl leading-relaxed font-light text-zinc-700 dark:text-zinc-300 md:text-2xl md:leading-relaxed">{text}</motion.p>
      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <Link to="/booking" className="group flex h-14 items-center gap-3 bg-brand-900 px-8 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-brand-800 dark:bg-brand-500 dark:text-ink-950 dark:hover:bg-brand-400">
          Reserve Now <ChevronRight size={18} className="transition-transform group-hover:translate-x-1"/>
        </Link>
      </motion.div>
    </motion.div>
  </section>; 
}
