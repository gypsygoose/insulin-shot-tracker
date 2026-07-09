export const APP_NAME = "Insulin Shot Tracker";
export const BLOCKED_TOAST_MESSAGE =
  "Точка заблокирована и не может быть отмечена";
export const TOAST_DURATION_MS = 4000;
// Newest toasts push older ones down; once the stack holds this many, the
// oldest is dropped to make room instead of growing further.
export const MAX_STACKED_TOASTS = 3;
export const INTERFACE_LOCKED_TOAST_MESSAGE =
  "Интерфейс залокирован. Чтобы отметить точку укола, разблокируйте интерфейс в нижнем меню либо отметьте через всплывающее меню точки (долгое нажатие).";
export const INTERFACE_LOCKED_TOAST_DURATION_MS = 4000;
export const INTERFACE_LOCK_ENABLED_TOAST_MESSAGE = "Интерфейс заблокирован";
export const INTERFACE_LOCK_DISABLED_TOAST_MESSAGE = "Интерфейс разблокирован";
export const AUTO_LOCK_FIRED_TOAST_MESSAGE =
  "Интерфейс заблокирован автоматически";
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
export const AUTO_LOCK_ENABLED_TOAST_MESSAGE =
  "Автоблокировка интерфейса включена";
export const AUTO_LOCK_DISABLED_TOAST_MESSAGE =
  "Автоблокировка интерфейса выключена";
export const AUTO_LOCK_UPDATED_TOAST_MESSAGE =
  "Настройки автоблокировки обновлены";
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
export const THEME_ROW_LABEL = "Тема";
export const THEME_LIGHT_LABEL = "Светлая";
export const THEME_DARK_LABEL = "Тёмная";
export const THEME_SYSTEM_LABEL = "Системная";
export const THEME_UPDATED_TOAST_MESSAGE_PREFIX = "Тема изменена";
export const EXPORT_ROW_LABEL = "Экспорт данных";
export const IMPORT_ROW_LABEL = "Импорт данных";
export const EXPORT_OPTIONS_DIALOG_TITLE = "Экспорт данных";
export const EXPORT_OPTIONS_DIALOG_MESSAGE =
  "Выберите, что экспортировать в файл.";
export const EXPORT_MARKS_LABEL = "Отметки точек укола";
export const EXPORT_SETTINGS_LABEL = "Настройки приложения";
export const EXPORT_CONFIRM_LABEL = "Экспортировать";
export const IMPORT_OPTIONS_DIALOG_TITLE = "Импорт данных";
export const IMPORT_OPTIONS_DIALOG_MESSAGE =
  "Выберите, что импортировать из файла. Пункты, которых нет в файле, недоступны. Выбранные категории заменят текущие данные — это действие нельзя отменить.";
export const IMPORT_CONFIRM_LABEL = "Импортировать";
// Shared between Accordion (LayoutAnimation, content expand/collapse) and
// Chevron (Animated.timing, rotation) so the two animate in lockstep.
export const ACCORDION_ANIMATION_DURATION_MS = 150;
export const MENU_SHEET_TITLE = "Меню";
export const HELP_SHEET_TITLE = "Справка";

// Note: shared surface/text/action/icon colors used to live here as flat
// constants (one dark palette). They're now theme-dependent — see
// src/theme/palette.ts (ThemeColors/DARK_COLORS/LIGHT_COLORS) and
// src/theme/ThemeContext.tsx's useTheme() hook.

// Toast status accent colors — each drives both the toast's left-edge/icon
// tint and its icon shape (src/components/icons/Toast*Icon.tsx). Chosen
// distinct from ButtonColor's cycle colors despite some value proximity,
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
