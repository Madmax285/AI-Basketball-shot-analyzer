import { 
  collection, 
  doc, 
  writeBatch, 
  getDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { subDays, formatISO } from 'date-fns';

const COLLECTIONS = {
  SESSIONS: 'analysisSessions',
  SHOTS: 'shotResults',
  METADATA: 'system'
};

const ACTION_TYPES = ['Jump Shot', '3-Point Shot', 'Layup', 'Dunk', 'Power Jump Shot'];
const RESULTS = ['MADE', 'MISSED', 'MADE', 'MADE', 'DETECTED'];

export async function initializeDemoDataset(db: Firestore, userId: string) {
  const metaRef = doc(db, COLLECTIONS.METADATA, 'demoDataset');
  const metaSnap = await getDoc(metaRef);

  if (metaSnap.exists() && metaSnap.data().initialized) {
    // We allow re-seeding for athletes to reset their training history if they want
  }

  const batch = writeBatch(db);

  // Seed 15 historical sessions over the last 30 days
  for (let i = 1; i <= 15; i++) {
    const sessionId = `demo-session-${i}-${crypto.randomUUID().substring(0, 8)}`;
    const createdAt = subDays(new Date(), 30 - (i * 2));
    const score = 70 + Math.floor(Math.random() * 25);

    batch.set(doc(db, COLLECTIONS.SESSIONS, sessionId), {
      id: sessionId,
      userId: userId,
      filename: `training_clip_${i}.mp4`,
      createdAt: createdAt.toISOString(),
      status: 'completed',
      overallScore: score,
      processedVideoUrl: `https://picsum.photos/seed/basketball-${i}/1200/800`,
      duration: 8.5 + i,
      type: 'video'
    });

    // Seed 2-4 shots per session
    const shotsCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 1; j <= shotsCount; j++) {
      const shotId = `${sessionId}-shot-${j}`;
      const shotScore = score + (Math.random() * 10 - 5);
      const actionType = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
      
      batch.set(doc(db, COLLECTIONS.SHOTS, shotId), {
        id: shotId,
        sessionId,
        userId: userId,
        shotNumber: j,
        actionType,
        result: RESULTS[Math.floor(Math.random() * RESULTS.length)],
        location: actionType.includes('3-Point') ? 'Beyond 3pt Line' : 'Key Area',
        confidence: 88 + Math.floor(Math.random() * 10),
        overallScore: Math.round(shotScore),
        lowerBodyScore: Math.round(shotScore - 5),
        upperBodyScore: Math.round(shotScore + j),
        alignmentScore: Math.round(shotScore - 2),
        releaseScore: Math.round(shotScore + 3),
        consistencyScore: 85 + (i * 0.5),
        metrics: {
          max_knee_flexion: 110 + (Math.random() * 15),
          release_elbow_angle: 155 + (Math.random() * 20),
          torso_angle: 5 + (Math.random() * 10)
        }
      });
    }
  }

  // Finalize metadata
  batch.set(metaRef, {
    initialized: true,
    initializedAt: serverTimestamp(),
    datasetVersion: "2.0", // Updated for Basketball context
    ownerId: userId
  });

  await batch.commit();
}