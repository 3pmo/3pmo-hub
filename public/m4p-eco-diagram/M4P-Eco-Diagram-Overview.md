# M4P-Eco-Diagram: Project Overview

## What is the M4P-Eco-Diagram?
The M4P-Eco-Diagram (Modern Portfolio, Program, and Project Management Ecosystem Diagram) is an interactive, React-based web application designed to visualize, prioritize, and assess enterprise capabilities across the Strategy Execution lifecycle. 

It acts as a dynamic architecture map that categorizes capabilities into distinct zones and domains, allowing PMO (Project Management Office) leaders, transformation directors, and executives to evaluate their organization's operating model.

## Why was it created?
Organizations often struggle to map their strategy execution capabilities and understand where their operational gaps lie. This tool was created to:
1. **Visualize the Ecosystem:** Provide a single-pane-of-glass view of how Governance, Strategy Execution, Performance, and the Operating Model interconnect.
2. **Enable Prioritization:** Allow leaders to assign priority rankings to specific capabilities to focus investment and effort.
3. **Facilitate Assessment:** Provide a standardized framework to assess the health of specific capabilities (Journeys) based on Repeatability, Maturity, and Understanding.
4. **Export Actionable Data:** Allow users to export their prioritization and assessment data to CSV for reporting and further analysis.

## How it works

### 1. Architecture & Layout
The diagram is divided into four main visual zones, each color-coded:
*   **Governance (Grey):** Represents the hierarchical levels of accountability (from Group Portfolio down to Delivery Teams & Pods).
*   **Strategy Execution (Green):** The core engine, split into three domains:
    *   *Strategy Alignment*
    *   *Risk & Plan Management*
    *   *Design & Delivery Management*
*   **Performance (Orange):** Capabilities related to monitoring, assurance, compliance, and categorization.
*   **Operating Model (Blue):** The foundational elements enabling execution (People & Practices, Tooling & Integrations, Data/Context, Journeys & Agents, Org Structure).

### 2. Interactive Capabilities (Nodes)
Each capability is represented as a clickable tile (node). Users can:
*   **Prioritize:** Enter a numeric value in the top right of a tile to rank its importance.
*   **Assess:** Click the "Assess" button to open a detailed evaluation modal.

### 3. Assessment Engine
The assessment modal evaluates a capability across three dimensions:
*   **Q1: Repeatability (0-10 scale):** How consistently the journey is executed.
*   **Q2: Maturity (1-4 scale):** From Ad-hoc (1) to Optimized/Predictive (4).
*   **Q3: Understanding (Checklist):** A 7-step checklist tracking how well the journey is documented, trained, and measured. Uses a bitmask for state management and applies specific weighting to calculate a percentage.
*   **Scoring:** The app calculates individual percentages for R, M, and U, and rolls them up into an overall average Score Badge displayed directly on the tile.

### 4. Visual Connections
SVG lines are overlaid on the grid to show relationships between specific nodes (e.g., connecting Strategy Alignment and Forecast nodes to the Performance Indicator Management node).

### 5. Tech Stack
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS + Custom CSS (`index.css`) for complex grid alignments and glassmorphism effects.
*   **Icons:** Lucide React
*   **State Management:** React Hooks (`useState`, `useMemo`) managing selected states, priorities, and assessment data.
