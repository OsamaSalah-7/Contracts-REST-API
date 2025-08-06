import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Contract } from "./contract.model";

@Entity()
export class Profile extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	firstName!: string;

	@Column()
	lastName!: string;

	@Column()
	profession!: string;

	@Column("float", { default: 0 })
	balance!: number;

	@Column({ type: "enum", enum: ["Client", "Contractor"], default: "Client" })
	type!: "Client" | "Contractor";

	@Column({ unique: true })
	username!: string;

	@Column()
	password!: string;

	@OneToMany(() => Contract, (contract) => contract.client)
	contractsAsClient!: Contract[];

	@OneToMany(() => Contract, (contract) => contract.contractor)
	contractsAsContractor!: Contract[];
}


export interface SignupUserData {
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: "Client" | "Contractor";
    username: string;
    password: string;
}

export interface LoginUserData {
    username: string;
    password: string;
}