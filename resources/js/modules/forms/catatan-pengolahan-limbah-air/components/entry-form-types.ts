import type { BatchField } from '@/modules/dashboard/types';

export type EntryView = 'CHECKLIST' | 'PROCESS';

export type ChecklistStatus = 'OK' | 'NOT_OK' | '';

export type ChecklistValuePayload = {
    item_id: number;
    status: ChecklistStatus;
    note: string;
};

export type ProcessValuePayload = {
    item_id: number;
    value_text: string;
    value_number: string;
    note: string;
};

export type BatchValuePayload = {
    item_id: number;
    value_text: string;
    value_number: string;
};

export type BatchGroupPayload = {
    batch_no: number;
    values: BatchValuePayload[];
};

export type ChecklistFormState = {
    tanggal: string;
    checklist: {
        template_id: number | null;
        values: ChecklistValuePayload[];
    };
};

export type ProcessFormState = {
    tanggal: string;
    action: 'DRAFT' | 'SUBMIT';
    has_mixing: boolean;
    process: {
        template_id: number | null;
        values: ProcessValuePayload[];
    };
    batch: BatchGroupPayload[];
};

export function findBatchItem(items: BatchField[], itemId: number): BatchField | undefined {
    return items.find((item) => item.id === itemId);
}

export function normalizeChecklistStatus(status: string | null): ChecklistStatus {
    if (status === 'OK' || status === 'NOT_OK') {
        return status;
    }

    return '';
}

export function buildAvailableBatchNumbers(maxBatchNo: number, batchGroups: BatchGroupPayload[]): number[] {
    const occupied = new Set(batchGroups.map((batch) => batch.batch_no));
    const numbers: number[] = [];

    for (let batchNo = 1; batchNo <= maxBatchNo; batchNo += 1) {
        if (!occupied.has(batchNo)) {
            numbers.push(batchNo);
        }
    }

    return numbers;
}
