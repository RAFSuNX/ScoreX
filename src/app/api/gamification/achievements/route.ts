import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import {
  getUserAchievements,
  getUnseenAchievements,
  markAchievementsAsSeen,
} from '@/lib/gamification/achievements';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unseenOnly = searchParams.get('unseen') === 'true';

    if (unseenOnly) {
      const achievements = await getUnseenAchievements(session.user.id);
      return NextResponse.json({ achievements }, { status: 200 });
    }

    const achievements = await getUserAchievements(session.user.id);
    return NextResponse.json({ achievements }, { status: 200 });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { message: 'Error fetching achievements' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { achievementIds } = await req.json();

    if (!Array.isArray(achievementIds)) {
      return NextResponse.json({ message: 'Invalid achievementIds' }, { status: 400 });
    }

    await markAchievementsAsSeen(session.user.id, achievementIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking achievements as seen:', error);
    return NextResponse.json(
      { message: 'Error updating achievements' },
      { status: 500 }
    );
  }
}
