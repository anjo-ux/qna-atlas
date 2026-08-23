import { useQuery } from "@tanstack/react-query";
import type { Section } from "@/types/question";
import { useSpecialty } from "@/hooks/useSpecialty";

export function useSections() {
  const { activeSpecialty, lockedBySpecialty, isSwitching } = useSpecialty();
  const isLocked = lockedBySpecialty[activeSpecialty] === true;

  const { data: sections = [], isLoading, error } = useQuery<Section[]>({
    queryKey: ["/api/sections", activeSpecialty],
    enabled: !isLocked && !isSwitching,
    queryFn: async () => {
      const res = await fetch("/api/sections", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        throw new Error("Subscription required to access the question bank");
      }
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });
  return { sections, isLoading: isLoading && !isLocked, error };
}
