export type Lab = { id: number; name: string; description: string; level: "Beginner"|"Intermediate"|"Advanced" };

export const mockLabs: Lab[] = [
  { id: 1, name: "Linux Basics", description: "First steps with Linux", level: "Beginner" },
  { id: 2, name: "Kubernetes Intro", description: "Pods, Deployments, Services", level: "Intermediate" },
  { id: 3, name: "Networking 101", description: "TCP/UDP, routing, tools", level: "Beginner" },
];

export const getLabs = async (): Promise<Lab[]> => Promise.resolve(mockLabs);
export const getLab = async (id: number): Promise<Lab | undefined> =>
  Promise.resolve(mockLabs.find(l => l.id === id));
