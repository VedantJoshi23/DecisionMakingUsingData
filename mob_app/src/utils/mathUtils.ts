// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  randInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  normal(mean: number, std: number): number {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
  }

  choice<T>(arr: T[], weights?: number[]): T {
    if (weights) {
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = this.next() * totalWeight;
      for (let i = 0; i < arr.length; i++) {
        random -= weights[i];
        if (random <= 0) return arr[i];
      }
      return arr[arr.length - 1];
    }
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export const rng = new SeededRandom(123);

export function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizePositive(arr: number[]): number[] {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1e-9;
  return arr.map((x) => (x - min) / range);
}

export function normalizeNegative(arr: number[]): number[] {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1e-9;
  return arr.map((x) => (max - x) / range);
}

// Principal eigenvector computation
export function principalEigenvector(matrix: number[][]): number[] {
  const n = matrix.length;
  let v = new Array(n).fill(1 / n);

  // Power iteration
  for (let iter = 0; iter < 100; iter++) {
    const newV = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newV[i] += matrix[i][j] * v[j];
      }
    }

    // Normalize
    const sum = newV.reduce((a, b) => a + Math.abs(b), 0);
    for (let i = 0; i < n; i++) {
      newV[i] = Math.abs(newV[i]) / sum;
    }
    v = newV;
  }

  return v;
}

// Build pairwise comparison matrix from scores
export function scoresToPCM(
  scores: number[],
  reverse: boolean = false
): number[][] {
  const n = scores.length;
  const pcm: number[][] = [];

  for (let i = 0; i < n; i++) {
    pcm[i] = [];
    for (let j = 0; j < n; j++) {
      if (reverse) {
        pcm[i][j] = scores[j] / (scores[i] + 1e-9);
      } else {
        pcm[i][j] = scores[i] / (scores[j] + 1e-9);
      }
    }
  }

  return pcm;
}
