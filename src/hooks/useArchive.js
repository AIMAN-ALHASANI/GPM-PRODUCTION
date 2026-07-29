import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import archiveService from '../services/archiveService';
import toast from 'react-hot-toast';

export const useArchivedProjects = () => {
    return useQuery({
        queryKey: ['archivedProjects'],
        queryFn: archiveService.getAll,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCollegeArchivedProjects = () => {
    return useQuery({
        queryKey: ['college-archived-projects'],
        queryFn: archiveService.getCollegeArchivedProjects,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useArchivedProject = (id) => {
    return useQuery({
        queryKey: ['archivedProject', id],
        queryFn: () => archiveService.getById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCreateArchive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: archiveService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['archivedProjects']);
            queryClient.invalidateQueries(['college-archived-projects']);
            toast.success('تم أرشفة المشروع بنجاح');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الأرشفة');
        }
    });
};

export const useCompletedProjectsForArchive = () => {
    return useQuery({
        queryKey: ['completed-projects-for-archive'],
        queryFn: archiveService.getCompletedForArchive,
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useArchiveProjectWithScore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: archiveService.archiveWithScore,
        onSuccess: () => {
            queryClient.invalidateQueries(['completed-projects-for-archive']);
            queryClient.invalidateQueries(['archivedProjects']);
            queryClient.invalidateQueries(['college-archived-projects']);
            toast.success('تم أرشفة المشروع بنجاح');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء أرشفة المشروع');
        }
    });
};

export const useUpdateArchive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => archiveService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['archivedProjects']);
            queryClient.invalidateQueries(['college-archived-projects']);
            toast.success('تم تحديث بيانات الأرشيف بنجاح');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الأرشيف');
        }
    });
};

export const useDeleteArchive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => archiveService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['completed-projects-for-archive']);
            queryClient.invalidateQueries(['archivedProjects']);
            queryClient.invalidateQueries(['college-archived-projects']);
            toast.success('تم حذف المشروع من الأرشيف بنجاح');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المشروع من الأرشيف');
        }
    });
};
