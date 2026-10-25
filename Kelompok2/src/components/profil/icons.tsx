import React from 'react';
import { View, Text } from 'react-native';
import { NotarisColors } from './theme';

interface IconProps {
  size?: number;
  color?: string;
}

// Logo "N" in dark green rounded square with gold serif
export function IconLogo({ size = 32 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: NotarisColors.primary,
        borderRadius: size * 0.22,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: NotarisColors.accent,
          fontSize: size * 0.58,
          fontWeight: '700',
          fontFamily: 'serif',
          lineHeight: size * 0.72,
        }}>
        N
      </Text>
    </View>
  );
}

// Briefcase / Layanan icon
export function IconBriefcase({ size = 20, color = NotarisColors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Handle */}
      <View
        style={{
          width: size * 0.42,
          height: size * 0.22,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
      {/* Bag Body */}
      <View
        style={{
          width: size * 0.85,
          height: size * 0.55,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Horizontal center stripe */}
        <View style={{ width: '100%', height: 1, backgroundColor: color, opacity: 0.6 }} />
      </View>
    </View>
  );
}

// User / Profile icon
export function IconUser({ size = 20, color = NotarisColors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Head */}
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
          borderWidth: 1.6,
          borderColor: color,
          marginBottom: 1.5,
        }}
      />
      {/* Shoulder */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.32,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
          borderWidth: 1.6,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
    </View>
  );
}

// Multiple Users / Staff icon
export function IconUsers({ size = 20, color = NotarisColors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <IconUser size={size * 0.85} color={color} />
      <View style={{ marginLeft: -size * 0.25, opacity: 0.75 }}>
        <IconUser size={size * 0.7} color={color} />
      </View>
    </View>
  );
}

// Bell notification icon
export function IconBell({ size = 20, color = NotarisColors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.6,
          borderWidth: 1.6,
          borderColor: color,
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.35,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
      <View style={{ width: size * 0.85, height: 1.6, backgroundColor: color }} />
      <View
        style={{
          width: size * 0.25,
          height: size * 0.15,
          backgroundColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          marginTop: 1,
        }}
      />
    </View>
  );
}

// Chevron Right (>)
export function IconChevronRight({ size = 18, color = '#9CA3AF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// Back Arrow (<)
export function IconBack({ size = 20, color = NotarisColors.text }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderBottomWidth: 2.2,
          borderLeftWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// Logout / Exit icon
export function IconLogout({ size = 20, color = NotarisColors.danger }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
      {/* Door frame */}
      <View
        style={{
          width: size * 0.45,
          height: size * 0.75,
          borderWidth: 1.8,
          borderRightWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}
      />
      {/* Exit Arrow */}
      <View style={{ width: size * 0.45, height: 1.8, backgroundColor: color, marginLeft: -2 }} />
      <View
        style={{
          width: size * 0.25,
          height: size * 0.25,
          borderTopWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: -size * 0.22,
        }}
      />
    </View>
  );
}

// Checkmark icon
export function IconCheck({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.32,
          height: size * 0.6,
          borderBottomWidth: 2.2,
          borderRightWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateY: -1 }],
        }}
      />
    </View>
  );
}

// Plus (+) icon
export function IconPlus({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.7, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', height: size * 0.7, width: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

// Search icon
export function IconSearch({ size = 18, color = '#9CA3AF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size * 0.3,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: size * 0.3,
          height: 1.8,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// Dots (...) horizontal icon
export function IconDots({ size = 20, color = '#6B7280' }: IconProps) {
  const dotSize = size * 0.16;
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <View style={{ width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }} />
      <View style={{ width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }} />
      <View style={{ width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }} />
    </View>
  );
}

// Close (X) icon
export function IconClose({ size = 16, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.7, height: 1.8, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: size * 0.7, height: 1.8, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

// Lock icon
export function IconLock({ size = 18, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.35,
          borderWidth: 1.6,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
        }}
      />
      <View
        style={{
          width: size * 0.75,
          height: size * 0.5,
          backgroundColor: color,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: 2, height: 4, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
      </View>
    </View>
  );
}

// Mail icon
export function IconMail({ size = 18, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.6,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
        <View
          style={{
            width: size * 0.48,
            height: size * 0.48,
            borderBottomWidth: 1.4,
            borderRightWidth: 1.4,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateY: -size * 0.2 }],
          }}
        />
      </View>
    </View>
  );
}

// Eye icon for password
export function IconEye({ size = 20, color = '#6B7280', crossed = false }: IconProps & { crossed?: boolean }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.5,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: size * 0.4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.15, backgroundColor: color }} />
      </View>
      {crossed && (
        <View
          style={{
            position: 'absolute',
            width: size * 0.9,
            height: 1.8,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      )}
    </View>
  );
}

// Home icon for tab bar
export function IconHome({ size = 20, color = '#9CA3AF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderLeftWidth: 1.8,
          borderTopWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginTop: 2,
        }}
      />
      <View
        style={{
          width: size * 0.6,
          height: size * 0.4,
          borderWidth: 1.8,
          borderTopWidth: 0,
          borderColor: color,
          marginTop: -size * 0.15,
        }}
      />
    </View>
  );
}

// Chart / Laporan icon
export function IconChart({ size = 20, color = '#9CA3AF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 2.5 }}>
      <View style={{ width: 3, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: size * 0.65, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: size * 0.45, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

