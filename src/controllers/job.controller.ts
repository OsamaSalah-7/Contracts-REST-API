import { FastifyRequest, FastifyReply } from "fastify";
import { Job } from "../models/job.model";
import { Profile } from "../models/profile.model";
import { Contract } from "../models/contract.model";
import { Between } from "typeorm";

declare module "fastify" {
    interface FastifyRequest {
        user: Profile;
    }
}

// Get all jobs for the logged-in user
export const getAllJobs = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user;
        
        // Find all contracts for this user
        const contracts = await Contract.find({
            where: [
                { client: { id: user.id } },
                { contractor: { id: user.id } }
            ],
        });
        
        if (contracts.length === 0) {
            return reply.status(404).send({ message: "No contracts found" });
        }
        
        // Get contract IDs
        const contractIds = contracts.map(contract => contract.id);
        
        // Find all jobs for these contracts
        const jobs = await Job.createQueryBuilder('job')
            .innerJoinAndSelect('job.contract', 'contract')
            .where('contract.id IN (:...ids)', { ids: contractIds })
            .getMany();
            
        if (jobs.length === 0) {
            return reply.status(404).send({ message: "No jobs found" });
        }
        
        return reply.status(200).send({ 
            success: true,
            message: "Jobs retrieved successfully", 
            data: jobs 
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

// Get unpaid jobs for active contracts
export const getUnpaidJobs = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user;
        
        // Find active contracts for this user
        const contracts = await Contract.find({
            where: [
                { client: { id: user.id }, status: "in_progress" },
                { contractor: { id: user.id }, status: "in_progress" }
            ],
        });
        
        if (contracts.length === 0) {
            return reply.status(404).send({ message: "No active contracts found" });
        }
        
        // Get contract IDs
        const contractIds = contracts.map(contract => contract.id);
        
        // Find unpaid jobs for these contracts
        const jobs = await Job.createQueryBuilder('job')
            .innerJoinAndSelect('job.contract', 'contract')
            .where('contract.id IN (:...ids)', { ids: contractIds })
            .andWhere('job.paid = :paid', { paid: false })
            .getMany();
            
        if (jobs.length === 0) {
            return reply.status(404).send({ message: "No unpaid jobs found" });
        }
        
        return reply.status(200).send({ 
            success: true,
            message: "Unpaid jobs retrieved successfully", 
            data: jobs 
        });
    } catch (error) {
        console.error("Error fetching unpaid jobs:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

// Pay for a job
export const payForJob = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user;
        const jobId = parseInt(req.params.id, 10);
        
        // Check if user is a client
        if (user.type !== "Client") {
            return reply.status(403).send({ message: "Only clients can pay for jobs" });
        }
        
        // Find the job
        const job = await Job.findOne({
            where: { id: jobId },
            relations: ['contract', 'contract.client', 'contract.contractor']
        });
        
        if (!job) {
            return reply.status(404).send({ message: "Job not found" });
        }
        
        // Check if job belongs to the client
        if (job.contract.client.id !== user.id) {
            return reply.status(403).send({ message: "You can only pay for your own jobs" });
        }
        
        // Check if job is already paid
        if (job.paid) {
            return reply.status(400).send({ message: "Job is already paid" });
        }
        
        // Check if client has enough balance
        if (user.balance < job.price) {
            return reply.status(400).send({ message: "Insufficient balance" });
        }
        
        // Get contractor
        const contractor = job.contract.contractor;
        
        // Update balances and job status
        user.balance -= job.price;
        contractor.balance += job.price;
        job.paid = true;
        job.paymentDate = new Date();
        
        // Save changes
        await user.save();
        await contractor.save();
        await job.save();
        
        return reply.status(200).send({ 
            success: true,
            message: "Payment successful", 
            data: {
                job,
                clientBalance: user.balance,
                contractorBalance: contractor.balance
            }
        });
    } catch (error) {
        console.error("Error paying for job:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

// Get best profession in date range
export const getBestProfession = async (
    req: FastifyRequest<{ Querystring: { start?: string, end?: string } }>,
    reply: FastifyReply
) => {
    try {
        const { start, end } = req.query;
        
        if (!start || !end) {
            return reply.status(400).send({ message: "Start and end dates are required" });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return reply.status(400).send({ message: "Invalid date format" });
        }
        
        // Find the profession that earned the most in the date range
        const result = await Job.createQueryBuilder('job')
            .innerJoin('job.contract', 'contract')
            .innerJoin('contract.contractor', 'contractor')
            .select('contractor.profession', 'profession')
            .addSelect('SUM(job.price)', 'earned')
            .where('job.paid = :paid', { paid: true })
            .andWhere('job.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('contractor.profession')
            .orderBy('earned', 'DESC')
            .limit(1)
            .getRawOne();
            
        if (!result) {
            return reply.status(404).send({ message: "No paid jobs found in the date range" });
        }
        
        return reply.status(200).send({ 
            success: true,
            message: "Best profession retrieved successfully", 
            data: {
                profession: result.profession,
                earned: parseFloat(result.earned)
            }
        });
    } catch (error) {
        console.error("Error fetching best profession:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

// Get best clients in date range
export const getBestClients = async (
    req: FastifyRequest<{ Querystring: { start?: string, end?: string, limit?: string } }>,
    reply: FastifyReply
) => {
    try {
        const { start, end, limit } = req.query;
        
        if (!start || !end) {
            return reply.status(400).send({ message: "Start and end dates are required" });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        const limitNum = limit ? parseInt(limit, 10) : 2;
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return reply.status(400).send({ message: "Invalid date format" });
        }
        
        if (isNaN(limitNum) || limitNum < 1) {
            return reply.status(400).send({ message: "Invalid limit" });
        }
        
        // Find the clients who paid the most in the date range
        const result = await Job.createQueryBuilder('job')
            .innerJoin('job.contract', 'contract')
            .innerJoin('contract.client', 'client')
            .select('client.id', 'id')
            .addSelect('CONCAT(client.firstName, \' \', client.lastName)', 'fullName')
            .addSelect('SUM(job.price)', 'paid')
            .where('job.paid = :paid', { paid: true })
            .andWhere('job.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('client.id')
            .addGroupBy('client.firstName')
            .addGroupBy('client.lastName')
            .orderBy('paid', 'DESC')
            .limit(limitNum)
            .getRawMany();
            
        if (!result || result.length === 0) {
            return reply.status(404).send({ message: "No paid jobs found in the date range" });
        }
        
        // Format the result
        const formattedResult = result.map(client => ({
            id: client.id,
            fullName: client.fullName,
            paid: parseFloat(client.paid)
        }));
        
        return reply.status(200).send({ 
            success: true,
            message: "Best clients retrieved successfully", 
            data: formattedResult
        });
    } catch (error) {
        console.error("Error fetching best clients:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

// Create a new job
export const createJob = async (
  req: FastifyRequest<{
    Body: {
      description: string;
      price: number;
      contractId: number;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { description, price, contractId } = req.body;
    const user = req.user;

    // Validate input
    if (!description || !price || !contractId) {
      return reply.status(400).send({
        message: "Missing required fields: description, price, and contractId"
      });
    }

    if (price <= 0) {
      return reply.status(400).send({
        message: "Price must be greater than zero"
      });
    }

    // Find the contract
    const contract = await Contract.findOne({
      where: { id: contractId },
      relations: ['client', 'contractor']
    });

    if (!contract) {
      return reply.status(404).send({ message: "Contract not found" });
    }

    // Verify contract ownership
    if (contract.contractor.id !== user.id) {
      return reply.status(403).send({
        message: "Only contractors can add jobs to contracts"
      });
    }

    // Check if contract is active
    if (contract.status !== "in_progress") {
      return reply.status(400).send({
        message: "Jobs can only be added to active contracts"
      });
    }

    // Create and save the job
    const job = new Job();
    job.description = description;
    job.price = price;
    job.paid = false;
    job.paymentDate = null;
    job.contract = contract;

    await job.save();

    return reply.status(201).send({
      success: true,
      message: "Job created successfully",
      data: job
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};