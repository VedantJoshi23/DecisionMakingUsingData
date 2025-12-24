import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../constants/theme";
import { ClusterScores } from "../types/college";

interface CollegeCardProps {
  collegeName: string;
  sizeCategory: string;
  deaEfficiency?: number;
  clusterScores: ClusterScores;
  rank?: number;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  collegeName,
  sizeCategory,
  deaEfficiency,
  clusterScores,
  rank,
}) => {
  const clusters = [
    {
      name: "Logistics",
      score: clusterScores.logisticsScore,
      color: Colors.logistics,
    },
    {
      name: "Academic",
      score: clusterScores.academicScore,
      color: Colors.academic,
    },
    {
      name: "Financial",
      score: clusterScores.financialScore,
      color: Colors.financial,
    },
    { name: "Campus", score: clusterScores.campusScore, color: Colors.campus },
    {
      name: "Reputation",
      score: clusterScores.reputationScore,
      color: Colors.reputation,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {rank !== undefined && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
          )}
          <View>
            <Text style={styles.collegeName}>{collegeName}</Text>
            <Text style={styles.sizeCategory}>
              {sizeCategory.charAt(0).toUpperCase() + sizeCategory.slice(1)}{" "}
              College
            </Text>
          </View>
        </View>
        {deaEfficiency !== undefined && (
          <View style={styles.efficiencyBadge}>
            <Text style={styles.efficiencyLabel}>DEA Score</Text>
            <Text style={styles.efficiencyValue}>
              {(deaEfficiency * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.scoresContainer}>
        <Text style={styles.scoresTitle}>Cluster Scores</Text>
        <View style={styles.scoresList}>
          {clusters.map((cluster) => (
            <View key={cluster.name} style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <View
                  style={[styles.scoreDot, { backgroundColor: cluster.color }]}
                />
                <Text style={styles.scoreName}>{cluster.name}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      width: `${cluster.score * 100}%`,
                      backgroundColor: cluster.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {(cluster.score * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

interface Styles {
  card: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  rankBadge: ViewStyle;
  rankText: TextStyle;
  collegeName: TextStyle;
  sizeCategory: TextStyle;
  efficiencyBadge: ViewStyle;
  efficiencyLabel: TextStyle;
  efficiencyValue: TextStyle;
  scoresContainer: ViewStyle;
  scoresTitle: TextStyle;
  scoresList: ViewStyle;
  scoreItem: ViewStyle;
  scoreHeader: ViewStyle;
  scoreDot: ViewStyle;
  scoreName: TextStyle;
  scoreBarContainer: ViewStyle;
  scoreBar: ViewStyle;
  scoreValue: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  rankText: {
    color: Colors.textLight,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  collegeName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sizeCategory: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  efficiencyBadge: {
    alignItems: "flex-end",
  },
  efficiencyLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  efficiencyValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accent,
  },
  scoresContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  scoresTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  scoresList: {
    gap: Spacing.sm,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  scoreName: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  scoreBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  scoreBar: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  scoreValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    width: 40,
    textAlign: "right",
  },
});
