import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import requestService from '../services/requestService';
import toast from 'react-hot-toast';

export const useRequests = () => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: requestService.getAllRequests,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useReviewRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewData }) => requestService.reviewRequest(id, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('تمت مراجعة الطلب بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في مراجعة الطلب');
    }
  });
};
