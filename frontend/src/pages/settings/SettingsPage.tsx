import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchControlPanelSettings,
  fetchSettingsList,
} from "../../store/slices/settingsSlice";

import SettingsLayout from "./SettingsLayout";

import type {
  SettingsSection,
} from "./SettingsLayout";


import CompanySettingsSection from "./sections/CompanySettingsSection";
import LeadSettingsSection from "./sections/LeadSettingsSection";
import CallingSettingsSection from "./sections/CallingSettingsSection";
import FollowUpSettingsSection from "./sections/FollowUpSettingsSection";
import DemoProductSettingsSection from "./sections/DemoProductSettingsSection";
import TrialSettingsSection from "./sections/TrialSettingsSection";
import EmployeeSettingsSection from "./sections/EmployeeSettingsSection";
import AttendanceSettingsSection from "./sections/AttendanceSettingsSection";
import GeneralSettingsSection from "./sections/GeneralSettingsSection";
import SecuritySettingsSection from "./sections/SecuritySettingsSection";

/* ============================
   PAGE
============================ */

export default function SettingsPage() {
  const dispatch =
    useAppDispatch();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const {
    loading,
    error,
  } =
    useAppSelector(
      (state) =>
        state.settings
    );

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SettingsSection>(
      "COMPANY"
    );

  const [
    searchValue,
    setSearchValue,
  ] =
    useState("");

  /* ============================
     ROLE
  ============================ */

  const roleName =
    useMemo(() => {
      const role =
        employee?.role as unknown;

      if (
        typeof role ===
        "string"
      ) {
        return role;
      }

      if (
        role &&
        typeof role ===
          "object" &&
        "name" in role
      ) {
        return String(
          (
            role as {
              name: string;
            }
          ).name
        );
      }

      return "";
    }, [employee]);

  /* ============================
     LOAD SETTINGS
  ============================ */

  useEffect(() => {
    if (
      roleName !== "ADMIN"
    ) {
      return;
    }

    dispatch(
      fetchSettingsList()
    );

    dispatch(
      fetchControlPanelSettings()
    );
  }, [
    dispatch,
    roleName,
  ]);

  /* ============================
     ADMIN GUARD
  ============================ */

  if (
    roleName &&
    roleName !== "ADMIN"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Access Denied
        </p>

        <p className="mt-1 text-sm text-red-600">
          Settings Control Panel
          is available only to
          Admin.
        </p>
      </div>
    );
  }

  /* ============================
     LOADING
  ============================ */

  if (
    loading &&
    !error
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading Control Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsLayout
      activeSection={
        activeSection
      }
      onSectionChange={
        setActiveSection
      }
      searchValue={
        searchValue
      }
      onSearchChange={
        setSearchValue
      }
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

   {activeSection ===
  "COMPANY" && (
  <CompanySettingsSection />
)}

  {activeSection ===
  "LEADS" && (
  <LeadSettingsSection />
)}

{activeSection ===
  "CALLING" && (
  <CallingSettingsSection />
)}

{activeSection ===
  "FOLLOW_UP" && (
  <FollowUpSettingsSection />
)}
  {activeSection ===
  "DEMO_PRODUCTS" && (
  <DemoProductSettingsSection />
)}
{activeSection ===
  "TRIAL" && (
  <TrialSettingsSection />
)}
{activeSection ===
  "EMPLOYEES" && (
  <EmployeeSettingsSection />
)}

   {activeSection ===
  "ATTENDANCE" && (
  <AttendanceSettingsSection />
)}

   {activeSection ===
  "GENERAL" && (
  <GeneralSettingsSection />
)}
     {activeSection ===
  "SECURITY" && (
  <SecuritySettingsSection />
)}
      
    </SettingsLayout>
  );
}

