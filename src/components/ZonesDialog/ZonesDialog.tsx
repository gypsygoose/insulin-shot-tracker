import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, Checkbox, Accordion } from "../common";
import { ZONE_LABEL_KEY, ZONE_TYPE_LABEL_KEY, ZONE_TYPE_ZONE_IDS } from "../../data";
import { EnabledZones, ZoneId, ZoneType } from "../../types";
import { allDisabled } from "./utils";

const ZONE_TYPES: ZoneType[] = [
  ZoneType.Shoulder,
  ZoneType.Belly,
  ZoneType.Thigh,
];

const COLLAPSED_ALL: Record<ZoneType, boolean> = {
  [ZoneType.Shoulder]: false,
  [ZoneType.Belly]: false,
  [ZoneType.Thigh]: false,
};

interface Props {
  visible: boolean;
  initialEnabledZones: EnabledZones;
  onConfirm: (next: EnabledZones) => void;
  onCancel: () => void;
}

// One collapsed-by-default accordion per zone type (Плечи/Живот/Бёдра), each
// with a bulk header checkbox plus two per-side checkboxes (e.g. Левое
// плечо/Правое плечо) — same accordion-with-checkbox-header pattern as
// AppDataSelector's "Настройки приложения" group, generalized to three
// independent groups instead of one. At least one zone must stay enabled, so
// toggling off the last remaining one is a no-op (see the `allDisabled`
// guard below) — otherwise the body diagram would have nowhere left to mark
// an injection.
export function ZonesDialog({
  visible,
  initialEnabledZones,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<EnabledZones>(initialEnabledZones);
  const [expanded, setExpanded] =
    useState<Record<ZoneType, boolean>>(COLLAPSED_ALL);

  useEffect(() => {
    if (!visible) return;
    setDraft(initialEnabledZones);
    setExpanded(COLLAPSED_ALL);
  }, [visible, initialEnabledZones]);

  const toggleZone = (zoneId: ZoneId) => {
    setDraft((prev) => {
      const next = { ...prev, [zoneId]: !prev[zoneId] };
      return allDisabled(next) ? prev : next;
    });
  };

  const toggleType = (type: ZoneType) => {
    const zoneIds = ZONE_TYPE_ZONE_IDS[type];
    const allChecked = zoneIds.every((zoneId) => draft[zoneId]);
    setDraft((prev) => {
      const next = { ...prev };
      for (const zoneId of zoneIds) next[zoneId] = !allChecked;
      return allDisabled(next) ? prev : next;
    });
  };

  return (
    <Dialog
      visible={visible}
      title={t("menu.zonesRow")}
      message={t("menu.zonesDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
      scrollable
    >
      {ZONE_TYPES.map((type) => {
        const zoneIds = ZONE_TYPE_ZONE_IDS[type];
        const checkedCount = zoneIds.filter((zoneId) => draft[zoneId]).length;
        return (
          <Accordion
            key={type}
            label={
              <Checkbox
                label={t(ZONE_TYPE_LABEL_KEY[type])}
                checked={checkedCount === zoneIds.length}
                indeterminate={checkedCount > 0 && checkedCount < zoneIds.length}
                onToggle={() => toggleType(type)}
              />
            }
            expanded={expanded[type]}
            onToggleExpanded={() =>
              setExpanded((prev) => ({ ...prev, [type]: !prev[type] }))
            }
          >
            {zoneIds.map((zoneId) => (
              <Checkbox
                key={zoneId}
                label={t(ZONE_LABEL_KEY[zoneId])}
                checked={draft[zoneId]}
                onToggle={() => toggleZone(zoneId)}
              />
            ))}
          </Accordion>
        );
      })}
    </Dialog>
  );
}
