import { createFileRoute } from "@tanstack/react-router";
import { seedDatabase } from "@/lib/data.functions";

export const Route = createFileRoute("/api/seed")({
  server: {
    handlers: {
      POST: async () => {
        const result = await seedDatabase();
        return Response.json(result);
      },
    },
  },
});
