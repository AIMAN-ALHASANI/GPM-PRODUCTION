import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';
import toast from 'react-hot-toast';

export const useProjects = (params) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getAllProjects(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useCollegeProjects = () => {
  return useQuery({
    queryKey: ['college-projects'],
    queryFn: projectService.getCollegeProjects,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => projectService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('تم تحديث حالة المشروع بنجاح');
    },
  });
};
