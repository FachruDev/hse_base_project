import Swal, { type SweetAlertOptions } from 'sweetalert2';

export const showAlert = (options: SweetAlertOptions) => {
    return Swal.fire({
        ...options,
        customClass: {
            popup: 'rounded-xl border border-border/50 bg-background text-foreground shadow-lg dark:bg-card',
            title: 'text-lg font-semibold text-foreground',
            htmlContainer: 'text-sm text-muted-foreground',
            confirmButton: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mx-2',
            cancelButton: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 mx-2',
        },
        buttonsStyling: false,
    });
};

export const confirmDelete = async (title: string = 'Apakah Anda yakin?', text: string = 'Data yang dihapus tidak dapat dikembalikan!') => {
    const result = await showAlert({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-xl border border-border/50 bg-background text-foreground shadow-lg dark:bg-card',
            title: 'text-lg font-semibold text-foreground',
            htmlContainer: 'text-sm text-muted-foreground',
            confirmButton: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 mx-2',
            cancelButton: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mx-2',
        },
    });

    return result.isConfirmed;
};
