import { useEffect, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { Toast, useUndoToast, LoadingSpinner } from '../Toast';
import { KPIBox, fmtCompact } from './_RoomShell';

export default function CashFlow() {
  const [cashAccounts, setCashAccounts] = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [pendingRevenue, setPendingRevenue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const undo = useUndoToast();

  async function reload() {
    setLoading(true); setError(null);
    const [ca, ex, inv] = await Promise.all([
      supabase.from('cash_accounts').select('*').order('created_at', { ascending: true }),
      supabase.from('expenses').select('*').order('created_at', { ascending: true }),
      supabase.from('invoices').select('due_payment'),
    ]);
    if (ca.error || ex.error || inv.error) {
      setError(ca.error?.message || ex.error?.message || inv.error?.message);
    }
    setCashAccounts(ca.data || []);
    setExpenses(ex.data || []);
    setPendingRevenue((inv.data || []).reduce((a, r) => a + (Number(r.due_payment) || 0), 0));
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  const totalCash     = cashAccounts.reduce((a, r) => a + (Number(r.balance) || 0), 0);
  const totalExpenses = expenses.reduce((a, r) => a + (Number(r.amount)  || 0), 0);
  const netNow        = totalCash - totalExpenses;
  const expectedTotal = totalCash + pendingRevenue;
  const expectedNet   = expectedTotal - totalExpenses;

  function strip(row) {
    const { id, created_at, updated_at, ...rest } = row;
    return rest;
  }

  // ---- cash accounts ----
  async function addCashAccount() {
    const payload = { account: 'New account', balance: 0 };
    const { data, error } = await supabase.from('cash_accounts').insert(payload).select().single();
    if (error) { setError(error.message); return; }
    setCashAccounts((xs) => [...xs, data]);
    undo.show('Added cash account.', async () => {
      await supabase.from('cash_accounts').delete().eq('id', data.id);
      setCashAccounts((xs) => xs.filter((r) => r.id !== data.id));
    });
  }
  async function updateCashAccount(row, patch) {
    const before = row;
    const next = { ...row, ...patch };
    setCashAccounts((xs) => xs.map((r) => r.id === row.id ? next : r));
    const { error } = await supabase.from('cash_accounts').update(patch).eq('id', row.id);
    if (error) {
      setError(error.message);
      setCashAccounts((xs) => xs.map((r) => r.id === row.id ? before : r));
      return;
    }
    undo.show('Updated cash account.', async () => {
      await supabase.from('cash_accounts').update(strip(before)).eq('id', row.id);
      setCashAccounts((xs) => xs.map((r) => r.id === row.id ? before : r));
    });
  }
  async function deleteCashAccount(row) {
    setCashAccounts((xs) => xs.filter((r) => r.id !== row.id));
    const { error } = await supabase.from('cash_accounts').delete().eq('id', row.id);
    if (error) { setError(error.message); reload(); return; }
    undo.show('Deleted cash account.', async () => {
      const { data, error } = await supabase.from('cash_accounts').insert({ id: row.id, ...strip(row) }).select().single();
      if (!error && data) setCashAccounts((xs) => [...xs, data]);
    });
  }

  // ---- expenses ----
  async function addExpense() {
    const payload = { item: 'New expense', amount: 0 };
    const { data, error } = await supabase.from('expenses').insert(payload).select().single();
    if (error) { setError(error.message); return; }
    setExpenses((xs) => [...xs, data]);
    undo.show('Added expense.', async () => {
      await supabase.from('expenses').delete().eq('id', data.id);
      setExpenses((xs) => xs.filter((r) => r.id !== data.id));
    });
  }
  async function updateExpense(row, patch) {
    const before = row;
    const next = { ...row, ...patch };
    setExpenses((xs) => xs.map((r) => r.id === row.id ? next : r));
    const { error } = await supabase.from('expenses').update(patch).eq('id', row.id);
    if (error) {
      setError(error.message);
      setExpenses((xs) => xs.map((r) => r.id === row.id ? before : r));
      return;
    }
    undo.show('Updated expense.', async () => {
      await supabase.from('expenses').update(strip(before)).eq('id', row.id);
      setExpenses((xs) => xs.map((r) => r.id === row.id ? before : r));
    });
  }
  async function deleteExpense(row) {
    setExpenses((xs) => xs.filter((r) => r.id !== row.id));
    const { error } = await supabase.from('expenses').delete().eq('id', row.id);
    if (error) { setError(error.message); reload(); return; }
    undo.show('Deleted expense.', async () => {
      const { data, error } = await supabase.from('expenses').insert({ id: row.id, ...strip(row) }).select().single();
      if (!error && data) setExpenses((xs) => [...xs, data]);
    });
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
          Finance
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Cash Flow</h1>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 22 }}>
        <KPIBox label="Total Cash"      value={totalCash}      loading={loading} suffix="AED" />
        <KPIBox label="Total Expenses"  value={totalExpenses}  loading={loading} color={theme.amber} suffix="AED" />
        <KPIBox label="Pending Revenue" value={pendingRevenue} loading={loading} color={theme.blue}  suffix="AED" />
        <KPIBox label="Net Now"         value={netNow}         loading={loading} color={netNow >= 0 ? theme.green : theme.red} suffix="AED" />
        <KPIBox label="Expected Total"  value={expectedTotal}  loading={loading} suffix="AED" />
        <KPIBox label="Expected Net"    value={expectedNet}    loading={loading} color={expectedNet >= 0 ? theme.green : theme.red} suffix="AED" />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: theme.textMuted }}>
        Pending Revenue is read-only — auto-summed from <em>invoices.due_payment</em>.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginTop: 24 }}>
        {/* Cash accounts */}
        <Section title="Cash accounts" loading={loading}
                 onAdd={addCashAccount}
                 footerLabel={`Subtotal: ${fmtCompact(totalCash)} AED`}>
          <RowHeader cols={[{ label: 'Account', flex: 2 }, { label: 'Balance', flex: 1, align: 'right' }, { label: '', flex: 0.4 }]} />
          {!loading && cashAccounts.length === 0 && (
            <Empty>No cash accounts yet.</Empty>
          )}
          {cashAccounts.map((r) => (
            <ItemRow key={r.id}>
              <InlineText
                value={r.account || ''}
                onCommit={(v) => updateCashAccount(r, { account: v })}
                placeholder="Account name"
                flex={2}
              />
              <InlineNumber
                value={r.balance}
                onCommit={(v) => updateCashAccount(r, { balance: v })}
                flex={1} align="right"
              />
              <DeleteButton onClick={() => deleteCashAccount(r)} />
            </ItemRow>
          ))}
        </Section>

        {/* Expenses */}
        <Section title="Expenses" loading={loading}
                 onAdd={addExpense}
                 footerLabel={`Total: ${fmtCompact(totalExpenses)} AED`}>
          <RowHeader cols={[{ label: 'Item', flex: 2 }, { label: 'Amount', flex: 1, align: 'right' }, { label: '', flex: 0.4 }]} />
          {!loading && expenses.length === 0 && (
            <Empty>No expenses yet.</Empty>
          )}
          {expenses.map((r) => (
            <ItemRow key={r.id}>
              <InlineText
                value={r.item || ''}
                onCommit={(v) => updateExpense(r, { item: v })}
                placeholder="Expense item"
                flex={2}
              />
              <InlineNumber
                value={r.amount}
                onCommit={(v) => updateExpense(r, { amount: v })}
                flex={1} align="right"
              />
              <DeleteButton onClick={() => deleteExpense(r)} />
            </ItemRow>
          ))}
        </Section>
      </div>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function Section({ title, loading, onAdd, footerLabel, children }) {
  return (
    <div style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{title}</div>
          {loading && <LoadingSpinner size={12} />}
        </div>
        <button onClick={onAdd} style={primaryBtn}>+ Add</button>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      {footerLabel && (
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}`, fontSize: 12, color: theme.textDim, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {footerLabel}
        </div>
      )}
    </div>
  );
}

function RowHeader({ cols }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '8px 16px', background: theme.bg3,
      borderBottom: `1px solid ${theme.border}`,
      fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase',
    }}>
      {cols.map((c, i) => (
        <div key={i} style={{ flex: c.flex || 1, textAlign: c.align || 'left' }}>{c.label}</div>
      ))}
    </div>
  );
}

function ItemRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 16px', borderBottom: `1px solid ${theme.border}` }}>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div style={{ padding: '24px 16px', color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
      {children}
    </div>
  );
}

function InlineText({ value, onCommit, placeholder, flex = 1 }) {
  const [v, setV] = useState(value ?? '');
  useEffect(() => { setV(value ?? ''); }, [value]);
  function commit() {
    const next = v;
    if ((next ?? '') === (value ?? '')) return;
    onCommit(next || null);
  }
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      placeholder={placeholder}
      style={{ ...inlineInput, flex, textAlign: 'left' }}
    />
  );
}

function InlineNumber({ value, onCommit, flex = 1, align = 'right' }) {
  const [v, setV] = useState(value == null ? '' : String(value));
  useEffect(() => { setV(value == null ? '' : String(value)); }, [value]);
  function commit() {
    const num = v === '' ? null : Number(v);
    if (!Number.isFinite(num) && num !== null) return;
    if (num === Number(value)) return;
    onCommit(num);
  }
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      style={{ ...inlineInput, flex, textAlign: align, fontVariantNumeric: 'tabular-nums' }}
    />
  );
}

function DeleteButton({ onClick }) {
  return (
    <button onClick={onClick} title="Delete" style={{
      flex: 0.4, background: 'transparent', color: theme.textMuted,
      border: `1px solid ${theme.border}`, borderRadius: 6,
      padding: '6px 8px', fontSize: 12, cursor: 'pointer',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = theme.red; e.currentTarget.style.borderColor = theme.red + '88'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border; }}
    >Delete</button>
  );
}

const inlineInput = {
  background: theme.bg3,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  padding: '6px 8px',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  minWidth: 0,
};

const primaryBtn = {
  background: theme.gold, color: '#0A0E14',
  border: 'none', borderRadius: 6, padding: '6px 12px',
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
};

const errorBox = {
  padding: 12, background: 'rgba(239,68,68,0.08)',
  border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red,
  margin: '12px 0', fontSize: 13,
};
