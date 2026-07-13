import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { fetchAllRows } from './fetchAll';
import { useUndoToast } from '../components/Toast';

// Shared live-CRUD hook. Every custom room uses this so that add / edit / delete
// all save permanently to Supabase and every change is undoable via the toast.
//
// Nothing is hardcoded — rows come straight from the given table and writes go
// straight back to it.

const strip = (row) => {
  const { id, created_at, updated_at, ...rest } = row;
  return rest;
};

export function useCrud(table, { order = 'created_at', ascending = false, label = 'record' } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const undo = useUndoToast();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { rows, error } = await fetchAllRows(table, { order, ascending });
    if (error) setError(error.message);
    setRows(rows);
    setLoading(false);
  }, [table, order, ascending]);

  useEffect(() => { reload(); }, [reload]);

  const place = useCallback((xs, row) => (ascending ? [...xs, row] : [row, ...xs]), [ascending]);

  const add = useCallback(async (payload = {}) => {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) { setError(error.message); return null; }
    setRows((xs) => place(xs, data));
    undo.show(`Added ${label}.`, async () => {
      await supabase.from(table).delete().eq('id', data.id);
      setRows((xs) => xs.filter((r) => r.id !== data.id));
    });
    return data;
  }, [table, label, place, undo]);

  const update = useCallback(async (row, patch) => {
    const before = row;
    setRows((xs) => xs.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from(table).update(patch).eq('id', row.id);
    if (error) {
      setError(error.message);
      setRows((xs) => xs.map((r) => (r.id === row.id ? before : r)));
      return;
    }
    undo.show(`Updated ${label}.`, async () => {
      await supabase.from(table).update(strip(before)).eq('id', row.id);
      setRows((xs) => xs.map((r) => (r.id === row.id ? before : r)));
    });
  }, [table, label, undo]);

  // Silent update — no undo toast. Used when a caller wraps its own richer undo
  // (e.g. Sales Pipeline award automation).
  const updateSilent = useCallback(async (row, patch) => {
    const before = row;
    setRows((xs) => xs.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from(table).update(patch).eq('id', row.id);
    if (error) {
      setError(error.message);
      setRows((xs) => xs.map((r) => (r.id === row.id ? before : r)));
    }
    return { error };
  }, [table]);

  const remove = useCallback(async (row) => {
    setRows((xs) => xs.filter((r) => r.id !== row.id));
    const { error } = await supabase.from(table).delete().eq('id', row.id);
    if (error) { setError(error.message); reload(); return; }
    undo.show(`Deleted ${label}.`, async () => {
      const { data } = await supabase.from(table).insert({ id: row.id, ...strip(row) }).select().single();
      if (data) setRows((xs) => place(xs, data));
    });
  }, [table, label, place, undo, reload]);

  return { rows, setRows, loading, error, setError, reload, add, update, updateSilent, remove, undo };
}
