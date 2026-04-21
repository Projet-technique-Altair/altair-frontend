import { WORLD_H, WORLD_W } from "./starpathWorld";

export type LabType = "course" | "guided" | "challenge" | "unguided";

export type StarpathLabInput = {
  lab_id: string;
  position: number;
  name?: string;
};

export type PlacedLab = {
  lab_id: string;
  order: number;
  chapterIndex: 1 | 2 | 3;
  chapterName: string;
  chapterRgb: string;
  title: string;
  type: LabType;
  description: string;
  x: number;
  y: number;
  size: number;
  status: "completed" | "current" | "locked";
};

function hashStringToUint32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function randBetween(rng: () => number, a: number, b: number) {
  return a + (b - a) * rng();
}

export function buildStarpathLabLayout(
  seed: string,
  labs: StarpathLabInput[],
  completedCount = 5
) {
  const rng = mulberry32(hashStringToUint32(seed + "|labs-layer"));
  const labsMapped = (labs ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((lab, i) => {
      const order = i + 1;
      const chapterIndex = Math.ceil(order / 3) as 1 | 2 | 3;

      const chapterMeta = {
        1: { name: "Foundations", rgb: "56,189,248" },
        2: { name: "Web & Systems", rgb: "122,44,243" },
        3: { name: "Operations", rgb: "236,72,153" },
      }[chapterIndex];

      return {
        lab_id: lab.lab_id,
        order,
        chapterIndex,
        chapterName: chapterMeta.name,
        chapterRgb: chapterMeta.rgb,
        title: lab.name ?? lab.lab_id,
        type: "guided" as LabType,
        description: "",
      };
    });

  const baseCenters = [
    { x: WORLD_W * 0.4, y: WORLD_H * 0.58 },
    { x: WORLD_W * 0.53, y: WORLD_H * 0.44 },
    { x: WORLD_W * 0.66, y: WORLD_H * 0.6 },
  ].map((c) => ({
    x: c.x + randBetween(rng, -110, 110),
    y: c.y + randBetween(rng, -110, 110),
  }));

  const baseAngles = [-18, 18, 52].map(
    (a) => (a + randBetween(rng, -12, 12)) * (Math.PI / 180)
  );

  const placed: PlacedLab[] = [];

  const overlaps = (x: number, y: number, r: number) => {
    for (const p of placed) {
      const pr = p.size * 0.55;
      const dx = x - p.x;
      const dy = y - p.y;
      const min = r + pr + 46;
      if (dx * dx + dy * dy < min * min) return true;
    }
    return false;
  };

  const placeChapter = (chapterIndex: 1 | 2 | 3) => {
    const center = baseCenters[chapterIndex - 1];
    const angle = baseAngles[chapterIndex - 1];
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    const perp = { x: -dir.y, y: dir.x };
    const list = labsMapped.filter((l) => l.chapterIndex === chapterIndex);
    const spacing = 310;

    for (let i = 0; i < list.length; i++) {
      const lab = list[i];
      const t = i - (list.length - 1) / 2;

      const size =
        lab.type === "course"
          ? Math.round(270 + randBetween(rng, -12, 12))
          : lab.type === "unguided"
          ? Math.round(285 + randBetween(rng, -10, 10))
          : Math.round(250 + randBetween(rng, -12, 12));

      const status: PlacedLab["status"] =
        lab.order <= completedCount
          ? "completed"
          : lab.order === completedCount + 1
          ? "current"
          : "locked";

      let px = 0;
      let py = 0;
      let ok = false;

      for (let tries = 0; tries < 80; tries++) {
        const jitterAlong = randBetween(rng, -22, 22);
        const jitterPerp = randBetween(rng, -130, 130);
        const jitterFineX = randBetween(rng, -24, 24);
        const jitterFineY = randBetween(rng, -24, 24);

        px =
          center.x +
          dir.x * (t * spacing + jitterAlong) +
          perp.x * jitterPerp +
          jitterFineX;
        py =
          center.y +
          dir.y * (t * spacing + jitterAlong) +
          perp.y * jitterPerp +
          jitterFineY;

        px = clamp(px, 260, WORLD_W - 260);
        py = clamp(py, 260, WORLD_H - 260);

        const r = size * 0.55;
        if (!overlaps(px, py, r)) {
          ok = true;
          break;
        }
      }

      if (!ok) {
        px = clamp(center.x + t * spacing, 260, WORLD_W - 260);
        py = clamp(center.y, 260, WORLD_H - 260);
      }

      placed.push({
        ...lab,
        x: Math.round(px * 2) / 2,
        y: Math.round(py * 2) / 2,
        size,
        status,
      });
    }
  };

  placeChapter(1);
  placeChapter(2);
  placeChapter(3);

  placed.sort((a, b) => a.order - b.order);
  return placed;
}
