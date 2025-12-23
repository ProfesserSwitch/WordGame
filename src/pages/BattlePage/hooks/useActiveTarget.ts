import { useGameStore } from "../store/useGameStore";

export function useActiveTarget(selectedTargetId: number | null) {
  const enemies = useGameStore((s) => s.enemies);

  const alive = enemies.filter((e) => e.hp > 0);

  if (!alive.length) return null;

  if (selectedTargetId && alive.some((e) => e.id === selectedTargetId)) {
    return selectedTargetId;
  }

  return alive[0].id;
}
