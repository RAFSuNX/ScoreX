import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getAuthSession } from "@/lib/auth";
import { Plan } from "@prisma/client";
import { rateLimiters, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const planSchema = z.object({
  plan: z.nativeEnum(Plan),
  action: z.enum(["downgrade", "change"]).optional(),
});

type PlanPayload = z.infer<typeof planSchema>;

export async function PATCH(req: Request) {
  let session: Awaited<ReturnType<typeof getAuthSession>> = null;
  try {
    const rateLimit = await rateLimiters.billing.check(10, getClientIp(req));
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    if (!env.BILLING_SELF_SERVICE_ENABLED && env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "Billing updates are disabled" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as PlanPayload;
    const { plan } = planSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
      select: { plan: true },
    });

    return NextResponse.json({ plan: updatedUser.plan });
  } catch (error) {
    logger.error("Plan update error", error, { userId: session?.user?.id });
    return NextResponse.json(
      { message: "Unable to update plan" },
      { status: 500 }
    );
  }
}
