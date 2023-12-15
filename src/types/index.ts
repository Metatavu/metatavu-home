import { DateTime } from "luxon";
import { DailyEntry, VacationType } from "../generated/client";
import { ReactNode } from "react";

/**
 * Enum describing table form modes
 */
export enum ToolbarFormModes {
  CREATE = "CREATE",
  EDIT = "EDIT",
  NONE = "NONE"
}

/**
 * Type describing Icon properties
 */
export type ButtonIconProps = {};

/**
 * Type describing available languages
 */
export type Language = "fi" | "en-gb";

/**
 * Type describing row for vacations data grid table
 */
export interface VacationsDataGridRow {
  id: string | undefined;
  type: VacationType | string;
  personFullName: string;
  updatedAt: string | DateTime;
  startDate: string | DateTime;
  endDate: string | DateTime;
  days: number;
  message: string;
  status: string;
}

/**
 * Type describing column for skeleton table
 */
export interface SkeletonTableColumn {
  variant: string;
  height: number | string;
  width: number | string;
  margin: number | string;
}

/**
 * Type describing row for skeleton table
 */
export interface SkeletonTableRow {
  variant: "rounded" | "text" | "rectangular" | "circular";
  height: string | number;
  width: string | number;
  margin: string;
}

/**
 * Type describing data for vacation request
 */
export interface VacationData {
  startDate: DateTime;
  endDate: DateTime;
  type: VacationType;
  message: string;
  days: number;
}

/**
 * Type describing date range for overview picker
 */
export interface DateRange {
  start: DateTime;
  end: DateTime;
}

/**
 * Interface for custom label used in the pie chart
 */
export interface CustomLabel {
  value: number;
  name: string;
}

/**
 * Enum for work time entry categories
 */
export enum Worktime {
  Billable = "billableProject",
  NonBillable = "nonBillableProject",
  Internal = "internal",
  Expected = "expected"
}

/**
 * Type describing vacation info list item
 */
export interface VacationInfoListItem {
  name: string;
  value: string | ReactNode;
}

/**
 * Type describing daily entry with index signature
 */
export interface DailyEntryWithIndexSignature extends DailyEntry {
  [key: string]: any;
}

/**
 * Type describing chart data
 */
export interface ChartData {
  name: string;
  internal: number;
  billableProject: number;
  nonBillableProject: number;
  expected: number;
}

/**
 * Type describing date range
 */
export interface DateRange {
  start: DateTime;
  end: DateTime;
}
