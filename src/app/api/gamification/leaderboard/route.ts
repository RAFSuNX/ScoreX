import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import {
  getGlobalLeaderboard,
  getSubjectLeaderboard,
  getWeeklyLeaderboard,
  getUserRank,
  LeaderboardType,
} from '@/lib/gamification/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') as LeaderboardType) || 'points';
    const subject = searchParams.get('subject');
    const period = searchParams.get('period'); // 'weekly' or 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100');

    let leaderboard;
    const userRank = await getUserRank(session.user.id, type);

    if (subject) {
      // Subject-specific leaderboard
      leaderboard = await getSubjectLeaderboard(subject, limit);
    } else if (period === 'weekly') {
      // Weekly leaderboard
      leaderboard = await getWeeklyLeaderboard(limit);
    } else {
      // Global leaderboard
      leaderboard = await getGlobalLeaderboard(type, limit);
    }

    return NextResponse.json(
      {
        leaderboard,
        userRank,
        type,
        period: period || 'all-time',
        subject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { message: 'Error fetching leaderboard' },
      { status: 500 }
    );
  }
}
