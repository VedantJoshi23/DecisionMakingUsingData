import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../constants/theme";
import { ANPResult } from "../types/college";

interface PriorityChartProps {
  results: ANPResult[];
}

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - Spacing.xl * 2;

export const PriorityChart: React.FC<PriorityChartProps> = ({ results }) => {
  const maxPriority = Math.max(...results.map((r) => r.priority));
  const sortedResults = [...results].sort((a, b) => b.priority - a.priority);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Final College Priorities (ANP)</Text>
      <View style={styles.chart}>
        {sortedResults.map((result, index) => {
          const barWidth = (result.priority / maxPriority) * (chartWidth - 100);
          const colors = [
            Colors.highlight,
            Colors.academic,
            Colors.logistics,
            Colors.financial,
            Colors.campus,
            Colors.reputation,
            Colors.info,
          ];
          const barColor = colors[index % colors.length];

          return (
            <View key={result.college} style={styles.barRow}>
              <Text style={styles.barLabel}>{result.college}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: barWidth, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>
                {(result.priority * 100).toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  chart: ViewStyle;
  barRow: ViewStyle;
  barLabel: TextStyle;
  barContainer: ViewStyle;
  bar: ViewStyle;
  barValue: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  chart: {
    gap: Spacing.md,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  barLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    width: 35,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: BorderRadius.sm,
  },
  barValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    width: 50,
    textAlign: "right",
  },
});
