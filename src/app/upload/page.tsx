
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Video, X, Loader2, Info, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
      const isVideo = selectedFile.type.startsWith('video/');
      const isJpg = selectedFile.type === 'image/jpeg' || selectedFile.name.toLowerCase().endsWith('.jpg') || selectedFile.name.toLowerCase().endsWith('.jpeg');
      
      if (isVideo || isJpg) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a shooting video (MP4, MOV) or a JPG photo."
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const isVideo = selectedFile.type.startsWith('video/');
      const isJpg = selectedFile.type === 'image/jpeg' || selectedFile.name.toLowerCase().endsWith('.jpg') || selectedFile.name.toLowerCase().endsWith('.jpeg');
      
      if (isVideo || isJpg) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a shooting video (MP4, MOV) or a JPG photo."
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      const sessionId = crypto.randomUUID();
      const sessionRef = doc(firestore, 'analysisSessions', sessionId);
      
      const mockScore = 75 + Math.floor(Math.random() * 20);
      const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
      
      await setDoc(sessionRef, {
        id: sessionId,
        userId: user?.uid || 'anonymous',
        filename: file.name,
        createdAt: new Date().toISOString(),
        status: 'completed',
        overallScore: mockScore,
        processedVideoUrl: isImage ? 'https://picsum.photos/seed/basketball-still/1200/800' : 'https://picsum.photos/seed/basketball/1200/600',
        duration: isImage ? 0 : 8.4,
        type: isImage ? 'image' : 'video'
      });

      // Create multiple shots for video for demo purposes
      const numShots = isImage ? 1 : 3;
      for (let i = 1; i <= numShots; i++) {
        const shotId = crypto.randomUUID();
        const shotScore = mockScore + (Math.random() * 6 - 3);
        const actionTypes = ['Jump Shot', '3-Point Shot', 'Layup', 'Dunk'];
        const results = ['MADE', 'MISSED', 'DETECTED'];
        
        await setDoc(doc(firestore, 'shotResults', shotId), {
          id: shotId,
          sessionId,
          shotNumber: i,
          actionType: i === 1 ? '3-Point Shot' : actionTypes[Math.floor(Math.random() * actionTypes.length)],
          result: i === 1 ? 'MADE' : results[Math.floor(Math.random() * results.length)],
          location: i === 1 ? 'Beyond 3pt Line' : 'Key Area',
          confidence: 85 + Math.floor(Math.random() * 10),
          overallScore: Math.round(shotScore),
          lowerBodyScore: Math.round(shotScore - 5),
          upperBodyScore: Math.round(shotScore + 3),
          alignmentScore: Math.round(shotScore - 2),
          releaseScore: Math.round(shotScore + 5),
          consistencyScore: isImage ? 100 : 90,
          metrics: {
            max_knee_flexion: 112.5,
            release_elbow_angle: 168.2,
            torso_angle: 8.4
          }
        });
      }

      toast({
        title: "Analysis Complete",
        description: `${isImage ? 'Photo' : 'Video'} processed. ${numShots} actions identified.`,
      });

      router.push(`/analysis/${sessionId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing your file."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg'));

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Upload Intelligence</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">
          Upload a court-view video to detect shots, actions, and violations.
        </p>
      </div>

      <Alert className="bg-orange-50 border-orange-200 text-orange-900 rounded-2xl">
        <Info className="h-5 w-5 text-orange-600" />
        <AlertTitle className="font-black text-sm uppercase tracking-widest">Intelligent Detection</AlertTitle>
        <AlertDescription className="text-xs font-medium opacity-80">
          The system will automatically identify multiple shots, classify actions (Dunk, Layup, 3PT), and analyze play legality.
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
              <h3 className="text-xl font-black text-slate-900 mb-2">Drag and drop basketball video or photo</h3>
              <p className="text-slate-400 font-bold text-sm mb-8 uppercase tracking-widest">MP4, MOV or JPG up to 50MB</p>
              
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="video/*,image/jpeg"
                />
                <Button variant="outline" className="border-2 font-bold px-8 h-12 rounded-2xl">
                  Select Training Video
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-600 p-3 rounded-2xl shadow-lg">
                    {isImage ? <ImageIcon className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ready for Video Intelligence</p>
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
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-tighter">Action Detection Active</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-black text-blue-800 uppercase tracking-tighter">Rule Engine Ready</span>
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
                Analyzing Scene...
              </>
            ) : (
              `Process ${isImage ? 'Photo' : 'Video'} Analysis`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
