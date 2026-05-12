import type { GameParticipant } from '@entities/participant';
import type { PositionedParticipant } from '@widgets/game-room-surface';

type PositionedSlot = {
  left: number;
  top: number;
};

type LayoutConfig = {
  centerX: number;
  centerY: number;
  baseHalfWidth: number;
  baseHalfHeight: number;
  layerGapX: number;
  layerGapY: number;
  minTopBottomGap: number;
  minSideGap: number;
  maxVisible: number;
};

const desktopLayoutConfig: LayoutConfig = {
  centerX: 50,
  centerY: 50,
  baseHalfWidth: 22,
  baseHalfHeight: 30,
  layerGapX: 8,
  layerGapY: 7,
  minTopBottomGap: 10,
  minSideGap: 13,
  maxVisible: 64,
};

const mobileLayoutConfig: LayoutConfig = {
  centerX: 50,
  centerY: 50,
  baseHalfWidth: 18,
  baseHalfHeight: 32,
  layerGapX: 10,
  layerGapY: 8,
  minTopBottomGap: 16,
  minSideGap: 18,
  maxVisible: 32,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getSideCapacity = (length: number, minGap: number) => {
  if (length <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(length / minGap) + 1);
};

const buildCenteredPositions = (center: number, halfLength: number, count: number) => {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [center];
  }

  const start = center - halfLength;
  const end = center + halfLength;
  const step = (end - start) / (count - 1);

  return Array.from({ length: count }, (_, index) => start + step * index);
};

const reorderCenterOut = (values: number[]) => {
  if (values.length <= 1) {
    return values;
  }

  const middleRight = Math.floor(values.length / 2);
  const middleLeft = middleRight - (values.length % 2 === 0 ? 1 : 0);
  const result: number[] = [];

  if (values.length % 2 === 1) {
    result.push(values[middleRight]);
  } else {
    result.push(values[middleLeft], values[middleRight]);
  }

  let offset = 1;

  while (result.length < values.length) {
    const leftIndex = middleLeft - offset;
    const rightIndex = middleRight + offset;

    if (leftIndex >= 0) {
      result.push(values[leftIndex]);
    }

    if (rightIndex < values.length) {
      result.push(values[rightIndex]);
    }

    offset += 1;
  }

  return result.slice(0, values.length);
};

const buildLayerSlots = (
  remainingCount: number,
  config: LayoutConfig,
  layerIndex: number,
): PositionedSlot[] => {
  const halfWidth = config.baseHalfWidth + layerIndex * config.layerGapX;
  const halfHeight = config.baseHalfHeight + layerIndex * config.layerGapY;

  const leftX = clamp(config.centerX - halfWidth, 4, 96);
  const rightX = clamp(config.centerX + halfWidth, 4, 96);
  const topY = clamp(config.centerY - halfHeight, 8, 92);
  const bottomY = clamp(config.centerY + halfHeight, 8, 92);

  const horizontalLength = rightX - leftX;
  const verticalLength = bottomY - topY;

  const topCapacity = getSideCapacity(horizontalLength, config.minTopBottomGap);
  const bottomCapacity = getSideCapacity(horizontalLength, config.minTopBottomGap);
  const sideCapacity = Math.max(0, getSideCapacity(verticalLength, config.minSideGap) - 2);

  let topCount = 0;
  let bottomCount = 0;
  let leftCount = 0;
  let rightCount = 0;
  let placed = 0;

  while (placed < remainingCount) {
    let changed = false;

    if (topCount < topCapacity && placed < remainingCount) {
      topCount += 1;
      placed += 1;
      changed = true;
    }

    if (bottomCount < bottomCapacity && placed < remainingCount) {
      bottomCount += 1;
      placed += 1;
      changed = true;
    }

    if (leftCount < sideCapacity && placed < remainingCount) {
      leftCount += 1;
      placed += 1;
      changed = true;
    }

    if (rightCount < sideCapacity && placed < remainingCount) {
      rightCount += 1;
      placed += 1;
      changed = true;
    }

    if (!changed) {
      break;
    }
  }

  const topXs = reorderCenterOut(
    buildCenteredPositions(config.centerX, (rightX - leftX) / 2, topCount),
  );

  const bottomXs = reorderCenterOut(
    buildCenteredPositions(config.centerX, (rightX - leftX) / 2, bottomCount),
  );

  const leftYs = reorderCenterOut(
    buildCenteredPositions(config.centerY, (bottomY - topY) / 2, leftCount + 2).slice(
      1,
      leftCount + 1,
    ),
  );

  const rightYs = reorderCenterOut(
    buildCenteredPositions(config.centerY, (bottomY - topY) / 2, rightCount + 2).slice(
      1,
      rightCount + 1,
    ),
  );

  const slots: PositionedSlot[] = [];

  topXs.forEach((x) => {
    slots.push({ left: x, top: topY });
  });

  bottomXs.forEach((x) => {
    slots.push({ left: x, top: bottomY });
  });

  leftYs.forEach((y) => {
    slots.push({ left: leftX, top: y });
  });

  rightYs.forEach((y) => {
    slots.push({ left: rightX, top: y });
  });

  return slots;
};

const buildPerimeterSlots = (totalCount: number, config: LayoutConfig) => {
  const slots: PositionedSlot[] = [];
  let remaining = totalCount;
  let layerIndex = 0;

  while (remaining > 0 && slots.length < config.maxVisible) {
    const nextLayerSlots = buildLayerSlots(remaining, config, layerIndex);

    if (nextLayerSlots.length === 0) {
      break;
    }

    slots.push(...nextLayerSlots);
    remaining -= nextLayerSlots.length;
    layerIndex += 1;
  }

  return slots.slice(0, config.maxVisible);
};

const getLayoutConfig = (isMobile: boolean) =>
  isMobile ? mobileLayoutConfig : desktopLayoutConfig;

export const getParticipantVisibilityLimit = (isMobile: boolean) =>
  getLayoutConfig(isMobile).maxVisible;

export const getParticipantPositions = (
  participants: GameParticipant[],
  isMobile: boolean,
): PositionedParticipant[] => {
  const config = getLayoutConfig(isMobile);
  const visibleParticipants = participants.slice(0, config.maxVisible);
  const slots = buildPerimeterSlots(visibleParticipants.length, config);

  return visibleParticipants.map((participant, index) => ({
    participant,
    left: `${slots[index]?.left ?? config.centerX}%`,
    top: `${slots[index]?.top ?? config.centerY}%`,
  }));
};
