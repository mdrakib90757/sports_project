import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  titleBn = 'কিছু ভুল হয়েছে',
  message = 'Failed to load tournament data. Please try again.',
  messageBn = 'টুর্নামেন্টের তথ্য লোড করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।',
  onRetry,
  isBangla = false,
}: {
  title?: string;
  titleBn?: string;
  message?: string;
  messageBn?: string;
  onRetry?: () => void;
  isBangla?: boolean;
}) {
  return (
    <div className="rounded-2xl glass-card border border-red-500/20 p-8 text-center flex flex-col items-center justify-center space-y-4 my-6">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-white">
          {isBangla ? titleBn : title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          {isBangla ? messageBn : message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBangla ? 'পুনরায় চেষ্টা করুন' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  titleBn = 'কোনো তথ্য পাওয়া যায়নি',
  message = 'There is no data available for this section at the moment.',
  messageBn = 'এই মুহূর্তে কোনো তথ্য প্রদর্শনের জন্য উপলব্ধ নেই।',
  action,
  isBangla = false,
}: {
  title?: string;
  titleBn?: string;
  message?: string;
  messageBn?: string;
  action?: React.ReactNode;
  isBangla?: boolean;
}) {
  return (
    <div className="rounded-2xl glass-card border border-slate-800 p-8 text-center flex flex-col items-center justify-center space-y-4 my-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-slate-300">
          {isBangla ? titleBn : title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          {isBangla ? messageBn : message}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
