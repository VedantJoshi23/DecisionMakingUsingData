import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ClusterColors,
} from "../../src/constants/theme";
import { PriorityTable } from "../../src/components/PriorityTable";
import { PriorityChart } from "../../src/components/PriorityChart";
import { runAnalysis } from "../../src/services/analysisService";
import {
  AnalysisResult,
  UserPreferences,
  DEFAULT_PREFERENCES,
} from "../../src/types/college";

// Dropdown options
const HOSTEL_OPTIONS = [
  { label: "Required", value: "required" },
  { label: "Preferred", value: "preferred" },
  { label: "Not Needed", value: "not_needed" },
];

const SCHOLARSHIP_OPTIONS = [
  { label: "Essential", value: "essential" },
  { label: "Preferred", value: "preferred" },
  { label: "Not Important", value: "not_important" },
];

const IMPORTANCE_OPTIONS = [
  { label: "Very High", value: "very_high" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const SIZE_OPTIONS: DropdownOption<"any" | "large" | "medium" | "small">[] = [
  { label: "Any Size", value: "any" },
  { label: "Large (800+ students)", value: "large" },
  { label: "Medium (500-800 students)", value: "medium" },
  { label: "Small (<500 students)", value: "small" },
];

const BRANCH_OPTIONS: DropdownOption<string>[] = [
  { label: "Computer Science", value: "Computer Science" },
  { label: "Electronics", value: "Electronics" },
  { label: "Mechanical", value: "Mechanical" },
  { label: "Civil", value: "Civil" },
  { label: "Electrical", value: "Electrical" },
  { label: "Chemical", value: "Chemical" },
  { label: "Biotechnology", value: "Biotechnology" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Any Branch", value: "Any Branch" },
];

type DropdownOption<T> = { label: string; value: T };

interface DropdownPickerProps<T> {
  label: string;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  icon: keyof typeof Ionicons.glyphMap;
}

function DropdownPicker<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  icon,
}: DropdownPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label || "";

  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsOpen(true)}
        >
          <Ionicons name={icon} size={20} color={Colors.textMuted} />
          <Text style={styles.dropdownText}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={String(option.value)}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value &&
                      styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.highlight}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  formatValue?: (value: number) => string;
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  color = Colors.highlight,
  formatValue,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color }]}>{displayValue}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={color}
      />
      <View style={styles.sliderRange}>
        <Text style={styles.sliderRangeText}>
          {formatValue ? formatValue(min) : `${min}${unit}`}
        </Text>
        <Text style={styles.sliderRangeText}>
          {formatValue ? formatValue(max) : `${max}${unit}`}
        </Text>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied"
  >("idle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    logistics: false,
    academic: false,
    financial: false,
    campus: false,
    weights: false,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setLocationStatus("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationStatus("granted");
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } else {
        setLocationStatus("denied");
      }
    } catch (err) {
      setLocationStatus("denied");
      console.error("Error requesting location permission:", err);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const validateAndAnalyze = () => {
    if (preferences.studentRank <= 0) {
      setError("Please enter a valid rank");
      return;
    }

    if (preferences.studentRank > 1000000) {
      setError("Please enter a realistic rank (max 1,000,000)");
      return;
    }

    performAnalysis();
  };

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analysisResults = runAnalysis(preferences);
      setResults(analysisResults);
    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const LocationStatusBadge = () => {
    const getStatusConfig = () => {
      switch (locationStatus) {
        case "loading":
          return {
            icon: "location-outline" as const,
            text: "Getting location...",
            color: Colors.info,
          };
        case "granted":
          return {
            icon: "location" as const,
            text: "Location enabled",
            color: Colors.success,
          };
        case "denied":
          return {
            icon: "location-outline" as const,
            text: "Location denied",
            color: Colors.warning,
          };
        default:
          return {
            icon: "location-outline" as const,
            text: "Enable location",
            color: Colors.textMuted,
          };
      }
    };

    const config = getStatusConfig();

    return (
      <TouchableOpacity
        style={[styles.locationBadge, { borderColor: config.color }]}
        onPress={
          locationStatus === "denied" ? requestLocationPermission : undefined
        }
      >
        <Ionicons name={config.icon} size={18} color={config.color} />
        <Text style={[styles.locationText, { color: config.color }]}>
          {config.text}
        </Text>
        {locationStatus === "loading" && (
          <ActivityIndicator
            size="small"
            color={config.color}
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({
    title,
    icon,
    section,
    color = Colors.highlight,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    section: keyof typeof expandedSections;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.sectionHeader, { borderLeftColor: color }]}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
      </View>
      <Ionicons
        name={expandedSections[section] ? "chevron-up" : "chevron-down"}
        size={20}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Personalized Analysis</Text>
          <Text style={styles.pageSubtitle}>
            Configure your preferences for accurate college recommendations
            using DEA-ANP analysis
          </Text>
          <LocationStatusBadge />
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Basic Information"
            icon="person-outline"
            section="basic"
            color={Colors.highlight}
          />
          {expandedSections.basic && (
            <View style={styles.sectionContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Examination Rank *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="trophy-outline"
                    size={20}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your rank (e.g., 5000)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={
                      preferences.studentRank > 0
                        ? String(preferences.studentRank)
                        : ""
                    }
                    onChangeText={(text) => {
                      const filtered = text.replace(/[^0-9]/g, "");
                      updatePreference(
                        "studentRank",
                        filtered ? parseInt(filtered, 10) : 0
                      );
                    }}
                    maxLength={7}
                  />
                </View>
              </View>

              <DropdownPicker
                label="Preferred College Size"
                options={SIZE_OPTIONS}
                selectedValue={preferences.preferredSize}
                onSelect={(value) =>
                  updatePreference(
                    "preferredSize",
                    value as "any" | "large" | "medium" | "small"
                  )
                }
                icon="business-outline"
              />

              <DropdownPicker
                label="Preferred Branch"
                options={BRANCH_OPTIONS}
                selectedValue={preferences.preferredBranch}
                onSelect={(value) => updatePreference("preferredBranch", value)}
                icon="book-outline"
              />
            </View>
          )}
        </View>

        {/* Logistics Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Logistics Preferences"
            icon="navigate-outline"
            section="logistics"
            color={ClusterColors.logistics}
          />
          {expandedSections.logistics && (
            <View style={styles.sectionContent}>
              <SliderInput
                label="Maximum Distance from Home"
                value={preferences.maxDistanceFromHome}
                onChange={(value) =>
                  updatePreference("maxDistanceFromHome", value)
                }
                min={50}
                max={1000}
                step={50}
                unit=" km"
                color={ClusterColors.logistics}
              />

              <DropdownPicker
                label="Hostel Requirement"
                options={
                  HOSTEL_OPTIONS as DropdownOption<
                    typeof preferences.hostelRequired
                  >[]
                }
                selectedValue={preferences.hostelRequired}
                onSelect={(value) => updatePreference("hostelRequired", value)}
                icon="bed-outline"
              />
            </View>
          )}
        </View>

        {/* Academic Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Academic Preferences"
            icon="school-outline"
            section="academic"
            color={ClusterColors.academic}
          />
          {expandedSections.academic && (
            <View style={styles.sectionContent}>
              <SliderInput
                label="Minimum Placement Rate"
                value={preferences.minPlacementRate}
                onChange={(value) =>
                  updatePreference("minPlacementRate", value)
                }
                min={0}
                max={100}
                step={5}
                unit="%"
                color={ClusterColors.academic}
              />

              <SliderInput
                label="Minimum Average Package"
                value={preferences.minAveragePackage}
                onChange={(value) =>
                  updatePreference("minAveragePackage", value)
                }
                min={2}
                max={20}
                step={1}
                unit=" LPA"
                color={ClusterColors.academic}
              />
            </View>
          )}
        </View>

        {/* Financial Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Financial Preferences"
            icon="wallet-outline"
            section="financial"
            color={ClusterColors.financial}
          />
          {expandedSections.financial && (
            <View style={styles.sectionContent}>
              <SliderInput
                label="Maximum Fee Per Year"
                value={preferences.maxFeePerYear}
                onChange={(value) => updatePreference("maxFeePerYear", value)}
                min={500000}
                max={3000000}
                step={100000}
                color={ClusterColors.financial}
                formatValue={formatCurrency}
              />

              <DropdownPicker
                label="Scholarship Need"
                options={
                  SCHOLARSHIP_OPTIONS as DropdownOption<
                    typeof preferences.scholarshipNeeded
                  >[]
                }
                selectedValue={preferences.scholarshipNeeded}
                onSelect={(value) =>
                  updatePreference("scholarshipNeeded", value)
                }
                icon="cash-outline"
              />
            </View>
          )}
        </View>

        {/* Campus Life Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Campus Life Preferences"
            icon="happy-outline"
            section="campus"
            color={ClusterColors.campus}
          />
          {expandedSections.campus && (
            <View style={styles.sectionContent}>
              <DropdownPicker
                label="Campus Safety Importance"
                options={
                  IMPORTANCE_OPTIONS as DropdownOption<
                    typeof preferences.campusSafetyImportance
                  >[]
                }
                selectedValue={preferences.campusSafetyImportance}
                onSelect={(value) =>
                  updatePreference("campusSafetyImportance", value)
                }
                icon="shield-checkmark-outline"
              />

              <DropdownPicker
                label="Extracurriculars Importance"
                options={
                  IMPORTANCE_OPTIONS as DropdownOption<
                    typeof preferences.extracurricularsImportance
                  >[]
                }
                selectedValue={preferences.extracurricularsImportance}
                onSelect={(value) =>
                  updatePreference("extracurricularsImportance", value)
                }
                icon="football-outline"
              />
            </View>
          )}
        </View>

        {/* Cluster Weights Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Priority Weights"
            icon="options-outline"
            section="weights"
            color={ClusterColors.reputation}
          />
          {expandedSections.weights && (
            <View style={styles.sectionContent}>
              <Text style={styles.weightsInfo}>
                Adjust how much importance you give to each category (0-100).
                Higher values mean more priority.
              </Text>

              <SliderInput
                label="Logistics (Distance, Hostel, Accessibility)"
                value={preferences.logisticsWeight}
                onChange={(value) => updatePreference("logisticsWeight", value)}
                min={0}
                max={100}
                step={5}
                color={ClusterColors.logistics}
              />

              <SliderInput
                label="Academic (Placements, Faculty, Curriculum)"
                value={preferences.academicWeight}
                onChange={(value) => updatePreference("academicWeight", value)}
                min={0}
                max={100}
                step={5}
                color={ClusterColors.academic}
              />

              <SliderInput
                label="Financial (Fees, Scholarships)"
                value={preferences.financialWeight}
                onChange={(value) => updatePreference("financialWeight", value)}
                min={0}
                max={100}
                step={5}
                color={ClusterColors.financial}
              />

              <SliderInput
                label="Campus Life (Safety, Activities, Facilities)"
                value={preferences.campusWeight}
                onChange={(value) => updatePreference("campusWeight", value)}
                min={0}
                max={100}
                step={5}
                color={ClusterColors.campus}
              />

              <SliderInput
                label="Reputation (Alumni, Industry Ties, Accreditations)"
                value={preferences.reputationWeight}
                onChange={(value) =>
                  updatePreference("reputationWeight", value)
                }
                min={0}
                max={100}
                step={5}
                color={ClusterColors.reputation}
              />
            </View>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (preferences.studentRank <= 0 || isAnalyzing) &&
              styles.analyzeButtonDisabled,
          ]}
          onPress={validateAndAnalyze}
          disabled={preferences.studentRank <= 0 || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator size="small" color={Colors.textLight} />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={Colors.textLight}
              />
              <Text style={styles.analyzeButtonText}>Run Analysis</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        {results && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Analysis Results</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{results.totalColleges}</Text>
                <Text style={styles.statLabel}>Total Colleges</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{results.eligibleCount}</Text>
                <Text style={styles.statLabel}>Eligible</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {results.shortlistedColleges.length}
                </Text>
                <Text style={styles.statLabel}>Shortlisted</Text>
              </View>
            </View>

            {/* No Eligible Colleges */}
            {results.shortlistedColleges.length === 0 ? (
              <View style={styles.noResultsCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={Colors.warning}
                />
                <Text style={styles.noResultsTitle}>No Eligible Colleges</Text>
                <Text style={styles.noResultsText}>
                  No colleges match your current preferences. Try adjusting your
                  criteria:
                </Text>
                <View style={styles.suggestionsList}>
                  <Text style={styles.suggestionItem}>
                    • Lower minimum placement rate
                  </Text>
                  <Text style={styles.suggestionItem}>
                    • Increase maximum fee budget
                  </Text>
                  <Text style={styles.suggestionItem}>
                    • Try "Any Size" for college size
                  </Text>
                  <Text style={styles.suggestionItem}>
                    • Reduce minimum package requirement
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {/* Info Card */}
                <View style={styles.infoCard}>
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={Colors.info}
                  />
                  <Text style={styles.infoText}>
                    Based on your preferences,{" "}
                    <Text style={styles.infoBold}>
                      {results.eligibleCount} colleges
                    </Text>{" "}
                    met your criteria. We shortlisted the top{" "}
                    <Text style={styles.infoBold}>
                      {results.shortlistedColleges.length}
                    </Text>{" "}
                    using DEA efficiency analysis, then ranked them using ANP
                    methodology with your priority weights.
                  </Text>
                </View>

                {/* Priority Table */}
                <PriorityTable
                  results={results.finalPriorities}
                  clusterScores={results.clusterScores}
                />

                {/* Priority Chart */}
                <PriorityChart results={results.finalPriorities} />

                {/* Best Match Card */}
                {results.finalPriorities.length > 0 && (
                  <View style={styles.bestMatchCard}>
                    <View style={styles.bestMatchHeader}>
                      <Ionicons name="star" size={24} color={Colors.warning} />
                      <Text style={styles.bestMatchTitle}>
                        Top Recommendation
                      </Text>
                    </View>
                    <Text style={styles.bestMatchCollege}>
                      {results.finalPriorities[0].college}
                    </Text>
                    <Text style={styles.bestMatchScore}>
                      Priority Score:{" "}
                      {(results.finalPriorities[0].priority * 100).toFixed(2)}%
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerSection: {
    paddingVertical: Spacing.xl,
  },
  pageTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  pageSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.lg,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderLeftWidth: 4,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dropdownText: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: `${Colors.highlight}15`,
  },
  modalOptionText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  modalOptionTextSelected: {
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.highlight,
  },
  sliderContainer: {
    marginBottom: Spacing.sm,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sliderLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  sliderValue: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderRange: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderRangeText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  weightsInfo: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginBottom: Spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.error}15`,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.highlight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  analyzeButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  analyzeButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textLight,
  },
  resultsSection: {
    paddingTop: Spacing.xl,
  },
  resultsDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textMuted,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.highlight,
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: `${Colors.info}15`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizes.sm * Typography.lineHeights.relaxed,
  },
  infoBold: {
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  bestMatchCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.warning,
    ...Shadows.medium,
  },
  bestMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  bestMatchTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.warning,
  },
  bestMatchCollege: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bestMatchScore: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  noResultsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.warning,
    ...Shadows.medium,
  },
  noResultsTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noResultsText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: Typography.fontSizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
  suggestionsList: {
    alignSelf: "stretch",
    paddingHorizontal: Spacing.lg,
  },
  suggestionItem: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
});
