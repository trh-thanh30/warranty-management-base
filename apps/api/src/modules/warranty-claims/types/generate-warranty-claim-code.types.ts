export interface IGenerateWarrantyClaimCodeUseCase {
  generateWarrantyClaimCodeBatch(count: number): Promise<string[]>;
  generateWarrantyClaimCode(): Promise<string>;
  execute(): Promise<string>;
}
