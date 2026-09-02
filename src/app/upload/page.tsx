
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Video, X, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a basketball shooting video (MP4, MOV, etc.)"
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    
    // Simulate Video Processing & Analysis for Portfolio Prototype
    try {
      const sessionId = crypto.randomUUID();
      const sessionRef = doc(firestore, 'analysisSessions', sessionId);
      
      // In a real app, this would be a POST to the FastAPI backend
      // and we would wait for a webhook or poll status.
      // For the portfolio MVP, we simulate the completion of the background task.
      
      const mockScore = 75 + Math.floor(Math.random() * 20);
      
      await setDoc(sessionRef, {
        id: sessionId,
        userId: user.uid,
        filename: file.name,
        createdAt: new Date().toISOString(),
        status: 'completed',
        overallScore: mockScore,
        processedVideoUrl: 'https://picsum.photos/seed/basketball/1200/600', // Placeholder
        duration: 5.4
      });

      // Create mock shot results
      const shotId = crypto.randomUUID();
      await setDoc(doc(firestore, 'shotResults', shotId), {
        id: shotId,
        sessionId,
        shotNumber: 1,
        overallScore: mockScore,
        lowerBodyScore: mockScore - 5,
        upperBodyScore: mockScore + 3,
        alignmentScore: mockScore - 2,
        releaseScore: mockScore + 5,
        consistencyScore: 90,
        metrics: {
          max_knee_flexion: 112.5,
          release_elbow_angle: 168.2,
          torso_angle: 8.4
        }
      });

      toast({
        title: "Analysis Complete",
        description: "Video processed. Results are ready.",
      });

      router.push(`/analysis/${sessionId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing your video."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Analyze Shot</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">
          Upload a clear side-view or 45-degree video of your shooting form.
        </p>
      </div>

      <Alert className="bg-orange-50 border-orange-200 text-orange-900 rounded-2xl">
        <Info className="h-5 w-5 text-orange-600" />
        <AlertTitle className="font-black text-sm uppercase tracking-widest">Pro Tip</AlertTitle>
        <AlertDescription className="text-xs font-medium opacity-80">
          Ensure your full body is visible from head to toe for the most accurate biomechanical measurements.
        </AlertDescription>
      </Alert>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2rem]">
        <div className="bg-orange-600 h-2 w-full" />
        <CardContent className="p-10">
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "border-4 border-dashed rounded-[1.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300",
                dragActive 
                  ? "border-orange-500 bg-orange-50 scale-[0.98]" 
                  : "border-slate-100 hover:border-orange-200 hover:bg-slate-50"
              )}
            >
              <div className="h-24 w-24 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 mb-6 shadow-inner">
                <Video className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Drag and drop shooting video</h3>
              <p className="text-slate-400 font-bold text-sm mb-8 uppercase tracking-widest">MP4, MOV up to 50MB</p>
              
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="video/*"
                />
                <Button variant="outline" className="border-2 font-bold px-8 h-12 rounded-2xl">
                  Select File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-600 p-3 rounded-2xl shadow-lg">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ready for AI Analysis</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-red-500 rounded-full"
                  onClick={() => setFile(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-tighter">Pose Detection Ready</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-black text-blue-800 uppercase tracking-tighter">Biomechanics Ready</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50/50 p-8 border-t border-slate-100">
          <Button 
            className="w-full h-14 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 text-lg font-black rounded-2xl"
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Processing Shot...
              </>
            ) : (
              "Start AI Analysis"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
