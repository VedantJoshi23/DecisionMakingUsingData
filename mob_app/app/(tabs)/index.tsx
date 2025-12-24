import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";
import { CollegeCard } from "../../src/components/CollegeCard";
import { getAllCollegesWithScores } from "../../src/services/analysisService";
import { College, ClusterScores } from "../../src/types/college";

export default function HomeScreen() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [clusterScores, setClusterScores] = useState<ClusterScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    const { colleges: collegeData, clusterScores: scores } =
      getAllCollegesWithScores();
    setColleges(collegeData);
    setClusterScores(scores);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getClusterScoresForCollege = (
    collegeId: string
  ): ClusterScores | undefined => {
    return clusterScores.find((cs) => cs.college === collegeId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading colleges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>All Engineering Colleges</Text>
          <Text style={styles.headerSubtitle}>
            Evaluated using DEA (Data Envelopment Analysis) efficiency scores
            and 5 cluster criteria
          </Text>
          <View style={styles.statsBadge}>
            <Text style={styles.statsText}>
              {colleges.length} Colleges • 5 Clusters • DEA Ranked
            </Text>
          </View>
        </View>

        {/* Cluster Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Evaluation Clusters</Text>
          <View style={styles.legendGrid}>
            <LegendItem color={Colors.logistics} label="Logistics" />
            <LegendItem color={Colors.academic} label="Academic" />
            <LegendItem color={Colors.financial} label="Financial" />
            <LegendItem color={Colors.campus} label="Campus" />
            <LegendItem color={Colors.reputation} label="Reputation" />
          </View>
        </View>

        {/* College Cards */}
        <View style={styles.collegeList}>
          {colleges.map((college, index) => {
            const scores = getClusterScoresForCollege(college.id);
            if (!scores) return null;

            return (
              <CollegeCard
                key={college.id}
                collegeName={college.name}
                sizeCategory={college.sizeCategory}
                deaEfficiency={college.deaEfficiencyTheta}
                clusterScores={scores}
                rank={index + 1}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  headerSection: {
    paddingVertical: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
  statsBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  statsText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textLight,
    fontWeight: Typography.fontWeights.medium,
  },
  legendContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  legendTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  legendLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  collegeList: {
    gap: Spacing.md,
  },
});
