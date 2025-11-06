import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  //   hello: baseProcedure
  //     .input(
  //       z.object({
  //         text: z.string(),
  //       })
  //     )
  //     .query(opts => {
  //       return {
  //         greeting: `hello ${opts.input.text}`,
  //       };
  //     }),
  getUsers: baseProcedure.query(async () => await prisma.user.findMany()),
});
// export type definition of API
export type AppRouter = typeof appRouter;
