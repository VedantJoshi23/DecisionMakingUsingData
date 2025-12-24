import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollView,
} from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../constants/theme";
import { ANPResult, ClusterScores } from "../types/college";

interface PriorityTableProps {
  results: ANPResult[];
  clusterScores: ClusterScores[];
}

export const PriorityTable: React.FC<PriorityTableProps> = ({
  results,
  clusterScores,
}) => {
  const sortedResults = [...results].sort((a, b) => b.priority - a.priority);

  const getClusterScoresForCollege = (
    collegeId: string
  ): ClusterScores | undefined => {
    return clusterScores.find((cs) => cs.college === collegeId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Priority Rankings</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.rankCell]}>Rank</Text>
            <Text style={[styles.headerCell, styles.collegeCell]}>College</Text>
            <Text style={[styles.headerCell, styles.scoreCell]}>Priority</Text>
            <Text style={[styles.headerCell, styles.clusterCell]}>
              Logistics
            </Text>
            <Text style={[styles.headerCell, styles.clusterCell]}>
              Academic
            </Text>
            <Text style={[styles.headerCell, styles.clusterCell]}>
              Financial
            </Text>
            <Text style={[styles.headerCell, styles.clusterCell]}>Campus</Text>
            <Text style={[styles.headerCell, styles.clusterCell]}>
              Reputation
            </Text>
          </View>

          {/* Data rows */}
          {sortedResults.map((result, index) => {
            const scores = getClusterScoresForCollege(result.college);
            const isFirst = index === 0;
            const isOdd = index % 2 === 1;

            return (
              <View
                key={result.college}
                style={[
                  styles.dataRow,
                  isOdd && styles.oddRow,
                  isFirst && styles.firstRow,
                ]}
              >
                <View style={[styles.dataCell, styles.rankCell]}>
                  <View
                    style={[styles.rankBadge, isFirst && styles.firstRankBadge]}
                  >
                    <Text
                      style={[styles.rankText, isFirst && styles.firstRankText]}
                    >
                      {result.rank}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.dataCell,
                    styles.collegeCell,
                    styles.collegeName,
                  ]}
                >
                  {result.college}
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.scoreCell,
                    styles.priorityValue,
                  ]}
                >
                  {(result.priority * 100).toFixed(2)}%
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.clusterCell,
                    { color: Colors.logistics },
                  ]}
                >
                  {scores ? (scores.logisticsScore * 100).toFixed(1) : "-"}
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.clusterCell,
                    { color: Colors.academic },
                  ]}
                >
                  {scores ? (scores.academicScore * 100).toFixed(1) : "-"}
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.clusterCell,
                    { color: Colors.financial },
                  ]}
                >
                  {scores ? (scores.financialScore * 100).toFixed(1) : "-"}
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.clusterCell,
                    { color: Colors.campus },
                  ]}
                >
                  {scores ? (scores.campusScore * 100).toFixed(1) : "-"}
                </Text>
                <Text
                  style={[
                    styles.dataCell,
                    styles.clusterCell,
                    { color: Colors.reputation },
                  ]}
                >
                  {scores ? (scores.reputationScore * 100).toFixed(1) : "-"}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  headerRow: ViewStyle;
  headerCell: TextStyle;
  dataRow: ViewStyle;
  oddRow: ViewStyle;
  firstRow: ViewStyle;
  dataCell: TextStyle;
  rankCell: ViewStyle;
  collegeCell: TextStyle;
  scoreCell: TextStyle;
  clusterCell: TextStyle;
  rankBadge: ViewStyle;
  firstRankBadge: ViewStyle;
  rankText: TextStyle;
  firstRankText: TextStyle;
  collegeName: TextStyle;
  priorityValue: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  headerCell: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textLight,
    textAlign: "center",
    paddingHorizontal: Spacing.xs,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  oddRow: {
    backgroundColor: Colors.surfaceVariant,
  },
  firstRow: {
    backgroundColor: `${Colors.highlight}15`,
  },
  dataCell: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    textAlign: "center",
    paddingHorizontal: Spacing.xs,
  },
  rankCell: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  collegeCell: {
    width: 70,
  },
  scoreCell: {
    width: 70,
  },
  clusterCell: {
    width: 70,
    fontWeight: Typography.fontWeights.medium,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  firstRankBadge: {
    backgroundColor: Colors.highlight,
  },
  rankText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  firstRankText: {
    color: Colors.textLight,
  },
  collegeName: {
    fontWeight: Typography.fontWeights.medium,
  },
  priorityValue: {
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.accent,
  },
});
