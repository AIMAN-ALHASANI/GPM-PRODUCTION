import { useState, useEffect, useCallback } from 'react';
import teamService from '../services/teamService';

/**
 * Shared hook for all student pages.
 * Calls GET /team/my-team once and exposes the result.
 *
 * Backend returns:
 *   - 200 OK { success: true, data: TeamDto }   — student is in a team
 *   - 200 OK { success: true, data: null }       — student has no team (expected state)
 *
 * Returns:
 *   team      — full team object from the API (null if not in a team)
 *   hasTeam   — boolean
 *   isLoading — true while the request is in-flight
 *   error     — string for genuine server/network errors only (not "no team")
 *   refetch   — call this after creating / joining a team to refresh
 */
const useMyTeam = () => {
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamService.getMyTeam();
      // data is null when backend returns { data: null } (no team) — valid state
      setTeam(data || null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        // Fallback: older backend behaviour returned 404 for no-team
        setTeam(null);
      } else {
        // Only set error for genuine server/network failures (500, network down…)
        setError(err.response?.data?.message || 'فشل تحميل بيانات الفريق');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const hasTeam = !!(team && (team.TeamID || team.teamID || team.id || team.teamId));

  // Normalise team status (backend may send numeric enum or string)
  const rawStatus = team?.Status ?? team?.status ?? team?.teamStatus ?? team?.approvalStatus;
  const normalizedStatus = (() => {
    if (typeof rawStatus === 'number') {
      if (rawStatus === 1) return 'Approved';
      if (rawStatus === 2) return 'Rejected';
      return 'Pending';
    }
    return String(rawStatus ?? '').trim();
  })();

  const isApproved =
    normalizedStatus === 'Approved' ||
    normalizedStatus === 'approved' ||
    team?.isApproved === true;

  const isPending = hasTeam && !isApproved && normalizedStatus !== 'Rejected' && normalizedStatus !== 'rejected';

  return {
    team,
    hasTeam,
    isApproved,
    isPending,
    teamStatus: normalizedStatus,
    isLoading,
    error,
    refetch: fetchTeam,
  };
};

export default useMyTeam;
