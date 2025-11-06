import { addMonths, startOfMonth } from "date-fns";

import { FREE_GENERATION_LIMIT } from "./auth";
import { prisma } from "./prisma";

export const getUsageForUser = async (userId: string) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usage = await prisma.usage.upsert({
    where: {
      userId_month_year: { userId, month, year }
    },
    create: {
      userId,
      month,
      year,
      count: 0
    },
    update: {}
  });

  return usage;
};

export const incrementUsage = async (userId: string) => {
  const usage = await getUsageForUser(userId);
  return prisma.usage.update({
    where: { id: usage.id },
    data: { count: { increment: 1 } }
  });
};

export const hasFreeCredits = async (userId: string) => {
  const usage = await getUsageForUser(userId);
  return usage.count < FREE_GENERATION_LIMIT;
};

export const resetUsageForNewMonth = async () => {
  const now = startOfMonth(new Date());
  const previous = addMonths(now, -1);

  await prisma.usage.deleteMany({
    where: {
      createdAt: {
        lt: previous
      }
    }
  });
};
