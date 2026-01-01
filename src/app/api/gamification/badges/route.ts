import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getUserBadges, getUnseenBadges, markBadgesAsSeen } from '@/lib/gamification/badges';

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
      const badges = await getUnseenBadges(session.user.id);
      return NextResponse.json({ badges }, { status: 200 });
    }

    const badges = await getUserBadges(session.user.id);
    return NextResponse.json({ badges }, { status: 200 });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { message: 'Error fetching badges' },
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

    const { badgeIds } = await req.json();

    if (!Array.isArray(badgeIds)) {
      return NextResponse.json({ message: 'Invalid badgeIds' }, { status: 400 });
    }

    await markBadgesAsSeen(session.user.id, badgeIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking badges as seen:', error);
    return NextResponse.json(
      { message: 'Error updating badges' },
      { status: 500 }
    );
  }
}
