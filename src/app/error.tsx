'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Crash:', error);
  }, [error]);

  const isPermissionError = error.message?.includes('permissions') || error.message?.includes('denied');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 basketball-grid">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-orange-100 max-w-lg w-full text-center space-y-6">
        <div className="mx-auto bg-rose-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-rose-600 shadow-inner">
          <AlertCircle className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase text-slate-900 tracking-tight">System Exception</h1>
          <p className="text-slate-500 font-medium">
            {isPermissionError 
              ? "Your session encountered a security sync issue. This usually happens during initial profile calibration."
              : "An unexpected biomechanical calculation error occurred."}
          </p>
        </div>

        {error.message && (
          <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-mono text-slate-400 text-left overflow-auto max-h-32 border border-slate-100">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={() => reset()}
            className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-black uppercase italic shadow-xl shadow-orange-200 gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Resume Training Session
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
              <Home className="h-4 w-4 mr-2" />
              Return to Stadium
            </Button>
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 font-black uppercase tracking-[0.3em] text-[8px]">
        Basketball AI Analyzer • Recovery Subsystem
      </p>
    </div>
  );
}