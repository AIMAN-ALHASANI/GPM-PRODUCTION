import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamService from '../services/teamService';
import toast from 'react-hot-toast';

export const useTeams = (params) => {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamService.getAllTeams(params),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCollegeTeams = () => {
  return useQuery({
    queryKey: ['college-teams'],
    queryFn: teamService.getCollegeTeams,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMyTeam = () => {
  return useQuery({
    queryKey: ['my-team'],
    queryFn: teamService.getMyTeam,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('تم إنشاء الفريق بنجاح');
    },
  });
};

export const useTeamDetails = (id) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamService.getTeamById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateTeamStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, statusData }) => teamService.updateStatus(teamId, statusData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
      toast.success('تم تحديث حالة الفريق بنجاح');
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, teamName }) => teamService.updateTeamName(teamId, teamName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
      toast.success('تم تحديث اسم الفريق بنجاح');
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('تم حذف الفريق بنجاح');
    },
    onError: (error) => {
      toast.error('فشل حذف الفريق');
      console.error(error);
    }
  });
};

export const useTeamMembers = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => teamService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useAssignTeamLeader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => teamService.assignTeamLeader(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
      toast.success('تم تعيين قائد الفريق بنجاح');
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => teamService.addMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
      toast.success('تم إضافة العضو بنجاح');
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => teamService.removeMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
      toast.success('تم إزالة العضو بنجاح');
    },
  });
};
