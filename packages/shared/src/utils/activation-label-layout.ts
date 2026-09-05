import {
  ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM,
  ACTIVATION_LABEL_PRINTABLE_WIDTH_MM,
  DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
  DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
  MIN_ACTIVATION_LABEL_HEIGHT_MM,
  MIN_ACTIVATION_LABEL_WIDTH_MM,
} from "../constants/activation-label-layout.ts";

export type ActivationLabelSize = {
  labelHeightMm: number;
  labelWidthMm: number;
};

export type ActivationLabelLayout = ActivationLabelSize & {
  columns: number;
  labelsPerPage: number;
  rows: number;
  sheetHeightMm: number;
  sheetWidthMm: number;
};

export function resolveActivationLabelLayout(
  size: Partial<ActivationLabelSize> = {},
): ActivationLabelLayout {
  const labelHeightMm =
    size.labelHeightMm ?? DEFAULT_ACTIVATION_LABEL_HEIGHT_MM;
  const labelWidthMm = size.labelWidthMm ?? DEFAULT_ACTIVATION_LABEL_WIDTH_MM;
  const columns = Math.floor(
    ACTIVATION_LABEL_PRINTABLE_WIDTH_MM / labelWidthMm + Number.EPSILON,
  );
  const rows = Math.floor(
    ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM / labelHeightMm + Number.EPSILON,
  );

  return {
    columns,
    labelHeightMm,
    labelWidthMm,
    labelsPerPage: columns * rows,
    rows,
    sheetHeightMm: roundMillimeters(rows * labelHeightMm),
    sheetWidthMm: roundMillimeters(columns * labelWidthMm),
  };
}

export function isActivationLabelSizeValid(size: ActivationLabelSize) {
  return (
    Number.isFinite(size.labelWidthMm) &&
    size.labelWidthMm >= MIN_ACTIVATION_LABEL_WIDTH_MM &&
    size.labelWidthMm <= ACTIVATION_LABEL_PRINTABLE_WIDTH_MM &&
    Number.isFinite(size.labelHeightMm) &&
    size.labelHeightMm >= MIN_ACTIVATION_LABEL_HEIGHT_MM &&
    size.labelHeightMm <= ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM
  );
}

function roundMillimeters(value: number) {
  return Math.round(value * 1000) / 1000;
}
