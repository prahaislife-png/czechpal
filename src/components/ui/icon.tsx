import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { icon as iconSize } from '@/theme/tokens';

/**
 * The app's single icon vocabulary: SF Symbols on iOS, Material Symbols on Android and web.
 * Add new glyphs here — never reach for another icon family.
 */
const glyphs = {
  camera: ['camera.fill', 'photo_camera'],
  photo: ['photo.on.rectangle', 'photo_library'],
  pdf: ['doc.richtext', 'picture_as_pdf'],
  paste: ['doc.on.clipboard', 'content_paste'],
  scan: ['doc.viewfinder', 'document_scanner'],
  chevronRight: ['chevron.right', 'chevron_right'],
  arrowRight: ['arrow.right', 'arrow_forward'],
  check: ['checkmark', 'check'],
  checkCircle: ['checkmark.circle.fill', 'check_circle'],
  circle: ['circle', 'radio_button_unchecked'],
  alert: ['exclamationmark.circle.fill', 'error'],
  warning: ['exclamationmark.triangle.fill', 'warning'],
  info: ['info.circle', 'info'],
  question: ['questionmark.circle', 'help'],
  calendar: ['calendar', 'calendar_today'],
  clock: ['clock', 'schedule'],
  person: ['person.crop.circle', 'account_circle'],
  sender: ['envelope.open', 'drafts'],
  money: ['banknote', 'payments'],
  number: ['number', 'tag'],
  document: ['doc.text', 'description'],
  location: ['mappin.and.ellipse', 'location_on'],
  water: ['drop', 'water_drop'],
  lock: ['lock.fill', 'lock'],
  shield: ['checkmark.shield', 'verified_user'],
  copy: ['doc.on.doc', 'content_copy'],
  mail: ['envelope', 'mail'],
  refresh: ['arrow.clockwise', 'refresh'],
  close: ['xmark', 'close'],
  plus: ['plus', 'add'],
  pills: ['pills', 'medication'],
  night: ['moon', 'bedtime'],
  external: ['arrow.up.right', 'open_in_new'],
  trash: ['trash', 'delete'],
  globe: ['globe', 'language'],
  translate: ['character.bubble', 'translate'],
  text: ['text.alignleft', 'notes'],
  tray: ['tray', 'inbox'],
  star: ['star.fill', 'star'],
  reply: ['arrowshape.turn.up.left', 'reply'],
  home: ['house', 'home'],
  history: ['clock.arrow.circlepath', 'history'],
  profile: ['person.crop.circle', 'person'],
  housing: ['house', 'home'],
  utilities: ['bolt', 'bolt'],
  school: ['graduationcap', 'school'],
  government: ['building.columns', 'account_balance'],
  work: ['briefcase', 'work'],
  finance: ['creditcard', 'credit_card'],
  health: ['cross.case', 'medical_services'],
  food: ['fork.knife', 'restaurant'],
  transport: ['car', 'directions_car'],
  personal: ['bubble.left.and.bubble.right', 'forum'],
  other: ['doc.text', 'description'],
  viewfinder: ['viewfinder', 'center_focus_strong'],
  flash: ['bolt.fill', 'flash_on'],
  flashOff: ['bolt.slash', 'flash_off'],
  keyboard: ['keyboard', 'keyboard'],
  settings: ['gearshape', 'settings'],
  qrcode: ['qrcode', 'qr_code'],
  phone: ['phone.fill', 'call'],
  message: ['message', 'sms'],
  compose: ['square.and.pencil', 'edit_square'],
  help: ['lifepreserver', 'support'],
  share: ['square.and.arrow.up', 'share'],
  emergency: ['staroflife.fill', 'emergency'],
  doctor: ['stethoscope', 'stethoscope'],
  trades: ['wrench.and.screwdriver', 'handyman'],
  accountant: ['percent', 'calculate'],
  legal: ['building.columns', 'gavel'],
  speaker: ['speaker.wave.2', 'volume_up'],
  verified: ['checkmark.seal.fill', 'verified'],
} as const satisfies Record<string, readonly [string, string]>;

export type IconName = keyof typeof glyphs;

export const iconGlyph = (name: IconName) => {
  const [ios, md] = glyphs[name];
  return { ios: ios as SFSymbol, md };
};

type Props = {
  name: IconName;
  size?: number | keyof typeof iconSize;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 'md', color, style }: Props) {
  const [ios, md] = glyphs[name];
  const px = typeof size === 'number' ? size : iconSize[size];
  return (
    <SymbolView
      name={{ ios: ios as SFSymbol, android: md as never, web: md as never }}
      size={px}
      tintColor={color}
      style={[{ width: px, height: px }, style]}
      accessible={false}
    />
  );
}
