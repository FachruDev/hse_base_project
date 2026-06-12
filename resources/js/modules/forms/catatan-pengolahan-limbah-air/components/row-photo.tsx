import { Paperclip, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

type RowPhotoProps = {
    index: number;
    readOnly: boolean;
    existingUrl?: string | null;
    existingName?: string | null;
    currentFile: File | null | undefined;
    inputRef: React.Ref<HTMLInputElement>;
    onFileChange: (file: File | null) => void;
    onClear: () => void;
};

export function RowPhoto({
    index,
    readOnly,
    existingUrl,
    existingName,
    currentFile,
    inputRef,
    onFileChange,
    onClear,
}: RowPhotoProps) {
    return (
        <div className="flex flex-col gap-2">
            {!readOnly ? (
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        id={`file-upload-${index}`}
                        ref={inputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            onFileChange(file);
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const input = document.getElementById(`file-upload-${index}`);
                            if (input) {
                                input.click();
                            }
                        }}
                    >
                        <Paperclip className="mr-2 size-3" />
                        Pilih File
                    </Button>
                    {(currentFile ?? existingName) ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClear}
                        >
                            <X className="size-4" />
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {currentFile ? (
                <p className="text-xs text-muted-foreground">
                    Baru: {currentFile.name}
                </p>
            ) : existingUrl ? (
                <a
                    href={existingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    {existingName ?? 'Lihat Lampiran'}
                </a>
            ) : readOnly ? (
                <span className="text-xs text-muted-foreground">-</span>
            ) : null}
        </div>
    );
}
