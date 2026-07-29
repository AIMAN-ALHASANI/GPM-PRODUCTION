import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import structureService from '../services/structureService';
import toast from 'react-hot-toast';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: structureService.getDepartments,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => structureService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('تم إضافة القسم بنجاح');
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => structureService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('تم تحديث القسم بنجاح');
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => structureService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('تم حذف القسم بنجاح');
    },
  });
};

export const useColleges = () => {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: structureService.getColleges,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUniversities = () => {
  return useQuery({
    queryKey: ['universities'],
    queryFn: structureService.getUniversities,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
