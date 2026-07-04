import { ScrollView, Text, View, StyleSheet } from "react-native";
import { ButtonColor } from "../types";
import { COLOR_HEX, COLOR_LABEL } from "../logic/stateMachine";
import BottomSheet from "./BottomSheet";

// Injection zone descriptions, taken from the Figma "help" frame
// (node 26:239, file grYg39698ogy0nEBd88Fup).
const INJECTION_ZONE_INFO = [
  {
    id: "shoulders",
    label: "Плечи",
    location: "средняя треть сзади и сбоку",
    description:
      "Умеренное всасывание. Начало действия через 10 минут. Пик действия через 60–90 минут.",
    color: "#F5D020",
  },
  {
    id: "belly",
    label: "Живот",
    location: "4 см отступ от рёбер и пупка",
    description:
      "Быстрое всасывание. Начало действия через 5 минут. Пик действия через 30–60 минут.",
    color: "#36D97A",
  },
  {
    id: "thighs",
    label: "Бёдра",
    location: "внешняя боковая поверхность",
    description:
      "Медленное всасывание. Для пролонгированного инсулина. Пик действия через 90–120 минут.",
    color: "#FF8C33",
  },
] as const;

const COLOR_ORDER: ButtonColor[] = [
  "white",
  "maroon",
  "red",
  "dark-orange",
  "orange",
  "dark-yellow",
  "yellow",
  "dark-green",
  "green",
  "black",
  "gray",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HelpSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Справка">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Зоны введения</Text>
        {INJECTION_ZONE_INFO.map((z) => (
          <View key={z.id} style={styles.zoneCard}>
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
                <Text style={styles.zoneLocation}> {z.location}</Text>
              </Text>
            </View>
            <Text style={styles.zoneDescription}>{z.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Цветовая схема</Text>
        {COLOR_ORDER.map((c) => (
          <View key={c} style={styles.colorRow}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: COLOR_HEX[c],
                  borderColor:
                    c === "white" ? "rgba(255,255,255,0.3)" : COLOR_HEX[c],
                },
              ]}
            />
            <Text style={styles.colorLabel}>{COLOR_LABEL[c]}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Управление</Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Нажатие</Text> — зафиксировать укол.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Долгое нажатие</Text> (~1 с) — вызвать меню
          для места укола.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>✓ Галочка</Text> — последнее использованное
          место в группе.
        </Text>

        <Text style={styles.sectionTitle}>Нижняя панель</Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Отменить</Text> — отменить последнее
          действие (укол, блокировку или разблокировку места).
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Меню</Text> — открыть меню настроек и
          данных.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Справка</Text> — открыть этот экран.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Замок</Text> — заблокировать или
          разблокировать интерфейс, чтобы избежать случайных нажатий.
        </Text>

        <Text style={styles.sectionTitle}>Пункты меню</Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Зеркальное отображение</Text> — отразить
          силуэт тела по горизонтали.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Автоблокировка интерфейса</Text> —
          автоматически включать блокировку через заданное время после
          отметки укола и после ручной разблокировки. Нажатие на строку
          открывает настройку задержек.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Экспорт...</Text> — сохранить все данные
          в файл.
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Импорт...</Text> — загрузить данные из
          файла (текущие данные будут заменены).
        </Text>
        <Text style={styles.hint}>
          <Text style={styles.bold}>Очистить</Text> — удалить всю историю
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
    color: "rgba(255,255,255,0.4)",
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  zoneCard: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
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
    color: "rgba(255,255,255,0.5)",
  },
  zoneDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
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
    color: "rgba(255,255,255,0.75)",
    lineHeight: 19,
  },
  hint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 21,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomPad: {
    // Extra clearance so the last row isn't hidden behind the bottom menu
    // bar, which now renders on top of the sheet instead of a full-screen
    // Modal covering it.
    height: 110,
  },
});
