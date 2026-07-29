import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import meetingService from '../services/meetingService';
import reportService from '../services/reportService';
import teamService from '../services/teamService';
import projectService from '../services/projectService';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

export const useSupervisorTeams = () => {
    return useQuery({
        queryKey: ['supervisor', 'teams'],
        queryFn: () => teamService.getSupervisorTeams(),
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
    });
};

export const useSupervisorMeetings = (teamId) => {
    return useQuery({
        queryKey: ['supervisor', 'meetings', teamId],
        queryFn: () => meetingService.getTeamMeetings(teamId),
        enabled: !!teamId && Number(teamId) > 0,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: false,
    });
};

export const useCreateMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (meetingData) => meetingService.scheduleMeeting(meetingData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supervisor', 'meetings', variables.TeamID] });
            toast.success('تم إنشاء الاجتماع بنجاح');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'فشل في إنشاء الاجتماع');
        }
    });
};

export const useSupervisorReports = (teamId) => {
    return useQuery({
        queryKey: ['supervisor', 'reports', teamId],
        queryFn: () => reportService.getTeamReports(teamId),
        enabled: !!teamId && Number(teamId) > 0,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: false,
    });
};

export const useAddReportFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, payload }) => reportService.provideFeedback(reportId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supervisor', 'reports'] });
            toast.success('تم حفظ الملاحظات بنجاح');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'فشل في حفظ الملاحظات');
        }
    });
};

export const useSupervisorProjects = () => {
    return useQuery({
        queryKey: ['supervisor', 'projects'],
        queryFn: () => projectService.getMySupervisedProjects(),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: false,
    });
};

export const useUpdateProjectStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, status }) => projectService.updateProjectStatusBySupervisor(projectId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supervisor', 'projects'] });
            toast.success('تم تحديث حالة المشروع بنجاح');
        },
        onError: (err) => {
            const message = err?.response?.data?.message || 'فشل في تحديث حالة المشروع';
            toast.error(message);
        }
    });
};

export const usePendingReportsCount = () => {
    return useQuery({
        queryKey: ['supervisor', 'reports', 'pending-count'],
        queryFn: async () => {
            const response = await apiClient.get('/Reports/pending-count');
            return response.data;
        },
        staleTime: 15 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: false,
    });
};
