import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  CheckSquare,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import useScholarStore, { BARANGAYS, SEMESTERS } from "../store/scholarStore";
import { YEAR_LEVELS } from "../config/yearLevels";
import { formatGWA, isGWAWarning } from "../config/grading";
import { formatScholarName } from "../utils/helpers";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ScholarRecords = ({ onEditScholar, onAddScholar }) => {
  const {
    getActiveScholars,
    getSchoolsList,
    deleteScholar,
    bulkUpdateScholars,
    bulkMarkAsGraduated,
    scholars,
    showToast,
  } = useScholarStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("ALL");
  const [filterSchool, setFilterSchool] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterSemester, setFilterSemester] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPWD, setFilterPWD] = useState("ALL");
  const [filterSoloParent, setFilterSoloParent] = useState("ALL");
  const [filterGender, setFilterGender] = useState("ALL");

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    scholar: null,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPaidConfirm, setBulkPaidConfirm] = useState(false);
  const [bulkUnpaidConfirm, setBulkUnpaidConfirm] = useState(false);
  const [bulkGraduatedConfirm, setBulkGraduatedConfirm] = useState(false);

  const allScholars = getActiveScholars();
  const schools = getSchoolsList();

  const getLatestGWA = (scholar) => {
    if (!scholar.grades || scholar.grades.length === 0) return null;
    const sorted = [...scholar.grades].sort((a, b) => {
      const syA = a.schoolYear || "";
      const syB = b.schoolYear || "";
      if (syA !== syB) {
        return syB.localeCompare(syA);
      }
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    return sorted[0].gwa;
  };

  const filteredScholars = useMemo(() => {
    return allScholars.filter((scholar) => {
      const matchesSearch =
        searchTerm === "" ||
        `${scholar.firstName} ${scholar.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        scholar.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholar.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholar.barangay?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBarangay =
        filterBarangay === "ALL" || scholar.barangay === filterBarangay;
      const matchesSchool =
        filterSchool === "ALL" || scholar.school === filterSchool;
      const matchesYear =
        filterYear === "ALL" || scholar.yearLevel === filterYear;
      const matchesSemester =
        filterSemester === "ALL" || scholar.semester === filterSemester;
      const matchesStatus =
        filterStatus === "ALL" || scholar.status === filterStatus;
      const matchesPWD =
        filterPWD === "ALL" ||
        (filterPWD === "Yes"
          ? scholar.is_pwd === true
          : scholar.is_pwd === false);
      const matchesSoloParent =
        filterSoloParent === "ALL" ||
        (filterSoloParent === "Yes"
          ? scholar.is_solo_parent === true
          : scholar.is_solo_parent === false);
      const matchesGender =
        filterGender === "ALL" || (scholar.gender || "Male") === filterGender;

      return (
        matchesSearch &&
        matchesBarangay &&
        matchesSchool &&
        matchesYear &&
        matchesSemester &&
        matchesStatus &&
        matchesPWD &&
        matchesSoloParent &&
        matchesGender
      );
    });
  }, [
    allScholars,
    searchTerm,
    filterBarangay,
    filterSchool,
    filterYear,
    filterSemester,
    filterStatus,
    filterPWD,
    filterSoloParent,
    filterGender,
  ]);

  const sortedScholars = useMemo(() => {
    const list = [...filteredScholars];
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    list.sort((a, b) => {
      switch (sortConfig.key) {
        case "name":
          return (
            formatScholarName(a, "lastFirst").localeCompare(
              formatScholarName(b, "lastFirst"),
            ) * dir
          );
        case "barangay":
          return (a.barangay || "").localeCompare(b.barangay || "") * dir;
        case "school":
          return (a.school || "").localeCompare(b.school || "") * dir;
        case "yearLevel":
          return (a.yearLevel || "").localeCompare(b.yearLevel || "") * dir;
        case "gwa": {
          const gA = getLatestGWA(a);
          const gB = getLatestGWA(b);
          if (gA === null && gB === null) return 0;
          if (gA === null) return 1;
          if (gB === null) return -1;
          return (Number(gA) - Number(gB)) * dir;
        }
        case "amount":
          return (
            ((parseFloat(a.scholarship_amount || a.amount) || 0) -
              (parseFloat(b.scholarship_amount || b.amount) || 0)) *
            dir
          );
        case "status":
          return (a.status || "").localeCompare(b.status || "") * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [filteredScholars, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedScholars.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedScholars = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return sortedScholars.slice(start, start + itemsPerPage);
  }, [sortedScholars, safePage, itemsPerPage]);

  useEffect(() => {
    setSelectedIds([]);
    setCurrentPage(1);
  }, [
    searchTerm,
    filterBarangay,
    filterSchool,
    filterYear,
    filterSemester,
    filterStatus,
    filterPWD,
    filterSoloParent,
    filterGender,
    itemsPerPage,
  ]);

  const secondaryFilterCount = [
    filterSemester !== "ALL",
    filterPWD !== "ALL",
    filterSoloParent !== "ALL",
    filterGender !== "ALL",
  ].filter(Boolean).length;

  const activeFilterCount =
    [
      searchTerm !== "",
      filterBarangay !== "ALL",
      filterSchool !== "ALL",
      filterYear !== "ALL",
      filterStatus !== "ALL",
    ].filter(Boolean).length + secondaryFilterCount;

  const handleResetSecondaryFilters = () => {
    setFilterSemester("ALL");
    setFilterPWD("ALL");
    setFilterSoloParent("ALL");
    setFilterGender("ALL");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterBarangay("ALL");
    setFilterSchool("ALL");
    setFilterYear("ALL");
    setFilterSemester("ALL");
    setFilterStatus("ALL");
    setFilterPWD("ALL");
    setFilterSoloParent("ALL");
    setFilterGender("ALL");
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-45" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-brand" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-brand" />
    );
  };

  const handleSelectAll = () => {
    if (
      filteredScholars.length > 0 &&
      selectedIds.length === filteredScholars.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredScholars.map((s) => s.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const triggerUndoPayment = async (changes) => {
    const paidIds = changes
      .filter((c) => c.oldStatus === "Paid")
      .map((c) => c.id);
    const processingIds = changes
      .filter((c) => c.oldStatus !== "Paid")
      .map((c) => c.id);

    let ok = true;
    if (paidIds.length > 0) {
      ok =
        (await bulkUpdateScholars(
          paidIds,
          { status: "Paid" },
          { silent: true },
        )) && ok;
    }
    if (processingIds.length > 0) {
      ok =
        (await bulkUpdateScholars(
          processingIds,
          { status: "Processing" },
          { silent: true },
        )) && ok;
    }
    if (ok) {
      showToast("Payment changes undone", "success");
    }
  };

  const confirmBulkPaid = async () => {
    const affectedScholars = scholars.filter((s) => selectedIds.includes(s.id));
    const scholarsToChange = affectedScholars.filter(
      (s) => s.status !== "Paid",
    );
    const alreadyPaid = affectedScholars.length - scholarsToChange.length;

    if (scholarsToChange.length === 0) {
      showToast("All selected scholars are already paid.", "info");
      setSelectedIds([]);
      setBulkPaidConfirm(false);
      return;
    }

    const previousState = scholarsToChange.map((s) => ({
      id: s.id,
      oldStatus: s.status,
    }));

    const ok = await bulkUpdateScholars(
      scholarsToChange.map((s) => s.id),
      { status: "Paid" },
      { silent: true },
    );
    if (!ok) return;

    let message = `Marked ${scholarsToChange.length} ${
      scholarsToChange.length === 1 ? "scholar" : "scholars"
    } as paid.`;
    if (alreadyPaid > 0) {
      message += ` ${alreadyPaid} ${alreadyPaid === 1 ? "was" : "were"} already paid.`;
    }

    showToast(message, "success", {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => triggerUndoPayment(previousState),
      },
    });

    setSelectedIds([]);
    setBulkPaidConfirm(false);
  };

  const confirmBulkUnpaid = async () => {
    const affectedScholars = scholars.filter((s) => selectedIds.includes(s.id));
    const scholarsToChange = affectedScholars.filter(
      (s) => s.status === "Paid",
    );
    const alreadyProcessing = affectedScholars.length - scholarsToChange.length;

    if (scholarsToChange.length === 0) {
      showToast("All selected scholars are already processing.", "info");
      setSelectedIds([]);
      setBulkUnpaidConfirm(false);
      return;
    }

    const previousState = scholarsToChange.map((s) => ({
      id: s.id,
      oldStatus: s.status,
    }));

    const ok = await bulkUpdateScholars(
      scholarsToChange.map((s) => s.id),
      { status: "Processing" },
      { silent: true },
    );
    if (!ok) return;

    let message = `Marked ${scholarsToChange.length} ${
      scholarsToChange.length === 1 ? "scholar" : "scholars"
    } as unpaid (Processing).`;
    if (alreadyProcessing > 0) {
      message += ` ${alreadyProcessing} ${
        alreadyProcessing === 1 ? "was" : "were"
      } already processing.`;
    }

    showToast(message, "success", {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => triggerUndoPayment(previousState),
      },
    });

    setSelectedIds([]);
    setBulkUnpaidConfirm(false);
  };

  const confirmBulkGraduated = async () => {
    const ok = await bulkMarkAsGraduated(selectedIds);
    if (ok) {
      setSelectedIds([]);
      setBulkGraduatedConfirm(false);
    }
  };

  const selectedScholars = scholars.filter((s) => selectedIds.includes(s.id));
  const hasProcessing = selectedScholars.some(
    (s) => s.status === "Processing" || !s.status,
  );
  const hasPaid = selectedScholars.some((s) => s.status === "Paid");

  const allSelected =
    filteredScholars.length > 0 &&
    selectedIds.length === filteredScholars.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < filteredScholars.length;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  const totalFiltered = filteredScholars.reduce(
    (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
    0,
  );

  const confirmDelete = async () => {
    if (deleteConfirm.scholar) {
      await deleteScholar(deleteConfirm.scholar.id);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Bulk Action Bar - Smooth Expand/Collapse */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          selectedIds.length > 0
            ? "grid-rows-[1fr] opacity-100 translate-y-0 mb-5"
            : "grid-rows-[0fr] opacity-0 -translate-y-1 pointer-events-none mb-0"
        }`}
        aria-hidden={selectedIds.length === 0}
      >
        <div className="overflow-hidden">
          <Card className="gradient-emerald-gold-soft border-brand/45">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand" />
                  <span className="font-bold text-sm text-foreground">
                    {selectedIds.length}{" "}
                    {selectedIds.length === 1 ? "scholar" : "scholars"} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-7 px-2 text-xs text-brand"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear selection
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {hasProcessing && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setBulkPaidConfirm(true)}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Mark as Paid
                  </Button>
                )}
                {hasPaid && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setBulkUnpaidConfirm(true)}
                  >
                    <X className="w-4 h-4" />
                    Mark as Unpaid
                  </Button>
                )}
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setBulkGraduatedConfirm(true)}
                >
                  <CheckSquare className="w-4 h-4" />
                  Mark as Graduated
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compact Unified Search, Filter & Action Bar */}
      <Card className="animate-fade-up mb-4">
        <CardContent className="p-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-brand/75" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, school, course, or barangay..."
                className="pl-9 pr-8 h-9 text-xs sm:text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Inline Quick Filters + Secondary Filters Popover + Add Scholar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-[168px]">
                <Select
                  value={filterBarangay}
                  onValueChange={setFilterBarangay}
                >
                  <SelectTrigger
                    aria-label="Filter by Barangay"
                    className="h-9 text-xs"
                  >
                    <SelectValue placeholder="All Barangays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Barangays</SelectItem>
                    {BARANGAYS.map((brgy) => (
                      <SelectItem key={brgy} value={brgy}>
                        {brgy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[196px]">
                <Select value={filterSchool} onValueChange={setFilterSchool}>
                  <SelectTrigger
                    aria-label="Filter by School"
                    className="h-9 text-xs"
                  >
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Schools</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[148px]">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger
                    aria-label="Filter by Year Level"
                    className="h-9 text-xs"
                  >
                    <SelectValue placeholder="All Year Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Year Levels</SelectItem>
                    {YEAR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[132px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger
                    aria-label="Filter by Payment Status"
                    className="h-9 text-xs"
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extra Filters Popover (Semester, Gender, PWD, Solo Parent) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-9 px-3 rounded-lg text-xs gap-1.5 ${
                      secondaryFilterCount > 0
                        ? "border-brand/50 bg-brand/10 text-brand font-semibold"
                        : ""
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
                    <span>Filters</span>
                    {secondaryFilterCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand text-white">
                        {secondaryFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/85">
                      More Filters
                    </span>
                    {secondaryFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetSecondaryFilters}
                        className="text-[11px] font-semibold text-brand hover:underline"
                      >
                        Clear ({secondaryFilterCount})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Semester
                      </span>
                      <Select
                        value={filterSemester}
                        onValueChange={setFilterSemester}
                      >
                        <SelectTrigger
                          aria-label="Filter by Semester"
                          className="h-8 text-xs"
                        >
                          <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Semesters</SelectItem>
                          {SEMESTERS.map((sem) => (
                            <SelectItem key={sem} value={sem}>
                              {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Gender
                      </span>
                      <Select
                        value={filterGender}
                        onValueChange={setFilterGender}
                      >
                        <SelectTrigger
                          aria-label="Filter by Gender"
                          className="h-8 text-xs"
                        >
                          <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Genders</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        PWD
                      </span>
                      <Select value={filterPWD} onValueChange={setFilterPWD}>
                        <SelectTrigger
                          aria-label="Filter by PWD"
                          className="h-8 text-xs"
                        >
                          <SelectValue placeholder="All PWD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All PWD</SelectItem>
                          <SelectItem value="Yes">PWD: Yes</SelectItem>
                          <SelectItem value="No">PWD: No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Solo Parent
                      </span>
                      <Select
                        value={filterSoloParent}
                        onValueChange={setFilterSoloParent}
                      >
                        <SelectTrigger
                          aria-label="Filter by Solo Parent"
                          className="h-8 text-xs"
                        >
                          <SelectValue placeholder="All Solo Parent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Solo Parent</SelectItem>
                          <SelectItem value="Yes">Solo Parent: Yes</SelectItem>
                          <SelectItem value="No">Solo Parent: No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-9 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ({activeFilterCount})</span>
                </Button>
              )}

              {onAddScholar && (
                <>
                  <div className="hidden xl:block h-5 w-px bg-border mx-0.5" />
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={onAddScholar}
                    className="h-9 px-4 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap ml-auto xl:ml-0"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.25} />
                    <span>Add Scholar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholars Table */}
      <Card
        className="overflow-hidden animate-fade-up"
        style={{ animationDelay: "70ms" }}
      >
        <Table
          wrapperClassName={
            selectedIds.length > 0
              ? "max-h-[calc(100vh-25rem)] min-h-[280px]"
              : "max-h-[calc(100vh-19.5rem)] min-h-[320px]"
          }
          style={{ minWidth: "1250px" }}
        >
          <TableHeader className="sticky top-0 z-20 bg-[#F6F6F1] shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[52px] sticky left-0 z-30 bg-[#F6F6F1]">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      someSelected
                        ? "indeterminate"
                        : allSelected
                          ? true
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label={allSelected ? "Deselect all" : "Select all"}
                  />
                </div>
              </TableHead>
              <TableHead
                className="w-[270px] min-w-[260px] sticky left-[52px] z-30 bg-[#F6F6F1]"
                style={{ boxShadow: "2px 0 4px -2px rgba(88, 117, 41, 0.1)" }}
              >
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>Scholar Name</span>
                  {renderSortIcon("name")}
                </button>
              </TableHead>
              <TableHead className="min-w-[130px]">
                <button
                  type="button"
                  onClick={() => handleSort("barangay")}
                  className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>Barangay</span>
                  {renderSortIcon("barangay")}
                </button>
              </TableHead>
              <TableHead className="min-w-[240px]">
                <button
                  type="button"
                  onClick={() => handleSort("school")}
                  className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>School</span>
                  {renderSortIcon("school")}
                </button>
              </TableHead>
              <TableHead className="text-center min-w-[110px]">
                <button
                  type="button"
                  onClick={() => handleSort("gwa")}
                  className="inline-flex items-center justify-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>Latest GWA</span>
                  {renderSortIcon("gwa")}
                </button>
              </TableHead>
              <TableHead className="min-w-[110px]">
                <button
                  type="button"
                  onClick={() => handleSort("yearLevel")}
                  className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>Year Level</span>
                  {renderSortIcon("yearLevel")}
                </button>
              </TableHead>
              <TableHead className="min-w-[100px]">Semester</TableHead>
              <TableHead className="min-w-[200px]">Course / Program</TableHead>
              <TableHead className="text-right min-w-[115px]">
                <button
                  type="button"
                  onClick={() => handleSort("amount")}
                  className="inline-flex items-center justify-end gap-1.5 hover:text-brand transition-colors ml-auto"
                >
                  <span>Amount</span>
                  {renderSortIcon("amount")}
                </button>
              </TableHead>
              <TableHead className="text-center min-w-[115px]">
                <button
                  type="button"
                  onClick={() => handleSort("status")}
                  className="inline-flex items-center justify-center gap-1.5 hover:text-brand transition-colors"
                >
                  <span>Status</span>
                  {renderSortIcon("status")}
                </button>
              </TableHead>
              <TableHead
                className="w-[104px] text-center sticky right-0 z-30 bg-[#F6F6F1] no-print"
                style={{
                  boxShadow: "-2px 0 4px -2px rgba(88, 117, 41, 0.1)",
                }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedScholars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-14 text-center">
                  {allScholars.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserPlus className="w-12 h-12 opacity-40" />
                      <p className="font-semibold text-foreground">
                        No scholars yet
                      </p>
                      <p className="text-xs">
                        Click &ldquo;Add Scholar&rdquo; to get started
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No scholars match your current filters
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedScholars.map((scholar) => {
                const isSelected = selectedIds.includes(scholar.id);
                const latestGWA = getLatestGWA(scholar);
                const isWarning = latestGWA ? isGWAWarning(latestGWA) : false;

                return (
                  <TableRow
                    key={scholar.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => {
                      if (window.getSelection()?.toString()) return;
                      onEditScholar(scholar);
                    }}
                    className="group cursor-pointer"
                  >
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="sticky left-0 z-10 bg-[inherit] transition-shadow duration-300 ease-out group-data-[state=selected]:shadow-[inset_3px_0_0_#587529]"
                    >
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectOne(scholar.id)}
                          aria-label={`Select ${formatScholarName(
                            scholar,
                            "firstLast",
                          )}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell
                      className="sticky left-[52px] z-10 bg-[inherit] font-semibold text-foreground"
                      style={{
                        boxShadow: "2px 0 4px -2px rgba(88, 117, 41, 0.1)",
                      }}
                    >
                      <div className="leading-snug">
                        {formatScholarName(scholar, "full")}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {scholar.barangay}
                    </TableCell>

                    <TableCell
                      className="text-xs text-muted-foreground"
                      title={scholar.school}
                    >
                      <div className="line-clamp-2">{scholar.school}</div>
                    </TableCell>

                    <TableCell className="text-center">
                      {!latestGWA ? (
                        <span className="text-xs text-muted-foreground/75 whitespace-nowrap">
                          No grades
                        </span>
                      ) : (
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${
                            isWarning ? "text-red-600" : "text-brand"
                          }`}
                        >
                          {formatGWA(latestGWA)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-foreground/80">
                      {scholar.yearLevel}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                      {scholar.semester || "1st Sem"}
                    </TableCell>

                    <TableCell
                      className="text-xs text-muted-foreground"
                      title={scholar.course}
                    >
                      <div className="line-clamp-2">
                        {scholar.course || "-"}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-bold text-brand whitespace-nowrap">
                      {formatCurrency(
                        scholar.scholarship_amount || scholar.amount || 0,
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={
                          scholar.status === "Paid" ? "success" : "warning"
                        }
                        className="whitespace-nowrap"
                      >
                        {scholar.status || "Processing"}
                      </Badge>
                    </TableCell>

                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="sticky right-0 z-10 bg-[inherit] no-print"
                      style={{
                        boxShadow: "-2px 0 4px -2px rgba(88, 117, 41, 0.1)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-brand hover:text-foreground"
                              onClick={() => onEditScholar(scholar)}
                              aria-label="Edit scholar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit scholar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setDeleteConfirm({ isOpen: true, scholar })
                              }
                              aria-label="Delete scholar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete scholar</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer Summary + Shadcn Pagination + Page Size Select */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-muted/90 via-accent/60 to-muted/90 border-t border-border space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-muted-foreground">
                Filtered:{" "}
                <strong className="text-foreground">
                  {filteredScholars.length}
                </strong>{" "}
                of{" "}
                <strong className="text-foreground">
                  {allScholars.length}
                </strong>{" "}
                records
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rows/page:</span>
                <div className="w-[82px]">
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => setItemsPerPage(Number(val))}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="font-semibold text-foreground">
              Filtered Total Amount:{" "}
              <span className="font-black text-sm text-brand">
                {formatCurrency(totalFiltered)}
              </span>
            </div>
          </div>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedScholars.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, scholar: null })}
        onConfirm={confirmDelete}
        title="Delete Scholar?"
        scholarName={
          deleteConfirm.scholar
            ? formatScholarName(deleteConfirm.scholar, "firstLast")
            : ""
        }
        message="Are you sure you want to delete this scholar record?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmModal
        isOpen={bulkPaidConfirm}
        onClose={() => setBulkPaidConfirm(false)}
        onConfirm={confirmBulkPaid}
        title="Mark as Paid?"
        message={`Are you sure you want to mark ${selectedIds.length} ${
          selectedIds.length === 1 ? "scholar" : "scholars"
        } as Paid?`}
        confirmText="Mark as Paid"
        cancelText="Cancel"
        type="success"
      />

      <ConfirmModal
        isOpen={bulkUnpaidConfirm}
        onClose={() => setBulkUnpaidConfirm(false)}
        onConfirm={confirmBulkUnpaid}
        title="Mark as Unpaid?"
        message={`Are you sure you want to mark ${selectedIds.length} ${
          selectedIds.length === 1 ? "scholar" : "scholars"
        } as Unpaid (Processing)?`}
        confirmText="Mark as Unpaid"
        cancelText="Cancel"
        type="warning"
      />

      <ConfirmModal
        isOpen={bulkGraduatedConfirm}
        onClose={() => setBulkGraduatedConfirm(false)}
        onConfirm={confirmBulkGraduated}
        title="Mark as Graduated?"
        message={`Are you sure you want to mark ${selectedIds.length} ${
          selectedIds.length === 1 ? "scholar" : "scholars"
        } as Graduated?`}
        confirmText="Mark as Graduated"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default ScholarRecords;
