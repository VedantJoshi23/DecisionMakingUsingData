// College data types based on the analysis notebook

export interface College {
  id: string;
  name: string;
  sizeCategory: "large" | "medium" | "small";

  // DEA Inputs
  facultyFTE: number;
  phdFacultyCount: number;
  totalBedsInHostel: number;
  infrastructureScore: number;
  operatingExpenditureLakh: number;

  // DEA Outputs
  placementRate: number;
  averagePackageLPA: number;
  researchPublications: number;
  studentSatisfaction: number;
  graduationRate: number;
  collegeCutoffRank: number;

  // Computed
  deaEfficiencyTheta?: number;
}

// User preferences for personalized analysis
export interface UserPreferences {
  // Basic Info
  studentRank: number;

  // Logistics Preferences
  maxDistanceFromHome: number; // km - max acceptable distance
  hostelRequired: "required" | "preferred" | "not_needed";

  // Academic Preferences
  preferredBranch: string;
  minPlacementRate: number; // minimum acceptable placement rate
  minAveragePackage: number; // minimum acceptable package in LPA

  // Financial Preferences
  maxFeePerYear: number; // max budget in INR
  scholarshipNeeded: "essential" | "preferred" | "not_important";

  // Campus Life Preferences
  campusSafetyImportance: "very_high" | "high" | "medium" | "low";
  extracurricularsImportance: "very_high" | "high" | "medium" | "low";

  // College Size Preference
  preferredSize: "large" | "medium" | "small" | "any";

  // Cluster Weights (how important each factor is to the user)
  logisticsWeight: number; // 0-100
  academicWeight: number; // 0-100
  financialWeight: number; // 0-100
  campusWeight: number; // 0-100
  reputationWeight: number; // 0-100
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  studentRank: 10000,
  maxDistanceFromHome: 500,
  hostelRequired: "preferred",
  preferredBranch: "Computer Science",
  minPlacementRate: 60,
  minAveragePackage: 4,
  maxFeePerYear: 2000000,
  scholarshipNeeded: "preferred",
  campusSafetyImportance: "high",
  extracurricularsImportance: "medium",
  preferredSize: "any",
  logisticsWeight: 50,
  academicWeight: 70,
  financialWeight: 60,
  campusWeight: 50,
  reputationWeight: 80,
};

export interface ANPData {
  college: string;
  rankFitScore: number;
  distanceFromHomeKm: number;
  travelTimeMin: number;
  hostelAvailability: number;
  branchOffered: number;
  facultyStudentRatio: number;
  curriculumRelevance: number;
  totalFeePerYear: number;
  scholarshipAvailability: number;
  feeFlexibility: number;
  campusSafetyIndex: number;
  extracurriculars: number;
  localityHealthFacilities: number;
  alumniNetworkStrength: number;
  industryTies: number;
  specialAccreditations: number;
}

export interface ClusterScores {
  college: string;
  logisticsScore: number;
  academicScore: number;
  financialScore: number;
  campusScore: number;
  reputationScore: number;
}

export interface ANPResult {
  college: string;
  priority: number;
  rank: number;
}

export interface AnalysisResult {
  shortlistedColleges: College[];
  anpData: ANPData[];
  clusterScores: ClusterScores[];
  finalPriorities: ANPResult[];
  eligibleCount: number;
  totalColleges: number;
}
