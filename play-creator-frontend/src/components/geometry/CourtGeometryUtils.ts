// src/court/geometry.ts
export const SCALE = 14; // px per foot (larger court)
export const BUFFER = 80; // px out-of-bounds around court
export const ft = (feet: number) => feet * SCALE;

// HS half-court dimensions (feet)
export const COURT_WIDTH_FT = 50;
export const COURT_LENGTH_FT = 42;

// Key distances (feet)
export const BACKBOARD_FROM_BASELINE_FT = 4;
export const HOOP_CENTER_FROM_BASELINE_FT = 5.25; // 63 inches
export const LANE_WIDTH_FT = 12;
export const FREE_THROW_FROM_BASELINE_FT = BACKBOARD_FROM_BASELINE_FT + 15; // 19 ft
export const FREE_THROW_RADIUS_FT = 6;
export const THREE_ARC_RADIUS_FT = 19.75;

// Derived (px)
export const COURT_WIDTH = ft(COURT_WIDTH_FT);
export const COURT_HEIGHT = ft(COURT_LENGTH_FT);
export const STAGE_WIDTH = COURT_WIDTH + BUFFER * 2;
export const STAGE_HEIGHT = COURT_HEIGHT + BUFFER * 2;
export const COURT_X = BUFFER;
export const COURT_Y = BUFFER;

export const baselineY = COURT_Y;
export const halfCourtY = COURT_Y + COURT_HEIGHT;
export const leftSidelineX = COURT_X;
export const rightSidelineX = COURT_X + COURT_WIDTH;
export const centerX = COURT_X + COURT_WIDTH / 2;

export const hoopY = baselineY + ft(HOOP_CENTER_FROM_BASELINE_FT);
export const hoopR = 9; // px rim size
export const backboardY = baselineY + ft(BACKBOARD_FROM_BASELINE_FT);
export const backboardW = ft(6); // 6 ft width
export const backboardX = centerX - backboardW / 2;

export const laneLeftX = centerX - ft(LANE_WIDTH_FT) / 2;
export const laneRightX = centerX + ft(LANE_WIDTH_FT) / 2;
export const laneBottomY = baselineY + ft(FREE_THROW_FROM_BASELINE_FT);

export const ftLineY = laneBottomY;
export const ftCircleR = ft(FREE_THROW_RADIUS_FT);

export const threeR = ft(THREE_ARC_RADIUS_FT);
