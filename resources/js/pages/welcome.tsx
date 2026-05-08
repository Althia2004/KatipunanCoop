import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Menu, X, ArrowRight, Check, Phone, Mail, MapPin, Clock,
    Facebook, Users, Banknote, CalendarDays, TreePalm, ShoppingCart,
    CreditCard, Smartphone, Shield, FileText,
    GraduationCap, UserCheck, IdCard, Quote, ChevronRight,
    BadgeCheck,
} from 'lucide-react';
import AdminLoginModal from '@/components/admin-login-modal';

// ── static data ──────────────────────────────────────────────────────────────

const SERVICES = [
    { n: '01', title: 'Copra Buy & Sell', desc: 'We buy and process copra from members at fair market prices.' },
    { n: '02', title: 'Consumer Store', desc: 'A store open for cash and credit to members.' },
    { n: '03', title: 'Hollow Block & Hardware', desc: 'Construction materials available at cheaper prices for members.' },
    { n: '04', title: 'Lending Services', desc: "Money credit with flexible terms aligned to farmers' harvest cycles." },
    { n: '05', title: 'Piggery Farm', desc: 'Cooperative piggery for fattening and selling of livestock.' },
    { n: '06', title: 'Meat Processing', desc: 'Processing business that produces local meat products for members.' },
    { n: '07', title: 'Savings & Capital Share', desc: 'Build your financial future through cooperative savings.' },
];

const STEPS = [
    { icon: FileText,      label: 'Submit Inquiry Form',          desc: 'Fill out your personal information at our office.' },
    { icon: GraduationCap, label: 'Attend Pre-Membership Seminar', desc: 'Required orientation before approval.' },
    { icon: UserCheck,     label: 'Board Approval',               desc: 'Staff confirms your seminar attendance.' },
    { icon: IdCard,        label: 'Receive Member Portal Access',  desc: 'View loans, savings, and dividends online.' },
];

const TESTIMONIALS = [
    {
        quote: 'We are grateful for partnerships that allow us to mentor students and share our cooperative journey with the next generation.',
        name: 'Cooperative Leadership',
        role: 'Board of Directors',
    },
    {
        quote: 'KSCFMPC helped me process my copra harvests and gain better market access. My family\'s livelihood has improved greatly.',
        name: 'Juan dela Cruz',
        role: 'Member Farmer',
    },
    {
        quote: 'My immersion at KSCFMPC taught me professionalism and effective communication. A truly valuable learning experience.',
        name: 'Maria Santos',
        role: 'Student Intern',
    },
];

// ── component ────────────────────────────────────────────────────────────────

export default function Welcome({
    canResetPassword = true,
    announcements = [],
}: {
    canRegister?: boolean;
    canResetPassword?: boolean;
    announcements?: Array<{ id: number; date: string; title: string; desc: string; category: string }>;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { auth, currentTeam } = usePage().props as {
        auth: { user?: { role?: string } };
        currentTeam?: { slug: string };
    };

    const getDashboardUrl = () => {
        const role = auth.user?.role;
        if (role === 'superadmin') return '/superadmin/dashboard';
        if (role === 'member') return '/member/dashboard';
        if (role === 'manager') return '/manager/dashboard';
        if (role === 'board') return '/board/dashboard';
        if (role === 'bookkeeper') return '/bookkeeper/dashboard';
        if (role === 'hr') return '/hr/dashboard';
        if (currentTeam?.slug) return `/${currentTeam.slug}/dashboard`;
        return '/dashboard';
    };

    const dashboardUrl = getDashboardUrl();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const navLinks = [
        { label: 'Home',          href: '#home' },
        { label: 'About Us',      href: '#about' },
        { label: 'Our Programs',  href: '#services' },
        { label: 'Announcements', href: '#announcements' },
        { label: 'Contact Us',    href: '#contact' },
    ];

    return (
        <>
            <Head title="Welcome — KSCFMPC">
                <style>{`
                    html { scroll-behavior: smooth; }
                    @keyframes marquee-left {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-track { animation: marquee-left 18s linear infinite; }
                    .marquee-track:hover { animation-play-state: paused; }
                `}</style>
            </Head>

            {/* ── Announcement Bar ── */}
            <div className="bg-[#c8920a] text-white text-sm text-center py-2 px-4 font-medium">
                📢 Next General Assembly: Every 3rd Thursday of the month — All members are encouraged to attend.
            </div>

            {/* ── Sticky Navbar ── */}
            <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                               src="/images/Sample - Logo(KSCF MPC).png"
                                alt="KSCFMPC Logo"
                                className="w-10 h-10 rounded-full object-cover shrink-0 mix-blend-multiply bg-transparent"
                            />
                        <div className="leading-tight">
                            <p className="font-bold text-[#2d5a27] text-sm">KSCFMPC</p>
                            <p className="text-[10px] text-zinc-400 hidden sm:block">Katipunan, Davao del Norte</p>
                        </div>
                    </div>

                    {/* Center nav links */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href}
                                className="text-sm font-medium text-zinc-600 hover:text-[#2d5a27] transition">
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        {auth.user ? (
                            <Link href={dashboardUrl}
                                className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3e1a] transition">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/member/login"
                                    className="px-4 py-2 border-2 border-[#2d5a27] text-[#2d5a27] text-sm font-semibold rounded-lg hover:bg-[#2d5a27] hover:text-white transition">
                                    Member Portal
                                </Link>
                                <button onClick={() => setAdminModalOpen(true)}
                                    className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3e1a] transition">
                                    Login
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="lg:hidden p-2 text-zinc-500" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="lg:hidden bg-white border-t border-zinc-100 px-4 py-4 space-y-3">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block text-sm font-medium text-zinc-600 py-1 hover:text-[#2d5a27]">
                                {link.label}
                            </a>
                        ))}
                        <div className="flex gap-3 pt-2">
                            <Link href="/member/login"
                                onClick={() => setMenuOpen(false)}
                                className="flex-1 py-2.5 border-2 border-[#2d5a27] text-[#2d5a27] text-sm font-semibold rounded-lg text-center hover:bg-[#2d5a27] hover:text-white transition">
                                Member Portal
                            </Link>
                            <button onClick={() => { setAdminModalOpen(true); setMenuOpen(false); }}
                                className="flex-1 py-2.5 bg-[#2d5a27] text-white text-sm font-semibold rounded-lg">
                                Login
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* ── Hero ── */}
                <section id="home" className="bg-[#f5f0e8] py-20 px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="inline-block px-3 py-1 bg-[#2d5a27]/10 text-[#2d5a27] text-xs font-semibold rounded-full tracking-wide">
                                Est. 1993 • Katipunan, Davao del Norte
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] leading-tight">
                                Empowering Coconut Farmers Through
                                <span className="text-[#2d5a27]"> Unity and Cooperation</span>
                            </h1>
                            <p className="text-zinc-600 text-lg leading-relaxed">
                                KSCFMPC provides financial services, livelihood programs, and community support
                                to help farmers and their families thrive.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <a href="#about"
                                    className="px-6 py-3 bg-[#2d5a27] text-white font-semibold rounded-xl hover:bg-[#1e3e1a] transition">
                                    Learn More
                                </a>
                                <button
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-6 py-3 border-2 border-[#2d5a27] text-[#2d5a27] font-semibold rounded-xl hover:bg-[#2d5a27]/5 transition">
                                    Become a Member
                                </button>
                            </div>
                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-5 pt-2">
                                {['CDA Registered', 'Since 1993', 'Member-Owned'].map(b => (
                                    <span key={b} className="flex items-center gap-1.5 text-sm text-[#2d5a27] font-medium">
                                        <BadgeCheck className="w-4 h-4" /> {b}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Logo with glow */}
                        <div className="flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-[#2d5a27]/20 blur-3xl scale-125" />
                                    <img
                                        src="/images/katipunanLogo.png"
                                        alt="KSCFMPC Logo"
                                        className="relative w-56 h-56 lg:w-72 lg:h-72 object-contain drop-shadow-2xl"
                                    />
                                </div>                      
                        </div>
                    </div>
                </section>

                {/* Banner below hero */}
                <div className="relative h-48 lg:h-64 bg-[#2d5a27] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '24px 24px' }} />
                    <p className="relative text-white text-2xl lg:text-4xl font-bold text-center px-4 drop-shadow-lg">
                         Rooted in Community. Growing Together.
                    </p>
                </div>

                {/* ── Stats Bar ── */}
                <section className="bg-[#1e3e1a] text-white py-10 px-4">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        {[
                            { icon: TreePalm,    value: '500+',    label: 'Active Members' },
                            { icon: Banknote,    value: '₱50,000', label: 'Max Loan Amount' },
                            { icon: CalendarDays,value: '30+ Years',label: 'of Service' },
                            { icon: Users,       value: '7',       label: 'Board Directors' },
                        ].map(s => (
                            <div key={s.label} className="flex flex-col items-center gap-2">
                                <s.icon className="w-6 h-6 text-[#c8920a]" />
                                <p className="text-3xl font-extrabold text-[#c8920a]">{s.value}</p>
                                <p className="text-sm text-white/70">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── What We Do ── */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">How We Help Our Members</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: TreePalm,    title: 'For Farmers',   desc: 'Crop assistance, supplies, and copra buying at fair market prices.' },
                                { icon: Banknote,    title: 'For Borrowers', desc: 'Affordable lending with flexible terms aligned to harvest cycles.' },
                                { icon: ShoppingCart,title: 'For Consumers', desc: 'Access to consumer store and hardware supplies at lower prices.' },
                            ].map(card => (
                                <div key={card.title}
                                    className="bg-[#2d5a27] rounded-2xl p-8 flex flex-col gap-4 hover:bg-[#1e3e1a] transition group">
                                    <div className="w-12 h-12 bg-[#c8920a]/20 rounded-xl flex items-center justify-center">
                                        <card.icon className="w-6 h-6 text-[#c8920a]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                                    <p className="text-white/70 text-sm leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Who We Are ── */}
                <section id="about" className="py-20 px-4 bg-[#f5f0e8]">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-[#1a1a1a]">Rooted in Community Since 1993</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Katipunan Small Coconut Farmers Multi Purpose Cooperative was established to empower
                                local coconut farming families through cooperative economics. We believe in shared
                                growth, transparent governance, and sustainable livelihood programs that uplift every member.
                            </p>
                            <ul className="space-y-3">
                                {['Sustainable credit operations', 'Livelihood development programs',
                                  'Community-first governance', 'Transparent financial management'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-zinc-700">
                                        <Check className="w-5 h-5 text-[#2d5a27] shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a href="#governance"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5a27] text-white font-semibold rounded-xl hover:bg-[#1e3e1a] transition">
                                Meet Our Board <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="rounded-3xl bg-[#2d5a27]/10 h-80 lg:h-96 flex items-center justify-center border-2 border-dashed border-[#2d5a27]/10">
                            <div className="text-center text-zinc-300">
                                
                                <img
                                  src="/images/Katipunan4.jpg"
                                   alt="Cooperative Office"
                                  className="w-full h-full object-cover"
                               />
                          </div>
                        </div>
                    </div>
                </section>

                {/* ── Our Services ── */}
                <section id="services" className="py-20 px-4 bg-[#2d5a27]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-3">Our Programs & Services</h2>
                        <p className="text-white/50 text-center mb-12">Serving the cooperative community across multiple sectors</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {SERVICES.map(s => (
                                <div key={s.n} className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition group cursor-default">
                                    <p className="text-[#c8920a] text-3xl font-extrabold mb-3">{s.n}</p>
                                    <h3 className="text-white font-bold mb-2">{s.title}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                                    <ArrowRight className="w-4 h-4 text-[#c8920a] mt-4 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Membership Steps ── */}
                <section id="how-it-works" className="py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-3">Becoming a Member is Simple</h2>
                        <p className="text-zinc-500 text-center mb-14">Follow these 4 steps to join our cooperative family</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {STEPS.map((step, i) => (
                                <div key={step.label} className="relative text-center space-y-4">
                                    <div className="relative mx-auto w-16 h-16 rounded-full bg-[#2d5a27] text-white flex items-center justify-center ring-4 ring-[#2d5a27]/20">
                                        <step.icon className="w-7 h-7" />
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#c8920a] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-[#1a1a1a]">{step.label}</h3>
                                    <p className="text-zinc-500 text-sm">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-zinc-400 mt-10 italic">
                            Registration is processed by our staff. Walk-in inquiries are welcome at our office.
                        </p>
                    </div>
                </section>

                {/* ── Why Choose Us ── */}
                <section className="py-20 px-4 bg-[#f5f0e8]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">Why Pick Us</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Users,       title: 'Community Owned',       desc: 'Every member has a voice in cooperative decisions.' },
                                { icon: CreditCard,  title: 'Flexible Loan Terms',   desc: 'Repayment schedules aligned with harvest seasons.' },
                                { icon: Smartphone,  title: 'Digital Member Portal', desc: 'View your account, loans, and savings anytime.' },
                                { icon: Shield,      title: 'Transparent Governance',desc: 'Board meetings held every 3rd Wednesday of the month.' },
                            ].map(f => (
                                <div key={f.title}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 hover:shadow-md hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 bg-[#2d5a27]/10 rounded-xl flex items-center justify-center mb-4">
                                        <f.icon className="w-6 h-6 text-[#2d5a27]" />
                                    </div>
                                    <h3 className="font-bold text-[#1a1a1a] mb-2">{f.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className="py-20 px-4 bg-[#2d5a27]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">What Our Members Say</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map(t => (
                                <div key={t.name} className="bg-white/10 rounded-2xl p-6 space-y-4">
                                    <Quote className="w-8 h-8 text-[#c8920a] opacity-60" />
                                    <p className="text-white/80 text-sm leading-relaxed italic">{t.quote}</p>
                                    <div>
                                        <p className="font-bold text-white">{t.name}</p>
                                        <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Announcements ── */}
                <section id="announcements" className="py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">Latest Announcements</h2>
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {announcements.length === 0 ? (
                                <div className="col-span-3 text-center py-12 text-zinc-400">
                                    <p>No announcements yet. Check back soon.</p>
                                </div>
                            ) : announcements.map(a => (
                                <div key={a.id}
                                    className="border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition space-y-3">
                                    <span className="inline-block px-3 py-1 bg-[#c8920a]/15 text-[#c8920a] text-xs font-semibold rounded-full">
                                        {a.date}
                                    </span>
                                    <h3 className="font-bold text-[#1a1a1a]">{a.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{a.desc}</p>
                                    <a href="#" className="inline-flex items-center gap-1 text-sm text-[#2d5a27] font-semibold hover:underline">
                                        Read More <ChevronRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <a href="#" className="px-6 py-3 border-2 border-[#2d5a27] text-[#2d5a27] font-semibold rounded-xl hover:bg-[#2d5a27]/5 transition inline-block">
                                View All Announcements
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── Contact ── */}
                <section id="contact" className="py-20 px-4 bg-[#f5f0e8]">
                    {/* Scrolling marquee */}
                    <div className="overflow-hidden mb-12 py-5 bg-[#c8920a]/10 rounded-2xl">
                        <div className="flex marquee-track w-max">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <span key={i} className="text-[#c8920a] font-bold text-xl whitespace-nowrap px-10">
                                    Let&apos;s talk ✳ Contact Us ✳ Get in Touch ✳
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                        {/* Contact info */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-[#1a1a1a]">Get in Touch</h2>
                            <div className="space-y-5">
                                {[
                                    { icon: MapPin, label: 'Address',      value: 'Katipunan, Davao del Norte, Philippines' },
                                    { icon: Phone,  label: 'Phone',        value: '+63 XXX XXX XXXX' },
                                    { icon: Mail,   label: 'Email',        value: 'kscfmpc@email.com' },
                                    { icon: Clock,  label: 'Office Hours', value: 'Mon–Fri: 8:00 AM – 5:00 PM' },
                                ].map(c => (
                                    <div key={c.label} className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                            <c.icon className="w-5 h-5 text-[#2d5a27]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{c.label}</p>
                                            <p className="text-zinc-700 font-medium mt-0.5">{c.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact form */}
                        <form className="space-y-4 bg-white rounded-2xl p-8 shadow-sm border border-zinc-100"
                            onSubmit={e => e.preventDefault()}>
                            <h3 className="font-bold text-[#1a1a1a] text-xl mb-2">Send us a Message</h3>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                                <input type="text" placeholder="Your full name"
                                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                                <input type="email" placeholder="your@email.com"
                                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
                                <textarea rows={4} placeholder="How can we help you?"
                                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27] resize-none" />
                            </div>
                            <button type="submit"
                                className="w-full py-3 bg-[#2d5a27] text-white font-semibold rounded-xl hover:bg-[#1e3e1a] transition">
                                Send Message
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer id="governance" className="bg-[#1a2e17] text-white pt-16 pb-8 px-4">
                <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2d5a27] flex items-center justify-center text-white font-bold text-sm select-none">K</div>
                            <span className="font-bold">KSCFMPC</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Empowering coconut farmers through unity, cooperation, and sustainable development since 1993.
                        </p>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
                            <Facebook className="w-4 h-4" /> Facebook Page
                        </a>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#c8920a] mb-4">Services</h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                            {SERVICES.slice(0, 5).map(s => (
                                <li key={s.n} className="hover:text-white transition cursor-default">{s.title}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#c8920a] mb-4">About</h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                            {['Our History', 'Mission & Vision', 'Board of Directors', 'Membership', 'Announcements'].map(l => (
                                <li key={l} className="hover:text-white transition cursor-default">{l}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#c8920a] mb-4">Contact</h4>
                        <ul className="space-y-3 text-white/60 text-sm">
                            <li className="flex gap-2 items-start"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> Katipunan, Davao del Norte</li>
                            <li className="flex gap-2"><Phone className="w-4 h-4 shrink-0" /> +63 XXX XXX XXXX</li>
                            <li className="flex gap-2"><Mail className="w-4 h-4 shrink-0" /> kscfmpc@email.com</li>
                            <li className="flex gap-2"><Clock className="w-4 h-4 shrink-0" /> Mon–Fri: 8AM – 5PM</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 text-center text-white/40 text-xs">
                    © 2026 Katipunan Small Coconut Farmers Multi Purpose Cooperative. All rights reserved.
                </div>
            </footer>

            {/* ── Modals ── */}
            <AdminLoginModal open={adminModalOpen} onOpenChange={setAdminModalOpen} canResetPassword={canResetPassword} />
        </>
    );
}


