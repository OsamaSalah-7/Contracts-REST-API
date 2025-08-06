import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Contract } from './contract.model';

@Entity()
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column('float')
  price!: number;

  @Column({ default: false })
  paid!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paymentDate!: Date | null;

  @ManyToOne(() => Contract, { eager: true })
  contract!: Contract;
}

export interface JobPaymentResult {
  success: boolean;
  message: string;
  job?: Job;
}
