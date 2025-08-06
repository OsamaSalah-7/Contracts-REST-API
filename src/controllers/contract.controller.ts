import { FastifyRequest, FastifyReply } from "fastify";
import { Contract, CreateContractInfo } from "../models/contract.model";
import { Profile } from "../models/profile.model";
import { Job } from "../models/job.model";

// Type extension for Fastify request
declare module "fastify" {
    interface FastifyRequest {
        user: Profile;
    }
}

// Contract controller class with methods for handling contract operations
class ContractController {
    // Create a new contract
    public static async create(req: FastifyRequest<{Body: CreateContractInfo}>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            // Validate client permissions
            const user = req.user;
            if (user.type !== "Client") {
                return reply.status(403).send({ 
                    success: false,
                    message: "Only clients can create contracts" 
                });
            }
            
            // Extract and validate contractor
            const { contractorId, terms, status, jobDescription, jobPrice } = req.body;
            const contractor = await this.findContractor(contractorId);
            if (!contractor) {
                return reply.status(400).send({ 
                    success: false,
                    message: "Invalid contractor" 
                });
            }
    
            // Create and save contract with provided status or default
            const contract = await this.saveNewContract(terms, user, contractor, status);
            
            // Create a job if details are provided or create a default job
            const job = new Job();
            job.description = jobDescription || "Initial contract job";
            job.price = jobPrice || 0;
            job.paid = false;
            job.paymentDate = null;
            job.contract = contract;
            
            // Save the job
            await job.save();
            
            return reply.status(201).send({ 
                success: true,
                message: "Contract created successfully with initial job", 
                data: { contract, job }
            });
        } catch (error) {
            return this.handleError(reply, "Error creating contract:", error);
        }
    }

    // Get contract by ID
    public static async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const user = req.user;
            const contractId = parseInt(req.params.id, 10);

            // Find contract with relations
            const contract = await Contract.findOne({
                where: { id: contractId },
                relations: ['client', 'contractor'],
            });
            
            // Validate contract ownership
            if (!this.validateContractAccess(contract, user)) {
                return reply.status(404).send({ 
                    success: false,
                    message: "Contract not found" 
                });
            }
            
            return reply.status(200).send({ 
                success: true,
                message: "Contract retrieved successfully", 
                data: contract 
            });
        } catch (error) {
            return this.handleError(reply, "Error fetching contract by ID:", error);
        }
    }

    // Get contracts by status
    public static async getByStatus(
        req: FastifyRequest<{ Querystring: { status?: "new" | "in_progress" | "terminated" } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const user = req.user;
            const status = req.query.status ?? "in_progress";
           
            // Find contracts by status and user
            const contracts = await this.findContractsByStatusAndUser(status, user);
            
            if (contracts.length === 0) {
                return reply.status(404).send({ 
                    success: false,
                    message: "No contracts found" 
                });
            }
            
            return reply.status(200).send({ 
                success: true,
                message: "Contracts retrieved successfully", 
                data: contracts 
            });
        } catch (error) {
            return this.handleError(reply, "Error fetching contracts by status:", error);
        }
    }

    // Helper methods
    private static async findContractor(contractorId: number): Promise<Profile | null> {
        const contractor = await Profile.findOneBy({ id: contractorId });
        return contractor && contractor.type === "Contractor" ? contractor : null;
    }

    // Helper method to save a new contract with a job
    private static async saveNewContract(terms: string, client: Profile, contractor: Profile, status?: "new" | "in_progress" | "terminated"): Promise<Contract> {
        // Create a new contract
        const contract = new Contract();
        contract.terms = terms;
        contract.status = status || "in_progress";
        contract.client = client;
        contract.contractor = contractor;
        
        // Save the contract first to get its ID
        await contract.save();
        
        // Only create a job if the contract status is "in_progress"
        if (contract.status === "in_progress") {
            // Create a default job for this contract
            const job = new Job();
            job.description = "Initial contract job";
            job.price = 0; // Default price, can be updated later
            job.paid = false;
            job.paymentDate = null;
            job.contract = contract;
            
            // Save the job
            await job.save();
        }
        
        return contract;
    }

    private static validateContractAccess(contract: Contract | null, user: Profile): boolean {
        return !!contract && (contract.client.id === user.id || contract.contractor.id === user.id);
    }

    private static async findContractsByStatusAndUser(status: string, user: Profile): Promise<Contract[]> {
        // Cast the status string to the specific contract status type
        const contractStatus = status as "new" | "in_progress" | "terminated";
        
        return Contract.find({
            where: [
                { client: { id: user.id }, status: contractStatus },
                { contractor: { id: user.id }, status: contractStatus }
            ],
        });
    }

    private static handleError(reply: FastifyReply, message: string, error: any): FastifyReply {
        console.error(message, error);
        return reply.status(500).send({ 
            success: false,
            message: "Internal server error" 
        });
    }
}

// Export controller methods for route handlers
export const createContract = ContractController.create.bind(ContractController);
export const getContractById = ContractController.getById.bind(ContractController);
export const getContractsByStatus = ContractController.getByStatus.bind(ContractController);