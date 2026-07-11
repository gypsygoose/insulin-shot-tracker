// Brand name — deliberately not localized (see src/i18n/), unlike every
// other user-facing string in the app.
export const APP_NAME = "Insulin Shot Tracker";

export const TOAST_DURATION_MS = 4000;
// Newest toasts push older ones down; once the stack holds this many, the
// oldest is dropped to make room instead of growing further.
export const MAX_STACKED_TOASTS = 3;
export const INTERFACE_LOCKED_TOAST_DURATION_MS = 4000;
export const ICON_SIZE = 22; // bottom-menu icon width/height (src/components/icons)

// Generic time-unit constants, not tied to any one feature.
export const SECOND_MS = 1000;
export const MINUTES_PER_DAY = 24 * 60;

// How far a MarkDialog timestamp must sit in the past (relative to confirm
// time) before the mark-confirmation toast calls it out as backdated and
// shows the date/time — accounts for time spent interacting with the date
// picker itself, so leaving the default "now" value doesn't count.
export const MARK_BACKDATED_THRESHOLD_MS = 2 * 60 * 1000;

// Configurable "days to white" setting range — see MenuSheet's row for it.
export const MIN_DAYS_TO_WHITE = 1;
export const MAX_DAYS_TO_WHITE = 8;
export const DEFAULT_DAYS_TO_WHITE = MAX_DAYS_TO_WHITE;

// Shared between Accordion (LayoutAnimation, content expand/collapse) and
// Chevron (Animated.timing, rotation) so the two animate in lockstep.
export const ACCORDION_ANIMATION_DURATION_MS = 150;

// Note: shared surface/text/action/icon colors used to live here as flat
// constants (one dark palette). They're now theme-dependent — see
// src/theme/palette.ts (ThemeColors/DARK_COLORS/LIGHT_COLORS) and
// src/theme/ThemeContext.tsx's useTheme() hook. All user-facing text
// (row labels, toast messages, dialog copy) has similarly moved out of this
// file — see src/i18n/locales/ru.ts and en.ts.

// Toast status accent colors — each drives both the toast's left-edge/icon
// tint and its icon shape (src/components/icons/Toast*Icon.tsx). Chosen
// distinct from PointColor's cycle colors despite some value proximity,
// since they mean "message severity", not "days since injection".
export const TOAST_INFO_COLOR = "#3B82F6";
export const TOAST_WARN_COLOR = "#F59E0B";
export const TOAST_SUCCESS_COLOR = "#22C55E";
export const TOAST_ERROR_COLOR = "#EF4444";
export const TOAST_ICON_SIZE = 18;
// Toast text/icon-mark color — fixed (not theme-dependent) since toasts are
// self-contained, always-dark-tinted status cards in both themes (see the
// TOAST_*_BACKGROUND_COLOR comment below).
export const TOAST_TEXT_COLOR = "#FFFFFF";
// Opaque, darkened tints of the accent colors above, used as the toast's own
// background so the whole toast (not just the icon) reads as its status
// without being see-through over whatever content sits behind it.
export const TOAST_INFO_BACKGROUND_COLOR = "#152238";
export const TOAST_WARN_BACKGROUND_COLOR = "#2E230D";
export const TOAST_SUCCESS_BACKGROUND_COLOR = "#122B1D";
export const TOAST_ERROR_BACKGROUND_COLOR = "#301414";

// Figma body image aspect ratio: 393.46 wide × 621.91 tall
export const IMG_ASPECT = 393.46 / 621.91;
