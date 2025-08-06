import { FastifyRequest, FastifyReply } from "fastify";
import { Profile } from "../models/profile.model";
import { Job } from "../models/job.model";
import { Contract } from "../models/contract.model";

// Deposit money into a client's balance
export const depositToClientBalance = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { amount: number };
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    const clientId = parseInt(userId, 10);

    // Validate input
    if (!amount || amount <= 0) {
      return reply.status(400).send({
        success: false,
        message: "Amount must be a positive number"
      });
    }

    // Find the client
    const client = await Profile.findOne({
      where: { id: clientId, type: "Client" }
    });

    if (!client) {
      return reply.status(404).send({
        success: false,
        message: "Client not found"
      });
    }

    // Calculate total of unpaid jobs for this client
    const contracts = await Contract.find({
      where: { client: { id: clientId }, status: "in_progress" },
      relations: ["client"]
    });

    if (contracts.length === 0) {
      return reply.status(400).send({
        success: false,
        message: "Client has no active contracts"
      });
    }

    const contractIds = contracts.map(contract => contract.id);

    // Find unpaid jobs for these contracts
    const unpaidJobs = await Job.createQueryBuilder('job')
      .innerJoinAndSelect('job.contract', 'contract')
      .where('contract.id IN (:...ids)', { ids: contractIds })
      .andWhere('job.paid = :paid', { paid: false })
      .getMany();

    if (unpaidJobs.length === 0) {
      return reply.status(400).send({
        success: false,
        message: "Client has no unpaid jobs"
      });
    }

    // Calculate total of unpaid jobs
    const unpaidTotal = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
    
    // Check if deposit amount exceeds 25% of unpaid jobs total
    const maxDeposit = unpaidTotal * 0.25;
    if (amount > maxDeposit) {
      return reply.status(400).send({
        success: false,
        message: `Deposit amount cannot exceed 25% of unpaid jobs total (${maxDeposit})`
      });
    }

    // Update client balance
    client.balance += amount;
    await client.save();

    return reply.status(200).send({
      success: true,
      message: "Deposit successful",
      data: {
        clientId: client.id,
        newBalance: client.balance,
        depositAmount: amount
      }
    });
  } catch (error) {
    console.error("Error depositing to client balance:", error);
    return reply.status(500).send({
      success: false,
      message: "Internal server error"
    });
  }
};