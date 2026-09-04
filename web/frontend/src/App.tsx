import { type ReactNode, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Eye,
  EyeOff,
  FileCode2,
  Github,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  RotateCcw,
  ScanSearch,
  ServerCog,
  ShieldAlert,
  TerminalSquare,
  X,
  XCircle,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import {
  analyzePassword,
  PasswordLensApiError,
  type PasswordAnalysis,
  type PasswordFinding,
  type ExposureStatus,
} from '@/lib/api';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const examples = [
  { label: 'P@55w0rd', value: 'P@55w0rd' },
  { label: 'Password123!', value: 'Password123!' },
  { label: 'qwerty123!', value: 'qwerty123!' },
  { label: 'Summer2026!', value: 'Summer2026!' },
];

const navItems = [
  { label: 'Analyzer', href: '#analyzer' },
  { label: 'How it works', href: '#method' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Privacy', href: '#privacy' },
];

function StatusDot({ tone = 'neutral' }: { tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const colors = {
    neutral: 'bg-[#8b919a]',
    good: 'bg-[#32744c]',
    warn: 'bg-[#a16b16]',
    bad: 'bg-[#ad3830]',
  };
  return <span aria-hidden="true" className={`inline-block size-1.5 rounded-full ${colors[tone]}`} />;
}

function SectionKicker({ children, number }: { children: ReactNode; number?: string }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737984]">
      {number && <span className="font-mono text-[#097fb1]">{number}</span>}
      <span className="h-px w-8 bg-[#b8bdc0]" />
      <span>{children}</span>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="relative flex size-8 items-center justify-center border border-[#b9c1c4] bg-[#222a38] text-[#c9dc54]" aria-hidden="true">
      <span className="absolute inset-[5px] border border-[#69737c]" />
      <span className="relative block h-2 w-2 bg-[#c9dc54]" />
    </span>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleMenu = () => {
    setMobileOpen((open) => !open);
    onMenu();
  };

  return (
    <header className="relative z-20 border-b border-[#d8d5cc]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#top" className="focus-ring flex items-center gap-3" data-testid="link-home">
          <LogoMark />
          <span className="text-sm font-bold tracking-[-0.03em] text-[#222a38]">PasswordLens</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring text-[11px] font-semibold uppercase tracking-[0.12em] text-[#737984] transition-colors hover:text-[#222a38]"
              data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 font-mono text-[10px] text-[#737984] sm:flex">
            <StatusDot tone="good" /> NO TRACKING
          </div>
          <a
            href={import.meta.env.VITE_GITHUB_URL ?? 'https://github.com/'}
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#737984] transition-colors hover:text-[#222a38] sm:inline-flex"
            data-testid="link-header-github"
          >
            GitHub <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            onClick={handleMenu}
            className="focus-ring flex size-9 items-center justify-center border border-[#cdd0cd] text-[#222a38] md:hidden"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#d8d5cc] px-5 py-3 md:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="focus-ring block border-b border-[#e2dfd7] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6673]"
                data-testid={`link-mobile-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {item.label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Analyzer({
  password,
  setPassword,
  checkExposure,
  setCheckExposure,
  onAnalyze,
  onClear,
  isLoading,
  analysis,
  error,
}: {
  password: string;
  setPassword: (password: string) => void;
  checkExposure: boolean;
  setCheckExposure: (checked: boolean) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  analysis: PasswordAnalysis | null;
  error: PasswordLensApiError | null;
}) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseExample = (value: string) => {
    setPassword(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div id="analyzer" className="scroll-mt-24">
      <div className="border border-[#455160] bg-[#202735] p-5 shadow-[0_16px_40px_rgba(24,31,42,.14)] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#aab3bb]">
              <ScanSearch size={13} className="text-[#c9dc54]" /> interactive analysis
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#f7f5ef]">Inspect a password</h2>
          </div>
          <span className="border border-[#515d6b] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#aab3bb]">
            {analysis ? 'analysis complete' : 'fastapi analyzer'}
          </span>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAnalyze();
          }}
        >
          <label htmlFor="password-input" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#aab3bb]">
            Password value
          </label>
          <div className="flex border border-[#66717d] bg-[#171d28] transition-colors focus-within:border-[#c9dc54]">
            <input
              ref={inputRef}
              id="password-input"
              name="password"
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a password to inspect"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-4 py-4 font-mono text-sm text-[#f7f5ef] outline-none placeholder:text-[#69737c]"
              aria-describedby="password-help"
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setVisible((show) => !show)}
              className="focus-ring flex w-12 items-center justify-center border-l border-[#455160] text-[#aab3bb] transition-colors hover:text-[#c9dc54]"
              aria-label={visible ? 'Hide password' : 'Show password'}
              data-testid="button-toggle-password"
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <p id="password-help" className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[#8e98a1]">
            <LockKeyhole size={13} className="mt-0.5 shrink-0 text-[#c9dc54]" />
            Held in memory only. Never written to storage, URLs, analytics, or logs.
          </p>

          <div className="mt-6 border-t border-[#394453] pt-5">
            <label className="flex cursor-pointer items-center gap-3 text-xs text-[#c6cbd0]">
              <input
                type="checkbox"
                checked={checkExposure}
                onChange={(event) => setCheckExposure(event.target.checked)}
                className="size-4 accent-[#c9dc54]"
                data-testid="checkbox-check-exposure"
              />
              <span>Check breach exposure</span>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#c9dc54] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#202735] transition-colors hover:bg-[#d6e878] disabled:cursor-not-allowed disabled:opacity-45"
              data-testid="button-analyze"
            >
              {isLoading ? 'Reading signals…' : 'Analyze password'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
            {(analysis || error) && (
              <button
                type="button"
                onClick={onClear}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 border border-[#66717d] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#c6cbd0] transition-colors hover:border-[#aab3bb] hover:text-[#f7f5ef]"
                data-testid="button-clear-analysis"
              >
                <RotateCcw size={14} /> Clear
              </button>
            )}
          </div>
        </form>

        <div className="mt-7">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#69737c]">Try an example</div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => chooseExample(example.value)}
                className="focus-ring border border-[#455160] px-3 py-2 text-left text-[11px] text-[#aab3bb] transition-colors hover:border-[#c9dc54] hover:text-[#f7f5ef]"
                data-testid={`button-example-${example.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingResults() {
  return (
    <div className="mt-8 border border-[#d8d5cc] bg-[#f1efe8] p-6" aria-live="polite" data-testid="status-analysis-loading">
      <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#737984]">
        <span className="scan-dot size-1.5 rounded-full bg-[#097fb1]" /> Analyzing signals
      </div>
      <div className="scan-line mb-6 h-5 w-44 bg-[#dedcd4]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="scan-line h-32 bg-[#dedcd4]" />
        <div className="scan-line h-32 bg-[#dedcd4]" />
      </div>
      <div className="scan-line mt-4 h-20 bg-[#dedcd4]" />
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: PasswordLensApiError; onRetry: () => void }) {
  const unavailable = error.kind === 'unavailable';
  return (
    <div className="mt-8 border border-[#d6b7b2] bg-[#fbf1ee] p-6" role="alert" data-testid="status-analysis-error">
      <div className="flex gap-4">
        <AlertCircle className="mt-0.5 shrink-0 text-[#ad3830]" size={19} />
        <div className="flex-1">
          <h3 className="font-semibold tracking-[-0.02em] text-[#452a28]">
            {unavailable ? 'The analysis service is unavailable' : 'This analysis could not be completed'}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#765450]">
            {unavailable
              ? 'Your password stayed in this page. Try again when the configured backend is reachable.'
              : error.message}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring mt-5 inline-flex items-center gap-2 border border-[#c9938d] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#7d332e] hover:bg-[#f6e4df]"
            data-testid="button-retry-analysis"
          >
            Try again <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreMeter({ score, label }: { score: number; label: string }) {
  const safeScore = Math.min(5, Math.max(0, score));
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex size-20 shrink-0 items-center justify-center rounded-full border-[7px] border-[#d8ddd5]">
        <div
          className="absolute inset-[-7px] rounded-full border-[7px] border-transparent border-l-[#32744c] border-t-[#32744c]"
          style={{ transform: `rotate(${safeScore * 72 - 45}deg)` }}
          aria-hidden="true"
        />
        <span className="font-mono text-lg font-medium text-[#202735]">{safeScore}/5</span>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#737984]">Composition signal</div>
        <div className="mt-1 text-sm font-bold text-[#202735]">{label}</div>
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: PasswordFinding }) {
  const [expanded, setExpanded] = useState(false);
  const toneMap = {
    danger: { icon: XCircle, color: '#ad3830', bg: '#fbf1ee' },
    caution: { icon: CircleHelp, color: '#a16b16', bg: '#fbf7eb' },
    positive: { icon: CheckCircle2, color: '#32744c', bg: '#eef6ee' },
    neutral: { icon: CircleHelp, color: '#737984', bg: '#f1f1ed' },
  };
  const tone =
    finding.severity === 'critical' || finding.severity === 'high'
      ? toneMap.danger
      : finding.severity === 'medium'
        ? toneMap.caution
        : finding.severity === 'low'
          ? toneMap.positive
          : toneMap.neutral;
  const Icon = tone.icon;
  return (
    <li className="flex gap-3 border-t border-[#e1ded7] py-4 first:border-t-0">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center" style={{ backgroundColor: tone.bg, color: tone.color }}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-bold text-[#202735]">{finding.title}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8b919a]">
            {finding.severity} · {finding.category}
          </span>
        </div>
        <div className="mt-1 text-xs leading-5 text-[#737984]">{finding.message}</div>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="focus-ring mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#097fb1]"
          aria-expanded={expanded}
          data-testid={`button-expand-finding-${finding.code}`}
        >
           Why this matters <ChevronDown size={12} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="mt-2 max-w-2xl overflow-hidden border-l-2 border-[#c9dc54] pl-3 text-xs leading-5 text-[#737984]"
             >
               {finding.transformation && finding.normalized && (
                 <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#202735]">
                   {finding.transformation.map((step) => (
                     <span key={`${step.from}-${step.to}`} className="border border-[#d8d5cc] bg-[#f1efe8] px-2 py-1">
                       {step.from} → {step.to}
                     </span>
                   ))}
                   <span className="text-[#737984]">→</span>
                   <span className="border border-[#c7d7bf] bg-[#eef6ee] px-2 py-1">{finding.normalized}</span>
                 </div>
               )}
               <p>{finding.detection ?? 'The analysis service returned this structured finding with no additional detection details.'}</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

function ExposureBadge({ status, label, detail }: { status: ExposureStatus; label: string; detail: string }) {
  const isUnknown = status === 'unknown';
  const isExposed = status === 'exposed';
  const isNotChecked = status === 'not_checked';

  const color = isUnknown
    ? '#a16b16'
    : isExposed
      ? '#ad3830'
      : isNotChecked
        ? '#737984'
        : '#32744c';

  const bg = isUnknown
    ? '#fbf7eb'
    : isExposed
      ? '#fbf1ee'
      : isNotChecked
        ? '#f3f2ee'
        : '#eef6ee';

  return (
    <div className="flex gap-3 border border-[#e1ded7] p-4" style={{ backgroundColor: bg }}>
      {isUnknown ? (
        <CircleHelp size={17} style={{ color }} />
      ) : isExposed ? (
        <ShieldAlert size={17} style={{ color }} />
      ) : isNotChecked ? (
        <CircleHelp size={17} style={{ color }} />
      ) : (
        <CheckCircle2 size={17} style={{ color }} />
      )}
      <div>
        <div className="text-xs font-bold" style={{ color }}>{label}</div>
        <p className="mt-1 text-xs leading-5 text-[#737984]">{detail}</p>
      </div>
    </div>
  );
}

function AnalysisResults({ analysis, onClear }: { analysis: PasswordAnalysis; onClear: () => void }) {
  const checks = [
    { label: `${analysis.length} chars`, passed: analysis.length >= 8 },
    { label: 'Uppercase', passed: analysis.has_uppercase },
    { label: 'Lowercase', passed: analysis.has_lowercase },
    { label: 'Numbers', passed: analysis.has_number },
    { label: 'Symbols', passed: analysis.has_symbol },
  ];
  const patternFindings = analysis.findings.filter((finding) => finding.category === 'pattern');
  const exposure = analysis.exposure ?? {
    status: 'unknown' as const,
    label: 'Exposure status: Unknown',
    detail: 'The backend did not return an exposure conclusion for this analysis.',
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 border border-[#d3d0c7] bg-[#faf9f5]"
      aria-live="polite"
      data-testid="section-analysis-results"
    >
      <div className="flex flex-col justify-between gap-3 border-b border-[#dedbd3] px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#32744c]">Analysis complete</div>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#202735]">Read the signals, not a score.</h2>
        </div>
        <button type="button" onClick={onClear} className="focus-ring self-start text-[11px] font-bold uppercase tracking-[0.12em] text-[#737984] hover:text-[#202735]" data-testid="button-dismiss-results">
          Dismiss
        </button>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        <div className="border-b border-[#dedbd3] p-6 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#737984]">Composition strength</h3>
            <span className="font-mono text-[10px] text-[#8b919a]">INPUT SHAPE</span>
          </div>
           <ScoreMeter score={analysis.score} label={analysis.strength} />
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#e1ded7] pt-5 sm:grid-cols-3">
             {checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2 text-xs text-[#5f6673]" data-testid={`status-check-${check.label.toLowerCase()}`}>
                 {check.passed === true ? <Check size={13} className="text-[#32744c]" /> : check.passed === false ? <X size={13} className="text-[#ad3830]" /> : <CircleHelp size={13} className="text-[#a16b16]" />}
                {check.label}
              </div>
            ))}
          </div>
          <div className="mt-5 border-l-2 border-[#c9dc54] pl-3 text-xs leading-5 text-[#737984]">
            Composition asks what the value looks like. It does not know whether this exact value has been seen before.
          </div>
        </div>
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#737984]">Observed risk</h3>
            <span className="font-mono text-[10px] text-[#8b919a]">CONTEXT</span>
          </div>
          <div className="border-l-2 border-[#ad3830] pl-4">
             <div className="text-lg font-semibold tracking-[-0.03em] text-[#202735]">{analysis.risk}</div>
             <p className="mt-2 text-sm leading-6 text-[#737984]">
               {analysis.findings.length
                 ? `${analysis.findings.length} structured finding${analysis.findings.length === 1 ? '' : 's'} returned by the analysis service.`
                 : 'No structured findings were returned by the analysis service.'}
             </p>
          </div>
          <div className="mt-6">
             <ExposureBadge {...exposure} />
          </div>
        </div>
      </div>
      <div className="border-t border-[#dedbd3] px-6 py-6">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#737984]">Structured findings</h3>
        <p className="mb-2 text-xs text-[#8b919a]">Each finding explains the path an attacker could prioritize.</p>
        <ul>
           {analysis.findings.length ? analysis.findings.map((finding, index) => <FindingRow key={`${finding.code}-${index}`} finding={finding} />) : (
             <li className="border-t border-[#e1ded7] py-4 text-xs text-[#737984]">No structured findings were returned by the analysis service.</li>
           )}
        </ul>
      </div>
      <div className="border-t border-[#dedbd3] bg-[#202735] px-6 py-6 text-[#f7f5ef]">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9dc54]">
          <TerminalSquare size={13} /> attacker&apos;s view
        </div>
         <p className="max-w-2xl text-base leading-7 text-[#e1e4e4]">
           PasswordLens does not simulate a complete attack. It surfaces the signals returned by the analysis service so you can see which paths deserve attention first.
         </p>
         <div className="mt-6 grid gap-2 border-t border-[#455160] pt-5 sm:grid-cols-3">
           {[
             ['Composition requirements', checks.every((check) => check.passed) ? 'PASSED' : 'MIXED'],
             ['Pattern findings', patternFindings.length ? `${patternFindings.length} DETECTED` : 'NO FINDING RETURNED'],
             ['Exposure status', exposure.status === 'unknown' ? 'UNKNOWN' : exposure.status === 'exposed' ? 'EXPOSED' : 'NOT FOUND'],
           ].map(([label, value]) => (
             <div key={label} className="border border-[#455160] px-3 py-3">
               <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8e98a1]">{label}</div>
               <div className="mt-2 text-xs font-bold text-[#c9dc54]">{value}</div>
             </div>
           ))}
         </div>
        <div className="mt-5 flex gap-3 border-t border-[#455160] pt-4 text-xs text-[#aab3bb]">
          <ArrowDownRight size={15} className="mt-0.5 shrink-0 text-[#c9dc54]" />
           <span><strong className="text-[#f7f5ef]">Interpretation:</strong> Review the structured findings above; the backend remains the source of truth.</span>
        </div>
      </div>
    </motion.section>
  );
}

function MethodSection() {
  return (
    <section id="method" className="scroll-mt-24 border-t border-[#d8d5cc] py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 lg:px-10">
        <div>
          <SectionKicker number="01">The distinction</SectionKicker>
          <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.07em] text-[#202735] sm:text-[2.85rem]">
             Why PasswordLens?
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#737984]">
             Most password checkers ask whether you included enough character types. PasswordLens asks a different question: what does the password&apos;s construction reveal?
          </p>
        </div>
        <div className="grid gap-px border border-[#d8d5cc] bg-[#d8d5cc] sm:grid-cols-2">
          <article className="bg-[#f7f5ef] p-7 sm:p-9">
            <div className="mb-12 flex items-center justify-between">
              <span className="font-mono text-xs text-[#097fb1]">A / 02</span>
              <Layers3 size={18} className="text-[#737984]" />
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#202735]">Composition strength</h3>
            <p className="mt-4 text-sm leading-7 text-[#737984]">
              A value can look complex — even something like <span className="font-mono text-[#202735]">P@55w0rd</span> — while still carrying a familiar shape.
            </p>
            <div className="mt-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#32744c]">
              <StatusDot tone="good" /> deterministic checks
            </div>
          </article>
          <article className="bg-[#202735] p-7 text-[#f7f5ef] sm:p-9">
            <div className="mb-12 flex items-center justify-between">
              <span className="font-mono text-xs text-[#c9dc54]">B / 02</span>
              <Network size={18} className="text-[#aab3bb]" />
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.04em]">Observed security risk</h3>
            <p className="mt-4 text-sm leading-7 text-[#aab3bb]">
              Character substitutions can normalize to <span className="font-mono text-[#f7f5ef]">password</span>. That distinction is what this project explores.
            </p>
            <div className="mt-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c9dc54]">
              <StatusDot tone="warn" /> context-dependent
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function AttackerSection() {
  return (
    <section className="overflow-hidden bg-[#202735] py-24 text-[#f7f5ef] sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
          <div>
            <SectionKicker number="02">Change the question</SectionKicker>
            <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.07em] sm:text-[2.85rem]">
             What stands out first?
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#aab3bb]">
             PasswordLens translates returned findings into a compact attacker&apos;s view: not a theatrical hack, just the signals that deserve a second look.
            </p>
          </div>
          <div className="relative border-l border-[#53606b] pl-7 sm:pl-12">
            <div className="absolute -left-[5px] top-0 size-2 rounded-full bg-[#c9dc54]" />
             {[
               ['01', 'Composition', 'Length and character variety are one signal, not the whole story.'],
               ['02', 'Patterns + substitutions', 'Common constructions and predictable character changes can make a value recognizable.'],
               ['03', 'Sequences + repetition', 'Repeated or sequential structures are returned as explicit findings when the engine detects them.'],
               ['04', 'Exposure context', 'Optional exposure checking stays separate from pattern and policy findings.'],
            ].map(([number, title, detail]) => (
              <div key={number} className="relative pb-12 last:pb-0">
                <div className="absolute -left-[53px] top-0 font-mono text-[10px] text-[#c9dc54] sm:-left-[77px]">{number}</div>
                <h3 className="text-xl font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[#aab3bb]">{detail}</p>
                <div className="mt-6 h-px max-w-[360px] bg-[#3d4856]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TryToFoolSection({ onSelect }: { onSelect: (password: string) => void }) {
  return (
    <section className="border-t border-[#d8d5cc] bg-[#f7f5ef] py-24 sm:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-20 lg:px-10">
        <div>
          <SectionKicker number="03">Try to fool PasswordLens</SectionKicker>
          <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.07em] text-[#202735] sm:text-[2.85rem]">
            Think your password is strong?
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#737984]">
            Pick a familiar construction and let the same backend analysis tell you what the checklist misses.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {examples.map((example) => (
            <button
              key={example.value}
              type="button"
              onClick={() => onSelect(example.value)}
              className="focus-ring group flex min-h-16 items-center justify-between border border-[#d8d5cc] bg-[#ebe9e1] px-4 text-left transition-colors hover:border-[#202735] hover:bg-[#f0eee6]"
              data-testid={`button-try-${example.value}`}
            >
              <span>
                <span className="block font-mono text-xs text-[#202735]">{example.label}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[#8b919a]">Analyze example</span>
              </span>
              <ArrowRight size={15} className="text-[#737984] transition-transform group-hover:translate-x-1 group-hover:text-[#202735]" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  const capabilities = [
    ['01', 'Composition', 'Length, uppercase, lowercase, numbers, and symbols are returned as separate checks.', Layers3],
    ['02', 'Common patterns', 'Recognizable words and constructions are surfaced instead of hidden behind a single grade.', ScanSearch],
    ['03', 'Predictable sequences', 'Sequential characters and repeated constructions can be called out as structured findings.', ArrowDownRight],
    ['04', 'Character substitutions', 'Common transformations such as @ → a, 0 → o, and 5 → s get their own explainable signal.', Code2],
    ['05', 'Exposure', 'Optional privacy-preserving exposure context stays distinct from “not checked” or “unknown.”', ShieldAlert],
  ] as const;
  return (
    <section className="border-t border-[#d8d5cc] py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionKicker number="04">What it can see</SectionKicker>
            <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.07em] text-[#202735] sm:text-[2.85rem]">Small surface area. Clear signals.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#737984]">Built for a developer&apos;s second look, not a dopamine hit.</p>
        </div>
        <div className="grid border-l border-t border-[#d8d5cc] sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(([number, title, detail, Icon]) => (
            <article key={number} className="group border-b border-r border-[#d8d5cc] p-7 transition-colors hover:bg-[#f0eee6] sm:p-9">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-[#097fb1]">{number}</span>
                <Icon size={19} strokeWidth={1.5} className="text-[#737984] transition-colors group-hover:text-[#202735]" />
              </div>
              <h3 className="mt-14 text-lg font-semibold tracking-[-0.03em] text-[#202735]">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#737984]">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-24 border-t border-[#d8d5cc] bg-[#ebe9e1] py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-24 lg:px-10">
        <div>
          <SectionKicker number="05">Under the lens</SectionKicker>
          <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.07em] text-[#202735] sm:text-[2.85rem]">A small adapter. A legible boundary.</h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#737984]">
            The interface owns presentation and state. Security logic stays with the service that can be tested, reviewed, and changed independently.
          </p>
        </div>
        <div className="border border-[#c8c7bf] bg-[#f7f5ef]">
          {[
              { icon: KeyRound, name: 'Password', detail: 'Held in component memory until submit or clear', code: 'input' },
              { icon: Code2, name: 'Analyzer boundary', detail: 'POST /analyze · check_exposure', code: 'API' },
              { icon: Layers3, name: 'Policy · patterns · exposure', detail: 'Modular signals returned by the security engine', code: 'signals' },
              { icon: ServerCog, name: 'Risk engine', detail: 'Strength, risk, and structured findings', code: 'risk' },
              { icon: FileCode2, name: 'Explainable result', detail: 'Findings translated into an attacker view', code: 'output' },
          ].map(({ icon: Icon, name, detail, code }, index) => (
            <div key={name} className="relative flex items-center gap-5 border-b border-[#dedbd3] p-5 last:border-b-0 sm:p-6">
              <div className="flex size-10 shrink-0 items-center justify-center border border-[#c8c7bf] bg-[#ebe9e1] text-[#202735]">
                <Icon size={17} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#202735]">{name}</div>
                <div className="mt-1 text-xs text-[#737984]">{detail}</div>
              </div>
              <code className="hidden font-mono text-[10px] text-[#097fb1] sm:block">{code}</code>
              {index < 4 && <ChevronRight className="absolute -bottom-3 left-[34px] z-10 bg-[#f7f5ef] text-[#737984]" size={17} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-24 border-t border-[#d8d5cc] py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 lg:px-10">
        <div>
          <SectionKicker number="06">Privacy decisions</SectionKicker>
          <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.07em] text-[#202735] sm:text-[2.85rem]">The quiet part is the feature.</h2>
        </div>
        <div>
          {[
            ['No persistence', 'Nothing is written to localStorage, cookies, the URL, or a client-side history. Clear means gone.'],
            ['No side channel', 'No analytics, tracking pixels, or password-shaped event payloads.'],
            ['Honest uncertainty', 'Exposure is shown as not checked when no lookup was requested, and unknown when the lookup could not be completed.'],
          ].map(([title, detail], index) => (
            <div key={title} className="grid gap-4 border-t border-[#d8d5cc] py-6 sm:grid-cols-[100px_1fr] sm:gap-8">
              <span className="font-mono text-xs text-[#097fb1]">0{index + 1}</span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#202735]">{title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[#737984]">{detail}</p>
              </div>
            </div>
          ))}
          <div className="mt-5 flex items-center gap-3 border border-[#c7d7bf] bg-[#eef6ee] px-4 py-3 text-xs text-[#32744c]" data-testid="status-privacy">
            <CheckCircle2 size={16} />
            <span>PasswordLens does not intentionally store or log plaintext passwords.</span>
          </div>
          <p className="mt-5 max-w-lg text-xs leading-6 text-[#737984]">
            If the external exposure service is unavailable, the result is Unknown — not Safe.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProjectStats() {
  return (
    <section className="border-t border-[#d8d5cc] bg-[#ebe9e1] py-16">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <SectionKicker number="07">Project proof</SectionKicker>
        <div className="mt-8 grid border-l border-t border-[#c8c7bf] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['53', 'Automated tests'],
            ['Python', 'Security engine'],
            ['FastAPI', 'API boundary'],
            ['Modular', 'Analysis pipeline'],
          ].map(([value, label]) => (
            <div key={label} className="border-b border-r border-[#c8c7bf] p-6 sm:p-8">
              <div className="font-mono text-3xl tracking-[-0.06em] text-[#202735]">{value}</div>
              <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#737984]">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[#737984]">
          The interface is only the surface. The analysis engine is independently tested and documented.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#d8d5cc] bg-[#202735] py-10 text-[#aab3bb]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <div className="text-sm font-bold text-[#f7f5ef]">PasswordLens</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#69737c]">A quiet security lab</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <span className="font-mono text-[#69737c]">Built for the second look · v0.1</span>
          <div className="flex flex-wrap items-center gap-5">
            <a href={import.meta.env.VITE_GITHUB_URL ?? 'https://github.com/'} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 text-[#f7f5ef] hover:text-[#c9dc54]" data-testid="link-github">
              <Github size={16} /> View source on GitHub <ArrowUpRight size={14} />
            </a>
            <a href="#analyzer" className="focus-ring inline-flex items-center gap-2 text-[#f7f5ef] hover:text-[#c9dc54]" data-testid="link-footer-analyzer">
              Try the analyzer <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [error, setError] = useState<PasswordLensApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkExposure, setCheckExposure] = useState(false);

  const runAnalysis = async (value = password) => {
    if (!value) {
      setError(new PasswordLensApiError('Enter a password to analyze.', 'invalid'));
      setAnalysis(null);
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzePassword(value, checkExposure);
      setAnalysis(result);
    } catch (caught) {
      setError(caught instanceof PasswordLensApiError ? caught : new PasswordLensApiError('The analysis could not be completed.', 'unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setPassword('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div id="top" className="noise site-shell min-h-[100dvh]">
      <Header onMenu={() => undefined} />
      <main>
        <section className="relative overflow-hidden bg-[#202735] text-[#f7f5ef]">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-[#394453] lg:block" aria-hidden="true">
            <div className="absolute right-16 top-16 size-44 border border-[#465362]" />
            <div className="absolute right-28 top-28 size-44 border border-[#465362]" />
            <div className="absolute bottom-20 right-20 h-px w-56 bg-[#c9dc54]" />
            <span className="absolute bottom-[76px] right-16 font-mono text-[9px] uppercase tracking-[0.18em] text-[#c9dc54]">signal / context</span>
          </div>
          <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10 lg:pb-32 lg:pt-28">
            <div className="grid items-start gap-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
              <div className="reveal">
                <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#aab3bb]">
                  <span className="flex items-center gap-2 text-[#c9dc54]"><StatusDot tone="good" /> Quiet security lab</span>
                  <span className="text-[#53606b]">/</span>
                  <span>v0.1</span>
                </div>
                <h1 className="max-w-xl text-[clamp(3.5rem,7.6vw,6.5rem)] font-semibold leading-[.88] tracking-[-0.09em] text-[#f7f5ef]">
                  Passwords<br /><span className="text-[#c9dc54]">are not</span><br />numbers.
                </h1>
                <p className="mt-9 max-w-md text-base leading-7 text-[#bfc6cb] sm:text-lg">
                  PasswordLens explains why a password is risky — from composition signal to the path an attacker would actually try.
                </p>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.13em] text-[#8e98a1]">
                  <span className="flex items-center gap-2"><StatusDot tone="good" /> no storage</span>
                  <span className="flex items-center gap-2"><StatusDot tone="good" /> no tracking</span>
                  <span className="flex items-center gap-2"><StatusDot tone="neutral" /> explainable output</span>
                </div>
              </div>
              <div className="reveal reveal-delay-2 lg:pt-7">
                <Analyzer
                  password={password}
                  setPassword={setPassword}
                  checkExposure={checkExposure}
                  setCheckExposure={setCheckExposure}
                  onAnalyze={runAnalysis}
                  onClear={clearAnalysis}
                  isLoading={isLoading}
                  analysis={analysis}
                  error={error}
                />
                <AnimatePresence mode="wait">
                  {isLoading && <LoadingResults />}
                  {!isLoading && error && <ErrorState error={error} onRetry={runAnalysis} />}
                  {!isLoading && analysis && <AnalysisResults analysis={analysis} onClear={clearAnalysis} />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d8d5cc] bg-[#ebe9e1]">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 text-xs text-[#737984]">
              <LockKeyhole size={15} className="text-[#32744c]" />
              <span>Your input stays in this browser until you submit or clear it.</span>
            </div>
            <a href="#method" className="focus-ring inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#202735]">
              Why two signals? <ArrowDownRight size={14} />
            </a>
          </div>
        </section>
        <MethodSection />
        <AttackerSection />
        <TryToFoolSection
          onSelect={(value) => {
            setPassword(value);
            void runAnalysis(value);
            window.location.hash = 'analyzer';
          }}
        />
        <CapabilitiesSection />
        <ArchitectureSection />
        <PrivacySection />
        <ProjectStats />
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;