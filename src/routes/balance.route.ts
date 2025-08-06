import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { depositToClientBalance } from "../controllers/balance.controller";
import { verifyToken } from "../auth";
import { Profile } from "../models/profile.model";

export async function balanceRoutes(app: FastifyInstance) {
  // Add preHandler hook for authentication
  const authenticateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.code(401).send({ message: "Authorization header missing" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = await verifyToken(token);
      
      // Fetch the user profile using the decoded token
      const profile = await Profile.findOneBy({ id: parseInt(decoded.id) });
      if (!profile) {
        return reply.code(401).send({ message: "User not found" });
      }
      request.user = profile;
    } catch (err) {
      reply.code(401).send({ message: "Invalid token" });
    }
  };

  // Apply authentication to all routes
  app.addHook("preHandler", authenticateRequest);

  // Deposit to client balance
  app.post("/balances/deposit/:userId", depositToClientBalance);
}