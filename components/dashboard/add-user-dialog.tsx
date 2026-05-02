import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Team as GasTeam } from "@/lib/api-client"
import { UseFormReturn } from "react-hook-form"
import { type UserUpsertValues } from "@/lib/registration"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<UserUpsertValues>
  onAddUser: (values: UserUpsertValues) => void
  isAddingUser: boolean
  teams: GasTeam[]
}

export function AddUserDialog({
  open,
  onOpenChange,
  form,
  onAddUser,
  isAddingUser,
  teams,
}: AddUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Organization</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onAddUser)}
          className="mt-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamId">Team</Label>
              <select
                id="teamId"
                {...form.register("teamId")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select a team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...form.register("role")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="servant">Servant</option>
              </select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600"
            disabled={isAddingUser}
          >
            {isAddingUser ? "Adding..." : "Add to Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
