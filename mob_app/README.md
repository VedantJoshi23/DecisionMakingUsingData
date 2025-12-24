# College Selector - React Native App

A React Native (Expo) mobile application that helps 12th-grade students select the best engineering college based on their examination rank. The app implements a sophisticated **DEA-ANP (Data Envelopment Analysis - Analytic Network Process)** methodology to provide personalized college recommendations.

## 📱 Overview

This application is built using the analysis methodology from the `analysis copy.ipynb` notebook, which implements a two-stage analytics pipeline:

1. **Stage 1 – DEA (Data Envelopment Analysis)**

   - Compares 30 synthetic colleges on measurable inputs & outputs
   - Uses input-oriented CCR DEA to compute efficiency scores
   - Shortlists the top 7 most efficient colleges

2. **Stage 2 – ANP (Analytic Network Process)**
   - Evaluates shortlisted colleges on personal and qualitative criteria
   - Uses a simplified ANP-style supermatrix to compute final priorities
   - Visualizes the best college choices for the student

## ✨ Features

### 🏠 Home Screen (Default Tab)

- Displays the top 7 shortlisted colleges with their DEA efficiency scores
- Shows **5 cluster criteria scores** for each college:
  - **Logistics**: Distance, travel time, hostel availability
  - **Academic**: Branch availability, faculty-student ratio, curriculum relevance
  - **Financial**: Fees, scholarships, fee flexibility
  - **Campus**: Safety, extracurriculars, health facilities
  - **Reputation**: Alumni network, industry ties, accreditations
- Color-coded score bars for easy comparison
- Pull-to-refresh functionality

### 🔍 Search Screen

- **Location Access**: Requests user's location permission for personalized distance calculations
- **Rank Input**: Number-only input field with validation constraints
- **Analysis Engine**: Runs the full DEA-ANP analysis based on entered rank
- **Results Display**:
  - Priority table with rankings and all cluster scores
  - Interactive bar chart showing college priorities
  - Top recommendation card highlighting the best match

## 🎨 Design

The app features a **minimalistic yet aesthetic design** with:

- Modern dark/light color palette (Deep blue/purple primary tones)
- Clean typography hierarchy
- Subtle shadows and rounded corners
- Color-coded cluster categories for visual distinction
- Responsive layouts for various screen sizes

### Color Palette

- **Primary**: `#1A1A2E` (Deep Blue)
- **Accent**: `#0F3460` (Navy)
- **Highlight**: `#E94560` (Coral Red)
- **Cluster Colors**:
  - Logistics: `#3498DB` (Blue)
  - Academic: `#9B59B6` (Purple)
  - Financial: `#27AE60` (Green)
  - Campus: `#F39C12` (Orange)
  - Reputation: `#E74C3C` (Red)

## 🛠 Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom theme constants
- **Icons**: @expo/vector-icons (Ionicons)
- **Location**: expo-location

## 📁 Project Structure

```
CollegeSelector/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigator configuration
│   │   ├── index.tsx        # Home screen
│   │   └── search.tsx       # Search screen
│   └── _layout.tsx          # Root layout
├── src/
│   ├── components/
│   │   ├── CollegeCard.tsx  # College display card component
│   │   ├── PriorityChart.tsx # Bar chart for priorities
│   │   └── PriorityTable.tsx # Results table component
│   ├── constants/
│   │   └── theme.ts         # Colors, typography, spacing
│   ├── services/
│   │   └── analysisService.ts # DEA-ANP analysis logic
│   ├── types/
│   │   └── college.ts       # TypeScript interfaces
│   └── utils/
│       └── mathUtils.ts     # Mathematical utilities
├── assets/                  # App icons and images
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator or Expo Go app

### Installation

1. Navigate to the project directory:

   ```bash
   cd mob_app/CollegeSelector
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📊 Analysis Methodology

### DEA (Data Envelopment Analysis)

The app evaluates colleges using the following metrics:

**Inputs (resources - want to minimize):**

- Faculty FTE (Full-time equivalent faculty)
- PhD Faculty Count
- Total Hostel Beds
- Infrastructure Score (0-100)
- Operating Expenditure (in Lakhs)

**Outputs (performance - want to maximize):**

- Placement Rate (%)
- Average Package (LPA)
- Research Publications
- Student Satisfaction (0-100)
- Graduation Rate (%)

### ANP (Analytic Network Process)

After DEA shortlisting, colleges are evaluated on 5 criteria clusters:

1. **Logistics Cluster** (15% weight)

   - Distance from home
   - Travel time
   - Hostel availability

2. **Academic Cluster** (35% weight)

   - Rank fit score
   - Branch availability
   - Faculty-student ratio
   - Curriculum relevance

3. **Financial Cluster** (15% weight)

   - Total fees
   - Scholarship availability
   - Fee flexibility

4. **Campus Cluster** (15% weight)

   - Campus safety
   - Extracurricular activities
   - Health facilities

5. **Reputation Cluster** (20% weight)
   - Alumni network strength
   - Industry ties
   - Special accreditations

## 📋 Requirements Fulfilled

✅ React Native application (Expo)  
✅ Standard theme with minimalistic aesthetic design  
✅ Connected with analysis notebook methodology  
✅ Uses data from the analysis notebook  
✅ Home screen displays college list with all cluster criteria  
✅ Tab structure with Home as default  
✅ Search tab with location access request  
✅ Number-only input constraint for rank  
✅ Analysis runs with student_rank = entered value  
✅ Displays priority table and plot after analysis

## 📝 License

This project is part of the TEDx Talk demonstration on college selection analytics.

## 👤 Author

Developed as part of the College Selection Analytics project.
