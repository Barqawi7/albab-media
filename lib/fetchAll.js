import { supabase } from './supabase';

// PostgREST caps page size (default 1000 rows). To get accurate full-table
// scans we paginate with .range() and concatenate.
//
// Returns { rows, count, error }. `count` is the *real* server-side total
// from a separate count: exact head: true query — independent of pagination.
//
// For tables with millions of rows, do NOT use this. Hit countOnly or build
// a paginated UI instead.

const PAGE = 1000;
const HARD_CAP = 50_000;  // never fetch more than this in one go

export async function fetchAllRows(table, { select = '*', order = 'created_at', ascending = false, cap = HARD_CAP } = {}) {
  // Pull count first so the caller can show the real total even if the rows
  // truncate.
  const { count, error: countErr } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });
  if (countErr) return { rows: [], count: 0, error: countErr };

  const limit = Math.min(count ?? 0, cap);
  let rows = [];
  let start = 0;
  while (start < limit) {
    const end = Math.min(start + PAGE - 1, limit - 1);
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(order, { ascending })
      .range(start, end);
    if (error) return { rows, count: count ?? rows.length, error };
    rows = rows.concat(data || []);
    if (!data || data.length === 0) break;
    start += data.length;
    if (data.length < PAGE) break;
  }
  return { rows, count: count ?? rows.length, error: null };
}

export async function countRows(table, modifier) {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (modifier) q = modifier(q);
  const { count, error } = await q;
  return { count: count ?? 0, error };
}

// One-page fetch for paginated views (Real Estate).
export async function fetchPage(table, { page, pageSize, order = 'created_at', ascending = false, select = '*' }) {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  const { data, error, count } = await supabase
    .from(table)
    .select(select, { count: 'exact' })
    .order(order, { ascending })
    .range(start, end);
  return { rows: data || [], count: count ?? 0, error };
}
