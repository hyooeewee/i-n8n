import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, type, value } = input;
      return prisma.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value: encrypt(value),
        },
      });
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return prisma.credential.delete({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, name, type, value } = input;
      return prisma.credential.update({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
        data: {
          name,
          type,
          value: encrypt(value),
        },
      });
    }),
  findOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;
      return prisma.credential.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
        // omit: {
        //   value: true, // Intentionally not selecting 'value' for security
        // },
      });
    }),
  findMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          omit: {
            value: true, // Intentionally not selecting 'value' for security
          },
        }),
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      return {
        items,
        totalCount,
        totalPages,
        page,
        pageSize,
        hasNextPage,
        hasPreviousPage,
      };
    }),
  findByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(({ ctx, input }) => {
      const { type } = input;
      return prisma.credential.findMany({
        where: {
          userId: ctx.auth.user.id,
          type,
        },
        omit: {
          value: true, // Intentionally not selecting 'value' for security
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
});
