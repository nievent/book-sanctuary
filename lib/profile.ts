export type ProfileVisibility = {
  showProfile: boolean
  showBooks: boolean
  showRatings: boolean
  showNotes: boolean
  showProgress: boolean
  showStats: boolean
}

export const DEFAULT_PROFILE_VISIBILITY: ProfileVisibility = {
  showProfile: true,
  showBooks: true,
  showRatings: true,
  showNotes: true,
  showProgress: true,
  showStats: true,
}

export function getProfileVisibility(metadata: unknown): ProfileVisibility {
  const candidate = (metadata as { profile_visibility?: Partial<ProfileVisibility> } | null)?.profile_visibility
  if (!candidate) return DEFAULT_PROFILE_VISIBILITY

  return {
    showProfile: candidate.showProfile ?? true,
    showBooks: candidate.showBooks ?? true,
    showRatings: candidate.showRatings ?? true,
    showNotes: candidate.showNotes ?? true,
    showProgress: candidate.showProgress ?? true,
    showStats: candidate.showStats ?? true,
  }
}
