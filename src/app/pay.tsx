import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QrCode } from '@/components/qr-code';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { bankName, buildSpayd, parseAccount, parseAmount, validatePayment } from '@/lib/payments/spayd';
import { useCase } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const QR_SIZE = 232;

const formatKc = (n: number) =>
  `${n.toLocaleString('cs-CZ', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} Kč`;

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/**
 * QR Platba: turns a bill into the QR code every Czech banking app scans.
 * Modal (self-contained task) with Close. Prefilled when opened from a scanned bill.
 */
export default function PayScreen() {
  const { colors } = useTheme();
  const { caseId } = useLocalSearchParams<{ caseId?: string }>();
  const item = useCase(caseId);
  const fromBill = item?.result?.analysis.payment;
  // Built-in examples carry made-up accounts: never render a scannable code for them.
  const [isExample, setIsExample] = useState(!!fromBill && !!item?.sampleId);
  // Due date and recipient come only from the bill the screen was opened with.
  const [usingBill, setUsingBill] = useState(!!fromBill);

  const [account, setAccount] = useState(fromBill?.account ?? '');
  const [amount, setAmount] = useState(fromBill?.amount ? String(fromBill.amount) : '');
  const [vs, setVs] = useState(fromBill?.variableSymbol ?? '');
  const [message, setMessage] = useState(fromBill?.message ?? '');
  const [formKey, setFormKey] = useState(0);
  const dueDate = usingBill ? fromBill?.dueDate : undefined;
  const recipientName = usingBill ? fromBill?.recipientName : undefined;

  const parsedAccount = useMemo(() => parseAccount(account), [account]);
  const parsedAmount = amount.trim() ? parseAmount(amount) : undefined;
  const fieldErrors = validatePayment({ amount: parsedAmount ?? undefined, variableSymbol: vs || undefined });
  const amountError = parsedAmount === null ? 'Enter an amount like 1840 or 1840,50.' : fieldErrors.amount;
  const vsError = fieldErrors.variableSymbol;

  const spayd = useMemo(() => {
    if (!parsedAccount.ok || amountError || vsError) return null;
    try {
      return buildSpayd({
        iban: parsedAccount.iban,
        amount: parsedAmount ?? undefined,
        variableSymbol: vs || undefined,
        dueDate,
        recipientName,
        message: message || undefined,
      });
    } catch {
      return null;
    }
  }, [parsedAccount, parsedAmount, amountError, vs, vsError, dueDate, recipientName, message]);

  const startRealBill = () => {
    setIsExample(false);
    setUsingBill(false);
    setAccount('');
    setAmount('');
    setVs('');
    setMessage('');
    setFormKey((k) => k + 1); // remount fields so "touched" errors reset
  };

  const bank = parsedAccount.ok && parsedAccount.bankCode ? bankName(parsedAccount.bankCode) : undefined;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerLeft: () => <HeaderTextButton label="Close" /> }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* The code itself: the signature element of this screen. */}
        <View style={[styles.qrPanel, { backgroundColor: colors.surface }]}>
          {isExample ? (
            <View style={[styles.qrPlaceholder, { borderColor: colors.separator }]}>
              <Icon name="qrcode" size={40} color={colors.label3} />
              <Text variant="subhead" color="label2" align="center">
                Example bill, so the QR code is hidden: nobody should pay a made-up account.
              </Text>
              <Button label="Pay a real bill" variant="secondary" size="medium" onPress={startRealBill} />
            </View>
          ) : spayd ? (
            <>
              <QrCode value={spayd} size={QR_SIZE} accessibilityLabel="Payment QR code" />
              <Text variant="footnote" color="label2" align="center">
                Open your banking app, choose to pay by QR code, and point it here.
              </Text>
            </>
          ) : (
            <View style={[styles.qrPlaceholder, { borderColor: colors.separator }]}>
              <Icon name="qrcode" size={40} color={colors.label3} />
              <Text variant="subhead" color="label2" align="center">
                Fill in the account number from the bill and the QR code appears here.
              </Text>
            </View>
          )}
        </View>

        {isExample && fromBill ? (
          <ExampleSummary
            account={fromBill.account}
            amount={fromBill.amount}
            vs={fromBill.variableSymbol}
            dueDate={fromBill.dueDate}
          />
        ) : (
          <View key={formKey} style={styles.form}>
            <SectionHeader title={usingBill ? 'From your bill: check before paying' : 'Payment details'} />
            <Field
              label="Account number"
              value={account}
              onChangeText={setAccount}
              placeholder="19-2000145399/0800 or an IBAN"
              autoCapitalize="characters"
              autoCorrect={false}
              error={parsedAccount.ok ? undefined : parsedAccount.error}
              helper={parsedAccount.ok ? [parsedAccount.display, bank].filter(Boolean).join(' · ') : 'Printed on the bill as “číslo účtu” or “účet”.'}
            />
            <Field
              label="Amount (Kč)"
              value={amount}
              onChangeText={setAmount}
              placeholder="1840"
              keyboardType="decimal-pad"
              error={amountError}
              helper="Leave empty to type the amount in your bank instead."
            />
            <Field
              label="Variable symbol"
              value={vs}
              onChangeText={(v) => setVs(v.replace(/\D/g, ''))}
              placeholder="5512048873"
              keyboardType="number-pad"
              maxLength={10}
              error={vsError}
              helper="“Variabilní symbol”: how they match your payment. Copy it exactly."
            />
            <Field
              label="Message for the recipient (optional)"
              value={message}
              onChangeText={setMessage}
              maxLength={60}
              autoCorrect={false}
            />
            {dueDate ? (
              <Text variant="footnote" color="label2" style={styles.due}>
                Due {formatDate(dueDate)}
              </Text>
            ) : null}
          </View>
        )}

        {spayd && !isExample && parsedAccount.ok ? (
          <View>
            <SectionHeader title="Or type it in your bank" />
            <List inset={false}>
              <CopyRow label="Account" value={parsedAccount.display} />
              {parsedAmount ? <CopyRow label="Amount" value={formatKc(parsedAmount)} copyValue={String(parsedAmount)} /> : null}
              {vs ? <CopyRow label="Variable symbol" value={vs} /> : null}
            </List>
          </View>
        ) : null}

        <View style={styles.note}>
          <Icon name="lock" size={14} color={colors.label3} />
          <Text variant="footnote" color="label3" style={styles.noteText}>
            CzechPal never sends money. The QR code only fills in the payment form in your own banking app.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ExampleSummary({ account, amount, vs, dueDate }: { account: string; amount?: number; vs?: string; dueDate?: string }) {
  return (
    <View>
      <View style={styles.exampleHeader}>
        <SectionHeader title="On the example bill" />
        <Badge label="Example" tone="accent" />
      </View>
      <List inset={false}>
        <InfoRow label="Account" value={account} />
        {amount ? <InfoRow label="Amount" value={formatKc(amount)} /> : null}
        {vs ? <InfoRow label="Variable symbol" value={vs} /> : null}
        {dueDate ? <InfoRow label="Due" value={formatDate(dueDate)} /> : null}
      </List>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="subhead" color="label2">
        {label}
      </Text>
      <Text variant="callout" weight="600" tabular selectable>
        {value}
      </Text>
    </View>
  );
}

function CopyRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    setCopied(true);
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Clipboard.setStringAsync(copyValue ?? value);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Pressable
      onPress={copy}
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label}`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.rowText}>
        <Text variant="subhead" color="label2">
          {label}
        </Text>
        <Text variant="callout" weight="600" tabular>
          {value}
        </Text>
      </View>
      <Text variant="subhead" weight="600" color={copied ? 'success' : 'accent'} chrome>
        {copied ? 'Copied' : 'Copy'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  qrPanel: {
    alignItems: 'center',
    gap: space.lg,
    padding: space.xl,
    borderRadius: radius.card,
    borderCurve: 'continuous',
  },
  qrPlaceholder: {
    width: '100%',
    minHeight: QR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.xl,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  form: { gap: space.lg },
  due: { paddingHorizontal: space.xs },
  exampleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
  rowText: { flex: 1, gap: 1 },
  note: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', paddingHorizontal: space.xs },
  noteText: { flex: 1 },
});
