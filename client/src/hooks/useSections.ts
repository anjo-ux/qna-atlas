import { useQuery } from "@tanstack/react-query";
import type { Section } from "@/types/question";
import { useSpecialty } from "@/hooks/useSpecialty";

export function useSections() {
  const { activeSpecialty } = useSpecialty();
  const { data: sections = [], isLoading, error } = useQuery<Section[]>({
    queryKey: ["/api/sections", activeSpecialty],
    queryFn: async () => {
      const res = await fetch("/api/sections", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });
  return { sections, isLoading, error };
}
