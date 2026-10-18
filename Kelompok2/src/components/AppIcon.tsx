import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'briefcase'
  | 'plus'
  | 'chart'
  | 'user'
  | 'bell'
  | 'search'
  | 'filter'
  | 'chevron'
  | 'back'
  | 'calendar'
  | 'users'
  | 'clock'
  | 'warning'
  | 'check'
  | 'edit'
  | 'sparkle'
  | 'file'
  | 'close'
  | 'lock'
  | 'mail'
  | 'copy';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = '#202a27',
  strokeWidth = 1.8,
}) => {
  const renderPaths = () => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path
              d="M3 10.5 12 3l9 7.5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M5 9.5V21h14V9.5M9 21v-7h6v7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'briefcase':
        return (
          <>
            <Rect
              x="3"
              y="7"
              width="18"
              height="13"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'plus':
        return (
          <Path
            d="M12 5v14M5 12h14"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'chart':
        return (
          <Path
            d="M4 20V10M10 20V4M16 20v-7M22 20H2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'user':
        return (
          <>
            <Circle
              cx="12"
              cy="8"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M4 21a8 8 0 0 1 16 0"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'bell':
        return (
          <>
            <Path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M10 21h4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'search':
        return (
          <>
            <Circle
              cx="11"
              cy="11"
              r="7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="m20 20-4-4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'filter':
        return (
          <Path
            d="M4 6h16M7 12h10M10 18h4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'chevron':
        return (
          <Path
            d="m9 18 6-6-6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'back':
        return (
          <Path
            d="m15 18-6-6 6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'calendar':
        return (
          <>
            <Rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M16 3v4M8 3v4M3 10h18"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'users':
        return (
          <>
            <Path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle
              cx="9"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'clock':
        return (
          <>
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M12 7v5l3 2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'warning':
        return (
          <>
            <Path
              d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M12 9v4M12 17h.01"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'check':
        return (
          <Path
            d="m5 12 4 4L19 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'edit':
        return (
          <>
            <Path
              d="m14 4 6 6L8 22H2v-6Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="m12 6 6 6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'sparkle':
        return (
          <>
            <Path
              d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'file':
        return (
          <>
            <Path
              d="M6 2h9l5 5v15H6Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M14 2v6h6M9 13h8M9 17h8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case 'close':
        return (
          <Path
            d="M18 6 6 18M6 6l12 12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {renderPaths()}
    </Svg>
  );
};
