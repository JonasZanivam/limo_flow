import { IsUUID } from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  proposalId!: string;
}
