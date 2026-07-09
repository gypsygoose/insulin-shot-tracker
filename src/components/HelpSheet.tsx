import { ScrollView, Text, View, StyleSheet } from "react-native";
import { ButtonColor, ZoneId } from "../types";
import {
  activeCycleColors,
  COLOR_HEX,
  colorLabel,
} from "../logic/stateMachine";
import { ZONE_COLORS } from "../data/zones";
import { BottomSheet } from "./common/BottomSheet";
import { useTheme } from "../theme/ThemeContext";
import {
  AUTO_LOCK_ROW_LABEL,
  CLEAR_LABEL,
  DAYS_TO_WHITE_ROW_LABEL,
  EXPORT_ROW_LABEL,
  HELP_SHEET_TITLE,
  IMPORT_ROW_LABEL,
  MENU_SHEET_TITLE,
  MIRROR_ROW_LABEL,
  THEME_ROW_LABEL,
} from "../constants";

// Injection zone descriptions, taken from the Figma "help" frame
// (node 26:239, file grYg39698ogy0nEBd88Fup). Colors are the same per-group
// accents as ZONE_COLORS in data/zones.ts (left/right share one accent).
const INJECTION_ZONE_INFO = [
  {
    id: "shoulders",
    label: "Плечи",
    location: "средняя треть сзади и сбоку",
    description:
      "Умеренное всасывание. Начало действия через 10 минут. Пик действия через 60–90 минут.",
    color: ZONE_COLORS[ZoneId.ShoulderRight].accent,
  },
  {
    id: "belly",
    label: "Живот",
    location: "4 см отступ от рёбер и пупка",
    description:
      "Быстрое всасывание. Начало действия через 5 минут. Пик действия через 30–60 минут.",
    color: ZONE_COLORS[ZoneId.BellyRight].accent,
  },
  {
    id: "thighs",
    label: "Бёдра",
    location: "внешняя боковая поверхность",
    description:
      "Медленное всасывание. Для пролонгированного инсулина. Пик действия через 90–120 минут.",
    color: ZONE_COLORS[ZoneId.ThighRight].accent,
  },
];

// Color scheme rows shown in order: white (free), the active injection
// cycle (fewer entries when daysToWhite is reduced), then the two block
// states.
function colorOrder(daysToWhite: number): ButtonColor[] {
  return [
    ButtonColor.White,
    ...activeCycleColors(daysToWhite),
    ButtonColor.Black,
    ButtonColor.Gray,
  ];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  daysToWhite: number;
}

export function HelpSheet({ visible, onClose, daysToWhite }: Props) {
  const { colors } = useTheme();
  const sectionTitleStyle = [
    styles.sectionTitle,
    { color: colors.sectionLabel },
  ];
  const hintStyle = [styles.hint, { color: colors.secondaryText }];
  const boldStyle = [styles.bold, { color: colors.primaryText }];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={HELP_SHEET_TITLE}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={sectionTitleStyle}>Зоны введения</Text>
        {INJECTION_ZONE_INFO.map((z) => (
          <View
            key={z.id}
            style={[styles.zoneCard, { borderBottomColor: colors.divider }]}
          >
            <View style={styles.zoneHeader}>
              <View
                style={[
                  styles.zoneBadge,
                  { backgroundColor: `${z.color}38`, borderColor: z.color },
                ]}
              />
              <Text style={styles.zoneRowText}>
                <Text style={[styles.zoneLabel, { color: z.color }]}>
                  {z.label}
                </Text>
                <Text
                  style={[styles.zoneLocation, { color: colors.mutedText }]}
                >
                  {" "}
                  {z.location}
                </Text>
              </Text>
            </View>
            <Text
              style={[styles.zoneDescription, { color: colors.secondaryText }]}
            >
              {z.description}
            </Text>
          </View>
        ))}

        <Text style={sectionTitleStyle}>Цветовая схема</Text>
        {colorOrder(daysToWhite).map((c) => (
          <View key={c} style={styles.colorRow}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: COLOR_HEX[c],
                  borderWidth: 0,
                },
              ]}
            />
            <Text style={[styles.colorLabel, { color: colors.secondaryText }]}>
              {colorLabel(c, daysToWhite)}
            </Text>
          </View>
        ))}

        <Text style={sectionTitleStyle}>Управление</Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>Нажатие</Text> — зафиксировать укол.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>Долгое нажатие</Text> (~1 с) — вызвать меню
          для места укола.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>✓ Галочка</Text> — последнее использованное
          место в группе.
        </Text>

        <Text style={sectionTitleStyle}>Нижняя панель</Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>Отменить</Text> — отменить последнее действие
          (укол, блокировку или разблокировку места).
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{MENU_SHEET_TITLE}</Text> — открыть меню
          настроек и данных.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{HELP_SHEET_TITLE}</Text> — открыть этот
          экран.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>Замок</Text> — заблокировать или
          разблокировать интерфейс, чтобы избежать случайных нажатий.
        </Text>

        <Text style={sectionTitleStyle}>Пункты меню</Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{MIRROR_ROW_LABEL}</Text> — отразить силуэт
          тела по горизонтали.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{AUTO_LOCK_ROW_LABEL}</Text> — автоматически
          включать блокировку через заданное время после отметки укола и после
          ручной разблокировки. Нажатие на строку открывает настройку задержек.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{DAYS_TO_WHITE_ROW_LABEL}</Text> — через
          сколько дней место укола снова считается полностью свободным (белым).
          Уменьшение значения сжимает цветовую схему в этот срок.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{THEME_ROW_LABEL}</Text> — выбрать светлую,
          тёмную или системную тему оформления приложения.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{EXPORT_ROW_LABEL}</Text> — выбрать, что
          сохранить в файл: отметки точек укола и/или настройки приложения
          (по отдельности).
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{IMPORT_ROW_LABEL}</Text> — выбрать, что
          применить из файла: отметки точек укола и/или настройки приложения
          (по отдельности). Категории, которых нет в файле, недоступны для
          выбора; остальные текущие данные не затрагиваются.
        </Text>
        <Text style={hintStyle}>
          <Text style={boldStyle}>{CLEAR_LABEL}</Text> — удалить всю историю
          инъекций без возможности восстановления.
        </Text>
        <View style={styles.bottomPad} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  zoneCard: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  zoneBadge: {
    width: 34,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    flexShrink: 0,
  },
  zoneRowText: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  zoneLocation: {
    fontSize: 13,
  },
  zoneDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 14,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  colorLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  hint: {
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "700",
  },
  bottomPad: {
    // Extra clearance so the last row isn't hidden behind the bottom menu
    // bar, which now renders on top of the sheet instead of a full-screen
    // Modal covering it.
    height: 110,
  },
});
