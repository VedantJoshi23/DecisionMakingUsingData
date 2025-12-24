import {
  College,
  ANPData,
  ClusterScores,
  ANPResult,
  AnalysisResult,
  UserPreferences,
  DEFAULT_PREFERENCES,
} from "../types/college";
import {
  clip,
  normalizePositive,
  normalizeNegative,
  principalEigenvector,
  scoresToPCM,
} from "../utils/mathUtils";

// Seeded random for reproducibility (same seed as Python notebook)
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  reset(seed: number) {
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

const rng = new SeededRandom(123);

// Generate synthetic college data (same as Python notebook)
export function generateCollegeData(): College[] {
  rng.reset(123);
  const numColleges = 30;
  const colleges: College[] = [];
  const sizeCategories: ("large" | "medium" | "small")[] = [
    "large",
    "medium",
    "small",
  ];
  const sizeWeights = [0.3, 0.4, 0.3];

  for (let i = 0; i < numColleges; i++) {
    const size = rng.choice(sizeCategories, sizeWeights);
    let college: Partial<College> = {
      id: `C${i + 1}`,
      name: `College ${i + 1}`,
      sizeCategory: size,
    };

    if (size === "large") {
      college.facultyFTE = rng.randInt(100, 180);
      college.phdFacultyCount = rng.randInt(
        Math.floor(college.facultyFTE * 0.2),
        Math.floor(college.facultyFTE * 0.5)
      );
      college.totalBedsInHostel = rng.randInt(800, 2000);
      college.infrastructureScore = rng.randInt(75, 90);
      college.operatingExpenditureLakh = rng.randInt(1000, 2000);
      college.placementRate = clip(rng.normal(85, 5), 40, 99);
      college.averagePackageLPA = clip(rng.normal(7.0, 1.0), 2.0, 12.0);
      college.researchPublications = Math.max(
        Math.round(rng.normal(40, 15)),
        0
      );
      college.studentSatisfaction = clip(rng.normal(82, 5), 40, 95);
      college.graduationRate = clip(rng.normal(92, 3), 60, 99);
    } else if (size === "medium") {
      college.facultyFTE = rng.randInt(60, 110);
      college.phdFacultyCount = rng.randInt(
        Math.floor(college.facultyFTE * 0.15),
        Math.floor(college.facultyFTE * 0.4)
      );
      college.totalBedsInHostel = rng.randInt(400, 1200);
      college.infrastructureScore = rng.randInt(65, 82);
      college.operatingExpenditureLakh = rng.randInt(600, 1200);
      college.placementRate = clip(rng.normal(78, 6), 40, 99);
      college.averagePackageLPA = clip(rng.normal(5.5, 0.8), 2.0, 12.0);
      college.researchPublications = Math.max(Math.round(rng.normal(20, 8)), 0);
      college.studentSatisfaction = clip(rng.normal(78, 6), 40, 95);
      college.graduationRate = clip(rng.normal(88, 4), 60, 99);
    } else {
      college.facultyFTE = rng.randInt(30, 70);
      college.phdFacultyCount = rng.randInt(
        Math.floor(college.facultyFTE * 0.1),
        Math.floor(college.facultyFTE * 0.3)
      );
      college.totalBedsInHostel = rng.randInt(0, 800);
      college.infrastructureScore = rng.randInt(55, 72);
      college.operatingExpenditureLakh = rng.randInt(300, 800);
      college.placementRate = clip(rng.normal(70, 7), 40, 99);
      college.averagePackageLPA = clip(rng.normal(4.0, 0.7), 2.0, 12.0);
      college.researchPublications = Math.max(Math.round(rng.normal(8, 4)), 0);
      college.studentSatisfaction = clip(rng.normal(73, 7), 40, 95);
      college.graduationRate = clip(rng.normal(82, 5), 60, 99);
    }

    college.collegeCutoffRank = rng.randInt(500, 50000);
    colleges.push(college as College);
  }

  return colleges;
}

// Input-oriented CCR DEA
function deaInputOrientedCCR(colleges: College[]): number[] {
  const inputCols = [
    "facultyFTE",
    "phdFacultyCount",
    "totalBedsInHostel",
    "infrastructureScore",
    "operatingExpenditureLakh",
  ] as const;
  const outputCols = [
    "placementRate",
    "averagePackageLPA",
    "researchPublications",
    "studentSatisfaction",
    "graduationRate",
  ] as const;

  const numDMU = colleges.length;
  const scores: number[] = new Array(numDMU).fill(0);

  // Get max cutoff rank for inversion
  const maxCutoffRank = Math.max(...colleges.map((c) => c.collegeCutoffRank));

  // Prepare input and output matrices
  const inputs: number[][] = colleges.map((c) =>
    inputCols.map((col) => c[col])
  );
  const outputs: number[][] = colleges.map((c) => [
    ...outputCols.map((col) => c[col]),
    maxCutoffRank - c.collegeCutoffRank, // Inverted cutoff rank
  ]);

  // Normalize inputs and outputs to comparable scales
  const normalizeColumn = (matrix: number[][], colIdx: number): number[] => {
    const col = matrix.map((row) => row[colIdx]);
    const max = Math.max(...col);
    const min = Math.min(...col);
    const range = max - min || 1;
    return col.map((v) => (v - min) / range);
  };

  const numInputs = inputs[0].length;
  const numOutputs = outputs[0].length;

  // Normalize all columns
  const normInputs: number[][] = [];
  const normOutputs: number[][] = [];

  for (let d = 0; d < numDMU; d++) {
    normInputs[d] = [];
    normOutputs[d] = [];
  }

  for (let i = 0; i < numInputs; i++) {
    const normCol = normalizeColumn(inputs, i);
    normCol.forEach((val, d) => {
      normInputs[d][i] = val;
    });
  }

  for (let i = 0; i < numOutputs; i++) {
    const normCol = normalizeColumn(outputs, i);
    normCol.forEach((val, d) => {
      normOutputs[d][i] = val;
    });
  }

  // Calculate DEA efficiency using output/input ratio method
  // For each DMU, efficiency = weighted output sum / weighted input sum
  // Compare against all other DMUs to find relative efficiency
  for (let d = 0; d < numDMU; d++) {
    // Sum of normalized outputs (higher is better)
    const outputScore = normOutputs[d].reduce((a, b) => a + b, 0) / numOutputs;
    // Sum of normalized inputs (lower is better, so we invert)
    const inputScore = normInputs[d].reduce((a, b) => a + b, 0) / numInputs;

    // Efficiency: high output with low input is best
    // Score = output / (input + 0.1) to avoid division issues
    scores[d] = outputScore / (inputScore + 0.1);
  }

  // Normalize scores to 0-1 range where max = 1
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore || 1;
  return scores.map((s) => 0.5 + 0.5 * ((s - minScore) / range)); // Scale to 0.5-1.0 range
}

// Get top N colleges by DEA efficiency
function getShortlistedColleges(
  colleges: College[],
  topN: number = 7
): College[] {
  const scores = deaInputOrientedCCR(colleges);

  // Add DEA scores to colleges
  colleges.forEach((c, i) => {
    c.deaEfficiencyTheta = scores[i];
  });

  // Sort by efficiency and take top N
  const sorted = [...colleges].sort(
    (a, b) => (b.deaEfficiencyTheta || 0) - (a.deaEfficiencyTheta || 0)
  );

  return sorted.slice(0, topN);
}

// Generate ANP data for shortlisted colleges
function generateANPData(
  shortlisted: College[],
  studentRank: number
): ANPData[] {
  const anpRng = new SeededRandom(456); // Different seed for ANP data
  const sizeMap = { large: 900, medium: 600, small: 350 };

  return shortlisted.map((college) => {
    const distance = anpRng.randInt(5, 600);
    const travelTime = Math.round((distance / anpRng.normal(50, 10)) * 60);

    let hostelAvailability: number;
    if (distance <= 30) {
      hostelAvailability = anpRng.choice([0, 0.5, 1], [0.3, 0.5, 0.2]);
    } else if (distance <= 200) {
      hostelAvailability = anpRng.choice([0.5, 1], [0.4, 0.6]);
    } else {
      hostelAvailability = 1.0;
    }

    const rankFitScore = clip(
      1 - studentRank / college.collegeCutoffRank,
      0,
      1
    );
    const students = sizeMap[college.sizeCategory];
    const facultyStudentRatio = college.facultyFTE / students;

    const curriculumRelevance = clip(
      anpRng.normal(75, 8) + (college.studentSatisfaction - 80) * 0.2,
      50,
      95
    );

    const totalFeePerYear = anpRng.randInt(80, 260) * 10000;
    const scholarshipAvailability = clip(
      anpRng.normal(60, 15) + (college.placementRate - 80) * 0.3,
      20,
      95
    );

    const feeFlexibility = anpRng.choice([0, 1], [0.3, 0.7]);

    const campusSafetyIndex = clip(
      anpRng.normal(80, 7) + (college.studentSatisfaction - 80) * 0.2,
      50,
      99
    );

    const extracurriculars = clip(
      anpRng.normal(78, 10) + (college.studentSatisfaction - 80) * 0.3,
      40,
      99
    );

    const localityHealthFacilities = clip(anpRng.normal(75, 8), 40, 95);

    const alumniNetworkStrength = clip(
      anpRng.normal(75, 10) + (college.placementRate - 80) * 0.4,
      40,
      99
    );

    const industryTies = clip(
      anpRng.normal(78, 8) + college.averagePackageLPA * 1.0,
      40,
      99
    );

    const specialAccreditations = clip(anpRng.normal(80, 5), 60, 99);

    return {
      college: college.id,
      rankFitScore,
      distanceFromHomeKm: distance,
      travelTimeMin: travelTime,
      hostelAvailability,
      branchOffered: 1,
      facultyStudentRatio,
      curriculumRelevance,
      totalFeePerYear,
      scholarshipAvailability,
      feeFlexibility,
      campusSafetyIndex,
      extracurriculars,
      localityHealthFacilities,
      alumniNetworkStrength,
      industryTies,
      specialAccreditations,
    };
  });
}

// Calculate cluster scores
function calculateClusterScores(anpData: ANPData[]): ClusterScores[] {
  const distances = anpData.map((a) => a.distanceFromHomeKm);
  const travelTimes = anpData.map((a) => a.travelTimeMin);
  const hostels = anpData.map((a) => a.hostelAvailability);
  const branches = anpData.map((a) => a.branchOffered);
  const facultyRatios = anpData.map((a) => a.facultyStudentRatio);
  const curriculums = anpData.map((a) => a.curriculumRelevance);
  const rankFits = anpData.map((a) => a.rankFitScore);
  const fees = anpData.map((a) => a.totalFeePerYear);
  const scholarships = anpData.map((a) => a.scholarshipAvailability);
  const feeFlexes = anpData.map((a) => a.feeFlexibility);
  const safeties = anpData.map((a) => a.campusSafetyIndex);
  const extras = anpData.map((a) => a.extracurriculars);
  const healths = anpData.map((a) => a.localityHealthFacilities);
  const alumnis = anpData.map((a) => a.alumniNetworkStrength);
  const industries = anpData.map((a) => a.industryTies);
  const accreditations = anpData.map((a) => a.specialAccreditations);

  const normDistances = normalizeNegative(distances);
  const normTravelTimes = normalizeNegative(travelTimes);
  const normHostels = normalizePositive(hostels);
  const normBranches = normalizePositive(branches);
  const normFacultyRatios = normalizePositive(facultyRatios);
  const normCurriculums = normalizePositive(curriculums);
  const normRankFits = normalizePositive(rankFits);
  const normFees = normalizeNegative(fees);
  const normScholarships = normalizePositive(scholarships);
  const normFeeFlexes = normalizePositive(feeFlexes);
  const normSafeties = normalizePositive(safeties);
  const normExtras = normalizePositive(extras);
  const normHealths = normalizePositive(healths);
  const normAlumnis = normalizePositive(alumnis);
  const normIndustries = normalizePositive(industries);
  const normAccreditations = normalizePositive(accreditations);

  return anpData.map((data, i) => ({
    college: data.college,
    logisticsScore:
      0.4 * normDistances[i] + 0.3 * normTravelTimes[i] + 0.3 * normHostels[i],
    academicScore:
      0.2 * normBranches[i] +
      0.4 * normFacultyRatios[i] +
      0.4 * normCurriculums[i] +
      0.2 * normRankFits[i],
    financialScore:
      0.4 * normFees[i] + 0.4 * normScholarships[i] + 0.2 * normFeeFlexes[i],
    campusScore:
      0.4 * normSafeties[i] + 0.3 * normExtras[i] + 0.3 * normHealths[i],
    reputationScore:
      0.4 * normAlumnis[i] +
      0.3 * normIndustries[i] +
      0.3 * normAccreditations[i],
  }));
}

// Calculate final ANP priorities with user-defined cluster weights
function calculateFinalPriorities(
  clusterScores: ClusterScores[],
  userWeights?: {
    logistics: number;
    academic: number;
    financial: number;
    campus: number;
    reputation: number;
  }
): ANPResult[] {
  const clusters = [
    "logisticsScore",
    "academicScore",
    "financialScore",
    "campusScore",
    "reputationScore",
  ] as const;
  const nClusters = clusters.length;
  const nAlt = clusterScores.length;

  // Local weights for each cluster
  const localWeights: Record<string, number[]> = {};
  clusters.forEach((cluster) => {
    const scores = clusterScores.map((cs) => cs[cluster]);
    const pcm = scoresToPCM(scores, false);
    localWeights[cluster] = principalEigenvector(pcm);
  });

  // Build cluster PCM based on user weights or default
  let clusterPCM: number[][];

  if (userWeights) {
    // Normalize user weights
    const weights = [
      userWeights.logistics,
      userWeights.academic,
      userWeights.financial,
      userWeights.campus,
      userWeights.reputation,
    ];
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    const normWeights = weights.map((w) => (w / totalWeight) * 5 + 0.1); // Scale to reasonable range

    // Build PCM from weights
    clusterPCM = [];
    for (let i = 0; i < 5; i++) {
      clusterPCM[i] = [];
      for (let j = 0; j < 5; j++) {
        clusterPCM[i][j] = normWeights[i] / normWeights[j];
      }
    }
  } else {
    // Default inter-cluster influence matrix (from Python notebook)
    clusterPCM = [
      [1, 1 / 3, 1 / 2, 1 / 2, 1 / 4], // Logistics
      [3, 1, 2, 2, 1 / 2], // Academic
      [2, 1 / 2, 1, 1, 1 / 3], // Financial
      [2, 1 / 2, 1, 1, 1 / 3], // Campus
      [4, 2, 3, 3, 1], // Reputation
    ];
  }

  const clusterPriorities = principalEigenvector(clusterPCM);

  // Build supermatrix
  const N = nAlt * nClusters;
  const supermatrix: number[][] = [];
  for (let i = 0; i < N; i++) {
    supermatrix[i] = new Array(N).fill(0);
  }

  const idx = (clusterIndex: number, altIndex: number) =>
    clusterIndex * nAlt + altIndex;

  for (let iCl = 0; iCl < nClusters; iCl++) {
    for (let jCl = 0; jCl < nClusters; jCl++) {
      const influence = clusterPriorities[jCl];
      const wI = localWeights[clusters[iCl]];

      for (let a = 0; a < nAlt; a++) {
        for (let b = 0; b < nAlt; b++) {
          supermatrix[idx(iCl, a)][idx(jCl, b)] = wI[a] * influence;
        }
      }
    }
  }

  // Column normalize
  for (let j = 0; j < N; j++) {
    const colSum = supermatrix.reduce((sum, row) => sum + row[j], 0);
    if (colSum > 0) {
      for (let i = 0; i < N; i++) {
        supermatrix[i][j] /= colSum;
      }
    }
  }

  // Compute limit matrix
  let limit = supermatrix.map((row) => [...row]);
  for (let iter = 0; iter < 150; iter++) {
    const newLimit: number[][] = [];
    for (let i = 0; i < N; i++) {
      newLimit[i] = new Array(N).fill(0);
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          newLimit[i][j] += limit[i][k] * supermatrix[k][j];
        }
      }
    }
    limit = newLimit;
  }

  // Aggregate final priorities
  const finalPrioritiesRaw: number[] = new Array(nAlt).fill(0);
  for (let a = 0; a < nAlt; a++) {
    for (let c = 0; c < nClusters; c++) {
      const rowIdx = idx(c, a);
      finalPrioritiesRaw[a] += limit[rowIdx].reduce((sum, val) => sum + val, 0);
    }
  }

  const totalPriority = finalPrioritiesRaw.reduce((a, b) => a + b, 0);
  const finalPriorities = finalPrioritiesRaw.map((p) => p / totalPriority);

  // Create results
  const results: ANPResult[] = clusterScores.map((cs, i) => ({
    college: cs.college,
    priority: finalPriorities[i],
    rank: 0,
  }));

  // Sort by priority and assign ranks
  results.sort((a, b) => b.priority - a.priority);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return results;
}

// Main analysis function - filters by user preferences, then DEA, then ANP
export function runAnalysis(
  preferences: UserPreferences = DEFAULT_PREFERENCES
): AnalysisResult {
  // Generate college data
  const allColleges = generateCollegeData();
  const totalColleges = allColleges.length;

  // Step 1: Filter colleges based on multiple criteria
  let eligibleColleges = allColleges.filter((college) => {
    // Must qualify based on cutoff rank
    if (preferences.studentRank > college.collegeCutoffRank) {
      return false;
    }

    // Filter by minimum placement rate
    if (college.placementRate < preferences.minPlacementRate) {
      return false;
    }

    // Filter by minimum average package
    if (college.averagePackageLPA < preferences.minAveragePackage) {
      return false;
    }

    // Filter by preferred size
    if (
      preferences.preferredSize !== "any" &&
      college.sizeCategory !== preferences.preferredSize
    ) {
      return false;
    }

    return true;
  });

  const eligibleCount = eligibleColleges.length;

  // If no eligible colleges, return empty result
  if (eligibleColleges.length === 0) {
    return {
      shortlistedColleges: [],
      anpData: [],
      clusterScores: [],
      finalPriorities: [],
      eligibleCount: 0,
      totalColleges,
    };
  }

  // Step 2: Run DEA on eligible colleges and get top 7 (or all if less than 7)
  const shortlistCount = Math.min(7, eligibleColleges.length);
  const shortlistedColleges = getShortlistedColleges(
    eligibleColleges,
    shortlistCount
  );

  // Step 3: Generate ANP data based on user preferences
  const anpData = generateANPDataWithPreferences(
    shortlistedColleges,
    preferences
  );

  // Step 4: Calculate cluster scores
  const clusterScores = calculateClusterScores(anpData);

  // Step 5: Calculate final priorities using ANP with user weights
  const userWeights = {
    logistics: preferences.logisticsWeight,
    academic: preferences.academicWeight,
    financial: preferences.financialWeight,
    campus: preferences.campusWeight,
    reputation: preferences.reputationWeight,
  };
  const finalPriorities = calculateFinalPriorities(clusterScores, userWeights);

  return {
    shortlistedColleges,
    anpData,
    clusterScores,
    finalPriorities,
    eligibleCount,
    totalColleges,
  };
}

// Generate ANP data with user preferences
function generateANPDataWithPreferences(
  shortlisted: College[],
  preferences: UserPreferences
): ANPData[] {
  const anpRng = new SeededRandom(456);
  const sizeMap = { large: 900, medium: 600, small: 350 };

  return shortlisted.map((college) => {
    // Distance based on max preference - closer colleges within range get better scores
    const maxDist = preferences.maxDistanceFromHome;
    const distance = anpRng.randInt(5, Math.min(600, maxDist * 1.5));
    const travelTime = Math.round((distance / anpRng.normal(50, 10)) * 60);

    // Hostel availability based on user preference and distance
    let hostelAvailability: number;
    const hostelPref = preferences.hostelRequired;
    if (hostelPref === "required") {
      // Required - assume all shortlisted have it
      hostelAvailability = anpRng.choice([0.8, 1], [0.3, 0.7]);
    } else if (hostelPref === "preferred") {
      if (distance <= 30) {
        hostelAvailability = anpRng.choice([0, 0.5, 1], [0.3, 0.5, 0.2]);
      } else if (distance <= 200) {
        hostelAvailability = anpRng.choice([0.5, 1], [0.4, 0.6]);
      } else {
        hostelAvailability = 1.0;
      }
    } else {
      hostelAvailability = anpRng.choice([0, 0.5, 1], [0.4, 0.4, 0.2]);
    }

    const rankFitScore = clip(
      1 - preferences.studentRank / college.collegeCutoffRank,
      0,
      1
    );
    const students = sizeMap[college.sizeCategory];
    const facultyStudentRatio = college.facultyFTE / students;

    const curriculumRelevance = clip(
      anpRng.normal(75, 8) + (college.studentSatisfaction - 80) * 0.2,
      50,
      95
    );

    // Fee based on user's max budget
    const maxFee = preferences.maxFeePerYear;
    const totalFeePerYear = anpRng.randInt(
      Math.max(800000, maxFee * 0.4),
      Math.min(2600000, maxFee * 1.2)
    );

    // Scholarship based on user's need
    let scholarshipBase = 60;
    if (preferences.scholarshipNeeded === "essential") {
      scholarshipBase = 75;
    } else if (preferences.scholarshipNeeded === "not_important") {
      scholarshipBase = 50;
    }
    const scholarshipAvailability = clip(
      anpRng.normal(scholarshipBase, 15) + (college.placementRate - 80) * 0.3,
      20,
      95
    );

    const feeFlexibility = anpRng.choice([0, 1], [0.3, 0.7]);

    // Campus safety based on user importance
    let safetyBase = 80;
    if (preferences.campusSafetyImportance === "very_high") {
      safetyBase = 85;
    } else if (preferences.campusSafetyImportance === "low") {
      safetyBase = 70;
    }
    const campusSafetyIndex = clip(
      anpRng.normal(safetyBase, 7) + (college.studentSatisfaction - 80) * 0.2,
      50,
      99
    );

    // Extracurriculars based on user importance
    let extraBase = 78;
    if (preferences.extracurricularsImportance === "very_high") {
      extraBase = 85;
    } else if (preferences.extracurricularsImportance === "low") {
      extraBase = 65;
    }
    const extracurriculars = clip(
      anpRng.normal(extraBase, 10) + (college.studentSatisfaction - 80) * 0.3,
      40,
      99
    );

    const localityHealthFacilities = clip(anpRng.normal(75, 8), 40, 95);

    const alumniNetworkStrength = clip(
      anpRng.normal(75, 10) + (college.placementRate - 80) * 0.4,
      40,
      99
    );

    const industryTies = clip(
      anpRng.normal(78, 8) + college.averagePackageLPA * 1.0,
      40,
      99
    );

    const specialAccreditations = clip(anpRng.normal(80, 5), 60, 99);

    return {
      college: college.id,
      rankFitScore,
      distanceFromHomeKm: distance,
      travelTimeMin: travelTime,
      hostelAvailability,
      branchOffered: 1,
      facultyStudentRatio,
      curriculumRelevance,
      totalFeePerYear,
      scholarshipAvailability,
      feeFlexibility,
      campusSafetyIndex,
      extracurriculars,
      localityHealthFacilities,
      alumniNetworkStrength,
      industryTies,
      specialAccreditations,
    };
  });
}

// Legacy function for backward compatibility
export function runAnalysisWithRank(studentRank: number): AnalysisResult {
  return runAnalysis({ ...DEFAULT_PREFERENCES, studentRank });
}

// Get all 30 colleges with their data and cluster scores for home screen
export function getAllCollegesWithScores(): {
  colleges: College[];
  clusterScores: ClusterScores[];
} {
  const allColleges = generateCollegeData();

  // Calculate DEA scores for all colleges
  const collegesWithDEA = getShortlistedColleges(allColleges, 30); // Get all with DEA scores

  // Generate ANP data for all colleges with default preferences
  const anpData = generateANPDataWithPreferences(
    collegesWithDEA,
    DEFAULT_PREFERENCES
  );

  // Calculate cluster scores for all
  const clusterScores = calculateClusterScores(anpData);

  return {
    colleges: collegesWithDEA,
    clusterScores,
  };
}
