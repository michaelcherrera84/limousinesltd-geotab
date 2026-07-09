import { addressMapping } from '@/data/address-mapping.ts';

export type AddressMapping = {
    company: string;
    qbCustomerRef?: string;
};

export interface MappingStorage {
    getAll(): Promise<AddressMapping[]>;
    upsert(mapping: AddressMapping): Promise<void>;
    delete(id: string): Promise<void>;
}

let memory: AddressMapping[] = addressMapping;

export const mockStorage: MappingStorage = {
    async getAll() {
        return memory;
    },
    upsert: async () => {},
    delete: async () => {},
};
