# Comprehensive College Ranking System: A DEA-ANP Hybrid Model

## Executive Summary

### Purpose

This analysis presents a **two-stage hybrid approach** for engineering college selection, combining Data Envelopment Analysis (DEA) and Analytic Network Process (ANP) to help 12th-grade students make informed decisions.

### Key Metrics

- **Total Colleges Analyzed:** 30
- **Colleges Shortlisted:** 7
- **Criteria Clusters:** 5
- **Student Rank:** 4,312

### Methodology Overview

| Stage | Method                          | Purpose                        | Output                   |
| ----- | ------------------------------- | ------------------------------ | ------------------------ |
| 1     | Data Envelopment Analysis (DEA) | Objective efficiency screening | Top 7 efficient colleges |
| 2     | Analytic Network Process (ANP)  | Subjective preference ranking  | Final prioritized list   |

This hybrid approach balances **objective performance metrics** with **subjective personal priorities**, ensuring both efficiency and student-fit alignment.

---

## Methodology

### Stage 1: Data Envelopment Analysis (DEA)

#### Model Specification

- **Model Type:** Input-Oriented CCR (Charnes-Cooper-Rhodes)
- **Objective:** Evaluate how efficiently colleges convert resources into outcomes
- **Efficiency Score Range:** 0 to 1 (where 1.0 = perfect efficiency)

#### Input Variables (5 metrics)

The DEA model evaluates the following resource inputs:

1. **Faculty FTE** - Full-time equivalent faculty count
2. **PhD Faculty Count** - Number of doctoral-qualified faculty
3. **Hostel Beds** - Residential capacity
4. **Infrastructure Score** - Quality of facilities and amenities
5. **Operating Expenditure** - Annual operational costs

#### Output Variables (6 metrics)

The model measures the following outcomes:

1. **Placement Rate** - Percentage of students placed
2. **Average Package** - Mean salary of placed students
3. **Research Publications** - Academic output per year
4. **Student Satisfaction** - Survey-based satisfaction index
5. **Graduation Rate** - Percentage completing degree on time
6. **Inverted Cutoff Rank** - Transformed selectivity metric

#### Efficiency Calculation

For each college _j_, the efficiency score θ<sub>j</sub> is calculated as:

```
θ_j = (weighted sum of outputs) / (weighted sum of inputs)
```

where weights are optimized to maximize each college's efficiency score while keeping all scores ≤ 1.

#### Selection Criteria

- Colleges with **θ = 1.0** are considered perfectly efficient
- Top **7 efficient colleges** were shortlisted for Stage 2 analysis

---

### Stage 2: Analytic Network Process (ANP)

#### Overview

ANP evaluates shortlisted colleges based on **5 interdependent criteria clusters** with consideration of internal dependencies and feedback loops.

#### Criteria Clusters and Weights

| Cluster         | Weight | Sub-Criteria                                                                     |
| --------------- | ------ | -------------------------------------------------------------------------------- |
| **Logistics**   | 7.9%   | Distance from home, Travel time, Hostel availability                             |
| **Academic**    | 24.4%  | Branch availability, Faculty-student ratio, Curriculum relevance, Rank fit score |
| **Financial**   | 13.7%  | Total fee per year, Scholarship availability, Fee flexibility                    |
| **Campus Life** | 13.7%  | Campus safety, Extracurricular activities, Health facilities                     |
| **Reputation**  | 40.3%  | Alumni network, Industry connections, Accreditations                             |

#### ANP Process

1. **Pairwise Comparison Matrices:** Experts/students compare criteria importance using Saaty's 1-9 scale
2. **Supermatrix Construction:** Build unweighted, weighted, and limit supermatrices
3. **Principal Eigenvector Method:** Extract priority vectors from each matrix
4. **Interdependency Analysis:** Account for feedback between criteria
5. **Final Priority Calculation:** Compute overall college priorities

#### Consistency Validation

- **Consistency Ratio (CR)** calculated for all pairwise comparison matrices
- **Acceptable threshold:** CR < 0.10
- Warns users if judgments are inconsistent and require revision

---

## Results and Findings

### DEA Stage Results

#### Efficiency Distribution

- **10 out of 30 colleges** achieved perfect efficiency (θ = 1.0)
- Mix of large and medium-sized institutions represented
- All shortlisted colleges demonstrate optimal resource utilization

#### Top 7 Shortlisted Colleges

| Rank | College ID | Efficiency Score | Size Category |
| ---- | ---------- | ---------------- | ------------- |
| -    | C24        | 1.0000           | Large         |
| -    | C14        | 1.0000           | Medium        |
| -    | C29        | 1.0000           | Large         |
| -    | C28        | 1.0000           | Medium        |
| -    | C10        | 1.0000           | Medium        |
| -    | C9         | 1.0000           | Large         |
| -    | C2         | 1.0000           | Medium        |

_Note: All 7 colleges are equally efficient in DEA; ranking determined in ANP stage._

---

### ANP Stage Rankings

#### Final Priority Scores

| Rank  | College | Priority Score | Key Strengths                                          |
| ----- | ------- | -------------- | ------------------------------------------------------ |
| **1** | **C29** | **0.1542**     | Strong financial position, excellent campus facilities |
| **2** | **C24** | **0.1531**     | Best logistics (closest to home), good reputation      |
| **3** | **C14** | **0.1481**     | Excellent campus life, strong academics                |
| 4     | C28     | 0.1448         | Balanced across all criteria                           |
| 5     | C10     | 0.1421         | Best rank fit (cutoff: 35,453)                         |
| 6     | C9      | 0.1394         | Strong reputation and industry ties                    |
| 7     | C2      | 0.1183         | Good academic programs                                 |

#### Student Rank Context

- **Student Rank:** 4,312
- **Best Rank Fit:** C10 (cutoff rank: 35,453)
- **Rank Safety Margin:** 31,141 ranks below cutoff

---

## Future Enhancements

### Data Integration

- **Real College Data:** Fetch from NIRF, JoSAA, college websites
- **Live Updates:** Current cutoff ranks, placement rates, fees
- **Historical Trends:** 3-5 year trends for placement and cutoffs

### Advanced Analytics

- **Cross-Validation:** Compare with TOPSIS, PROMETHEE, pure AHP
- **Monte Carlo Simulation:** Test robustness under input uncertainty
- **Machine Learning:** Train on past student choices to refine weights
- **Confidence Intervals:** Provide uncertainty bands around scores

### User Experience

- **Comparison View:** Side-by-side college comparison with radar charts
- **Export Reports:** Generate PDF reports with detailed breakdowns

### Constraint Handling

- **Budget Constraints:** Hard filter for maximum affordable fees
- **Geographic Preferences:** Distance/state/region filters
- **Branch Availability:** Filter by specific engineering disciplines
- **Reservation Category:** Adjust cutoff ranks based on student category

---

## Conclusions

The system provides reliable, defensible recommendations that balance objective performance metrics with subjective student preferences while maintaining full transparency and customizability.

---

## Appendices

### A. Technical Implementation

**Programming Language:** Python  
**Key Libraries:**

- NumPy (matrix operations)
- SciPy (optimization)
- Pandas (data manipulation)
- PuLP (linear programming for DEA)

### B. Sensitivity Analysis Results

Rank stability across 5 scenarios demonstrates that **C29, C24, and C14** consistently appear in top 3 regardless of weight configuration, indicating robust recommendations.

---

**Report Generated:** December 24, 2025
