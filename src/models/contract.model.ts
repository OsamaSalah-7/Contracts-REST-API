import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm";
import { Profile } from './profile.model';

@Entity()
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    terms!: string;

    @Column({ type: "enum", enum: ["new", "in_progress", "terminated"] })
    status!: "new" | "in_progress" | "terminated";

    @ManyToOne(() => Profile, (profile) => profile.contractsAsClient)
    client!: Profile;

    @ManyToOne(() => Profile, (profile) => profile.contractsAsContractor)
    contractor!: Profile;
}

export interface CreateContractInfo {
  contractorId: number;
  terms: string;
  status?: "new" | "in_progress" | "terminated";
  jobDescription?: string;
  jobPrice?: number;
}
