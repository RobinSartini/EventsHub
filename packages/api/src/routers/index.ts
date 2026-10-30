import { protectedProcedure, publicProcedure, router } from "../index";

// <better-fullstack:recipe-imports sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855>

// </better-fullstack:recipe-imports>

export const appRouter = router({
  // <better-fullstack:recipe-registrations sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855>

  // </better-fullstack:recipe-registrations>
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
