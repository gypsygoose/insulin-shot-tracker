import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Trans, useTranslation } from "react-i18next";
import { PointColor, ZoneType } from "../../types";
import { COLOR_HEX, PointService } from "../../logic";
import { BottomSheet } from "../common";
import { useTheme } from "../../theme";
import type { TranslationKey } from "../../i18n";
import { colorOrder, formatColorLabel } from "./utils";

// Injection zone descriptions, taken from the Figma "help" frame (node
// 26:239, file grYg39698ogy0nEBd88Fup). `type` looks up the accent directly
// from `colors.zoneColors`, which already resolves to the theme's darker
// shade in light mode — the plain dark-theme accent reads too faint as
// text/a badge border on the light theme's white sheet surface (same issue
// as ZoneContainer's block — see CLAUDE.md's "Zones and points").
const HELP_ZONE_TYPES: ZoneType[] = [
  ZoneType.Shoulder,
  ZoneType.Belly,
  ZoneType.Thigh,
];

interface HelpZoneKeys {
  label: TranslationKey;
  location: TranslationKey;
  description: TranslationKey;
}

const HELP_ZONE_KEY: Record<ZoneType, HelpZoneKeys> = {
  [ZoneType.Shoulder]: {
    label: "help.zones.shoulder.label",
    location: "help.zones.shoulder.location",
    description: "help.zones.shoulder.description",
  },
  [ZoneType.Belly]: {
    label: "help.zones.belly.label",
    location: "help.zones.belly.location",
    description: "help.zones.belly.description",
  },
  [ZoneType.Thigh]: {
    label: "help.zones.thigh.label",
    location: "help.zones.thigh.location",
    description: "help.zones.thigh.description",
  },
};

interface Props {
  visible: boolean;
  onClose: () => void;
  daysToWhite: number;
}

export function HelpSheet({ visible, onClose, daysToWhite }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const sectionTitleStyle = [
    styles.sectionTitle,
    { color: colors.sectionLabel },
  ];
  const hintStyle = [styles.hint, { color: colors.secondaryText }];
  const boldStyle = [styles.bold, { color: colors.primaryText }];
  const boldComponents = { bold: <Text style={boldStyle} /> };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("help.title")}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={sectionTitleStyle}>{t("help.sectionZones")}</Text>
        {HELP_ZONE_TYPES.map((type) => {
          const color = colors.zoneColors[type].accent;
          const zoneKey = HELP_ZONE_KEY[type];
          return (
            <View
              key={type}
              style={[styles.zoneCard, { borderBottomColor: colors.divider }]}
            >
              <View style={styles.zoneHeader}>
                <View
                  style={[
                    styles.zoneBadge,
                    { backgroundColor: `${color}38`, borderColor: color },
                  ]}
                />
                <Text style={styles.zoneRowText}>
                  <Text style={[styles.zoneLabel, { color }]}>
                    {t(zoneKey.label)}
                  </Text>
                  <Text
                    style={[styles.zoneLocation, { color: colors.mutedText }]}
                  >
                    {" "}
                    {t(zoneKey.location)}
                  </Text>
                </Text>
              </View>
              <Text
                style={[
                  styles.zoneDescription,
                  { color: colors.secondaryText },
                ]}
              >
                {t(zoneKey.description)}
              </Text>
            </View>
          );
        })}

        <Text style={sectionTitleStyle}>{t("help.sectionColorScheme")}</Text>
        {colorOrder(daysToWhite).map((color) => (
          <View key={color} style={styles.colorRow}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: COLOR_HEX[color],
                  borderWidth: 0,
                },
              ]}
            />
            <Text style={[styles.colorLabel, { color: colors.secondaryText }]}>
              {formatColorLabel(t, PointService.colorLabel(color, daysToWhite))}
            </Text>
          </View>
        ))}

        <Text style={sectionTitleStyle}>{t("help.sectionControls")}</Text>
        <Text style={hintStyle}>
          <Trans i18nKey="help.controls.press" components={boldComponents} />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.controls.longPress"
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.controls.checkmark"
            components={boldComponents}
          />
        </Text>

        <Text style={sectionTitleStyle}>{t("help.sectionBottomBar")}</Text>
        <Text style={hintStyle}>
          <Trans i18nKey="help.bottomBar.undo" components={boldComponents} />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.bottomBar.menu"
            values={{ label: t("menu.title") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.bottomBar.help"
            values={{ label: t("help.title") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans i18nKey="help.bottomBar.lock" components={boldComponents} />
        </Text>

        <Text style={sectionTitleStyle}>{t("help.sectionMenuItems")}</Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.mirror"
            values={{ label: t("menu.mirrorRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.autoLock"
            values={{ label: t("menu.autoLockRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.daysToWhite"
            values={{ label: t("menu.daysToWhiteRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.theme"
            values={{ label: t("menu.themeRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.language"
            values={{ label: t("menu.languageRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.export"
            values={{ label: t("menu.exportRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.import"
            values={{ label: t("menu.importRow") }}
            components={boldComponents}
          />
        </Text>
        <Text style={hintStyle}>
          <Trans
            i18nKey="help.menuItems.clear"
            values={{ label: t("common.clear") }}
            components={boldComponents}
          />
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
