export const APP_NAME = "Insulin Shot Tracker";
export const BLOCKED_TOAST_MESSAGE =
  "Точка заблокирована и не может быть отмечена";
export const TOAST_DURATION_MS = 4000;
export const INTERFACE_LOCKED_TOAST_MESSAGE =
  "Интерфейс залокирован. Чтобы отметить точку укола, разблокируйте интерфейс в нижнем меню либо отметьте через всплывающее меню точки (долгое нажатие).";
export const INTERFACE_LOCKED_TOAST_DURATION_MS = 4000;
export const INTERFACE_LOCK_ENABLED_TOAST_MESSAGE = "Интерфейс заблокирован";
export const INTERFACE_LOCK_DISABLED_TOAST_MESSAGE = "Интерфейс разблокирован";
export const AUTO_LOCK_FIRED_TOAST_MESSAGE = "Интерфейс заблокирован автоматически";
export const MANUAL_BLOCK_TOAST_PREFIX = "Точка заблокирована вручную";
export const MANUAL_UNBLOCK_TOAST_PREFIX = "Точка разблокирована вручную";
export const POINT_CLEARED_TOAST_PREFIX = "Точка очищена";
export const CLEAR_ALL_TOAST_MESSAGE = "Все данные очищены";
export const UNDO_TOAST_MESSAGE = "Последнее действие отменено";
export const EXPORT_SUCCESS_TOAST_MESSAGE = "Данные экспортированы";
export const IMPORT_SUCCESS_TOAST_MESSAGE = "Данные импортированы";
export const IMPORT_FAILURE_TOAST_MESSAGE =
  "Не удалось импортировать\nВыбранный файл повреждён или имеет неверный формат.";
export const MIRROR_ENABLED_TOAST_MESSAGE = "Зеркальное отображение включено";
export const MIRROR_DISABLED_TOAST_MESSAGE = "Зеркальное отображение выключено";
export const AUTO_LOCK_ENABLED_TOAST_MESSAGE = "Автоблокировка интерфейса включена";
export const AUTO_LOCK_DISABLED_TOAST_MESSAGE = "Автоблокировка интерфейса выключена";
export const AUTO_LOCK_UPDATED_TOAST_MESSAGE = "Настройки автоблокировки обновлены";
export const BACKGROUND_COLOR = "#080C18";
export const ICON_COLOR = "#FFFFFF";
export const DISABLED_ICON_COLOR = "#4A5568";
export const ICON_SIZE = 22; // bottom-menu icon width/height (src/components/icons)
export const LEFT_SIDE_LABEL = "левая\nсторона";
export const RIGHT_SIDE_LABEL = "правая\nсторона";

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

// Action labels shared across dialogs/menus/sheets — a single source of
// truth so e.g. HelpSheet's documentation of a row can't drift from the
// row's actual label.
export const CANCEL_LABEL = "Отмена";
export const SAVE_LABEL = "Сохранить";
export const CLEAR_LABEL = "Очистить";
export const MARK_LABEL = "Отметить";
export const AFTER_MARK_LABEL = "После отметки";
export const AFTER_UNLOCK_LABEL = "После разблокировки";
export const MIRROR_ROW_LABEL = "Зеркальное отображение";
export const AUTO_LOCK_ROW_LABEL = "Автоблокировка интерфейса";
export const DAYS_TO_WHITE_ROW_LABEL = "Дней до восстановления точки";
export const EXPORT_ROW_LABEL = "Экспорт...";
export const IMPORT_ROW_LABEL = "Импорт...";
export const MENU_SHEET_TITLE = "Меню";
export const HELP_SHEET_TITLE = "Справка";

// Shared surface/text/action colors for dialogs, sheets, and menus (dark theme)
export const SURFACE_COLOR = "#141824"; // card/sheet/toast background
export const PRIMARY_TEXT_COLOR = "#FFFFFF"; // title/label/value text on dark surfaces
export const SECONDARY_TEXT_COLOR = "rgba(255,255,255,0.6)"; // message/info body text
export const MUTED_TEXT_COLOR = "rgba(255,255,255,0.5)"; // field labels/descriptions
export const PRIMARY_SECTION_LABEL_COLOR = "rgba(255,255,255,0.4)"; // faint uppercase section titles
export const SECONDARY_SECTION_LABEL_COLOR = "rgba(255,255,255,0.4)"; // faint body copy under a section heading (same value, distinct role)
export const CARD_BORDER_COLOR = "rgba(255,255,255,0.1)"; // hairline border on dark surfaces
export const DIVIDER_COLOR = "rgba(255,255,255,0.08)"; // hairline row/section divider
export const MODAL_OVERLAY_COLOR = "rgba(0,0,0,0.7)"; // modal backdrop scrim
export const PRIMARY_ACTION_COLOR = "#2563EB"; // confirm/primary button background
export const DESTRUCTIVE_COLOR = "#DC2626"; // destructive action background/label
export const CANCEL_BUTTON_BORDER_COLOR = "rgba(255,255,255,0.2)";
export const CANCEL_BUTTON_TEXT_COLOR = "rgba(255,255,255,0.7)";
export const CANCEL_BUTTON_BACKGROUND_COLOR = "rgba(255,255,255,0.06)";
export const SWITCH_THUMB_COLOR = "#FFFFFF"; // Switch thumb fill (distinct control-role constant, not text)
export const SWITCH_TRACK_ON_COLOR = "#16A34A"; // Switch "on" track — unrelated to the injection-cycle green in stateMachine.ts's ButtonColor, despite the value match
export const SWITCH_TRACK_OFF_COLOR = "rgba(255,255,255,0.15)"; // Switch "off" track
export const SCREEN_TITLE_COLOR = "rgba(255,255,255,0.26)"; // App title text — fainter than PRIMARY_SECTION_LABEL_COLOR since it sits directly on the root background, not a card surface

// Toast status accent colors — each drives both the toast's left-edge/icon
// tint and its icon shape (src/components/icons/Toast*Icon.tsx). Chosen
// distinct from ButtonColor's cycle colors despite some value proximity,
// since they mean "message severity", not "days since injection".
export const TOAST_INFO_COLOR = "#3B82F6";
export const TOAST_WARN_COLOR = "#F59E0B";
export const TOAST_SUCCESS_COLOR = "#22C55E";
export const TOAST_ERROR_COLOR = "#EF4444";
export const TOAST_ICON_SIZE = 18;
// Opaque, darkened tints of the accent colors above, used as the toast's own
// background so the whole toast (not just the icon) reads as its status
// without being see-through over whatever content sits behind it.
export const TOAST_INFO_BACKGROUND_COLOR = "#152238";
export const TOAST_WARN_BACKGROUND_COLOR = "#2E230D";
export const TOAST_SUCCESS_BACKGROUND_COLOR = "#122B1D";
export const TOAST_ERROR_BACKGROUND_COLOR = "#301414";

// Figma body image aspect ratio: 393.46 wide × 621.91 tall
export const IMG_ASPECT = 393.46 / 621.91;
