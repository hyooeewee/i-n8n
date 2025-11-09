import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(opts => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    console.log({ userId: ctx.auth.user.id });
    return prisma.user.findMany({
      where: {
        id: ctx.auth.user.id,
      },
    });
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "hughie-ngai@outlook.com",
      },
    });
    return {
      success: true,
      message: "Job queued",
    };
  }),
  testAI: baseProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    });
    return {
      success: true,
      message: "Job queued",
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
