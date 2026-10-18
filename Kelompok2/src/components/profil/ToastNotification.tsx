import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { IconCheck } from './icons';
import { NotarisColors } from './theme';

interface ToastNotificationProps {
  message: string | null;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function ToastNotification({
  message,
  visible,
  onHide,
  duration = 2600,
}: ToastNotificationProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (visible && message) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 15,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  if (!visible || !message) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={styles.toastCard}>
        <View style={styles.checkWrapper}>
          <IconCheck size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NotarisColors.toastBg,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  checkWrapper: {
    marginRight: 8,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

