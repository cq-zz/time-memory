import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, languageMeta } from '../../store/settings';
import { useProfileStore } from '../../store/profile';
import { hasPassword, clearPassword } from '../../utils/password';
import { logPasswordAction } from '../../utils/passwordHistory';
import { showToast } from '../common/Toast';
import ProfileEditModal from '../common/ProfileEditModal';
import SecurityModal from '../common/SecurityModal';
import ConfirmModal from '../common/ConfirmModal';
import LanguageModal from './LanguageModal';

function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.toggleTrack, { backgroundColor: value ? '#4AA868' : '#E2E2E2' }]}
    >
      <View style={[styles.toggleKnob, { transform: [{ translateX: value ? 24 : 0 }] }]} />
    </TouchableOpacity>
  );
}

function SettingRow({ icon, label, value, isToggle, toggleValue, onToggle, onPress }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress} disabled={!onPress && !isToggle}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: Colors.iconBg }]}>
          <Ionicons name={icon} size={18} color={Colors.textPrimary} />
        </View>
        <Text style={[styles.rowLabel, { color: Colors.textDark, fontFamily: Fonts.regular }]}>{label}</Text>
      </View>

      {isToggle ? (
        <Toggle value={toggleValue} onToggle={onToggle} />
      ) : (
        <View style={styles.rowRight}>
          {value ? (
            <Text style={[styles.rowValue, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {value}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingGroups() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const language = useSettingsStore((s) => s.settings.language);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const nickname = useProfileStore((s) => s.nickname);

  const [pwdSet, setPwdSet] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const refreshPwd = useCallback(() => {
    hasPassword().then(setPwdSet);
  }, []);

  useEffect(() => {
    refreshPwd();
  }, [refreshPwd]);

  const handleReset = async () => {
    try {
      await clearPassword();
      await logPasswordAction('reset');
      setPwdSet(false);
      setResetOpen(false);
      showToast(t('settings.resetPasswordSuccess'));
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  return (
    <View style={styles.container}>
      {/* ACCOUNT */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('settings.groupAccount')}
        </Text>
        <View style={styles.rows}>
          <SettingRow
            icon="person-outline"
            label={t('settings.profileSettings')}
            value={nickname || t('common.newUser')}
            onPress={() => setProfileOpen(true)}
          />
          <SettingRow
            icon="lock-closed-outline"
            label={t('settings.security')}
            value={pwdSet ? t('settings.changePassword') : t('settings.setPassword')}
            onPress={() => setSecurityOpen(true)}
          />
          {pwdSet ? (
            <SettingRow
              icon="key-outline"
              label={t('settings.resetPassword')}
              onPress={() => setResetOpen(true)}
            />
          ) : null}
        </View>
      </View>

      {/* SYSTEM */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('settings.groupSystem')}
        </Text>
        <View style={styles.rows}>
          <SettingRow
            icon={darkMode ? 'moon-outline' : 'sunny-outline'}
            label={darkMode ? t('settings.darkModeLabel') : t('settings.lightModeLabel')}
            isToggle
            toggleValue={darkMode}
            onToggle={() => updateSetting('darkMode', !darkMode)}
          />
          <SettingRow
            icon="language-outline"
            label={t('settings.language')}
            value={languageMeta(language).label}
            onPress={() => setLanguageOpen(true)}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label={t('settings.securityLog')}
            onPress={() => router.push('/settings/password-history')}
          />
        </View>
      </View>

      {/* SUPPORT */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('settings.groupSupport')}
        </Text>
        <View style={styles.rows}>
          <SettingRow icon="shield-checkmark-outline" label={t('profile.privacyPolicy')} onPress={() => router.push('/settings/privacy')} />
          <SettingRow icon="information-circle-outline" label={t('profile.about')} value="v2.4.0" />
        </View>
      </View>

      <ProfileEditModal visible={profileOpen} onClose={() => setProfileOpen(false)} />
      <SecurityModal visible={securityOpen} onClose={() => setSecurityOpen(false)} onChanged={refreshPwd} />
      <LanguageModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
      <ConfirmModal
        visible={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title={t('settings.resetPasswordConfirmTitle')}
        description={t('settings.resetPasswordConfirmDesc')}
        confirmText={t('settings.resetPassword')}
        icon="key-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    padding: 24,
    gap: 16,
    borderWidth: 1,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  rows: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
