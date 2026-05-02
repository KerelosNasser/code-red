"use client"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, UserPlus, Target, Users, ShieldCheck, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { TeamCard } from "@/components/dashboard/team-card"
import { MemberRow } from "@/components/dashboard/member-row"
import { AddTeamDialog } from "@/components/dashboard/add-team-dialog"
import { AddUserDialog } from "@/components/dashboard/add-user-dialog"
import { ProfileDialog } from "@/components/dashboard/profile-dialog"
import { useDashboard } from "@/hooks/use-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const d = useDashboard()

  useEffect(() => {
    if (!d.isCheckingAccess && (!d.access || d.access.role !== "admin")) {
      router.push("/register")
    }
  }, [d.isCheckingAccess, d.access, router])

  if (d.isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    )
  }

  if (!d.access || d.access.role !== "admin") return null

  const adminDisplayName = d.adminProfile?.first_name || d.adminProfile?.firstName
    ? `${d.adminProfile.first_name || d.adminProfile.firstName} ${d.adminProfile.last_name || d.adminProfile.lastName || ""}`.trim()
    : "Administrator"

  const servantCount = d.managedUsers.filter((u) => u.role === "servant").length
  const memberCount = d.managedUsers.filter((u) => u.role === "member").length
  const isRefreshing = d.isLoadingUsers || d.isLoadingTeams

  const unassignedUsers = d.managedUsers.filter(
    (u) =>
      !(u.team_id || u.teamId) ||
      !d.teams.find((t) => t.id === (u.team_id || u.teamId))
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar
        adminName={adminDisplayName}
        phone={d.access.phone}
        teamCount={d.teams.length}
        memberCount={memberCount}
        servantCount={servantCount}
        onOpenProfile={() => d.setIsProfileOpen(true)}
        collapsed={d.sidebarCollapsed}
        onToggle={() => d.setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-sm font-black text-slate-900 md:text-lg">Organization Overview</h1>
            <p className="hidden text-slate-400 md:text-xs">Manage your teams and members</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={d.refreshData}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-slate-200 font-semibold text-slate-700"
              onClick={() => d.setIsAddTeamOpen(true)}
            >
              <Target className="mr-1.5 h-3.5 w-3.5" />
              New Team
            </Button>

            <Button
              size="sm"
              className="h-9 rounded-xl bg-red-700 font-semibold hover:bg-red-600"
              onClick={() => d.setIsAddUserOpen(true)}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Person
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Teams" value={d.teams.length} icon={Target} accent="#1e3a5f" />
            <StatCard label="Total Members" value={d.managedUsers.length} icon={Users} accent="#9b1c1f" />
            <StatCard label="Servants" value={servantCount} icon={ShieldCheck} accent="#2d6a4f" />
            <StatCard label="Members" value={memberCount} icon={User} accent="#b5541a" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Teams &amp; Members</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {d.teams.length} teams
            </span>
          </div>

          {d.teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <User className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Teams Yet</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Create your first team to start organizing members into groups.
              </p>
              <Button
                onClick={() => d.setIsAddTeamOpen(true)}
                className="mt-6 rounded-xl bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {d.teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  users={d.managedUsers.filter((u) => (u.team_id || u.teamId) === team.id)}
                  onDeleteTeam={d.onDeleteTeam}
                  onDeleteUser={d.onDeleteUser}
                  onOpenAddUser={() => d.setIsAddUserOpen(true)}
                />
              ))}

              {unassignedUsers.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Unassigned Members</h3>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    {unassignedUsers.map((u) => (
                      <MemberRow key={u.id} user={u} onDelete={d.onDeleteUser} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AddTeamDialog
        open={d.isAddTeamOpen}
        onOpenChange={d.setIsAddTeamOpen}
        onAddTeam={d.onAddTeam}
        newTeamName={d.newTeamName}
        setNewTeamName={d.setNewTeamName}
        isAddingTeam={d.isAddingTeam}
      />

      <AddUserDialog
        open={d.isAddUserOpen}
        onOpenChange={d.setIsAddUserOpen}
        form={d.userForm}
        onAddUser={d.onAddUser}
        isAddingUser={d.isAddingUser}
        teams={d.teams}
      />

      <ProfileDialog
        open={d.isProfileOpen}
        onOpenChange={d.setIsProfileOpen}
        onUpdateProfile={d.onUpdateProfile}
        firstName={d.profileFirstName}
        setFirstName={d.setProfileFirstName}
        lastName={d.profileLastName}
        setLastName={d.setProfileLastName}
        phone={d.access.phone}
        isUpdating={d.isUpdatingProfile}
      />
    </div>
  )
}
