import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import proposalService from '../services/proposalService';
import toast from 'react-hot-toast';

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: proposalService.getAllProposals,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useProposal = (id) => {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getProposalById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useMyProposals = () => {
  return useQuery({
    queryKey: ['my-proposals'],
    queryFn: proposalService.getMyProposals,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useEvaluateProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, evaluationData }) => proposalService.evaluateProposal(id, evaluationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('تم تقييم المقترح بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تقييم المقترح');
    }
  });
};

export const useSubmitProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: proposalService.submitProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('تم تقديم المقترح بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تقديم المقترح');
    }
  });
};
