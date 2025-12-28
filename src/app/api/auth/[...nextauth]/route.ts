import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

// getServerSession/NextAuth overloads are currently incompatible with typed config when using App Router.
// Casting keeps runtime behavior identical while maintaining type-safety elsewhere.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
