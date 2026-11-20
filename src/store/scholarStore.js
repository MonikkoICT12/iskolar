import { create } from "zustand";
import { BARANGAYS } from "../config/barangays";
import SEMESTER_OPTIONS from "../config/semesters";
import { supabase, handleSupabaseError } from "../lib/supabase";
import { toast as sonnerToast } from "@/components/ui/sonner";
import {
  DEFAULT_DB_SCHEMA,
  detectDbSchema,
  normalizeScholarRow,
  toDbPayload,
} from "../utils/scholarMapper";

const SEMESTERS = SEMESTER_OPTIONS.map((opt) => opt.value);
const PAGE_SIZE = 1000;

const chunkArray = (arr, size = 100) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const ensureActiveSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;
  if (error || !session?.access_token || !session?.user?.id) {
    return { ok: false, error: "Your administrator session has expired. Please sign in again." };
  }
  return { ok: true, session };
};

const isRlsPermissionError = (error) => {
  if (!error) return false;
  return (
    error.code === "42501" ||
    /permission denied|row-level security|rls|policy/i.test(error.message || "")
  );
};

const buildScholarDefaults = (scholar, currentSchoolYear) => {
  const effectiveSY =
    scholar.schoolYear ||
    (currentSchoolYear === "ALL" ? "2026-2027" : currentSchoolYear);
  const paymentStatus = scholar.status || scholar.paymentStatus || "Processing";
  const scholarStatus = scholar.scholarStatus || "Active";
  const numericAmount =
    parseFloat(scholar.scholarship_amount ?? scholar.amount ?? 0) || 0;

  return {
    ...scholar,
    schoolYear: effectiveSY,
    status: paymentStatus,
    paymentStatus,
    scholarStatus,
    yearGraduated:
      scholarStatus === "Graduated"
        ? scholar.yearGraduated || new Date().getFullYear()
        : null,
    scholarship_amount: numericAmount,
    amount: numericAmount,
    is_pwd: Boolean(scholar.is_pwd),
    is_solo_parent: Boolean(scholar.is_solo_parent),
    grades: scholar.grades || [],
  };
};

const syncUpdateState = (scholar, updates) => {
  const nextPaymentStatus =
    updates.status !== undefined || updates.paymentStatus !== undefined
      ? (updates.status ?? updates.paymentStatus)
      : undefined;
  const nextAmount =
    updates.scholarship_amount !== undefined || updates.amount !== undefined
      ? parseFloat(updates.scholarship_amount ?? updates.amount) || 0
      : undefined;

  return {
    ...scholar,
    ...updates,
    ...(nextPaymentStatus !== undefined
      ? { status: nextPaymentStatus, paymentStatus: nextPaymentStatus }
      : {}),
    ...(nextAmount !== undefined
      ? { scholarship_amount: nextAmount, amount: nextAmount }
      : {}),
    updatedAt: new Date().toISOString(),
  };
};

const useScholarStore = create((set, get) => ({
  scholars: [],
  loading: false,
  initialized: false,
  error: null,
  rlsBlocked: false,
  dbSchema: DEFAULT_DB_SCHEMA,
  currentSchoolYear: "ALL",
  toast: null,

  resetStore: () =>
    set({
      scholars: [],
      loading: false,
      initialized: false,
      error: null,
      rlsBlocked: false,
      dbSchema: DEFAULT_DB_SCHEMA,
    }),

  // Fetch all scholars from Supabase (with 1,000-row pagination & RLS detection)
  fetchScholars: async () => {
    set({ loading: true, error: null, rlsBlocked: false });

    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().resetStore();
      set({ error: authCheck.error });
      return false;
    }

    try {
      const rawRows = [];
      let from = 0;
      let useOrder = true;

      while (true) {
        let query = supabase.from("scholars").select("*");
        if (useOrder) {
          query = query.order("created_at", { ascending: false });
        }
        const { data, error } = await query.range(from, from + PAGE_SIZE - 1);

        if (error) {
          // Fallback if created_at column does not exist on live table
          if (
            useOrder &&
            from === 0 &&
            (error.code === "42703" || error.message?.includes("created_at"))
          ) {
            useOrder = false;
            continue;
          }

          if (isRlsPermissionError(error)) {
            const msg =
              "Permission denied reading scholars from Supabase (Row Level Security). Run supabase-admin-rls.sql in the Supabase SQL Editor, then click Retry.";
            set({
              loading: false,
              initialized: true,
              error: msg,
              rlsBlocked: true,
            });
            get().showToast(msg, "error");
            return false;
          }

          const msg = handleSupabaseError(error);
          set({ loading: false, initialized: true, error: msg });
          get().showToast(msg, "error");
          return false;
        }

        const page = data || [];
        rawRows.push(...page);

        if (page.length < PAGE_SIZE) {
          break;
        }
        from += PAGE_SIZE;
      }

      // Detect silent RLS empty result by cross-checking public_dashboard_stats RPC
      if (rawRows.length === 0) {
        try {
          const { data: stats } = await supabase.rpc("public_dashboard_stats");
          const statRow = Array.isArray(stats) ? stats[0] : stats;
          const totalInDb = Number(statRow?.total_scholars || 0);

          if (totalInDb > 0) {
            set({
              scholars: [],
              loading: false,
              initialized: true,
              rlsBlocked: true,
              error: `Supabase has ${totalInDb} scholar records, but Row Level Security (RLS) on public.scholars is blocking your signed-in account from reading them. Run supabase-admin-rls.sql in the Supabase SQL Editor, then click Retry.`,
            });
            return false;
          }
        } catch (rpcErr) {
          console.warn("Could not cross-check public_dashboard_stats:", rpcErr);
        }
      }

      const dbSchema = detectDbSchema(rawRows);

      // Best-effort fallback to public.scholar_grades for any scholar without inline JSONB grades
      const gradesMap = new Map();
      const needsFallbackGrades = rawRows.some(
        (r) => !Array.isArray(r.grades) || r.grades.length === 0,
      );

      if (needsFallbackGrades) {
        try {
          let gFrom = 0;
          while (true) {
            const { data: gData, error: gError } = await supabase
              .from("scholar_grades")
              .select("*")
              .range(gFrom, gFrom + PAGE_SIZE - 1);

            if (gError || !gData) break;

            gData.forEach((g) => {
              const sid = g.scholar_id ?? g.scholarId;
              if (!sid) return;
              if (!gradesMap.has(sid)) {
                gradesMap.set(sid, []);
              }
              gradesMap.get(sid).push(g);
            });

            if (gData.length < PAGE_SIZE) break;
            gFrom += PAGE_SIZE;
          }
        } catch {
          // Ignore if public.scholar_grades does not exist or is not exposed
        }
      }

      const scholars = rawRows.map((row) =>
        normalizeScholarRow(row, gradesMap.get(row.id) || []),
      );

      set({
        scholars,
        dbSchema,
        loading: false,
        initialized: true,
        error: null,
        rlsBlocked: false,
      });
      return true;
    } catch (err) {
      const msg = handleSupabaseError(err);
      set({ loading: false, initialized: true, error: msg });
      get().showToast(msg, "error");
      return false;
    }
  },

  // Scholar CRUD operations persisted to Supabase
  addScholar: async (scholar, { silent = false } = {}) => {
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const prepared = buildScholarDefaults(scholar, get().currentSchoolYear);
    const payload = toDbPayload(prepared, get().dbSchema, { isInsert: true });

    const { data, error } = await supabase
      .from("scholars")
      .insert(payload)
      .select()
      .single();

    if (error) {
      get().showToast(
        `Failed to add scholar: ${handleSupabaseError(error)}`,
        "error",
      );
      return false;
    }

    const nextSchema =
      get().dbSchema?.columns || !data
        ? get().dbSchema
        : detectDbSchema([data]);
    const normalized = data
      ? normalizeScholarRow(data)
      : normalizeScholarRow(prepared);

    set((state) => ({
      scholars: [normalized, ...state.scholars],
      dbSchema: nextSchema,
    }));

    if (!silent) {
      get().showToast("Scholar added successfully!", "success");
    }
    return true;
  },

  updateScholar: async (id, updates, { silent = false } = {}) => {
    if (!id) return false;
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const payload = toDbPayload(updates, get().dbSchema, { isInsert: false });

    const { data, error } = await supabase
      .from("scholars")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      get().showToast(
        `Failed to update scholar: ${handleSupabaseError(error)}`,
        "error",
      );
      return false;
    }

    set((state) => ({
      scholars: state.scholars.map((s) => {
        if (s.id !== id) return s;
        return data
          ? normalizeScholarRow(data, s.grades)
          : syncUpdateState(s, updates);
      }),
    }));

    if (!silent) {
      get().showToast("Scholar updated successfully!", "success");
    }
    return true;
  },

  bulkUpdateScholars: async (ids, updates, { silent = false } = {}) => {
    if (!ids || ids.length === 0) return true;
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const payload = toDbPayload(updates, get().dbSchema, { isInsert: false });
    const chunks = chunkArray(ids, 100);

    for (const chunk of chunks) {
      const { error } = await supabase
        .from("scholars")
        .update(payload)
        .in("id", chunk);

      if (error) {
        get().showToast(
          `Failed to update scholars: ${handleSupabaseError(error)}`,
          "error",
        );
        return false;
      }
    }

    const idSet = new Set(ids);
    set((state) => ({
      scholars: state.scholars.map((s) =>
        idSet.has(s.id) ? syncUpdateState(s, updates) : s,
      ),
    }));

    if (!silent) {
      const count = ids.length;
      get().showToast(
        `${count} scholar${count === 1 ? "" : "s"} updated successfully!`,
        "success",
      );
    }
    return true;
  },

  bulkMarkAsGraduated: async (
    ids,
    yearGraduated = null,
    { silent = false } = {},
  ) => {
    if (!ids || ids.length === 0) return true;
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const year = yearGraduated || new Date().getFullYear();
    const updates = { scholarStatus: "Graduated", yearGraduated: year };
    const payload = toDbPayload(updates, get().dbSchema, { isInsert: false });
    const chunks = chunkArray(ids, 100);

    for (const chunk of chunks) {
      const { error } = await supabase
        .from("scholars")
        .update(payload)
        .in("id", chunk);

      if (error) {
        get().showToast(
          `Failed to mark graduates: ${handleSupabaseError(error)}`,
          "error",
        );
        return false;
      }
    }

    const idSet = new Set(ids);
    set((state) => ({
      scholars: state.scholars.map((s) =>
        idSet.has(s.id) ? syncUpdateState(s, updates) : s,
      ),
    }));

    if (!silent) {
      const count = ids.length;
      get().showToast(
        `${count} scholar${count === 1 ? "" : "s"} marked as graduated!`,
        "success",
      );
    }
    return true;
  },

  returnToActive: async (id) => {
    if (!id) return false;
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const updates = { scholarStatus: "Active", yearGraduated: null };
    const payload = toDbPayload(updates, get().dbSchema, { isInsert: false });

    const { error } = await supabase
      .from("scholars")
      .update(payload)
      .eq("id", id);

    if (error) {
      get().showToast(
        `Failed to return scholar to active: ${handleSupabaseError(error)}`,
        "error",
      );
      return false;
    }

    set((state) => ({
      scholars: state.scholars.map((s) =>
        s.id === id ? syncUpdateState(s, updates) : s,
      ),
    }));
    get().showToast("Scholar returned to active status!", "success");
    return true;
  },

  deleteScholar: async (id) => {
    if (!id) return false;
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      get().showToast(authCheck.error, "error");
      return false;
    }

    const { error } = await supabase.from("scholars").delete().eq("id", id);

    if (error) {
      get().showToast(
        `Failed to delete scholar: ${handleSupabaseError(error)}`,
        "error",
      );
      return false;
    }

    set((state) => ({
      scholars: state.scholars.filter((s) => s.id !== id),
    }));
    get().showToast("Scholar deleted successfully!", "warning");
    return true;
  },

  bulkImportScholars: async (newScholars = [], updatesList = []) => {
    const authCheck = await ensureActiveSession();
    if (!authCheck.ok) {
      return {
        imported: 0,
        updated: 0,
        failed: newScholars.length + updatesList.length,
        errorMessage: authCheck.error,
      };
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;
    let errorMessage = null;
    const insertedRows = [];

    const schema = get().dbSchema;
    const chunks = chunkArray(newScholars, 100);

    for (const chunk of chunks) {
      const payloads = chunk.map((s) =>
        toDbPayload(buildScholarDefaults(s, get().currentSchoolYear), schema, {
          isInsert: true,
        }),
      );
      const { data, error } = await supabase
        .from("scholars")
        .insert(payloads)
        .select();

      if (error) {
        failed += chunk.length;
        errorMessage = handleSupabaseError(error);
      } else if (data) {
        insertedRows.push(...data);
        imported += data.length;
      }
    }

    if (insertedRows.length > 0) {
      const nextSchema = get().dbSchema?.columns
        ? get().dbSchema
        : detectDbSchema(insertedRows);
      const normalizedNew = insertedRows.map((r) => normalizeScholarRow(r));
      set((state) => ({
        scholars: [...normalizedNew, ...state.scholars],
        dbSchema: nextSchema,
      }));
    }

    for (const item of updatesList) {
      const ok = await get().updateScholar(item.id, item.data, {
        silent: true,
      });
      if (ok) {
        updated += 1;
      } else {
        failed += 1;
      }
    }

    return { imported, updated, failed, errorMessage };
  },

  // Filtering
  getScholarsBySchoolYear: () => {
    const { scholars, currentSchoolYear } = get();
    if (currentSchoolYear === "ALL") return scholars;
    return scholars.filter((s) => s.schoolYear === currentSchoolYear);
  },

  getActiveScholars: () => {
    const scholars = get().getScholarsBySchoolYear();
    // Treat missing scholarStatus as Active for backward compatibility
    return scholars.filter(
      (s) => !s.scholarStatus || s.scholarStatus === "Active",
    );
  },

  getGraduatedScholars: () => {
    // Always show all graduates regardless of active SY filter; GraduatesTab filters by graduation year
    return get().scholars.filter((s) => s.scholarStatus === "Graduated");
  },

  getGraduatedScholarsBySchool: (school) => {
    return get()
      .getGraduatedScholars()
      .filter((s) => s.school === school);
  },

  getGraduationYears: () => {
    const graduates = get().getGraduatedScholars();
    const years = [
      ...new Set(graduates.map((s) => s.yearGraduated).filter(Boolean)),
    ];
    return years.sort((a, b) => b - a);
  },

  // Statistics
  getTotalScholars: () => {
    return get().getScholarsBySchoolYear().length;
  },

  getTotalAmount: () => {
    return get()
      .getScholarsBySchoolYear()
      .reduce(
        (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
        0,
      );
  },

  getSchoolsList: () => {
    const scholars = get().getActiveScholars();
    const schools = [...new Set(scholars.map((s) => s.school).filter(Boolean))];
    return schools.sort();
  },

  getGraduatedSchoolsList: () => {
    const scholars = get().getGraduatedScholars();
    const schools = [...new Set(scholars.map((s) => s.school).filter(Boolean))];
    return schools.sort();
  },

  getAllSchoolsList: () => {
    const schools = [
      ...new Set(
        get()
          .scholars.map((s) => s.school)
          .filter(Boolean),
      ),
    ];
    return schools.sort();
  },

  getScholarsBySchool: (school) => {
    return get()
      .getActiveScholars()
      .filter((s) => s.school === school);
  },

  getScholarsByYearLevel: (yearLevel) => {
    return get()
      .getScholarsBySchoolYear()
      .filter((s) => s.yearLevel === yearLevel);
  },

  getYearLevelStats: (yearLevels) => {
    const scholars = get().getScholarsBySchoolYear();
    const stats = {};

    yearLevels.forEach((level) => {
      const matching = scholars.filter((s) => s.yearLevel === level);
      const count = matching.length;
      const amount = matching.reduce(
        (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
        0,
      );
      stats[level] = { count, amount };
    });

    return stats;
  },

  getSchoolStats: () => {
    const scholars = get().getScholarsBySchoolYear();
    const schools = get().getSchoolsList();
    const total = get().getTotalAmount();

    return schools.map((school) => {
      const schoolScholars = scholars.filter((s) => s.school === school);
      const count = schoolScholars.length;
      const amount = schoolScholars.reduce(
        (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
        0,
      );
      const percentage = total > 0 ? (amount / total) * 100 : 0;

      return {
        school,
        count,
        amount,
        percentage,
      };
    });
  },

  // School Management
  addSchool: (schoolName) => {
    const schools = get().getAllSchoolsList();

    if (schools.some((s) => s.toLowerCase() === schoolName.toLowerCase())) {
      get().showToast("School already exists", "error");
      return false;
    }

    get().showToast(
      `School "${schoolName}" ready to assign to scholars!`,
      "success",
    );
    return true;
  },

  updateSchoolName: async (oldName, newName) => {
    const normalizedOld = oldName.trim().replace(/\s+/g, " ");
    const normalizedNew = newName.trim().replace(/\s+/g, " ");

    if (!normalizedNew) {
      get().showToast("School name cannot be empty", "error");
      return false;
    }

    const allSchools = [
      ...new Set(
        get()
          .scholars.map((s) => s.school)
          .filter(Boolean),
      ),
    ];

    if (
      allSchools.some(
        (s) =>
          s.toLowerCase().replace(/\s+/g, " ") ===
            normalizedNew.toLowerCase() &&
          s.toLowerCase().replace(/\s+/g, " ") !== normalizedOld.toLowerCase(),
      )
    ) {
      get().showToast("This school already exists", "error");
      return false;
    }

    const schoolCol = get().dbSchema?.school || "school";
    const { error } = await supabase
      .from("scholars")
      .update({ [schoolCol]: normalizedNew })
      .eq(schoolCol, oldName);

    if (error) {
      get().showToast(
        `Failed to update school name: ${handleSupabaseError(error)}`,
        "error",
      );
      return false;
    }

    set((state) => ({
      scholars: state.scholars.map((s) =>
        s.school === oldName
          ? { ...s, school: normalizedNew, updatedAt: new Date().toISOString() }
          : s,
      ),
    }));

    get().showToast("School name updated successfully!", "success");
    return true;
  },

  deleteSchool: (schoolName) => {
    if (get().validateSchoolInUse(schoolName)) {
      const count = get().getScholarsBySchool(schoolName).length;
      get().showToast(
        `Cannot delete: ${count} scholar${count === 1 ? "" : "s"} still using this school`,
        "error",
      );
      return false;
    }

    get().showToast(`School "${schoolName}" deleted successfully!`, "warning");
    return true;
  },

  validateSchoolInUse: (schoolName) => {
    return get().getScholarsBySchool(schoolName).length > 0;
  },

  // School year management
  setSchoolYear: (year) => {
    set({ currentSchoolYear: year });
  },

  // Toast notifications via shadcn Sonner
  showToast: (message, type = "info", options = {}) => {
    const fn =
      typeof sonnerToast[type] === "function" ? sonnerToast[type] : sonnerToast;
    fn(message, {
      id: options.id ?? `${type}:${message}`,
      duration: options.duration ?? 3500,
      ...options,
    });
    set({ toast: { message, type, id: Date.now() } });
  },

  // Backup & Export
  exportData: () => {
    const data = {
      scholars: get().scholars,
      exportDate: new Date().toISOString(),
      schoolYear: get().currentSchoolYear,
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.scholars && Array.isArray(data.scholars)) {
        set({ scholars: data.scholars });
        get().showToast("Data imported successfully!", "success");
        return true;
      }
      throw new Error("Invalid data format");
    } catch {
      get().showToast("Failed to import data. Invalid format.", "error");
      return false;
    }
  },
}));

export { BARANGAYS, SEMESTERS };
export default useScholarStore;
