import { ToastStatus } from "../../../types";
import {
  ToastInfoIcon,
  ToastWarnIcon,
  ToastSuccessIcon,
  ToastErrorIcon,
} from "../../icons";
import {
  TOAST_INFO_COLOR,
  TOAST_WARN_COLOR,
  TOAST_SUCCESS_COLOR,
  TOAST_ERROR_COLOR,
  TOAST_INFO_BACKGROUND_COLOR,
  TOAST_WARN_BACKGROUND_COLOR,
  TOAST_SUCCESS_BACKGROUND_COLOR,
  TOAST_ERROR_BACKGROUND_COLOR,
} from "../../../constants";

export const FADE_MS = 200;

export const STATUS_ICON: Record<ToastStatus, () => React.JSX.Element> = {
  [ToastStatus.Info]: ToastInfoIcon,
  [ToastStatus.Warn]: ToastWarnIcon,
  [ToastStatus.Success]: ToastSuccessIcon,
  [ToastStatus.Error]: ToastErrorIcon,
};

export const STATUS_BORDER_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_COLOR,
};

export const STATUS_BACKGROUND_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_BACKGROUND_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_BACKGROUND_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_BACKGROUND_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_BACKGROUND_COLOR,
};
